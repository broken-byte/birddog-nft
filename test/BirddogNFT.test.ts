import { ethers } from 'hardhat';
import { Signer } from 'ethers';
import { expect } from 'chai';
import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers';
import { BirddogNFT } from '../typechain-types';

describe('Birddog NFT', function () {
  const IPFS_HASH = 'QmR1eRsCqpMsHq9KaGHBGRw4YWjhj9kCwyeozCoH7am2Vb';

  async function deployBirddogNFTFixture(): Promise<{
    accounts: Signer[];
    contract: BirddogNFT;
  }> {
    const accounts = await ethers.getSigners();
    const ownerAddress = await accounts[0].getAddress();
    const name = 'BirddogNFT';
    const symbol = 'BDOG';
    const baseUri = `ipfs://${IPFS_HASH}/`;

    const contract = await ethers.deployContract('BirddogNFT', [
      name, // _name
      symbol, // _symbol
      ownerAddress, // owner
      baseUri, // _initBaseURI
    ]);

    await contract.waitForDeployment();

    return { accounts, contract };
  }

  describe('Constructor', function () {
    it('should set the owner', async function () {
      const { contract, accounts } = await loadFixture(deployBirddogNFTFixture);
      const ownerAddress = await accounts[0].getAddress();
      expect(await contract.owner()).to.equal(ownerAddress);
    });

    it('should set the name', async function () {
      const { contract } = await loadFixture(deployBirddogNFTFixture);
      expect(await contract.name()).to.equal('BirddogNFT');
    });

    it('should set the symbol', async function () {
      const { contract } = await loadFixture(deployBirddogNFTFixture);
      expect(await contract.symbol()).to.equal('BDOG');
    });

    it('should set the base URI', async function () {
      const { contract } = await loadFixture(deployBirddogNFTFixture);
      const baseUri = `ipfs://${IPFS_HASH}/`;

      expect(await contract.baseURI()).to.equal(baseUri);
    });

    it('should set the token state to launched', async function () {
      const { contract } = await loadFixture(deployBirddogNFTFixture);
      expect(await contract.state()).to.equal(1); // Launched;
    });

    it('should have defaulted to a 0.04 ETH cost per token mint', async function () {
      const { contract } = await loadFixture(deployBirddogNFTFixture);
      expect(await contract.cost()).to.equal(ethers.parseEther('0.04'));
    });

    it('should have defaulted to a max supply of 3000 tokens', async function () {
      const { contract } = await loadFixture(deployBirddogNFTFixture);
      expect(await contract.maxSupply()).to.equal(3000);
    });

    it('should have defaulted to a max mint per transaction of 5 tokens', async function () {
      const { contract } = await loadFixture(deployBirddogNFTFixture);
      expect(await contract.maxMintAmount()).to.equal(5);
    });

    it('should have defaulted to paused', async function () {
      const { contract } = await loadFixture(deployBirddogNFTFixture);
      expect(await contract.paused()).to.equal(true);
    });
  });

  describe('setBaseURI', function () {
    it('should set the base URI', async function () {
      const { contract } = await loadFixture(deployBirddogNFTFixture);
      const newIpfsHash = 'asdfsfkHulloHullo';
      const baseUri = `ipfs://${newIpfsHash}/`;

      await contract.setBaseURI(baseUri);

      expect(await contract.baseURI()).to.equal(baseUri);
    });
  });

  describe('setCost', function () {
    it('should set the cost', async function () {
      const { contract } = await loadFixture(deployBirddogNFTFixture);
      const newCost = ethers.parseEther('0.05');

      await contract.setCost(newCost);

      expect(await contract.cost()).to.equal(newCost);
    });
  });

  describe('setMaxMintAmount', function () {
    it('should set the max mint amount', async function () {
      const { contract } = await loadFixture(deployBirddogNFTFixture);
      const newMaxMintAmount = 10;

      await contract.setMaxMintAmount(newMaxMintAmount);

      expect(await contract.maxMintAmount()).to.equal(newMaxMintAmount);
    });
  });

  describe('setBaseExtension', function () {
    it('should set the base extension', async function () {
      const { contract } = await loadFixture(deployBirddogNFTFixture);
      const newBaseExtension = '.yaml';

      await contract.setBaseExtension(newBaseExtension);

      expect(await contract.baseExtension()).to.equal(newBaseExtension);
    });
  });

  describe('pause', function () {
    it('should set the paused state', async function () {
      const { contract } = await loadFixture(deployBirddogNFTFixture);

      await contract.pause(false);

      expect(await contract.paused()).to.equal(false);
    });
  });

  describe('mintAirdropToCoinHoldersOfBirddogAndArtist', function () {
    it('should mint and airdrop to the coin holders of Birddog and #37 to the artist', async function () {
      const { contract, accounts } = await loadFixture(deployBirddogNFTFixture);
      const birddogHolderRecipients: string[] = [
        await accounts[1].getAddress(),
        await accounts[2].getAddress(),
        await accounts[3].getAddress(),
        await accounts[4].getAddress(),
        await accounts[5].getAddress(),
        await accounts[6].getAddress(),
        await accounts[7].getAddress(),
        await accounts[8].getAddress(),
        await accounts[9].getAddress(),
        await accounts[10].getAddress(),
        await accounts[11].getAddress(),
      ];
      const birddogHolderAmounts: number[] = [2, 4, 3, 1, 5, 5, 5, 5, 5, 5, 5]; // 11 addresses, 40 tokens total
      const artistAddress = await accounts[12].getAddress();

      await contract.mintAirdropToCoinHoldersOfBirddogAndArtist(
        birddogHolderRecipients,
        birddogHolderAmounts,
        artistAddress
      );

      for (let i = 0; i < birddogHolderRecipients.length; i++) {
        expect(await contract.balanceOf(birddogHolderRecipients[i])).to.equal(
          birddogHolderAmounts[i]
        );
      }

      expect(await contract.balanceOf(artistAddress)).to.equal(6);
      const tokensOwnedByArtist: bigint[] = await contract.getTokensOwnedByAddress(artistAddress);
      expect(tokensOwnedByArtist).to.include(BigInt(37));
    });

    it('should revert if the sender is not the owner', async function () {
      const { contract, accounts } = await loadFixture(deployBirddogNFTFixture);
      const birddogHolderRecipients: string[] = [
        await accounts[1].getAddress(),
        await accounts[2].getAddress(),
        await accounts[3].getAddress(),
        await accounts[4].getAddress(),
        await accounts[5].getAddress(),
        await accounts[6].getAddress(),
        await accounts[7].getAddress(),
        await accounts[8].getAddress(),
        await accounts[9].getAddress(),
        await accounts[10].getAddress(),
        await accounts[11].getAddress(),
      ];
      const birddogHolderAmounts: number[] = [2, 4, 3, 1, 5, 5, 5, 5, 5, 5, 5]; // 11 addresses, 40 tokens total
      const artistAddress = await accounts[12].getAddress();

      await expect(
        contract
          .connect(accounts[1])
          .mintAirdropToCoinHoldersOfBirddogAndArtist(
            birddogHolderRecipients,
            birddogHolderAmounts,
            artistAddress
          )
      ).to.be.reverted;
    });
  });
});
