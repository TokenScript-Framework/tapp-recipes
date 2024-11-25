// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

// import "hardhat/console.sol";

contract BondingCurveNFT is ERC721, ReentrancyGuard, Ownable {
    using Math for uint256;

    address public trustedSigner;

    // Revenue sharing parameters
    string public receiverTwitterHandle;
    uint256 public constant CONTRACT_FEE_PERCENTAGE = 20; // 20% goes to contract
    uint256 public constant RECEIVER_PERCENTAGE = 80; // 80% goes to receiver

    // Core token economics
    uint256 public currentTokenId;
    uint256 public constant INITIAL_PRICE = 0.001 ether;
    int256 public constant STEEPNESS = 500;
    int256 public constant MIDPOINT = 1000;

    // Contract state
    bool public isWithdrawn;
    uint256 public totalReceiverRevenue;

    // Anti-depletion parameters
    uint256 public constant MINIMUM_SELL_FEE_PERCENTAGE = 10; // Minimum 10% fee
    uint256 public constant MAX_SELL_PERCENTAGE = 5; // Max 5% of contract balance per sell
    uint256 public constant MINIMUM_HOLDING_PERIOD = 30 days; // Minimum holding period
    uint256 public constant EARLY_SELL_PENALTY_PERCENTAGE = 50; // 50% penalty for early selling

    // Tracking structures
    uint256[] public historicalPrices;
    mapping(uint256 => uint256) public tokenHistoryIndex;
    mapping(uint256 => uint256) public mintTimestamps;
    mapping(uint256 => uint256) public tokenMintPrices;

    // Revenue tracking
    uint256 public totalTokensMinted;
    uint256 public totalMintRevenue;
    uint256 public totalSellRevenue;

    // Events
    event ReceiverSet(string indexed receiverTwitterHandle);
    event ReceiverWithdrawn(uint256 amount);
    event ContractPaused(bool status);
    event TokenSold(uint256 tokenId, uint256 sellPrice, uint256 contractShare, uint256 receiverShare);
    event MintRevenueSplit(uint256 mintPrice, uint256 contractShare, uint256 receiverShare);

    constructor() ERC721("ImprovedBondingCurveNFT", "IBCNFT") Ownable(msg.sender) {}

    // Set receiver twitter handle (can only be done once)
    function setReceiverTwitterHandle(string memory _receiverTwitterHandle) external onlyOwner {
        require(!nonEmptyString(receiverTwitterHandle), "Receiver already set");
        require(nonEmptyString(_receiverTwitterHandle), "Invalid receiver twitter handler");
        receiverTwitterHandle = _receiverTwitterHandle;
        emit ReceiverSet(_receiverTwitterHandle);
    }

    function setTrustedSigner(address signer) external onlyOwner {
        require(signer != address(0), "Invalid signer");
        trustedSigner = signer;
    }

    // Sigmoid price calculation
    function calculateSigmoidPrice(int256 x) public pure returns (uint256) {
        if (x > 2 ** 128) revert("Overflow prevention");

        int256 num = int256(INITIAL_PRICE * 2 * 2 ** 16);
        int256 exp_input = int256((STEEPNESS * (x - MIDPOINT)) / 100);

        int256 exp_approx;
        if (exp_input < 0) {
            exp_approx = int256(2 ** 16 + (2 ** 16 * uint256(-exp_input)) / (2 ** 16 + uint256(-exp_input)));
        } else {
            exp_approx = int256(2 ** 16 / (1 + uint256(exp_input)));
        }

        int256 result = num / (int256(2 ** 16) + exp_approx);
        uint256 originResult = uint256(result > 0 ? result : int256(INITIAL_PRICE)) / 2 ** 16;

        // Adjust result to be reasonable larger
        return originResult * 10 ** 6;
    }

    // Mint function with enhanced revenue tracking
    function mint() external payable nonReentrant {
        // Check if receiver has withdrawn or receiver twitter handle is not set
        require(!isWithdrawn, "Minting paused");
        require(nonEmptyString(receiverTwitterHandle), "Receiver not set");

        uint256 basePrice = calculateSigmoidPrice(int256(currentTokenId + 1));
        require(msg.value >= basePrice, "Insufficient payment");

        // Split revenue immediately upon minting
        uint256 contractShare = (basePrice * CONTRACT_FEE_PERCENTAGE) / 100;
        uint256 receiverShare = (basePrice * RECEIVER_PERCENTAGE) / 100;

        // Track total receiver revenue
        totalReceiverRevenue += receiverShare;

        // Track revenue
        totalMintRevenue += basePrice;

        // Emit event for mint revenue
        emit MintRevenueSplit(basePrice, contractShare, receiverShare);

        currentTokenId++;
        uint256 newTokenId = currentTokenId;

        // Track mint details
        historicalPrices.push(basePrice);
        mintTimestamps[newTokenId] = block.timestamp;
        tokenHistoryIndex[newTokenId] = historicalPrices.length - 1;
        tokenMintPrices[newTokenId] = basePrice;

        // Track total tokens minted
        totalTokensMinted++;

        // Mint token
        _safeMint(msg.sender, newTokenId);

        // Refund excess payment
        if (msg.value > basePrice) {
            payable(msg.sender).transfer(msg.value - basePrice);
        }
    }

    // Advanced sell price calculation
    function getSellPrice(uint256 tokenId) public view returns (uint256) {
        require(!isWithdrawn, "Selling paused");
        require(ownerOf(tokenId) != address(0), "Token does not exist");

        uint256 originalPrice = tokenMintPrices[tokenId];
        uint256 currentMintPrice = calculateSigmoidPrice(int256(currentTokenId + 1));

        // Early selling penalty
        uint256 holdingDuration = block.timestamp - mintTimestamps[tokenId];
        if (holdingDuration < MINIMUM_HOLDING_PERIOD) {
            return (originalPrice * (100 - EARLY_SELL_PENALTY_PERCENTAGE)) / 100;
        }

        // Price appreciation calculation
        uint256 priceMultiplier = (currentMintPrice * 120) / originalPrice;

        // Calculate max sellable amount (5% of contract balance)
        uint256 maxSellableAmount = (address(this).balance * MAX_SELL_PERCENTAGE) / 100;

        // Base sell price
        uint256 basePrice = Math.min((originalPrice * priceMultiplier) / 100, maxSellableAmount);

        // Apply minimum sell fee
        uint256 sellFee = Math.min((basePrice * MINIMUM_SELL_FEE_PERCENTAGE) / 100, originalPrice / 10);

        require(basePrice > sellFee, "Sell price cannot cover fee");

        return basePrice - sellFee;
    }

    // Sell function with post-sale revenue deduction
    function sell(uint256 tokenId) external nonReentrant {
        require(!isWithdrawn, "Selling paused");
        require(ownerOf(tokenId) == msg.sender, "Not token owner");

        // Calculate sell price
        uint256 sellPrice = getSellPrice(tokenId);
        require(address(this).balance >= sellPrice, "Insufficient contract balance");

        // Calculate revenue shares
        uint256 contractShare = (sellPrice * CONTRACT_FEE_PERCENTAGE) / 100;
        uint256 receiverShare = (sellPrice * RECEIVER_PERCENTAGE) / 100;

        // Deduct from total receiver revenue
        totalReceiverRevenue -= receiverShare;

        // Track sell revenue
        totalSellRevenue += sellPrice;

        // Emit sell event with detailed revenue breakdown
        emit TokenSold(tokenId, sellPrice, contractShare, receiverShare);

        // Burn the token
        _burn(tokenId);

        // Transfer net proceeds to seller
        payable(msg.sender).transfer(sellPrice);
    }

    // Receiver withdrawal function
    function withdrawReceiverFunds(bytes memory signature) external nonReentrant {
        require(!isWithdrawn, "Funds already withdrawn");

        address signer = getWithdrawSigner(signature);
        require(signer == trustedSigner, "Invalid withdraw signature");

        uint256 withdrawAmount = totalReceiverRevenue;
        require(withdrawAmount > 0, "No funds to withdraw");

        // Mark contract as withdrawn to pause minting and selling
        isWithdrawn = true;

        // Transfer funds to receiver
        payable(msg.sender).transfer(withdrawAmount);

        emit ReceiverWithdrawn(withdrawAmount);
        emit ContractPaused(true);
    }

    function getWithdrawSigner(bytes memory signature) public view returns (address) {
        return getSigner(abi.encode(receiverTwitterHandle, msg.sender), signature);
    }

    function getSigner(bytes memory data, bytes memory signature) public pure returns (address) {
        (bytes32 r, bytes32 s, uint8 v) = splitSignature(signature);

        return ecrecover(keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", keccak256(data))), v, r, s);
    }

    function splitSignature(bytes memory sig) public pure returns (bytes32 r, bytes32 s, uint8 v) {
        require(sig.length == 65, "invalid signature length");

        assembly {
            /*
            First 32 bytes stores the length of the signature

            add(sig, 32) = pointer of sig + 32
            effectively, skips first 32 bytes of signature

            mload(p) loads next 32 bytes starting at the memory address p into memory
            */

            // first 32 bytes, after the length prefix
            r := mload(add(sig, 32))
            // second 32 bytes
            s := mload(add(sig, 64))
            // final byte (first byte of the next 32 bytes)
            v := byte(0, mload(add(sig, 96)))
        }

        // implicitly return (r, s, v)
    }

    // Revenue and contract health metrics
    function getContractHealthMetrics()
        external
        view
        returns (
            uint256 contractBalance,
            uint256 totalMintRev,
            uint256 totalSellRev,
            uint256 pendingReceiverRev,
            uint256 tokensMinted,
            uint256 averageTokenPrice,
            bool mintingPaused
        )
    {
        contractBalance = address(this).balance;
        totalMintRev = totalMintRevenue;
        totalSellRev = totalSellRevenue;
        pendingReceiverRev = totalReceiverRevenue;
        tokensMinted = totalTokensMinted;
        averageTokenPrice = totalTokensMinted > 0 ? (totalMintRevenue + totalSellRevenue) / totalTokensMinted : 0;
        mintingPaused = isWithdrawn;
    }

    function nonEmptyString(string memory str) internal pure returns (bool) {
        return bytes(str).length > 0;
    }

    // Fallback functions
    receive() external payable {}
}
