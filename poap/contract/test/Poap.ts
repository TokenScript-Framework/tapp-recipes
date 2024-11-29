import {
  loadFixture,
  time,
} from '@nomicfoundation/hardhat-toolbox/network-helpers';
import {expect} from 'chai';
import {ethers, upgrades} from 'hardhat';
import {Poap, IERC721Errors__factory} from '../typechain-types';
import {Signer} from 'ethers';

// async function signStage(
//   contract: string,
//   to: string,
//   stage: bigint,
//   mintRequestId: bigint,
//   signer: any
// ) {
//   let abiCoder = new ethers.AbiCoder();
//   let encoded = await abiCoder.encode(
//     ['address', 'uint', 'address', 'uint', 'uint'],
//     [contract, 31337, to, stage, mintRequestId]
//   );
//   return await signer.signMessage(ethers.getBytes(ethers.keccak256(encoded)));
// }

async function signMint(
  contract: string,
  to: string,
  poapId: bigint,
  tokenId: bigint,
  signer: Signer
) {
  let abiCoder = new ethers.AbiCoder();
  let encoded = await abiCoder.encode(
    ['address', 'uint', 'address', 'uint', 'uint'],
    [contract, 31337, to, poapId, tokenId]
  );
  return await signer.signMessage(
    ethers.getBytes(ethers.keccak256(encoded))
  );

}

