// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract TestToken is ERC721 {
    uint private _nextTokenId;

    constructor() ERC721("Test NFT", "TNFT") {}

    function mint(address to) external {
        _mint(to, _nextTokenId++);
    }
}
