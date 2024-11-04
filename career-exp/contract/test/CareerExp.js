const { expect } = require('chai');
const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');

describe('CareerExp', function () {
  async function deployTokenFixture() {
    const [owner, employer1, employee1, employee2] = await ethers.getSigners();

    const CareerExp = await ethers.getContractFactory('CareerExp');
    const careerExp = await upgrades.deployProxy(CareerExp, ['CareerExp', 'CXP']);
    await careerExp.waitForDeployment();

    return {
      careerExp,
      owner,
      employer1,
      employer1Name: 'Smart Token Labs',
      employer1Logo: 'https://resources.smartlayer.network/images/STL_Icon_Black.png',
      employee1,
      employee2,
    };
  }

  describe('deployment', function () {
    it('should set owner as admin role', async function () {
      const { careerExp, owner } = await loadFixture(deployTokenFixture);

      expect(await careerExp.owner()).to.equal(owner);
    });
  });

  describe('employer management', function () {
    it('should add employer', async function () {
      const { careerExp, owner, employer1, employer1Name, employer1Logo } = await loadFixture(deployTokenFixture);

      await careerExp.connect(owner).addEmployer(employer1Name, employer1Logo, employer1);
      const employer = await careerExp.getEmployer(employer1Name);

      expect(employer[0]).to.equal(employer1Logo);
      expect(employer[1]).to.equal(employer1);
    });
  });

  describe('claim', function () {
    it('should claim career experience', async function () {
      const { careerExp, owner, employer1, employer1Name, employer1Logo, employee1 } =
        await loadFixture(deployTokenFixture);

      await careerExp.connect(owner).addEmployer(employer1Name, employer1Logo, employer1);
      const proof = await generateCareerExpProof(
        await careerExp.getAddress(),
        '1',
        'Dev',
        Math.floor(Date.now() / 1000),
        Math.floor(Date.now() / 1000),
        employer1,
      );

      await careerExp.connect(employee1).claim(employer1Name, proof);
      expect(await careerExp.balanceOf(employee1)).to.equal(1);
    });
  });

  describe('endorse', function () {
    it('should endorse career experience', async function () {
      const { careerExp, owner, employer1, employer1Name, employer1Logo, employee1, employee2 } =
        await loadFixture(deployTokenFixture);

      const now = Math.floor(Date.now() / 1000);
      await careerExp.connect(owner).addEmployer(employer1Name, employer1Logo, employer1);
      const proof1 = await generateCareerExpProof(await careerExp.getAddress(), '1', 'Dev', now - 3600, now, employer1);
      await careerExp.connect(employee1).claim(employer1Name, proof1);
      const employee1TokenId = await careerExp.tokenOfOwnerByIndex(employee1, 0);

      const proof2 = await generateCareerExpProof(await careerExp.getAddress(), '2', 'BA', now - 3600, now, employer1);
      await careerExp.connect(employee2).claim(employer1Name, proof2);

      await careerExp.connect(employee2).endorse(employee1TokenId);

      expect(await careerExp.getEndorsement(employee1TokenId)).to.equal(1);
    });

    it('can not endorse if there is no career overlap', async function () {
      const { careerExp, owner, employer1, employer1Name, employer1Logo, employee1, employee2 } =
        await loadFixture(deployTokenFixture);

      const now = Math.floor(Date.now() / 1000);
      await careerExp.connect(owner).addEmployer(employer1Name, employer1Logo, employer1);
      const proof1 = await generateCareerExpProof(await careerExp.getAddress(), '1', 'Dev', now - 3600, now, employer1);
      await careerExp.connect(employee1).claim(employer1Name, proof1);
      const employee1TokenId = await careerExp.tokenOfOwnerByIndex(employee1, 0);

      const proof2 = await generateCareerExpProof(
        await careerExp.getAddress(),
        '2',
        'BA',
        now - 7200,
        now - 3601,
        employer1,
      );
      await careerExp.connect(employee2).claim(employer1Name, proof2);

      await expect(careerExp.connect(employee2).endorse(employee1TokenId)).to.be.revertedWith(
        'Endorser has no career overlap with the target token',
      );
    });

    it('can not endorse themselves', async function () {
      const { careerExp, owner, employer1, employer1Name, employer1Logo, employee1, employee2 } =
        await loadFixture(deployTokenFixture);

      const now = Math.floor(Date.now() / 1000);
      await careerExp.connect(owner).addEmployer(employer1Name, employer1Logo, employer1);
      const proof1 = await generateCareerExpProof(await careerExp.getAddress(), '1', 'Dev', now - 3600, now, employer1);
      await careerExp.connect(employee1).claim(employer1Name, proof1);
      const employee1TokenId = await careerExp.tokenOfOwnerByIndex(employee1, 0);

      await expect(careerExp.connect(employee1).endorse(employee1TokenId)).to.be.revertedWith(
        'Can not endorse yourself',
      );
    });
  });
});

async function generateCareerExpProof(contractAddress, employeeId, title, startInSec, endInSec, signer) {
  const abiCoder = new ethers.AbiCoder();
  const encoded = await abiCoder.encode(
    ['address', 'uint', 'string', 'string', 'uint', 'uint'],
    [contractAddress, 31337, employeeId, title, startInSec, endInSec],
  );
  const signature = await signer.signMessage(ethers.getBytes(ethers.keccak256(encoded)));

  return await abiCoder.encode(
    ['string', 'string', 'uint', 'uint', 'bytes'],
    [employeeId, title, startInSec, endInSec, signature],
  );
}
