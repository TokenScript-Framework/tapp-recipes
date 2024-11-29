// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol";
// import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "stl-contracts/ERC/ERC5169.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts-upgradeable/access/extensions/AccessControlEnumerableUpgradeable.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

import "hardhat/console.sol";

contract Poap is AccessControlEnumerableUpgradeable, ERC721EnumerableUpgradeable, OwnableUpgradeable, ERC5169 {
  using ECDSA for bytes32;
  using Strings for uint256;
  using EnumerableSet for EnumerableSet.UintSet;

  mapping(uint256 => EnumerableSet.UintSet) private _poapSets;

  bytes32 private constant _MINTER_ROLE = keccak256("MINTER_ROLE");

  string public baseUri;

  string public contractURI;

  uint public mintStart;
  uint public mintEnd;

  event TrustedSignerUpdated(address prevWallet, address newWallet);
  event MintDateRangeUpdated(uint32 start, uint32 end);
  event Minted(
    address to,
    uint256 poapId,
    uint256 tokenId
  );

  /// @custom:oz-upgrades-unsafe-allow constructor
  constructor() {
    _disableInitializers();
  }

  function initialize() public initializer {
    __ERC721_init("Souvenir", "SVNR");
    __Ownable_init(msg.sender);
    __AccessControlEnumerable_init();
    _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    _grantRole(_MINTER_ROLE, 0x1c18e4eF0C9740e258835Dbb26E6C5fB4684C7a0);
    baseUri = "https://store-backend.smartlayer.network/metadata/";
    contractURI = "https://resources.smarttokenlabs.com/contract/poap_nft.json";
  }

  function setBaseUri(string memory uri) public onlyOwner {
    baseUri = uri;
  }

  function setContractUri(string memory uri) public onlyOwner {
    contractURI = uri;
  }

  function setMintTimeRange(
    uint32 _mintStart,
    uint32 _mintEnd
  ) external onlyOwner {
    mintStart = _mintStart;
    mintEnd = _mintEnd;
    emit MintDateRangeUpdated(_mintStart, _mintEnd);
  }

  function mint(
    uint poapId,
    uint tokenId,
    bytes memory signature
  ) public {
    require(
      mintStart > 0 && mintStart < block.timestamp,
      "Minting not started yet"
    );
    require(_ownerOf(tokenId) == address(0), "Already minted");
    require(mintEnd == 0 || mintEnd > block.timestamp, "Minting finished");

    require(
      hasRole(_MINTER_ROLE, getMintSigner(msg.sender, poapId, tokenId, signature)),
      "Only Minter role allowed"
    );

    _poapSets[poapId].add(tokenId);

    emit Minted( msg.sender, poapId, tokenId);

    _safeMint(msg.sender, tokenId);

  }

  function getSouvenirAmount(uint souvenirId) public view returns(uint){
    return _poapSets[souvenirId].length();
  }

  function isTokenSouvenir(uint souvenirId, uint tokenId) public view returns(bool){
    return _poapSets[souvenirId].contains(tokenId);
  }

  function getSouvenirByIndex(uint souvenirId, uint index) public view returns(uint){
    return _poapSets[souvenirId].at(index);
  }

  function getAllSouvenirs(uint souvenirId) public view returns(uint[] memory){
    return _poapSets[souvenirId].values();
  }

  // TODO add bulk mint
  function mintDirect(
    uint poapId,
    uint tokenId
  ) public onlyRole(_MINTER_ROLE) {
    
    require(ownerOf(tokenId) == address(0), "Already minted");

    _poapSets[poapId].add(tokenId);

    emit Minted( msg.sender, tokenId, poapId);

    _safeMint(msg.sender, tokenId);

  }

  function mintingActive() public view returns (bool) {
    return mintStart < block.timestamp && mintEnd > block.timestamp;
  }

  // function _update(address to, uint256 tokenId, address auth) internal override (ERC721Enumerable) returns (address) {
  //   if (gateAddress != address(0)) {
  //     IGate(gateAddress).check(_msgSender());
  //   }
  //   return super._update(to, tokenId, auth);
  // }

  function supportsInterface(
    bytes4 interfaceId
  )
    public
    view
    override(ERC5169, ERC721EnumerableUpgradeable, AccessControlEnumerableUpgradeable)
    returns (bool)
  {
    return
      AccessControlEnumerableUpgradeable.supportsInterface(interfaceId) ||
      ERC721Upgradeable.supportsInterface(interfaceId) ||
      ERC721EnumerableUpgradeable.supportsInterface(interfaceId) ||
      ERC5169.supportsInterface(interfaceId);
  }

  function _authorizeSetScripts(
    string[] memory
  ) internal view override(ERC5169) {
    require(
      msg.sender == owner(),
      "You do not have the authority to set the script URI"
    );
  }

  function _contractAddress() internal view returns (string memory) {
    return Strings.toHexString(uint160(address(this)), 20);
  }

  // TODO make sure path is correct
  function tokenURI(
    uint256 tokenId
  ) public view virtual override returns (string memory) {
    ownerOf(tokenId);

    return
      string(
        abi.encodePacked(
          baseUri,
          block.chainid.toString(),
          "/",
          _contractAddress(),
          "/",
          tokenId.toString()
        )
      );
  }

  // function setTrustedSigner(address signer) external onlyOwner {
  //   emit TrustedSignerUpdated(trustedSigner, signer);
  //   trustedSigner = signer;
  // }

  // function getCodeSigner(
  //   uint time,
  //   bytes memory signature
  // ) public view returns (address) {
  //   return getSigner(abi.encode(address(this), block.chainid, time), signature);
  // }

  // function getCodeSigner2(
  //   uint tokenId,
  //   uint8 number,
  //   bytes memory signature
  // ) public view returns (address) {
  //   return
  //     getSigner(
  //       abi.encode(address(this), block.chainid, tokenId, number),
  //       signature
  //     );
  // }

  // function setMinterRole(address addr) public onlyRole(DEFAULT_ADMIN_ROLE){
  function setMinterRole(address addr) public onlyRole(getRoleAdmin(_MINTER_ROLE)){
    _grantRole(_MINTER_ROLE, addr);
  }

  function getMintSigner(
    address to,
    uint256 poapId,
    uint256 tokenId,
    bytes memory signature
  ) public view returns (address) {
    return
      getSigner(
        abi.encode(address(this), block.chainid, to, poapId, tokenId),
        signature
      );
  }

  function getSigner(
    bytes memory data,
    bytes memory signature
  ) public pure returns (address) {
    (bytes32 r, bytes32 s, uint8 v) = splitSignature(signature);

    return
      ecrecover(
        keccak256(
          abi.encodePacked("\x19Ethereum Signed Message:\n32", keccak256(data))
        ),
        v,
        r,
        s
      );
  }

  function splitSignature(
    bytes memory sig
  ) public pure returns (bytes32 r, bytes32 s, uint8 v) {
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
}
