const { expect } = require('chai');
const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');
const { increase } = require('@nomicfoundation/hardhat-network-helpers/dist/src/helpers/time');

describe('BondingCurveNFT', function () {
  async function deployTokenFixture() {
    const [owner, signer, receiver, buyer] = await ethers.getSigners();

    const BondingCurveNFT = await ethers.getContractFactory('BondingCurveNFT');
    const bondingCurveNFT = await BondingCurveNFT.deploy();
    await bondingCurveNFT.waitForDeployment();

    const receiverTwitterHandle = '@me';
    await bondingCurveNFT.setReceiverTwitterHandle(receiverTwitterHandle);

    await bondingCurveNFT.setTrustedSigner(signer);

    return {
      bondingCurveNFT,
      owner,
      signer,
      receiverTwitterHandle: '@me',
      receiver,
      buyer,
    };
  }

  describe('deployment', function () {
    it('should set owner as admin role', async function () {
      const { bondingCurveNFT, owner } = await loadFixture(deployTokenFixture);

      expect(await bondingCurveNFT.owner()).to.equal(owner);
    });

    it('should set receiver twitter handle', async function () {
      const { bondingCurveNFT, receiverTwitterHandle } = await loadFixture(deployTokenFixture);

      expect(await bondingCurveNFT.receiverTwitterHandle()).to.equal(receiverTwitterHandle);
    });

    it('should set trusted signer', async function () {
      const { bondingCurveNFT, signer } = await loadFixture(deployTokenFixture);

      expect(await bondingCurveNFT.trustedSigner()).to.equal(signer);
    });
  });

  describe('mint', function () {
    it('should mint with bonding curve price', async function () {
      const { bondingCurveNFT, receiver, buyer } = await loadFixture(deployTokenFixture);

      await expect(bondingCurveNFT.connect(buyer).mint({ value: ethers.parseEther('1') })).to.changeTokenBalance(
        bondingCurveNFT,
        buyer,
        1,
      );
    });
  });

  describe('mint', function () {
    it('should mint with bonding curve price', async function () {
      const { bondingCurveNFT, buyer } = await loadFixture(deployTokenFixture);

      await expect(bondingCurveNFT.connect(buyer).mint({ value: ethers.parseEther('1') })).to.changeTokenBalance(
        bondingCurveNFT,
        buyer,
        1,
      );
    });

    it('should take payment and split to contract and receiver', async function () {
      const { bondingCurveNFT, buyer } = await loadFixture(deployTokenFixture);

      await expect(bondingCurveNFT.connect(buyer).mint({ value: ethers.parseEther('1') }))
        .to.emit(bondingCurveNFT, 'MintRevenueSplit')
        .withArgs(14736981718000000n, 2947396343600000n, 11789585374400000n);

      expect(await bondingCurveNFT.totalMintRevenue()).to.equal(14736981718000000n);
      expect(await bondingCurveNFT.totalReceiverRevenue()).to.equal(11789585374400000n);
    });
  });

  describe('sell', function () {
    it('should sell and burn', async function () {
      const { bondingCurveNFT, buyer } = await loadFixture(deployTokenFixture);

      await bondingCurveNFT.connect(buyer).mint({ value: ethers.parseEther('1') });

      await expect(bondingCurveNFT.connect(buyer).sell(1)).to.changeTokenBalance(bondingCurveNFT, buyer, -1);
    });

    it('should get penalty for early sell', async function () {
      const { bondingCurveNFT, buyer } = await loadFixture(deployTokenFixture);

      await bondingCurveNFT.connect(buyer).mint({ value: ethers.parseEther('1') });

      await expect(bondingCurveNFT.connect(buyer).sell(1)).to.changeEtherBalance(buyer, 7368490859000000n);

      expect(await bondingCurveNFT.totalReceiverRevenue()).to.equal(5894792687200000n);
    });

    it('should sell and earn', async function () {
      const { bondingCurveNFT, buyer } = await loadFixture(deployTokenFixture);

      await bondingCurveNFT.connect(buyer).mint({ value: ethers.parseEther('1') });
      await increase(30 * 24 * 60 * 60 + 1);

      await expect(bondingCurveNFT.connect(buyer).sell(1)).to.changeEtherBalance(buyer, 663164177310000n);

      expect(await bondingCurveNFT.totalReceiverRevenue()).to.equal(11259054032552000n);
    });
  });

  describe('withdrawReceiverFunds', function () {
    it('should withdraw receiver funds', async function () {
      const { bondingCurveNFT, signer, receiver, buyer, receiverTwitterHandle } = await loadFixture(deployTokenFixture);

      await bondingCurveNFT.connect(buyer).mint({ value: ethers.parseEther('1') });
      const signature = await generateSignature(receiverTwitterHandle, receiver, signer);

      expect(await bondingCurveNFT.connect(receiver).withdrawReceiverFunds(signature)).to.changeEtherBalance(
        receiver,
        11789585374n,
      );
    });

    it('should set contract as withdrawn', async function () {
      const { bondingCurveNFT, signer, receiver, buyer, receiverTwitterHandle } = await loadFixture(deployTokenFixture);

      await bondingCurveNFT.connect(buyer).mint({ value: ethers.parseEther('1') });
      const signature = await generateSignature(receiverTwitterHandle, receiver, signer);
      await bondingCurveNFT.connect(receiver).withdrawReceiverFunds(signature);

      expect(await bondingCurveNFT.isWithdrawn()).to.equal(true);
    });

    it('should revert when signer is not trusted', async function () {
      const { bondingCurveNFT, receiver, buyer, receiverTwitterHandle } = await loadFixture(deployTokenFixture);

      await bondingCurveNFT.connect(buyer).mint({ value: ethers.parseEther('1') });
      const signature = await generateSignature(receiverTwitterHandle, receiver, buyer);
      await expect(bondingCurveNFT.connect(receiver).withdrawReceiverFunds(signature)).to.be.revertedWith(
        'Invalid withdraw signature',
      );
    });
  });
});

async function generateSignature(receiverTwitterHandle, receiver, signer) {
  const abiCoder = new ethers.AbiCoder();
  const encoded = await abiCoder.encode(['string', 'address'], [receiverTwitterHandle, receiver.address]);
  return await signer.signMessage(ethers.getBytes(ethers.keccak256(encoded)));
}
