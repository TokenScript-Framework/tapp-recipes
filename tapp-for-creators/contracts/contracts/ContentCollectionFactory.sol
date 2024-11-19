// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "./ContentCollection.sol";

contract ContentCollectionFactory {
    event CollectionCreated(
        address collectionAddress,
        string name,
        string symbol
    );

    mapping(address => bool) public collections;

    function createCollection(
        string memory name,
        string memory symbol,
        string memory baseUri,
        address feeReceiver
    ) public returns (address) {
        ContentCollection newCollection = new ContentCollection(
            name,
            symbol,
            baseUri,
            feeReceiver
        );

        newCollection.transferOwnership(msg.sender);
        collections[address(newCollection)] = true;

        emit CollectionCreated(address(newCollection), name, symbol);
        return address(newCollection);
    }

    function isCollection(address collection) public view returns (bool) {
        return collections[collection];
    }
}
