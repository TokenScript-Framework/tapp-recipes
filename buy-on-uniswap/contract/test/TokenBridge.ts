const { expect } = require("chai");
import {ethers, network, upgrades} from 'hardhat';

describe("TokenBridgeV3", function () {
  let TokenBridgeV3, tokenBridge, owner, addr1, addr2;
  let MockSwapRouter, mockSwapRouter;
  let MockERC20, tokenIn, tokenOut;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    // Deploy mock SwapRouter
    MockSwapRouter = await ethers.getContractFactory("MockSwapRouter");
    mockSwapRouter = await MockSwapRouter.deploy();
    
    // Deploy TokenBridgeV3
    TokenBridgeV3 = await ethers.getContractFactory("TokenBridgeV3");
    tokenBridge = await upgrades.deployProxy(TokenBridgeV3, [mockSwapRouter.target]);
    
    // Deploy mock ERC20 tokens
    MockERC20 = await ethers.getContractFactory("MockERC20");
    tokenIn = await MockERC20.deploy("TokenIn", "TIN");
    tokenOut = await MockERC20.deploy("TokenOut", "TOUT");
    
    // Mint some tokens to addr1
    await tokenIn.mint(addr1.address, ethers.parseEther("1000"));
    await tokenIn.connect(addr1).approve(tokenBridge.target, ethers.parseEther("1000"));
  });

  describe("swapTokens", function () {
    it("Should swap tokens and distribute fees", async function () {
        const swapId = 1;
        const amountIn = ethers.parseEther("100");
        const amountOutMinimum = ethers.parseEther("90");
        const deadline = Math.floor(Date.now() / 1000) + 60 * 10; // 10 minutes from now
        
        await expect(tokenBridge.connect(addr1).swapTokens(
            swapId,
            tokenIn.target,
            tokenOut.target,
            amountIn,
            amountOutMinimum,
            deadline
        )).to.emit(tokenBridge, "SwapCompleted")
        .and.to.emit(tokenBridge, "FeeDistributed");

      // Check if sender is added to swapIdToSenders
      expect(await tokenBridge.getSenders(swapId)).to.include(addr1.address);

      // Check if fee is distributed
      const feeAmount = amountIn * 1n / 100n; // 1% fee
      expect(await tokenBridge.getFeeBalance(tokenIn.target, addr1.address)).to.equal(feeAmount);
    });

    it("Should revert if amountIn is 0", async function () {
      await expect(tokenBridge.connect(addr1).swapTokens(
        1,
        tokenIn.target,
        tokenOut.target,
        0,
        0,
        Math.floor(Date.now() / 1000) + 60 * 10
      )).to.be.revertedWith("Amount must be greater than 0");
    });
  });

  describe("withdrawFee", function () {
    it("Should allow withdrawal of accumulated fees", async function () {
      // First, perform a swap to accumulate fees
      await tokenBridge.connect(addr1).swapTokens(
        1,
        tokenIn.target,
        tokenOut.target,
        ethers.parseEther("100"),
        ethers.parseEther("90"),
        Math.floor(Date.now() / 1000) + 60 * 10
      );

      const initialBalance = await tokenIn.balanceOf(addr1.address);
      await expect(tokenBridge.connect(addr1).withdrawFee(1, tokenIn.target))
        .to.emit(tokenBridge, "FeeWithdrawn");

      const finalBalance = await tokenIn.balanceOf(addr1.address);
      expect(finalBalance.sub(initialBalance)).to.equal(ethers.parseEther("1")); // 1% of 100
    });

    it("Should revert if there's no fee to withdraw", async function () {
      await expect(tokenBridge.connect(addr1).withdrawFee(1, tokenIn.target))
        .to.be.revertedWith("No fee to withdraw");
    });
  });

  describe("getSenders", function () {
    it("Should return correct senders for a swapId", async function () {
      await tokenBridge.connect(addr1).swapTokens(
        1,
        tokenIn.target,
        tokenOut.target,
        ethers.parseEther("100"),
        ethers.parseEther("90"),
        Math.floor(Date.now() / 1000) + 60 * 10
      );

      const senders = await tokenBridge.getSenders(1);
      expect(senders).to.have.lengthOf(1);
      expect(senders[0]).to.equal(addr1.address);
    });
  });

  describe("getFeeBalance", function () {
    it("Should return correct fee balance for a sender", async function () {
      await tokenBridge.connect(addr1).swapTokens(
        1,
        tokenIn.target,
        tokenOut.target,
        ethers.parseEther("100"),
        ethers.parseEther("90"),
        Math.floor(Date.now() / 1000) + 60 * 10
      );

      const feeBalance = await tokenBridge.getFeeBalance(tokenIn.target, addr1.address);
      expect(feeBalance).to.equal(ethers.parseEther("1")); // 1% of 100
    });
  });

  describe("withdrawContractBalance", function () {
    it("Should allow owner to withdraw contract balance", async function () {
      // Send some Ether to the contract
      await owner.sendTransaction({
        to: tokenBridge.address,
        value: ethers.parseEther("1")
      });

      const initialBalance = await owner.getBalance();
      await tokenBridge.withdrawContractBalance();
      const finalBalance = await owner.getBalance();

      expect(finalBalance.sub(initialBalance)).to.be.closeTo(
        ethers.parseEther("1"),
        ethers.parseEther("0.01") // Allow for gas costs
      );
    });

    it("Should revert if called by non-owner", async function () {
      await expect(tokenBridge.connect(addr1).withdrawContractBalance())
        .to.be.revertedWith("Ownable: caller is not the owner");
    });
  });
});