import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';
import {
  BASE_URI,
  BIRDDOG_NFT_NAME,
  BIRDDOG_NFT_SYMBOL,
  BROKENBYTE_ENGINEERING_DEPLOYER,
  ARTIST,
  WITHDRAWAL_ADDRESSES,
  WITHDRAWAL_ALLOCATION_PERCENTAGE_NUMERATORS,
  ROYALTY_MULTISIG,
  COLLECTION_LEVEL_BASE_URI,
} from '../../Constants';
import { parseCSV } from '../../airdrop/parseCsvAirdropList';
import { ethers } from 'hardhat';

const BirddogNFTModule = buildModule('BirddogNFT', (m) => {
  // 1. Deploy contract
  const birddogNFT = m.contract('BirddogNFT', [
    BIRDDOG_NFT_NAME, // name
    BIRDDOG_NFT_SYMBOL, // symbol
    BROKENBYTE_ENGINEERING_DEPLOYER, // owner
    ARTIST, // artist
    ROYALTY_MULTISIG, // royaltyMultisig
    WITHDRAWAL_ADDRESSES, // _withdrawalAddresses
    WITHDRAWAL_ALLOCATION_PERCENTAGE_NUMERATORS, // _withdrawalAllocationPercentageNumerators
    BASE_URI, // initBaseURI
    COLLECTION_LEVEL_BASE_URI, // _collectionBaseURI
  ]);

  // 2. Parse the airdrop CSV and extract the participants and how many tokens they should receive.
  const filePath = './airdrop/airdrop.csv';
  parseCSV(filePath)
    .then(async (participantData) => {
      let participants: string[] = [];
      let mintAmounts: number[] = [];

      participantData.map((participantDatum: any) => {
        participants.push(participantDatum.Addresses);
        mintAmounts.push(participantDatum.MintAmount);
      });

      // 3. Call the airdrop function on the contract with the participants and mint amounts.
      const airdropCall = m.call(birddogNFT, 'airdropToBirdDogMemecoinParticipants', [
        participants,
        mintAmounts,
      ]);
    })
    .catch((error) => {
      console.error('Error parsing CSV:', error);
    });

  return { birddogNFT };
});

export default BirddogNFTModule;
