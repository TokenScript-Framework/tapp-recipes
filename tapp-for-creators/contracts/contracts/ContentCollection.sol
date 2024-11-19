// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./ContentDvp.sol";

struct Content {
    uint256 price;
    uint256 stock;
}

contract ContentCollection is Ownable, ERC1155, ContentDvp {
    mapping(uint256 => Content) private _tokenSKUs;

    string private _name;
    string private _symbol;
    string private _baseUri;

    constructor(
        string memory contentName,
        string memory contentSymbol,
        string memory contentBaseUri,
        address feeReceiver
    )
        Ownable(_msgSender())
        ERC1155(contentBaseUri)
        ContentDvp(_msgSender(), feeReceiver)
    {
        _name = contentName;
        _symbol = contentSymbol;
        _baseUri = contentBaseUri;
    }

    function name() public view virtual returns (string memory) {
        return _name;
    }

    function symbol() public view virtual returns (string memory) {
        return _symbol;
    }

    function baseUri() public view virtual returns (string memory) {
        return _baseUri;
    }

    function setBaseUri(string memory newBaseUri) public onlyOwner {
        _setURI(newBaseUri);
    }

    function setTokenSKUs(
        uint256 tokenId,
        Content memory sku
    ) public onlyOwner {
        _tokenSKUs[tokenId] = sku;
    }

    function mint(
        address account,
        uint256 tokenId,
        uint256 amount
    ) public payable {
        require(
            _tokenSKUs[tokenId].stock >= amount,
            "ContentCollection: not enough tokens reserved"
        );

        require(
            msg.value == _tokenSKUs[tokenId].price * amount,
            "ContentCollection: incorrect payment amount"
        );

        _tokenSKUs[tokenId].stock -= amount;
        _mint(account, tokenId, amount, "");
        _pay(msg.value);
    }

    function uri(
        uint256 tokenId
    ) public view virtual override returns (string memory) {
        return
            string(abi.encodePacked(_baseUri, "/", Strings.toString(tokenId)));
    }

    function transferOwnership(address newOwner) public override onlyOwner {
        super.transferOwnership(newOwner);
        setSeller(newOwner);
    }
}
