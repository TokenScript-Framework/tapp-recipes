// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";

import {ERC5169Upgradable, ERC5169} from "stl-contracts/ERC/ERC5169Upgradable.sol";

contract DutchAuction is
    Initializable,
    OwnableUpgradeable,
    UUPSUpgradeable,
    ERC5169Upgradable,
    ReentrancyGuardUpgradeable
{
    struct Auction {
        address nftContract;
        uint256 nftId;
        address seller;
        uint256 startingPrice;
        uint256 reservePrice;
        uint256 startTime;
        uint256 dropRatePerHour;
    }

    mapping(address => mapping(uint256 => Auction)) public auctions;

    event NFTAuctionCreated(
        address indexed nftContract,
        uint256 indexed nftId,
        address seller,
        uint256 startingPrice,
        uint256 reservePrice,
        uint256 startTime,
        uint256 dropRatePerHour
    );

    event NFTSold(address indexed nftContract, uint256 indexed nftId, address buyer, uint256 price);

    function initialize() public initializer {
        __Ownable_init(msg.sender);
        __UUPSUpgradeable_init();
        __ReentrancyGuard_init();
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    function _authorizeSetScripts(string[] memory) internal override onlyOwner {}

    function createAuction(
        address nftContract,
        uint256 nftId,
        uint256 startingPrice,
        uint256 reservePrice,
        uint256 startTime,
        uint256 dropRatePerHour
    ) external {
        require(startingPrice > reservePrice, "Starting price must be higher than reserve price");
        require(dropRatePerHour > 0, "Drop rate must be greater than 0");

        ERC721Upgradeable nft = ERC721Upgradeable(nftContract);
        require(nft.ownerOf(nftId) == msg.sender, "Caller is not the owner of the NFT");

        // check approval status

        Auction memory auction = Auction({
            nftId: nftId,
            nftContract: nftContract,
            seller: msg.sender,
            startingPrice: startingPrice,
            reservePrice: reservePrice,
            startTime: startTime,
            dropRatePerHour: dropRatePerHour
        });

        auctions[nftContract][nftId] = auction;

        emit NFTAuctionCreated(nftContract, nftId, msg.sender, startingPrice, reservePrice, startTime, dropRatePerHour);
    }

    function currentPrice(address nftContract, uint256 nftId) public view returns (uint256) {
        Auction storage auction = auctions[nftContract][nftId];
        require(auction.startTime > 0, "Auction does not exist");

        // TODO: calculate price per hourly drop rate
        // uint256 elapsed = block.timestamp - auction.startTime;
        // if (elapsed >= auction.duration) {
        //     return auction.reservePrice;
        // }

        // uint256 priceDrop = ((auction.startingPrice - auction.reservePrice) * elapsed) / auction.duration;
        // return auction.startingPrice - priceDrop;
    }

    function buyNFT(address nftContract, uint256 nftId) external payable nonReentrant {
        Auction storage auction = auctions[nftContract][nftId];
        require(auction.startTime > 0, "Auction does not exist");
        require(block.timestamp >= auction.startTime, "Auction not started");

        uint256 price = currentPrice(nftContract, nftId);
        require(msg.value >= price, "Insufficient funds");

        ERC721Upgradeable(auction.nftContract).safeTransferFrom(auction.seller, msg.sender, nftId);
        payable(auction.seller).transfer(price);

        if (msg.value > price) {
            payable(msg.sender).transfer(msg.value - price);
        }

        emit NFTSold(nftContract, nftId, msg.sender, price);

        delete auctions[nftContract][nftId];
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC5169) returns (bool) {
        return ERC5169.supportsInterface(interfaceId);
    }
}
