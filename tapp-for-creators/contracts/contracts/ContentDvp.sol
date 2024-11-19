// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/utils/Address.sol";

abstract contract ContentDvp is Ownable {
    address internal _feeReceiver;
    address internal _seller;

    uint256 public constant COMMON_DENOMINATOR = 10_000;
    uint256 internal _feeNumerator;
    uint256 internal _commissionNumerator;

    constructor(address seller, address feeReceiver) {
        _seller = seller;
        _feeReceiver = feeReceiver;
        _feeNumerator = 100; // fee: 1% * price
        _commissionNumerator = 1000; // commission: 10% * fee
    }

    function setFeeReceiver(address feeReceiver) public onlyOwner {
        _feeReceiver = feeReceiver;
    }

    function getFeeReceiver() public view returns (address) {
        return _feeReceiver;
    }

    function setSeller(address seller) public onlyOwner {
        _seller = seller;
    }

    function getSeller() public view returns (address) {
        return _seller;
    }

    function setFeeNumerator(uint256 feeNumerator) public onlyOwner {
        require(
            feeNumerator <= COMMON_DENOMINATOR,
            "FeeController: feeNumerator exceeds COMMON_DENOMINATOR"
        );
        _feeNumerator = feeNumerator;
    }

    function getFeeNumerator() public view returns (uint256) {
        return _feeNumerator;
    }

    function setCommissionNumerator(
        uint256 commissionNumerator
    ) public onlyOwner {
        require(
            commissionNumerator <= COMMON_DENOMINATOR,
            "FeeController: commissionNumerator exceeds COMMON_DENOMINATOR"
        );
        _commissionNumerator = commissionNumerator;
    }

    function getCommissionNumerator() public view returns (uint256) {
        return _commissionNumerator;
    }

    function feeAndCommission(
        uint256 amount
    ) public view returns (uint256, uint256) {
        uint256 fee = (amount * _feeNumerator) / COMMON_DENOMINATOR;
        uint256 commission = (fee * _commissionNumerator) / COMMON_DENOMINATOR;
        return (fee, commission);
    }

    function _pay(uint256 price) internal {
        (uint256 fee, uint256 netAmount) = _calcFeeAndNetAmount(price);
        Address.sendValue(payable(_seller), netAmount);

        uint256 commission = _calcCommission(fee);
        Address.sendValue(payable(_feeReceiver), commission);
    }

    function _calcFeeAndNetAmount(
        uint256 amount
    ) internal view returns (uint256, uint256) {
        uint256 fee = (amount * _feeNumerator) / COMMON_DENOMINATOR;
        return (fee, amount - fee);
    }

    function _calcCommission(uint256 fee) internal view returns (uint256) {
        return (fee * _commissionNumerator) / COMMON_DENOMINATOR;
    }
}
