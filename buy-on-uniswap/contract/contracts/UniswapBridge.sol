// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.27;

import "@uniswap/swap-router-contracts/contracts/interfaces/IV3SwapRouter.sol";

import "stl-contracts/ERC/ERC5169.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract TokenBridgeV3 is OwnableUpgradeable {
    IV3SwapRouter public swapRouter;
    uint24 public constant poolFee = 10000; // 1% fee tier
    uint256 public constant FEE_PERCENTAGE = 1;
    uint256 public constant MAX_SENDERS = 20;
    uint256 public constant CONTRACT_REWARD_PERCENTAGE = 20;

    mapping(uint256 => address[]) public swapIdToSenders;
    mapping(uint256 => uint256) public swapIdTxCounter;
    mapping(address => mapping(address => uint256)) public senderFees;
    mapping(address => uint256) public contractFees;

    event SwapCompleted(
        uint256 indexed swapId,
        address sender,
        uint256 amountIn,
        uint256 amountOut
    );
    event FeeDistributed(
        uint256 indexed swapId,
        address token,
        address[] senders,
        uint256 totalFee
    );
    event FeeWithdrawn(address sender, address token, uint256 amount);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(IV3SwapRouter _swapRouter) public initializer {
        __Ownable_init(msg.sender);
        swapRouter = _swapRouter;
    }

    function swapTokens(
        uint256 swapId,
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 amountOutMinimum
    ) external returns (uint256 amountOut) {
        require(amountIn > 0, "Amount must be greater than 0");

        // Transfer tokens from sender to this contract
        IERC20(tokenIn).transferFrom(msg.sender, address(this), amountIn);

        // Calculate and deduct the fee
        uint256 fee = (amountIn * FEE_PERCENTAGE) / 100;
        uint256 amountToSwap = amountIn - fee;

        // Approve the router to spend the token
        IERC20(tokenIn).approve(address(swapRouter), amountToSwap);

        // Prepare the swap params
        // ISwapRouter.ExactInputSingleParams memory params = ISwapRouter
        IV3SwapRouter.ExactInputSingleParams memory params = IV3SwapRouter
            .ExactInputSingleParams({
                tokenIn: tokenIn,
                tokenOut: tokenOut,
                fee: poolFee,
                recipient: msg.sender,
                amountIn: amountToSwap,
                amountOutMinimum: amountOutMinimum,
                sqrtPriceLimitX96: 0
            });
        amountOut = swapRouter.exactInputSingle(params);
        
        // Update senders and distribute fee
        _updateSendersAndDistributeFee(tokenIn, swapId, msg.sender, fee);
        
        emit SwapCompleted(swapId, msg.sender, amountIn, amountOut);
    }

    function _updateSendersAndDistributeFee(
        address token,
        uint256 swapId,
        address sender,
        uint256 fee
    ) internal {
        address[] storage senders = swapIdToSenders[swapId];

        // Add new sender or overwrite existing one
        if (senders.length < MAX_SENDERS) {
            senders.push(sender);
        } else {
            senders[swapIdTxCounter[swapId] % MAX_SENDERS] = sender;
        }

        swapIdTxCounter[swapId]++;

        emit FeeDistributed(swapId, token, senders, fee);

        // stay CONTRACT_REWARD_PERCENTAGE of the fee in contract
        if (CONTRACT_REWARD_PERCENTAGE > 0) {
            uint usersfee = (100 - CONTRACT_REWARD_PERCENTAGE) * fee / 100;
            contractFees[token] += fee - usersfee;
            fee = usersfee;
        }

        // Distribute fee among senders
        uint256 feePerSender = fee / senders.length;
        for (uint256 i = 0; i < senders.length; i++) {
            senderFees[token][senders[i]] += feePerSender;
        }
    }

    function withdrawFee(address tokenAddress) external {
        uint256 feeAmount = senderFees[tokenAddress][msg.sender];
        require(feeAmount > 0, "No fee to withdraw");
        // Reset fee balance before transfer to prevent reentrancy
        senderFees[tokenAddress][msg.sender] = 0;

        // Transfer fee to sender
        IERC20(tokenAddress).transfer(msg.sender, feeAmount);

        emit FeeWithdrawn(msg.sender, tokenAddress, feeAmount);
    }

    function getSenders(
        uint256 swapId
    ) external view returns (address[] memory) {
        return swapIdToSenders[swapId];
    }

    function getFeeBalance(
        address tokenAddress,
        address sender
    ) external view returns (uint256) {
        return senderFees[tokenAddress][sender];
    }

    // Function to receive Ether
    receive() external payable {}

    // Allow contract owner to withdraw any stuck Ether
    function withdrawContractBalance(address tokenAddress) external onlyOwner {
        if (tokenAddress == address(0)){
            // for emergency cases
            uint256 balance = address(this).balance;
            (bool success, ) = owner().call{value: balance}("");
            require(success, "Transfer failed");
        } else {
            // only ERC20 transfers emit fee
            uint256 feeAmount = contractFees[tokenAddress];
            require(feeAmount > 0, "No fee to withdraw");
            // Reset fee balance before transfer to prevent reentrancy
            contractFees[tokenAddress] = 0;

            // Transfer fee to sender
            IERC20(tokenAddress).transfer(msg.sender, feeAmount);
            emit FeeWithdrawn(msg.sender, tokenAddress, feeAmount);
        }
    }
}
