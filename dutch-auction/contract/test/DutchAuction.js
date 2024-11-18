const { expect } = require('chai');
const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');

describe('DutchAuction', function () {
  async function deployTokenFixture() {
    const [owner, owner2, buyer] = await ethers.getSigners();

    const DutchAuction = await ethers.getContractFactory('DutchAuction');
    const dutchAuction = await upgrades.deployProxy(DutchAuction);
    await dutchAuction.waitForDeployment();

    const Token = await ethers.getContractFactory('TestToken');
    const token = await Token.deploy();
    await token.waitForDeployment();

    await token.mint(owner);
    await token.mint(owner2);

    const block = await ethers.provider.getBlock('latest');

    return {
      dutchAuction,
      token,
      owner,
      buyer,
      ownedTokenId: 0,
      nowInSeconds: block.timestamp,
    };
  }

  describe('deployment', function () {
    it('should set owner as admin role', async function () {
      const { dutchAuction, owner } = await loadFixture(deployTokenFixture);

      expect(await dutchAuction.owner()).to.equal(owner);
    });
  });

  describe('createAuction', function () {
    it('should store auction details', async function () {
      const { dutchAuction, token, owner, ownedTokenId, nowInSeconds } = await loadFixture(deployTokenFixture);
      const startingPrice = 100;
      const reservePrice = 50;
      const dropRatePerHour = 10;

      await token.connect(owner).approve(dutchAuction, ownedTokenId);
      await dutchAuction.createAuction(token, ownedTokenId, startingPrice, reservePrice, nowInSeconds, dropRatePerHour);

      const auction = await dutchAuction.auctions(token, ownedTokenId);
      expect(auction[0]).to.equal(token);
      expect(auction[1]).to.equal(ownedTokenId);
      expect(auction[2]).to.equal(owner);
      expect(auction[3]).to.equal(startingPrice);
      expect(auction[4]).to.equal(reservePrice);
      expect(auction[5]).to.equal(nowInSeconds);
      expect(auction[6]).to.equal(dropRatePerHour);
      expect(auction[7]).to.equal(0);
    });

    it('should check approval status', async function () {
      const { dutchAuction, token, ownedTokenId, nowInSeconds } = await loadFixture(deployTokenFixture);
      const startingPrice = 100;
      const reservePrice = 50;
      const dropRatePerHour = 10;

      await expect(
        dutchAuction.createAuction(token, ownedTokenId, startingPrice, reservePrice, nowInSeconds, dropRatePerHour),
      ).to.be.revertedWith('DVP is not an approved operator for the token');
    });

    it('should verify token ownership', async function () {
      const { dutchAuction, owner, token, ownedTokenId, nowInSeconds } = await loadFixture(deployTokenFixture);
      const notOwnedTokenId = 1;
      const startingPrice = 100;
      const reservePrice = 50;
      const dropRatePerHour = 10;

      await token.connect(owner).approve(dutchAuction, ownedTokenId);

      await expect(
        dutchAuction.createAuction(token, notOwnedTokenId, startingPrice, reservePrice, nowInSeconds, dropRatePerHour),
      ).to.be.revertedWith('Caller is not the owner of the NFT');
    });

    it('should emit auction created event', async function () {
      const { dutchAuction, token, owner, ownedTokenId, nowInSeconds } = await loadFixture(deployTokenFixture);
      const startingPrice = 100;
      const reservePrice = 50;
      const dropRatePerHour = 10;

      await token.connect(owner).approve(dutchAuction, ownedTokenId);
      await expect(
        dutchAuction.createAuction(token, ownedTokenId, startingPrice, reservePrice, nowInSeconds, dropRatePerHour),
      )
        .to.emit(dutchAuction, 'NFTAuctionCreated')
        .withArgs(token, ownedTokenId, owner, startingPrice, reservePrice, nowInSeconds, dropRatePerHour);
    });
  });

  describe('currentPrice', function () {
    it('should calculate price during dropping period', async function () {
      const { dutchAuction, token, owner, ownedTokenId, nowInSeconds } = await loadFixture(deployTokenFixture);
      const startingPrice = 100;
      const reservePrice = 50;
      const dropRatePerHour = 10;
      const startTime = nowInSeconds - 3.5 * 3600;

      await token.connect(owner).approve(dutchAuction, ownedTokenId);
      await dutchAuction.createAuction(token, ownedTokenId, startingPrice, reservePrice, startTime, dropRatePerHour);

      expect(await dutchAuction.currentPrice(token, ownedTokenId)).to.equal(70);
    });

    it('should get reserve price after dropping period', async function () {
      const { dutchAuction, token, owner, ownedTokenId, nowInSeconds } = await loadFixture(deployTokenFixture);
      const startingPrice = 100;
      const reservePrice = 50;
      const dropRatePerHour = 10;
      const startTime = nowInSeconds - Math.floor(5.01 * 3600);

      await token.connect(owner).approve(dutchAuction, ownedTokenId);
      await dutchAuction.createAuction(token, ownedTokenId, startingPrice, reservePrice, startTime, dropRatePerHour);

      expect(await dutchAuction.currentPrice(token, ownedTokenId)).to.equal(reservePrice);
    });

    it('should get starting price before auction start time', async function () {
      const { dutchAuction, token, owner, ownedTokenId, nowInSeconds } = await loadFixture(deployTokenFixture);
      const startingPrice = 100;
      const reservePrice = 50;
      const dropRatePerHour = 10;
      const startTime = nowInSeconds + 1;

      await token.connect(owner).approve(dutchAuction, ownedTokenId);
      await dutchAuction.createAuction(token, ownedTokenId, startingPrice, reservePrice, startTime, dropRatePerHour);

      expect(await dutchAuction.currentPrice(token, ownedTokenId)).to.equal(startingPrice);
    });
  });

  describe('buyNFT', function () {
    it('should buy NFT', async function () {
      const { dutchAuction, token, owner, buyer, ownedTokenId, nowInSeconds } = await loadFixture(deployTokenFixture);
      const startingPrice = 100;
      const reservePrice = 50;
      const dropRatePerHour = 10;

      await token.connect(owner).approve(dutchAuction, ownedTokenId);
      await dutchAuction.createAuction(token, ownedTokenId, startingPrice, reservePrice, nowInSeconds, dropRatePerHour);

      await expect(dutchAuction.connect(buyer).buyNFT(token, ownedTokenId, { value: 100 })).to.changeTokenBalance(
        token,
        buyer,
        1,
      );
    });

    it('should send payment to seller', async function () {
      const { dutchAuction, token, owner, buyer, ownedTokenId, nowInSeconds } = await loadFixture(deployTokenFixture);
      const startingPrice = 100;
      const reservePrice = 50;
      const dropRatePerHour = 10;

      await token.connect(owner).approve(dutchAuction, ownedTokenId);
      await dutchAuction.createAuction(token, ownedTokenId, startingPrice, reservePrice, nowInSeconds, dropRatePerHour);

      await expect(dutchAuction.connect(buyer).buyNFT(token, ownedTokenId, { value: 100 })).to.changeEtherBalances(
        [owner, buyer],
        [100, -100],
      );
    });

    it('should only take the expected payment and send extra back to buyer', async function () {
      const { dutchAuction, token, owner, buyer, ownedTokenId, nowInSeconds } = await loadFixture(deployTokenFixture);
      const startingPrice = 100;
      const reservePrice = 50;
      const dropRatePerHour = 10;

      await token.connect(owner).approve(dutchAuction, ownedTokenId);
      await dutchAuction.createAuction(token, ownedTokenId, startingPrice, reservePrice, nowInSeconds, dropRatePerHour);

      await expect(dutchAuction.connect(buyer).buyNFT(token, ownedTokenId, { value: 120 })).to.changeEtherBalances(
        [owner, buyer],
        [100, -100],
      );
    });

    it('should record sold price', async function () {
      const { dutchAuction, token, owner, buyer, ownedTokenId, nowInSeconds } = await loadFixture(deployTokenFixture);
      const startingPrice = 100;
      const reservePrice = 50;
      const dropRatePerHour = 10;

      await token.connect(owner).approve(dutchAuction, ownedTokenId);
      await dutchAuction.createAuction(token, ownedTokenId, startingPrice, reservePrice, nowInSeconds, dropRatePerHour);
      await dutchAuction.connect(buyer).buyNFT(token, ownedTokenId, { value: 100 });

      expect((await dutchAuction.auctions(token, ownedTokenId))[7]).to.equal(100);
    });

    it('should emit nft sold event', async function () {
      const { dutchAuction, token, owner, buyer, ownedTokenId, nowInSeconds } = await loadFixture(deployTokenFixture);
      const startingPrice = 100;
      const reservePrice = 50;
      const dropRatePerHour = 10;

      await token.connect(owner).approve(dutchAuction, ownedTokenId);
      await dutchAuction.createAuction(token, ownedTokenId, startingPrice, reservePrice, nowInSeconds, dropRatePerHour);
      await expect(dutchAuction.connect(buyer).buyNFT(token, ownedTokenId, { value: 100 }))
        .to.emit(dutchAuction, 'NFTSold')
        .withArgs(token, ownedTokenId, buyer, startingPrice);
    });

    it('should revert when insufficient funds', async function () {
      const { dutchAuction, token, owner, buyer, ownedTokenId, nowInSeconds } = await loadFixture(deployTokenFixture);
      const startingPrice = 100;
      const reservePrice = 50;
      const dropRatePerHour = 10;
      const startTime = nowInSeconds - 3.5 * 3600;

      await token.connect(owner).approve(dutchAuction, ownedTokenId);
      await dutchAuction.createAuction(token, ownedTokenId, startingPrice, reservePrice, startTime, dropRatePerHour);

      await expect(dutchAuction.connect(buyer).buyNFT(token, ownedTokenId, { value: 69 })).to.be.revertedWith(
        'Insufficient funds',
      );
    });
  });
});