describe('Poap', () => {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployInitialFixture() {
    // Contracts are deployed using the first signer/account by default
    const [
      owner,
      otherAccount,
      otherAccount2,
      otherAccount3,
      trusted,
      sutEOAfunding,
    ] = await ethers.getSigners();

    const Poap = await ethers.getContractFactory('Poap');
    const nft = (await upgrades.deployProxy(Poap)) as unknown as Poap;
    await nft.waitForDeployment();

    return {
      owner,
      otherAccount,
      otherAccount2,
      otherAccount3,
      trusted,
      nft,
    };
  }

  describe('Demo', () => {
    it('full flow', async () => {
      const {owner, otherAccount, otherAccount2, trusted, nft} =
        await loadFixture(deployInitialFixture);
      await nft.setMintTimeRange(1n, Math.floor(Date.now() / 1000) + 1000);
      await nft.setMinterRole(trusted.address);
      let signature = await signMint(
        nft.target as string,
        otherAccount.address,
        0n, // poap
        1n, // tokenId
        trusted
      );
      expect(await nft.getSouvenirAmount(0)).to.eq(0n);
      expect(await nft.isTokenSouvenir(0,1)).to.eq(false);
      expect(await nft.getAllSouvenirs(0)).to.deep.eq([]);
      // expect(await nft.getSouvenirByIndex(0,0)).to.eq(false);
      await nft.connect(otherAccount).mint(0, 1, signature);
      
      expect(await nft.balanceOf(otherAccount.address)).to.eq(1n);
      expect(await nft.getSouvenirAmount(0)).to.eq(1n);
      expect(await nft.isTokenSouvenir(0,1)).to.eq(true);
      expect(await nft.getSouvenirByIndex(0,0)).to.eq(1n);
      expect(await nft.getAllSouvenirs(0)).to.deep.eq([1n]);
    });
  });
  /*
  describe('Mint', () => {
    it('Stage not started yet', async () => {
      const {owner, otherAccount, otherAccount2, trusted, nft} =
        await loadFixture(deployInitialFixture);

      await expect(
        nft.connect(otherAccount2).setMintTimeRange(0n, 0n)
      ).to.revertedWithCustomError(nft, 'OwnableUnauthorizedAccount');

      let signature = await signStage(
        nft.target as string,
        otherAccount2.address,
        0n,
        1n,
        trusted
      );

      await expect(
        nft.connect(otherAccount2).mint(4, 1, signature)
      ).to.revertedWith('Incorrect stage');

      await nft.setMintTimeRange(0n, Math.floor(Date.now() / 1000) + 1000);

      await expect(
        nft.connect(otherAccount2).mint(0, 1n, signature)
      ).to.revertedWith('Minting not started yet');

      await nft.setMintTimeRange(
        Math.floor(Date.now() / 1000) - 1000,
        Math.floor(Date.now() / 1000) - 10
      );

      await expect(
        nft.connect(otherAccount2).mint(0, 1n, signature)
      ).to.revertedWith('Minting finished');

      await nft.setTrustedSigner(trusted.address);

      await nft.setMintAmount(1);
      await nft.setMintTimeRange(
        Math.floor(Date.now() / 1000) - 1000,
        Math.floor(Date.now() / 1000) + 1000
      );

      await nft.connect(otherAccount2).mint(0, 1, signature);

      signature = await signStage(
        nft.target as string,
        otherAccount.address,
        0n,
        2n,
        trusted
      );

      await expect(
        nft.connect(otherAccount).mint(0, 2n, signature)
      ).to.revertedWith('Stage overflow');
    });

    it('counterXMinted, legendariesMinted, rareMinted', async () => {
      const {owner, otherAccount, otherAccount2, trusted, nft} =
        await loadFixture(deployInitialFixture);

      const [, , , , a5, a6, a7, a8] = await ethers.getSigners();

      let signature = await signStage(
        nft.target as string,
        otherAccount2.address,
        0n,
        1n,
        trusted
      );

      await nft.setMintTimeRange(0n, Math.floor(Date.now() / 1000) + 1000);

      await nft.setMintTimeRange(
        Math.floor(Date.now() / 1000) - 1000,
        Math.floor(Date.now() / 1000) - 10
      );

      await nft.setTrustedSigner(trusted.address);

      // await nft.setMintAmount(2);
      await nft.setMintTimeRange(
        Math.floor(Date.now() / 1000) - 1000,
        Math.floor(Date.now() / 1000) + 1000
      );

      expect(await nft.counter0Minted()).to.eq(0n);
      expect(await nft.legendariesMinted()).to.eq(0n);

      await nft.connect(otherAccount2).mint(0, 1, signature);

      expect(await nft.counter0Minted()).to.eq(1n);
      expect(await nft.legendariesMinted()).to.eq(1n);

      signature = await signStage(
        nft.target as string,
        otherAccount.address,
        0n,
        2n,
        trusted
      );

      await nft.connect(otherAccount).mint(0, 2, signature);

      expect(await nft.counter0Minted()).to.eq(2n);
      expect(await nft.legendariesMinted()).to.eq(2n);
      expect(await nft.raresMinted()).to.eq(0n);
      expect(await nft.launchpadMinted()).to.eq(0n);

      signature = await signStage(
        nft.target as string,
        a5.address,
        1n,
        3n,
        trusted
      );

      await nft.connect(a5).mint(1, 3, signature);

      expect(await nft.counter0Minted()).to.eq(2n);
      expect(await nft.legendariesMinted()).to.eq(2n);
      expect(await nft.counter1Minted()).to.eq(1n);
      expect(await nft.launchpadMinted()).to.eq(0n);
      expect(await nft.raresMinted()).to.eq(1n);

      signature = await signStage(
        nft.target as string,
        a6.address,
        2n,
        4n,
        trusted
      );

      await nft.connect(a6).mint(2, 4, signature);

      expect(await nft.legendariesMinted()).to.eq(2n);
      expect(await nft.raresMinted()).to.eq(1n);
      expect(await nft.stage0Minted()).to.eq(4n);
      expect(await nft.counter2Minted()).to.eq(1n);
    });

    it('Signer is not trusted', async () => {
      const {owner, otherAccount, otherAccount2, trusted, nft} =
        await loadFixture(deployInitialFixture);

      await nft.setMintTimeRange(1n, Math.floor(Date.now() / 1000) + 1000);

      let signature = await signStage(
        nft.target as string,
        otherAccount2.address,
        0n,
        1n,
        trusted
      );

      await expect(
        nft.connect(otherAccount2).mint(0, 1n, signature)
      ).to.revertedWith('Signer is not trusted');
    });

    it('stageMinted', async () => {
      const {owner, otherAccount, otherAccount2, trusted, nft} =
        await loadFixture(deployInitialFixture);

      await nft.setMintTimeRange(1n, Math.floor(Date.now() / 1000) + 1000);

      let signature = await signStage(
        nft.target as string,
        otherAccount2.address,
        0n,
        1n,
        trusted
      );
      await nft.setTrustedSigner(trusted.address);

      expect(await nft.stage0Minted()).to.eq(0n);
      expect(await nft.claimedByWallet(otherAccount2.address)).to.eq(false);
      expect(await nft.claimed()).to.eq(0n);
      await nft.connect(otherAccount2).mint(0, 1n, signature);

      expect(await nft.claimedByWallet(otherAccount2.address)).to.eq(true);
      expect(await nft.claimed()).to.eq(1n);
      expect(await nft.stage0Minted()).to.eq(1n);
    });

    it('double mint', async () => {
      const {owner, otherAccount, otherAccount2, trusted, nft} =
        await loadFixture(deployInitialFixture);

      await nft.setMintTimeRange(1n, Math.floor(Date.now() / 1000) + 1000);

      let signature = await signMint(
        nft.target as string,
        otherAccount2.address,
        0n,
        1n,
        trusted
      );
      await nft.setTrustedSigner(trusted.address);

      await nft.connect(otherAccount2).mint(0, 1n, signature);

      await expect(
        nft.connect(otherAccount2).mint(0, 1n, signature)
      ).to.revertedWith('User already minted');
    });

    it('emit Minted', async () => {
      const {owner, otherAccount, otherAccount2, trusted, nft} =
        await loadFixture(deployInitialFixture);

      await nft.setMintTimeRange(1n, Math.floor(Date.now() / 1000) + 1000);

      let signature = await signMint(
        nft.target as string,
        otherAccount2.address,
        3n,
        1n,
        trusted
      );
      await nft.setTrustedSigner(trusted.address);

      expect(await nft.counter3Minted()).to.eq(0n);
      expect(await nft.stage1Minted()).to.eq(0n);
      expect(await nft.launchpadMinted()).to.eq(0n);


      await expect(nft.connect(otherAccount2).mint(3, 1n, signature))
        .to.emit(nft, 'Minted')
        .withArgs(3n, otherAccount2.address, 0, 1);

      expect(await nft.counter3Minted()).to.eq(1n);
      expect(await nft.stage1Minted()).to.eq(1n);
      expect(await nft.launchpadMinted()).to.eq(1n);

    });
  });

  describe('mintWithCode', () => {
    it('mintWithCode correct flow', async () => {
      const {owner, otherAccount, otherAccount2, trusted, nft, morchiGame} =
        await loadFixture(deployInitialFixture);

      await nft.setMintTimeRange(1n, Math.floor(Date.now() / 1000) + 1000);

      let signature = await signStage(
        nft.target as string,
        otherAccount2.address,
        0n,
        1n,
        trusted
      );
      await nft.setTrustedSigner(trusted.address);
      // mint 1 NFT
      await nft.connect(otherAccount2).mint(0, 1n, signature);

      // enable mint with Code
      await nft.setMintWithCodeStartTime(Math.floor(Date.now() / 1000) - 1000);

      // generate activation code for level 5
      let activationCode = await signedCode(
        nft.target as string,
        0n,
        5,
        otherAccount2
      );

      // generate signature with suit-up ID 2
      signature = await signStage(
        nft.target as string,
        otherAccount.address,
        4n,
        2n,
        trusted
      );

      // set address of game contract
      await nft.setGameContract(morchiGame.target);

      await expect(nft.getMintCodeTokenId(activationCode)).to.revertedWith(
        'Game level too low'
      );

      expect(await nft.getGameLevel(0)).to.eq(0);
      // mock NFT#0 level 5
      await morchiGame.setCustomLevel(0, 5);
      expect(await nft.getGameLevel(0)).to.eq(5);

      expect(await nft.getMintCodeTokenId(activationCode)).to.eq(0);

      expect(await nft.counter4Minted()).to.eq(0n);
      await nft
        .connect(otherAccount)
        .mintWithCode(activationCode, 2, signature);

      expect(await nft.counter4Minted()).to.eq(1n);

      expect(await nft.balanceOf(otherAccount.address)).to.eq(1n);

      // generate activation code for level 10
      activationCode = await signedCode(
        nft.target as string,
        0n,
        10,
        otherAccount2
      );

      // mock NFT#0 level 10+
      await morchiGame.setCustomLevel(0, 100);
      await nft
        .connect(otherAccount)
        .mintWithCode(activationCode, 2, signature);
      expect(await nft.balanceOf(otherAccount.address)).to.eq(2n);
    });

    it('mintWithCode flow', async () => {
      const {
        owner,
        otherAccount,
        otherAccount2,
        otherAccount3,
        trusted,
        nft,
        morchiGame,
      } = await loadFixture(deployInitialFixture);

      await nft.setMintTimeRange(1n, Math.floor(Date.now() / 1000) + 1000);

      let signature = await signStage(
        nft.target as string,
        otherAccount2.address,
        0n,
        1n,
        trusted
      );
      await nft.setTrustedSigner(trusted.address);

      await nft.connect(otherAccount2).mint(0, 1n, signature);

      signature = await signStage(
        nft.target as string,
        otherAccount3.address,
        0n,
        2n,
        trusted
      );

      await nft.connect(otherAccount3).mint(0, 2n, signature);

      await expect(
        nft
          .connect(otherAccount2)
          .mintWithCode('0x' + '00'.repeat(224), 2, '0x')
      ).to.revertedWith('Mint with code not active yet');
      expect(await nft.getActivationCodeStatus('0x')).to.eq(
        'Minting not active yet'
      );

      await nft.setMintWithCodeStartTime(Math.floor(Date.now() / 1000) - 1000);

      await expect(
        nft.connect(otherAccount2).mintWithCode('0x', 2, '0x')
      ).to.revertedWith('Activation code wrong format');

      expect(await nft.getActivationCodeStatus('0x')).to.eq('Wrong format');

      let activationCode;

      activationCode = await signedCode(
        nft.target as string,
        1n,
        5,
        otherAccount2
      );

      signature = await signStage(
        nft.target as string,
        otherAccount3.address,
        4n,
        3n,
        trusted
      );

      await expect(
        nft.connect(otherAccount).mintWithCode(activationCode, 3, signature)
      ).to.revertedWith('Code issuer is not NFT owner');

      expect(await nft.getActivationCodeStatus(activationCode)).to.eq(
        'Code issuer is not NFT owner'
      );

      activationCode = await signedCode(
        nft.target as string,
        0n,
        5,
        otherAccount2
      );

      signature = await signStage(
        nft.target as string,
        otherAccount.address,
        4n,
        2n,
        trusted
      );

      expect(await nft.balanceOf(otherAccount.address)).to.eq(0n);

      await expect(
        nft.connect(otherAccount).mintWithCode(activationCode, 2, signature)
      ).to.revertedWith('Game contract undefined');

      expect(await nft.getActivationCodeStatus(activationCode)).to.eq(
        'Game contract undefined'
      );

      await nft.setGameContract(morchiGame.target);

      await expect(
        nft.connect(otherAccount).mintWithCode(activationCode, 2, signature)
      ).to.revertedWith('Game level too low');

      expect(await nft.getActivationCodeStatus(activationCode)).to.eq(
        'Game level too low'
      );

      await morchiGame.setCustomLevel(0, 4);

      expect(await morchiGame.morchiStates(0)).to.deep.eq([
        4n,
        false,
        false,
        false,
        false,
        0n,
        0n,
      ]);

      await expect(
        nft.connect(otherAccount).mintWithCode(activationCode, 2, signature)
      ).to.revertedWith('Game level too low');
      await morchiGame.setCustomLevel(0, 5);

      await nft
        .connect(otherAccount)
        .mintWithCode(activationCode, 2, signature);

      await expect(
        nft.connect(otherAccount).mintWithCode(activationCode, 2, signature)
      ).to.revertedWith('Game level too low');

      expect(await nft.balanceOf(otherAccount.address)).to.eq(1n);

      await morchiGame.setCustomLevel(0, 100);
      activationCode = await signedCode(
        nft.target as string,
        0n,
        1,
        otherAccount2
      );

      expect(await nft.getActivationCodeStatus(activationCode)).to.eq(
        'Wrong code level'
      );

      // await morchiGame.setCustomLevel(0, 10);
      activationCode = await signedCode(
        nft.target as string,
        0n,
        10n,
        otherAccount2
      );
      await nft
        .connect(otherAccount)
        .mintWithCode(activationCode, 2, signature);
      expect(await nft.balanceOf(otherAccount.address)).to.eq(2n);
    });

    it('mintWithCode flow after leveling up to 6', async () => {
      const {owner, otherAccount, otherAccount2, trusted, nft, morchiGame} =
          await loadFixture(deployInitialFixture);

      await nft.setMintTimeRange(1n, Math.floor(Date.now() / 1000) + 1000);

      let signature = await signStage(
          nft.target as string,
          otherAccount2.address,
          0n,
          1n,
          trusted
      );
      await nft.setTrustedSigner(trusted.address);
      // mint 1 NFT
      await nft.connect(otherAccount2).mint(0, 1n, signature);

      // enable mint with Code
      await nft.setMintWithCodeStartTime(Math.floor(Date.now() / 1000) - 1000);

      // generate activation code for level 6
      let activationCode = await signedCode(
          nft.target as string,
          0n,
          6,
          otherAccount2
      );

      // generate signature with suit-up ID 2
      signature = await signStage(
          nft.target as string,
          otherAccount.address,
          4n,
          2n,
          trusted
      );

      // set address of game contract
      await nft.setGameContract(morchiGame.target);

      await morchiGame.setCustomLevel(0, 5);

      await nft
          .connect(otherAccount)
          .mintWithCode(activationCode, 2, signature);

      expect(await nft.balanceOf(otherAccount.address)).to.eq(1n);

      expect(await nft.gameLevelActivationCodeUsed(0n)).to.eq(5n);

      expect(nft
          .connect(otherAccount)
          .mintWithCode(activationCode, 2, signature)).to.revertedWith('Game level too low');

      // Generate code for level 7, this should not be valid
      activationCode = await signedCode(
          nft.target as string,
          0n,
          7,
          otherAccount2
      );

      expect(nft
          .connect(otherAccount)
          .mintWithCode(activationCode, 2, signature)
      ).to.revertedWith('Game level too low');

      // generate activation code for level 10
      activationCode = await signedCode(
          nft.target as string,
          0n,
          10,
          otherAccount2
      );

      // mock NFT#0 level 10+
      await morchiGame.setCustomLevel(0, 10);
      await nft
          .connect(otherAccount)
          .mintWithCode(activationCode, 2, signature);
      expect(await nft.balanceOf(otherAccount.address)).to.eq(2n);

      expect(await nft.gameLevelActivationCodeUsed(0n)).to.eq(10n);

    });
  });
  */

  it('Test ERC5169', async () => {
    const {owner, otherAccount, otherAccount2, trusted, nft} =
      await loadFixture(deployInitialFixture);

    const ERC5169InterfaceId = '0xa86517a1';

    expect((await nft.scriptURI()).toString()).to.be.equal([].toString());

    expect(await nft.supportsInterface(ERC5169InterfaceId)).to.eq(true);

    const scriptURI = ['uri1', 'uri2', 'uri3'];

    await expect(
      nft.connect(otherAccount).setScriptURI(scriptURI)
    ).to.revertedWith('You do not have the authority to set the script URI');
    await expect(nft.connect(owner).setScriptURI(scriptURI))
      .emit(nft, 'ScriptUpdate')
      .withArgs(scriptURI);

    expect((await nft.scriptURI()).toString()).to.be.equal(
      scriptURI.toString()
    );
  });

  describe('Metadata', () => {
    it('Contract URI', async () => {
      const {owner, otherAccount, otherAccount2, trusted, nft} =
        await loadFixture(deployInitialFixture);

      expect(await nft.contractURI()).to.eq(
        'https://resources.smarttokenlabs.com/contract/poap_nft.json'
      );

      await nft.setContractUri(
        'https://ipfs.io/ipfs/QmY2wD5b3PpXHx9Y1n9VZg2RqGkWbqXqZk6yUqJtP1Jf8H'
      );
      expect(await nft.contractURI()).to.eq(
        'https://ipfs.io/ipfs/QmY2wD5b3PpXHx9Y1n9VZg2RqGkWbqXqZk6yUqJtP1Jf8H'
      );
    });

    it('supportsInterface', async () => {
      const {owner, otherAccount, otherAccount2, trusted, nft} =
        await loadFixture(deployInitialFixture);
      // TODO
    });

    it('Token URI', async () => {
      const {owner, otherAccount, otherAccount2, trusted, nft} =
        await loadFixture(deployInitialFixture);

      await nft.setMintTimeRange(1n, Math.floor(Date.now() / 1000) + 1000);
      await nft.setMinterRole(trusted.address);
      let signature = await signMint(
        nft.target as string,
        otherAccount2.address,
        0n,
        2n,
        trusted
      );
      // await nft.setTrustedSigner(trusted.address);

      await expect(nft.connect(otherAccount2).mint(0, 2, signature))
        .to.emit(nft, 'Minted')
        .withArgs(otherAccount2.address, 0n, 2);

      expect(await nft.tokenURI(2n)).to.eq(
        `https://store-backend.smartlayer.network/metadata/31337/${nft.target.toLowerCase()}/2`
      );
    });
  });
});
