import { ethers } from 'hardhat';
import { Signer } from 'ethers';
import { expect } from 'chai';
import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers';
import { BirddogNFT } from '../typechain-types';
import {
  IPFS_HASH,
  BIRDDOG_NFT_NAME,
  BIRDDOG_NFT_SYMBOL,
  WITHDRAWAL_ALLOCATION_PERCENTAGE_NUMERATORS,
} from '../Constants';

describe('Birddog NFT', function () {
  async function deployBirddogNFTFixture(): Promise<{
    accounts: Signer[];
    contract: BirddogNFT;
  }> {
    const accounts = await ethers.getSigners();
    const ownerAddress = await accounts[0].getAddress();
    const artistAddress = await accounts[1].getAddress();
    const royaltyMultisigAddress = await accounts[2].getAddress();
    const baseUri = `ipfs://${IPFS_HASH}/`;
    const withdrawAddresses = [
      await accounts[3].getAddress(),
      await accounts[4].getAddress(),
      await accounts[5].getAddress(),
      await accounts[6].getAddress(),
      await accounts[7].getAddress(),
    ];

    /**
     * constructor(
    string memory _name,
    string memory _symbol,
    address owner,
    address artist,
    address royaltyMultisig,
    string memory _initBaseURI
  )
     */

    const contract = await ethers.deployContract('BirddogNFT', [
      BIRDDOG_NFT_NAME, // _name
      BIRDDOG_NFT_SYMBOL, // _symbol
      ownerAddress, // owner
      artistAddress, // artist
      royaltyMultisigAddress, // royaltyMultisig
      withdrawAddresses, // _withdrawAddresses
      WITHDRAWAL_ALLOCATION_PERCENTAGE_NUMERATORS, // _withdrawalAllocationPercentageNumerators
      baseUri, // _initBaseURI
    ]);

    await contract.waitForDeployment();

    return { accounts, contract };
  }

  async function callBirdDogMemeCoinAirdropFunctionToMoveStateForward(
    accounts: Signer[],
    contract: BirddogNFT
  ) {
    const birddogHolderRecipients: string[] = [
      await accounts[2].getAddress(),
      await accounts[3].getAddress(),
    ];
    const birddogHolderAmounts: number[] = [2, 4];

    await contract.airdropToBirdDogMemecoinParticipants(
      birddogHolderRecipients,
      birddogHolderAmounts
    );
  }

  describe('Constructor', function () {
    it('should set the name', async function () {
      const { contract } = await loadFixture(deployBirddogNFTFixture);
      expect(await contract.name()).to.equal(BIRDDOG_NFT_NAME);
    });

    it('should set the symbol', async function () {
      const { contract } = await loadFixture(deployBirddogNFTFixture);
      expect(await contract.symbol()).to.equal(BIRDDOG_NFT_SYMBOL);
    });

    it('should set the owner', async function () {
      const { contract, accounts } = await loadFixture(deployBirddogNFTFixture);
      const ownerAddress = await accounts[0].getAddress();
      expect(await contract.owner()).to.equal(ownerAddress);
    });

    it('should have set the royalty info as 7.5% to the royalty multisig address', async function () {
      const { contract, accounts } = await loadFixture(deployBirddogNFTFixture);
      const royaltyMultisigAddress = await accounts[2].getAddress();
      const someSalePrice = ethers.parseEther('0.04');
      const expectedRoyaltyAmount = (someSalePrice * BigInt(750)) / BigInt(10000);

      // Check the royalty info for any arbitrary token
      const [royaltyReceiver, royaltyAmount] = await contract.royaltyInfo(
        37,
        ethers.parseEther('0.04')
      );
      expect(royaltyReceiver).to.equal(royaltyMultisigAddress);
      expect(royaltyAmount).to.equal(expectedRoyaltyAmount);
    });

    it('should have set the withdrawal addresses and allocation percentages', async function () {
      const { contract, accounts } = await loadFixture(deployBirddogNFTFixture);
      const expectedWithdrawAddresses = [
        await accounts[3].getAddress(),
        await accounts[4].getAddress(),
        await accounts[5].getAddress(),
        await accounts[6].getAddress(),
        await accounts[7].getAddress(),
      ];

      expect(await contract.withdrawAddresses(0)).to.equal(expectedWithdrawAddresses[0]);
      expect(await contract.withdrawAddresses(1)).to.equal(expectedWithdrawAddresses[1]);
      expect(await contract.withdrawAddresses(2)).to.equal(expectedWithdrawAddresses[2]);
      expect(await contract.withdrawAddresses(3)).to.equal(expectedWithdrawAddresses[3]);
      expect(await contract.withdrawAddresses(4)).to.equal(expectedWithdrawAddresses[4]);

      expect(await contract.withdrawPercentageNumerators(0)).to.equal(
        WITHDRAWAL_ALLOCATION_PERCENTAGE_NUMERATORS[0]
      );
      expect(await contract.withdrawPercentageNumerators(1)).to.equal(
        WITHDRAWAL_ALLOCATION_PERCENTAGE_NUMERATORS[1]
      );
      expect(await contract.withdrawPercentageNumerators(2)).to.equal(
        WITHDRAWAL_ALLOCATION_PERCENTAGE_NUMERATORS[2]
      );
      expect(await contract.withdrawPercentageNumerators(3)).to.equal(
        WITHDRAWAL_ALLOCATION_PERCENTAGE_NUMERATORS[3]
      );
      expect(await contract.withdrawPercentageNumerators(4)).to.equal(
        WITHDRAWAL_ALLOCATION_PERCENTAGE_NUMERATORS[4]
      );
    });

    it('should have minted #37 and #1248, and the first 5 to the artist address', async function () {
      const { contract, accounts } = await loadFixture(deployBirddogNFTFixture);
      const artistAddress = await accounts[1].getAddress();
      expect(await contract.balanceOf(artistAddress)).to.equal(7);
      expect(await contract.ownerOf(37)).to.equal(artistAddress);
      expect(await contract.ownerOf(1248)).to.equal(artistAddress);
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
      expect(await contract.MAX_SUPPLY()).to.equal(3000);
    });

    it('should have defaulted to a max mint per transaction of 5 tokens', async function () {
      const { contract } = await loadFixture(deployBirddogNFTFixture);
      expect(await contract.maxMintAmount()).to.equal(5);
    });

    it('should have moved the token mint counter to 6 since the token counter rests on the next token to be minted', async function () {
      const { contract } = await loadFixture(deployBirddogNFTFixture);
      expect(await contract.tokenMintCounter()).to.equal(6);
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

  describe('airdropToBirdDogMemecoinParticipants', function () {
    it('should mint and airdrop NFTs to participants in the Birddog coin holder NFT giveaway', async function () {
      const { contract, accounts } = await loadFixture(deployBirddogNFTFixture);
      const birddogHolderRecipients: string[] = [
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
        await accounts[12].getAddress(),
      ];
      const birddogHolderAmounts: number[] = [2, 4, 3, 1, 5, 5, 5, 5, 5, 5, 5]; // 11 addresses, 40 tokens total
      await contract.airdropToBirdDogMemecoinParticipants(
        birddogHolderRecipients,
        birddogHolderAmounts
      );

      for (let i = 0; i < birddogHolderRecipients.length; i++) {
        expect(await contract.balanceOf(birddogHolderRecipients[i])).to.equal(
          birddogHolderAmounts[i]
        );
      }
    });

    it('should revert if the sender is not the owner', async function () {
      const { contract, accounts } = await loadFixture(deployBirddogNFTFixture);
      const birddogHolderRecipients: string[] = [
        await accounts[2].getAddress(),
        await accounts[3].getAddress(),
      ];
      const birddogHolderAmounts: number[] = [2, 4];

      await expect(
        contract
          .connect(accounts[1])
          .airdropToBirdDogMemecoinParticipants(birddogHolderRecipients, birddogHolderAmounts)
      ).to.be.reverted;
    });
  });

  describe('mint', function () {
    it('should mint a token', async function () {
      const { contract, accounts } = await loadFixture(deployBirddogNFTFixture);
      await callBirdDogMemeCoinAirdropFunctionToMoveStateForward(accounts, contract);
      await contract.pause(false);
      const recipient = await accounts[4].getAddress();

      await contract.mint(recipient, 1);

      expect(await contract.balanceOf(recipient)).to.equal(1);
    });

    it('should mint multiple tokens', async function () {
      const { contract, accounts } = await loadFixture(deployBirddogNFTFixture);
      await callBirdDogMemeCoinAirdropFunctionToMoveStateForward(accounts, contract);
      await contract.pause(false);
      const recipient = await accounts[4].getAddress();

      await contract.mint(recipient, 3);

      expect(await contract.balanceOf(recipient)).to.equal(3);
    });

    it('should revert if the contract is still paused', async function () {
      const { contract, accounts } = await loadFixture(deployBirddogNFTFixture);
      await callBirdDogMemeCoinAirdropFunctionToMoveStateForward(accounts, contract);
      await contract.pause(true);
      const recipient = await accounts[4].getAddress();

      await expect(contract.mint(recipient, 1)).to.be.reverted;
    });

    it('should revert if the contract has not airdropped to BirdDog Memecoin participants', async function () {
      const { contract, accounts } = await loadFixture(deployBirddogNFTFixture);
      await contract.pause(false);
      const recipient = await accounts[4].getAddress();

      await expect(contract.mint(recipient, 1)).to.be.reverted;
    });

    it('should move the token counter appropriately when minting', async function () {
      const { contract, accounts } = await loadFixture(deployBirddogNFTFixture);
      await callBirdDogMemeCoinAirdropFunctionToMoveStateForward(accounts, contract);
      await contract.pause(false);
      const recipient = await accounts[4].getAddress();
      const mintCountSoFarFromConstructorAllocations = 5;
      const mintCountSoFarFromAirdrop = 6;

      await contract.mint(recipient, 5);

      // +1 because token mint counter rests on the next token to be minted
      expect(await contract.tokenMintCounter()).to.equal(
        5 + mintCountSoFarFromConstructorAllocations + mintCountSoFarFromAirdrop + 1
      );
    });
  });

  describe('withdraw', function () {
    it('should withdraw the funds generated from minting to the predefined addresses at the predefined percentages', async function () {
      const { contract, accounts } = await loadFixture(deployBirddogNFTFixture);
      await callBirdDogMemeCoinAirdropFunctionToMoveStateForward(accounts, contract);
      await contract.pause(false);
      const recipient = await accounts[4].getAddress();
      const mintAmount = 5;
      const costPerMint = await contract.cost();
      const totalAmountOfEtherGenerated = costPerMint * BigInt(mintAmount);
      await contract.mint(recipient, 5);
      const withdrawAddresses = [
        await contract.withdrawAddresses(0),
        await contract.withdrawAddresses(1),
        await contract.withdrawAddresses(2),
        await contract.withdrawAddresses(3),
        await contract.withdrawAddresses(4),
      ];
      const withdrawPercentageNumerators = [
        await contract.withdrawPercentageNumerators(0),
        await contract.withdrawPercentageNumerators(1),
        await contract.withdrawPercentageNumerators(2),
        await contract.withdrawPercentageNumerators(3),
        await contract.withdrawPercentageNumerators(4),
      ];
      const withdrawAmounts = withdrawPercentageNumerators.map((percentage) => {
        return (totalAmountOfEtherGenerated * BigInt(percentage)) / BigInt(10000);
      });
      const initialBalances = await Promise.all(
        withdrawAddresses.map(async (address) => {
          return await ethers.provider.getBalance(address);
        })
      );

      await contract.withdraw();

      const finalBalances = await Promise.all(
        withdrawAddresses.map(async (address) => {
          return await ethers.provider.getBalance(address);
        })
      );

      expect(finalBalances[0] - initialBalances[0]).to.equal(withdrawAmounts[0]);
      expect(finalBalances[1] - initialBalances[1]).to.equal(withdrawAmounts[1]);
      expect(finalBalances[2] - initialBalances[2]).to.equal(withdrawAmounts[2]);
      expect(finalBalances[3] - initialBalances[3]).to.equal(withdrawAmounts[3]);
      expect(finalBalances[4] - initialBalances[4]).to.equal(withdrawAmounts[4]);
    });
  });
});
