// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@uniswap/swap-router-contracts/contracts/interfaces/IV3SwapRouter.sol";

contract MockSwapRouter is IV3SwapRouter {
    function exactInputSingle(ExactInputSingleParams calldata params) external payable override returns (uint256 amountOut) {
        // Mock implementation: just return the input amount as the output amount
        return params.amountIn;
    }

    // Implement other required functions with mock behavior
    function exactInput(ExactInputParams calldata params) external payable override returns (uint256 amountOut) {
        return 0;
    }

    function exactOutputSingle(ExactOutputSingleParams calldata params) external payable override returns (uint256 amountIn) {
        return 0;
    }

    function exactOutput(ExactOutputParams calldata params) external payable override returns (uint256 amountIn) {
        return 0;
    }

    function WETH9() external pure returns (address){
        return address(0);
    }

    // Implement the missing uniswapV3SwapCallback function
    function uniswapV3SwapCallback(
        int256 amount0Delta,
        int256 amount1Delta,
        bytes calldata data
    ) external override {
        // This is a mock implementation, so we don't need to do anything here
        // In a real implementation, this would handle the swap callback
    }
}