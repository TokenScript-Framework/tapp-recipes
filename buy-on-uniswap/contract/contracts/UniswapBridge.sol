// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.27;

import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import "stl-contracts/ERC/ERC5169.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract TokenBridgeV3 is OwnableUpgradeable {
    ISwapRouter public swapRouter;
    uint24 public constant poolFee = 3000; // 0.3% fee tier
    uint256 public constant FEE_PERCENTAGE = 1;
    uint256 public constant MAX_SENDERS = 20;

    mapping(uint256 => address[]) public swapIdToSenders;
    mapping(address => mapping(address => uint256)) public senderFees;

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
    event FeeWithdrawn(address sender, uint256 amount);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(ISwapRouter _swapRouter) public initializer {
        __Ownable_init(msg.sender);
        swapRouter = _swapRouter;
    }

    function swapTokens(
        uint256 swapId,
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 amountOutMinimum,
        uint256 deadline
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
        ISwapRouter.ExactInputSingleParams memory params = ISwapRouter
            .ExactInputSingleParams({
                tokenIn: tokenIn,
                tokenOut: tokenOut,
                fee: poolFee,
                recipient: msg.sender,
                deadline: deadline,
                amountIn: amountToSwap,
                amountOutMinimum: amountOutMinimum,
                sqrtPriceLimitX96: 0
            });

        // Execute the swap
        amountOut = swapRouter.exactInputSingle(params);

        // Update senders and distribute fee
        _updateSendersAndDistributeFee(tokenIn, swapId, msg.sender, fee);

        emit SwapCompleted(swapId, msg.sender, amountIn, amountOut);
        return amountOut;
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
            senders[swapId % MAX_SENDERS] = sender;
        }

        // Distribute fee among senders
        uint256 feePerSender = fee / senders.length;
        for (uint256 i = 0; i < senders.length; i++) {
            senderFees[token][senders[i]] += feePerSender;
        }

        emit FeeDistributed(swapId, token, senders, fee);
    }

    function withdrawFee(uint256 swapId, address tokenAddress) external {
        uint256 feeAmount = senderFees[tokenAddress][msg.sender];
        require(feeAmount > 0, "No fee to withdraw");

        // Reset fee balance before transfer to prevent reentrancy
        senderFees[tokenAddress][msg.sender] = 0;

        // Transfer fee to sender
        // (bool success, ) = msg.sender.call{value: feeAmount}("");
        IERC20(tokenAddress).transferFrom(address(this), msg.sender, feeAmount);
        // require(success, "Fee transfer failed");

        emit FeeWithdrawn(msg.sender, feeAmount);
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
    function withdrawContractBalance() external onlyOwner {
        uint256 balance = address(this).balance;
        (bool success, ) = owner().call{value: balance}("");
        require(success, "Transfer failed");
    }
}
