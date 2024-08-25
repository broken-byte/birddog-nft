import { ethers } from 'hardhat';
import { Signer } from 'ethers';
import { expect } from 'chai';
import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers';
import { BirddogNFT } from '../typechain-types';
import {
  BASE_URI,
  COLLECTION_LEVEL_BASE_URI,
  BIRDDOG_NFT_NAME,
  BIRDDOG_NFT_SYMBOL,
  WITHDRAWAL_ALLOCATION_PERCENTAGE_NUMERATORS,
} from '../Constants';
import { parseCSV } from '../airdrop/parseCsvAirdropList';

describe('Birddog NFT', function () {
  async function deployBirddogNFTFixture(): Promise<{
    accounts: Signer[];
    contract: BirddogNFT;
  }> {
    const accounts = await ethers.getSigners();
    const ownerAddress = await accounts[0].getAddress();
    const artistAddress = await accounts[1].getAddress();
    const royaltyMultisigAddress = await accounts[2].getAddress();
    const withdrawAddresses = [
      await accounts[3].getAddress(),
      await accounts[4].getAddress(),
      await accounts[5].getAddress(),
      await accounts[6].getAddress(),
      await accounts[7].getAddress(),
    ];

    const contract = await ethers.deployContract('BirddogNFT', [
      BIRDDOG_NFT_NAME, // _name
      BIRDDOG_NFT_SYMBOL, // _symbol
      ownerAddress, // owner
      artistAddress, // artist
      royaltyMultisigAddress, // royaltyMultisig
      withdrawAddresses, // _withdrawAddresses
      WITHDRAWAL_ALLOCATION_PERCENTAGE_NUMERATORS, // _withdrawalAllocationPercentageNumerators
      BASE_URI, // _initBaseURI
      COLLECTION_LEVEL_BASE_URI, // _collectionBaseURI
    ]);

    await contract.waitForDeployment();

    return { accounts, contract };
  }

  async function generateMintFundsWithinContractInPrepForWithdrawal(
    accounts: Signer[],
    contract: BirddogNFT
  ): Promise<bigint> {
    contract.pause(false);
    const minter = accounts[4];
    const costPerMint = await contract.cost();
    const mintAmount = 5;
    const totalCost: bigint = costPerMint * BigInt(mintAmount);

    await contract.connect(minter).mint(5, {
      value: totalCost,
    });

    return totalCost;
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

      expect(await contract.baseURI()).to.equal(BASE_URI);
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
      expect(await contract.sequentialMintCounter()).to.equal(6);
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
    it('should set the metadata extension', async function () {
      const { contract } = await loadFixture(deployBirddogNFTFixture);
      const newBaseExtension = '.yaml';

      await contract.setMetadataExtension(newBaseExtension);

      expect(await contract.metadataExtension()).to.equal(newBaseExtension);
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
    it('should mint and airdrop NFTs to a smaller list of participants then planned in the Birddog coin holder NFT giveaway', async function () {
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

    it('should mint and airdrop NFTs to the actual list of participants in the Birddog coin holder NFT giveaway, (gas profiler)', async function () {
      const { contract, accounts } = await loadFixture(deployBirddogNFTFixture);
      const filePath = './airdrop/airdrop.csv';
      const airdropData = await parseCSV(filePath);
      let birddogHolderRecipients: string[] = [];
      let birddogHolderAmounts: number[] = [];

      let uniqueAddressesToMintCountMap: Map<string, number> = new Map();

      airdropData.map((participantDatum: any) => {
        birddogHolderRecipients.push(participantDatum.Addresses);
        birddogHolderAmounts.push(participantDatum.MintAmount);

        if (uniqueAddressesToMintCountMap.has(participantDatum.Addresses)) {
          const currentAmount: number = uniqueAddressesToMintCountMap.get(
            participantDatum.Addresses
          )!;
          uniqueAddressesToMintCountMap.set(
            participantDatum.Addresses,
            currentAmount + participantDatum.MintAmount
          );
        } else {
          uniqueAddressesToMintCountMap.set(
            participantDatum.Addresses,
            participantDatum.MintAmount
          );
        }
      });

      await contract.airdropToBirdDogMemecoinParticipants(
        birddogHolderRecipients,
        birddogHolderAmounts
      );

      uniqueAddressesToMintCountMap.forEach(async (mintedAmount, address) => {
        expect(await contract.balanceOf(address)).to.equal(mintedAmount);
      });
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

    it('should revert if the array lengths of the recipients and amounts are not equal', async function () {
      const { contract, accounts } = await loadFixture(deployBirddogNFTFixture);
      const birddogHolderRecipients: string[] = [
        await accounts[2].getAddress(),
        await accounts[3].getAddress(),
      ];
      const birddogHolderAmounts: number[] = [2, 4, 3];

      await expect(
        contract.airdropToBirdDogMemecoinParticipants(birddogHolderRecipients, birddogHolderAmounts)
      ).to.be.reverted;
    });
  });

  describe('mint', function () {
    it('should mint a token for free as the owner', async function () {
      const { contract, accounts } = await loadFixture(deployBirddogNFTFixture);
      const owner = await accounts[0].getAddress(); // Sender is the owner by default, this is just to get our own balance.
      await contract.pause(false);

      await contract.mint(1);

      expect(await contract.balanceOf(owner)).to.equal(1);
    });

    it('should mint multiple tokens for free as the owner', async function () {
      const { contract, accounts } = await loadFixture(deployBirddogNFTFixture);
      const owner = await accounts[0].getAddress(); // Sender is the owner by default, this is just to get our own balance.
      await contract.pause(false);

      await contract.mint(3);

      expect(await contract.balanceOf(owner)).to.equal(3);
    });

    it('should cost the appropriate amount of ether when minting  1 token as someone other than the owner', async function () {
      const { contract, accounts } = await loadFixture(deployBirddogNFTFixture);
      await contract.pause(false);
      const minter = accounts[4];
      const minterAddress = await accounts[4].getAddress();
      const costPerMint = await contract.cost();
      const mintAmount = 1;
      const totalCost = costPerMint * BigInt(mintAmount);
      const initialBalance = await ethers.provider.getBalance(minter);

      const tx = await contract.connect(minter).mint(1, {
        value: totalCost,
      });

      const receipt = await tx.wait();
      const gasCost: bigint = receipt!!.gasUsed * BigInt(tx.gasPrice);
      const finalBalance = await ethers.provider.getBalance(minter);
      const expectedFinalBalance = initialBalance - totalCost - gasCost;
      expect(finalBalance).to.equal(expectedFinalBalance);
    });

    it('should cost the appropriate amount of ether when minting  several tokens as someone other than the owner', async function () {
      const { contract, accounts } = await loadFixture(deployBirddogNFTFixture);
      await contract.pause(false);
      const minter = accounts[4];
      const minterAddress = await accounts[4].getAddress();
      const costPerMint = await contract.cost();
      const mintAmount = 3;
      const totalCost = costPerMint * BigInt(mintAmount);
      const initialBalance = await ethers.provider.getBalance(minterAddress);

      const tx = await contract.connect(minter).mint(3, {
        value: totalCost,
      });

      const receipt = await tx.wait();
      const gasCost: bigint = receipt!!.gasUsed * BigInt(tx.gasPrice);
      const finalBalance = await ethers.provider.getBalance(minterAddress);
      const expectedFinalBalance = initialBalance - totalCost - gasCost;
      expect(finalBalance).to.equal(expectedFinalBalance);
    });

    it('should move the token counter appropriately when minting', async function () {
      const { contract, accounts } = await loadFixture(deployBirddogNFTFixture);
      await contract.pause(false);
      const sequentialMintSoFarFromConstructorAllocations = 5;

      await contract.mint(5);

      // +1 because token mint counter rests on the next token to be minted
      expect(await contract.sequentialMintCounter()).to.equal(
        5 + sequentialMintSoFarFromConstructorAllocations + 1
      );
    });

    it('should be able to mint past token ids that have already been minted', async function () {
      const { contract, accounts } = await loadFixture(deployBirddogNFTFixture);
      await contract.pause(false);
      await contract.setMaxMintAmount(35);
      const sequentialMintSoFarFromConstructorAllocations = 5;

      // Token ID #37 is already minted for the artist in the constructor, so 5 + 35 = 40,
      //which should test minting past the already minted token ID.
      expect(await contract.mint(35)).to.not.be.reverted;
    });

    it('should revert if the minter (who is not the owner) does not send the appropriate amount of ether', async function () {
      const { contract, accounts } = await loadFixture(deployBirddogNFTFixture);
      await contract.pause(false);
      const minter = accounts[4];
      const minterAddress = await accounts[4].getAddress();
      await contract.setCost(ethers.parseEther('0.04'));
      const costPerMint = await contract.cost();
      const mintAmount = 1;
      const totalCost = costPerMint * BigInt(mintAmount);

      await expect(
        contract.connect(minter).mint(1, {
          value: ethers.parseEther('0.03'),
        })
      ).to.be.reverted;
    });

    it('should revert if the contract is still paused', async function () {
      const { contract, accounts } = await loadFixture(deployBirddogNFTFixture);
      await contract.pause(true);

      await expect(contract.mint(1)).to.be.reverted;
    });

    it('should revert if the mint amount is greater than the max mint amount', async function () {
      const { contract, accounts } = await loadFixture(deployBirddogNFTFixture);
      await contract.pause(false);
      await contract.setMaxMintAmount(3);

      await expect(contract.mint(4)).to.be.reverted;
    });

    it('should revert if the mint amount is greater than the max supply (constant at 3000)', async function () {
      const { contract, accounts } = await loadFixture(deployBirddogNFTFixture);
      await contract.pause(false);
      await contract.setMaxMintAmount(3001);

      await expect(contract.mint(3001)).to.be.reverted;
    });

    it('should revert if the amount to mint is 0', async function () {
      const { contract, accounts } = await loadFixture(deployBirddogNFTFixture);
      await contract.pause(false);

      await expect(contract.mint(0)).to.be.reverted;
    });

    it('should move the total supply forward when minting', async function () {
      const { contract, accounts } = await loadFixture(deployBirddogNFTFixture);
      await contract.pause(false);
      const mintCountSoFarFromConstructorAllocations = 7;

      await contract.mint(1);

      expect(await contract.totalSupply()).to.equal(1 + mintCountSoFarFromConstructorAllocations);
    });
  });

  describe('tokenURI', function () {
    it('should return the correct token URI for a token ID that has already been minted', async function () {
      const { contract, accounts } = await loadFixture(deployBirddogNFTFixture);
      const tokenID = 1;
      const expectedTokenURI = `${BASE_URI}${tokenID}.json`;

      const tokenURI = await contract.tokenURI(1);

      expect(tokenURI).to.equal(expectedTokenURI);
    });

    it('should revert if the token ID is out of bounds (1 to 3000, inclusive)', async function () {
      const { contract } = await loadFixture(deployBirddogNFTFixture);

      await expect(contract.tokenURI(0)).to.be.reverted;
      await expect(contract.tokenURI(3001)).to.be.reverted;
    });
  });

  describe('contractURI', function () {
    it('should return the correct contract URI', async function () {
      const { contract } = await loadFixture(deployBirddogNFTFixture);
      const expectedContractURI = `${COLLECTION_LEVEL_BASE_URI}birddog-nft.json`;

      const contractURI = await contract.contractURI();
      expect(contractURI).to.equal(expectedContractURI);
    });
  });

  describe('withdraw', function () {
    it('should withdraw the funds generated from minting to the predefined addresses at the predefined percentages', async function () {
      const { contract, accounts } = await loadFixture(deployBirddogNFTFixture);
      const totalAmountOfEtherGenerated = await generateMintFundsWithinContractInPrepForWithdrawal(
        accounts,
        contract
      );
      const withdrawAddresses = [
        await accounts[3].getAddress(),
        await accounts[4].getAddress(),
        await accounts[5].getAddress(),
        await accounts[6].getAddress(),
        await accounts[7].getAddress(),
      ];
      const withdrawPercentageNumerators = [
        await contract.withdrawPercentageNumerators(0),
        await contract.withdrawPercentageNumerators(1),
        await contract.withdrawPercentageNumerators(2),
        await contract.withdrawPercentageNumerators(3),
        await contract.withdrawPercentageNumerators(4),
      ];
      const expectedWithdrawAmounts = withdrawPercentageNumerators.map((numerator) => {
        return (totalAmountOfEtherGenerated * BigInt(numerator)) / BigInt(10000);
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

      expect(finalBalances[0] - initialBalances[0]).to.equal(expectedWithdrawAmounts[0]);
      expect(finalBalances[1] - initialBalances[1]).to.equal(expectedWithdrawAmounts[1]);
      expect(finalBalances[2] - initialBalances[2]).to.equal(expectedWithdrawAmounts[2]);
      expect(finalBalances[3] - initialBalances[3]).to.equal(expectedWithdrawAmounts[3]);
      expect(finalBalances[4] - initialBalances[4]).to.equal(expectedWithdrawAmounts[4]);
    });
  });
});
