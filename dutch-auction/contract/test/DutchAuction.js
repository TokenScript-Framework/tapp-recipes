const { expect } = require('chai');
const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');

describe('DutchAuction', function () {
  async function deployTokenFixture() {
    const [owner] = await ethers.getSigners();

    const DutchAuction = await ethers.getContractFactory('DutchAuction');
    const dutchAuction = await upgrades.deployProxy(DutchAuction);
    await dutchAuction.waitForDeployment();

    return {
      dutchAuction,
      owner,
    };
  }

  describe('deployment', function () {
    it('should set owner as admin role', async function () {
      const { dutchAuction, owner } = await loadFixture(deployTokenFixture);

      expect(await dutchAuction.owner()).to.equal(owner);
    });
  });
});
