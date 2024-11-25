const { expect } = require("chai");
import {ethers, network, upgrades} from 'hardhat';
import {MockSwapRouter, TokenBridgeV3, MockERC20} from '../typechain-types';
import { Signer } from 'ethers';

describe("TokenBridgeV3", function () {
  let TokenBridgeV3, tokenBridge:TokenBridgeV3, owner:Signer, addr1:Signer, addr2:Signer;
  let MockSwapRouter, mockSwapRouter;
  let MockERC20, sln:MockERC20, weth:MockERC20, usdt:MockERC20;
  let wealthySigner:Signer;
  let wealthySigner2:Signer;
  let tx;

  // owns 64 SLN
  const slnOwnerAddress = "0x38CDdcCB57BB40906fe2e99aB389ba3Ab7f5ab53"
  // owns 974 SLN
  const slnOwnerAddress2 = "0x1F09a010565eb7f5290ec8Db50498727A6C63c2F"

  const slnMainnetAddress = "0xDb82c0d91E057E05600C8F8dc836bEb41da6df14"
  const wethMainnetAddress = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
  const usdtMainnetAddress = "0xdAC17F958D2ee523a2206206994597C13D831ec7"

  const uniswapRouterMainnetAddress = "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45"
  const usdtSlnPoolAddress = "0x291Db2c056D94017E67725e5133528851A156cD0"
  const ethSlnPoolAddress = "0xBa33A58609c1e2092F79C83C4432Ca3b81c5Fc0B"

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    // Deploy mock SwapRouter
    MockSwapRouter = await ethers.getContractFactory("MockSwapRouter");
    // mockSwapRouter = await MockSwapRouter.deploy();
    // MockSwapRouter = await ethers.getContractFactory("IV3SwapRouter");
    mockSwapRouter = await MockSwapRouter.attach(uniswapRouterMainnetAddress);
    
    // Deploy TokenBridgeV3
    TokenBridgeV3 = await ethers.getContractFactory("TokenBridgeV3");
    tokenBridge = await upgrades.deployProxy(TokenBridgeV3, [mockSwapRouter.target]) as unknown as TokenBridgeV3;
    
    // Deploy mock ERC20 tokens
    MockERC20 = await ethers.getContractFactory("MockERC20");
    sln = await MockERC20.attach(slnMainnetAddress) as MockERC20;
    weth = await MockERC20.attach(wethMainnetAddress) as MockERC20;
    usdt = await MockERC20.attach(usdtMainnetAddress) as MockERC20;

    wealthySigner = await ethers.getImpersonatedSigner(slnOwnerAddress)
    wealthySigner2 = await ethers.getImpersonatedSigner(slnOwnerAddress2)

    let tx2 = await owner.sendTransaction({
      to: slnOwnerAddress,
      value: 10n ** 18n, // 1 ETH
      gasLimit: 100_000,
    });
    await tx2.wait();

    tx2 = await owner.sendTransaction({
      to: slnOwnerAddress2,
      value: 10n ** 18n, // 1 ETH
      gasLimit: 100_000,
    });
    await tx2.wait();
  });

  describe("swapTokens", function () {
    it("Should swap tokens and distribute fees", async function () {
        const swapId = 1;
        const amountIn = ethers.parseEther("50");
        // const amountOutMinimum = ethers.parseEther("90");
        // const deadline = Math.floor(Date.now() / 1000) + 60 * 10; // 10 minutes from now
        console.log("Wealthy signer 1 balance: ", ethers.formatEther(await sln.balanceOf(slnOwnerAddress)))
        console.log("Wealthy signer 2 balance: ", ethers.formatEther(await sln.balanceOf(slnOwnerAddress2)))
        tx = await sln.connect(wealthySigner).approve(tokenBridge.target, amountIn)
        await tx.wait()
        await expect(tokenBridge.connect(wealthySigner).swapTokens(
          swapId,
          sln.target,
          weth.target,
          amountIn,
          0,
          // deadline
        )).to.emit(tokenBridge, "SwapCompleted")
        .and.to.emit(tokenBridge, "FeeDistributed");
        
      // Check if sender is added to swapIdToSenders
      expect(await tokenBridge.getSenders(swapId)).to.include(slnOwnerAddress);

      // Check if fee is distributed
      const feeAmount = amountIn * 1n / 100n * 8n / 10n; // 1% * 0.8 fee
      expect(await tokenBridge.getFeeBalance(sln.target, slnOwnerAddress)).to.equal(feeAmount);
    });

    it("Should revert if amountIn is 0", async function () {
      await expect(tokenBridge.connect(wealthySigner).swapTokens(
        1,
        slnMainnetAddress,
        wethMainnetAddress,
        0,
        0
      )).to.be.revertedWith("Amount must be greater than 0");
    });
  });

  describe("withdrawFee", function () {
    it("Should allow withdrawal of accumulated fees", async function () {
      const amountIn = ethers.parseEther("100");
      tx = await sln.connect(wealthySigner2).approve(tokenBridge.target, amountIn)
      await tx.wait()
      // First, perform a swap to accumulate fees
      await tokenBridge.connect(wealthySigner2).swapTokens(
        1,
        slnMainnetAddress,
        usdtMainnetAddress,
        amountIn,
        0
      );
      const initialBalance = await sln.balanceOf(slnOwnerAddress2);
      await expect(tokenBridge.connect(wealthySigner2).withdrawFee(sln.target))
      .to.emit(tokenBridge, "FeeWithdrawn");
      
      const finalBalance = await sln.balanceOf(slnOwnerAddress2);
      expect(finalBalance - initialBalance).to.equal(ethers.parseEther("0.8")); // 1% of 100
    });

    it("Should revert if there's no fee to withdraw", async function () {
      await expect(tokenBridge.connect(wealthySigner).withdrawFee(slnMainnetAddress))
        .to.be.revertedWith("No fee to withdraw");
    });
  });

  describe("getSenders", function () {
    it("Should return correct senders for a swapId", async function () {
      const amountIn = ethers.parseEther("100");
      tx = await sln.connect(wealthySigner2).approve(tokenBridge.target, amountIn)
      await tx.wait()
      await tokenBridge.connect(wealthySigner2).swapTokens(
        1,
        slnMainnetAddress,
        usdtMainnetAddress,
        amountIn,
        0
      );

      const senders = await tokenBridge.getSenders(1);
      expect(senders).to.have.lengthOf(1);
      expect(senders[0]).to.equal(slnOwnerAddress2);
    });
  });

  describe("getFeeBalance", function () {
    it("Should return correct fee balance for a sender", async function () {
      const amountIn = ethers.parseEther("100");
      tx = await sln.connect(wealthySigner2).approve(tokenBridge.target, amountIn)
      await tx.wait()
      await tokenBridge.connect(wealthySigner2).swapTokens(
        1,
        slnMainnetAddress,
        usdtMainnetAddress,
        amountIn,
        0
      );

      const feeBalance = await tokenBridge.getFeeBalance(slnMainnetAddress, slnOwnerAddress2);
      expect(feeBalance).to.equal(ethers.parseEther("0.8")); // 1% of 100
      expect(await tokenBridge.contractFees(slnMainnetAddress)).to.equal(ethers.parseEther("0.2")); // 1% of 100
    });
  });

  describe("withdrawContractBalance", function () {
    it("Should allow owner to withdraw contract balance", async function () {
      // Send some Ether to the contract
      await owner.sendTransaction({
        to: tokenBridge.target,
        value: ethers.parseEther("1")
      });

      const initialBalance = await owner.provider.getBalance(await owner.getAddress());
      await tokenBridge.withdrawContractBalance(ethers.ZeroAddress);
      const finalBalance = await owner.provider.getBalance(await owner.getAddress());

      expect(finalBalance - initialBalance).to.be.closeTo(
        ethers.parseEther("1"),
        ethers.parseEther("0.01") // Allow for gas costs
      );
    });

    it("Should revert if called by non-owner", async function () {
      await expect(tokenBridge.connect(addr1).withdrawContractBalance(ethers.ZeroAddress))
        .to.be.revertedWithCustomError(tokenBridge, "OwnableUnauthorizedAccount");
    });

    it("Should return correct fee balance for a contract", async function () {
      const amountIn = ethers.parseEther("100");
      tx = await sln.connect(wealthySigner2).approve(tokenBridge.target, amountIn)
      await tx.wait()
      await tokenBridge.connect(wealthySigner2).swapTokens(
        1,
        slnMainnetAddress,
        usdtMainnetAddress,
        amountIn,
        0
      );

      const feeBalance = await tokenBridge.getFeeBalance(slnMainnetAddress, slnOwnerAddress2);
      expect(feeBalance).to.equal(ethers.parseEther("0.8")); // 1% of 100
      expect(await tokenBridge.contractFees(slnMainnetAddress)).to.equal(ethers.parseEther("0.2")); // 1% of 100
      
      await expect(tokenBridge.withdrawContractBalance(slnMainnetAddress)).to.emit(sln, "Transfer").withArgs(tokenBridge.target, await owner.getAddress(), ethers.parseEther("0.2")); // 1% of 100
      expect(await tokenBridge.contractFees(slnMainnetAddress)).to.equal(0); // 1% of 100
    });
    it("Should replace wallet on 21 TX", async function () {
      const amountIn = ethers.parseEther("1");
      tx = await sln.connect(wealthySigner2).approve(tokenBridge.target, amountIn * 20n)
      await tx.wait()
      tx = await sln.connect(wealthySigner).approve(tokenBridge.target, amountIn * 2n)
      await tx.wait()
      for (let i=0; i<20; i++){

        await tokenBridge.connect(wealthySigner2).swapTokens(
          1,
          slnMainnetAddress,
          usdtMainnetAddress,
          amountIn,
          0
        );
      }
      expect(await tokenBridge.swapIdToSenders(1,19)).to.equal(slnOwnerAddress2); 
      expect(await tokenBridge.swapIdToSenders(1,0)).to.equal(slnOwnerAddress2); 
      expect(await tokenBridge.swapIdToSenders(1,1)).to.equal(slnOwnerAddress2); 

      const feeBalance = await tokenBridge.getFeeBalance(slnMainnetAddress, slnOwnerAddress2);
      expect(feeBalance).to.be.closeTo(ethers.parseEther("0.008") * 20n, ethers.parseEther("0.000001")); 
      expect(await tokenBridge.contractFees(slnMainnetAddress)).to.be.closeTo(ethers.parseEther("0.002") * 20n, ethers.parseEther("0.000001")); 
      
      await tokenBridge.connect(wealthySigner).swapTokens(
        1,
        slnMainnetAddress,
        usdtMainnetAddress,
        amountIn,
        0
      );

      expect(await tokenBridge.swapIdToSenders(1,0)).to.equal(slnOwnerAddress); 
      expect(await tokenBridge.swapIdToSenders(1,1)).to.equal(slnOwnerAddress2); 
      
      await tokenBridge.connect(wealthySigner).swapTokens(
        1,
        slnMainnetAddress,
        usdtMainnetAddress,
        amountIn,
        0
      );
      expect(await tokenBridge.swapIdToSenders(1,1)).to.equal(slnOwnerAddress); 
      
      });
  });
});