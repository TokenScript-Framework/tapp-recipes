// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

import {ERC5169Upgradable, ERC5169} from "stl-contracts/ERC/ERC5169Upgradable.sol";

contract CareerExp is
    Initializable,
    ERC721EnumerableUpgradeable,
    OwnableUpgradeable,
    UUPSUpgradeable,
    ERC5169Upgradable
{
    using Strings for uint256;

    string public baseUri;

    struct Employer {
        string logo;
        address wallet;
    }
    mapping(string => Employer) private employers;

    // employer name => (employeeId => tokenId)
    mapping(string => mapping(string => uint)) private employmentTokenIds;

    struct Employment {
        string employerName;
        string title;
        uint startInSec;
        uint endInSec;
    }
    mapping(uint => Employment[]) private tokenEmployments;

    // tokenId => (endorserTokenId => endorsed)
    mapping(uint => mapping(uint => bool)) private endorsements;
    mapping(uint => uint) private endorsementCount;

    uint public nextTokenId;

    function initialize(string memory name, string memory symbol) public initializer {
        __ERC721_init(name, symbol);
        __ERC721Enumerable_init();
        __Ownable_init(msg.sender);
        __UUPSUpgradeable_init();

        baseUri = "https://store-backend-stage.smartlayer.network/";
        nextTokenId = 1;
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    function _authorizeSetScripts(string[] memory) internal override onlyOwner {}

    function addEmployer(string memory name, string memory logo, address wallet) external onlyOwner {
        employers[name] = Employer(logo, wallet);
    }

    function getEmployer(string memory name) external view returns (string memory logo, address wallet) {
        Employer memory employer = employers[name];
        require(employer.wallet != address(0), "Employer not found");

        return (employer.logo, employer.wallet);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(ERC5169, ERC721EnumerableUpgradeable) returns (bool) {
        return ERC5169.supportsInterface(interfaceId) || ERC721EnumerableUpgradeable.supportsInterface(interfaceId);
    }

    function claim(string memory employerName, bytes memory proof) public {
        (string memory employeeId, string memory title, uint startInSec, uint endInSec, bytes memory signature) = abi
            .decode(proof, (string, string, uint256, uint256, bytes));
        address employerWallet = employers[employerName].wallet;
        require(employerWallet != address(0), "Employer not found");
        require(employmentTokenIds[employerName][employeeId] == 0, "Career token is already claimed");

        address proofSigner = getCareerExpProofSigner(employeeId, title, startInSec, endInSec, signature);
        require(employerWallet == proofSigner, "Invalid career proof");

        employmentTokenIds[employerName][employeeId] = nextTokenId;
        tokenEmployments[nextTokenId].push(Employment(employerName, title, startInSec, endInSec));

        _safeMint(msg.sender, nextTokenId);

        nextTokenId++;
    }

    function getEmployment(
        uint tokenId
    )
        external
        view
        returns (string memory employerName, string memory title, uint startInSec, uint endInSec, uint numOfEndorsement)
    {
        Employment[] memory employments = tokenEmployments[tokenId];
        require(employments.length > 0, "Token not found");

        return (
            employments[0].employerName,
            employments[0].title,
            employments[0].startInSec,
            employments[0].endInSec,
            endorsementCount[tokenId]
        );
    }

    function endorse(uint tokenId) public {
        Employment[] memory targetEmployments = tokenEmployments[tokenId];
        require(targetEmployments.length > 0, "Token not found");

        address targetTokenOwner = ownerOf(tokenId);
        require(targetTokenOwner != msg.sender, "Can not endorse yourself");

        // TODO: multiple employment support
        Employment memory targetEmployment = targetEmployments[0];

        uint endorserTokenId;
        address endorser = msg.sender;
        uint256 balance = balanceOf(endorser);
        for (uint256 i = 0; i < balance; i++) {
            uint ownedTokenId = tokenOfOwnerByIndex(endorser, i);
            Employment memory employment = tokenEmployments[ownedTokenId][0];

            if (
                keccak256(abi.encodePacked(employment.employerName)) ==
                keccak256(abi.encodePacked(targetEmployment.employerName)) &&
                !(employment.endInSec < targetEmployment.startInSec ||
                    employment.startInSec > targetEmployment.endInSec)
            ) {
                endorserTokenId = ownedTokenId;
                break;
            }
        }
        require(endorserTokenId != 0, "Endorser has no career overlap with the target token");

        endorsements[tokenId][endorserTokenId] = true;
        endorsementCount[tokenId]++;
    }

    function getEndorsement(uint tokenId) external view returns (uint) {
        require(tokenEmployments[tokenId].length > 0, "Token not found");
        return endorsementCount[tokenId];
    }

    function getCareerExpProofSigner(
        string memory employeeId,
        string memory title,
        uint startInSec,
        uint endInSec,
        bytes memory signature
    ) public view returns (address) {
        return getSigner(abi.encode(address(this), block.chainid, employeeId, title, startInSec, endInSec), signature);
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

    function setBaseUri(string memory uri) external onlyOwner {
        baseUri = uri;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);

        return
            string(
                abi.encodePacked(
                    baseUri,
                    "career-exp/metadata/",
                    block.chainid.toString(),
                    "/",
                    _contractAddress(),
                    "/",
                    tokenId.toString()
                )
            );
    }

    function _contractAddress() internal view returns (string memory) {
        return Strings.toHexString(uint160(address(this)), 20);
    }

    // Override transfer relevant functions to make this token non-transferable
    function transferFrom(address, address, uint256) public pure override(ERC721Upgradeable, IERC721) {
        revert("This token is non-transferable");
    }

    function safeTransferFrom(
        address,
        address,
        uint256,
        bytes memory
    ) public pure override(ERC721Upgradeable, IERC721) {
        revert("This token is non-transferable");
    }

    function approve(address, uint256) public pure override(ERC721Upgradeable, IERC721) {
        revert("This token is non-transferable");
    }

    function setApprovalForAll(address, bool) public pure override(ERC721Upgradeable, IERC721) {
        revert("This token is non-transferable");
    }
}
