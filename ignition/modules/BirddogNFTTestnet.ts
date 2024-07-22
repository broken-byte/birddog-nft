import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';
import {
  BASE_URI,
  BIRDDOG_NFT_NAME,
  BIRDDOG_NFT_SYMBOL,
  BROKENBYTE_ENGINEERING_DEPLOYER,
  WITHDRAWAL_ADDRESSES,
  WITHDRAWAL_ALLOCATION_PERCENTAGE_NUMERATORS,
  ROYALTY_MULTISIG,
  AIRDROP_TEST_PARTICIPANTS,
  AIRDROP_TEST_MINT_AMOUNTS,
} from '../../Constants';

const BirddogNFTModule = buildModule('BirddogNFT', (m) => {
  // 1. Deploy contract
  const birddogNFT = m.contract('BirddogNFT', [
    BIRDDOG_NFT_NAME, // name
    BIRDDOG_NFT_SYMBOL, // symbol
    BROKENBYTE_ENGINEERING_DEPLOYER, // owner
    BROKENBYTE_ENGINEERING_DEPLOYER, // artist
    ROYALTY_MULTISIG, // royaltyMultisig
    WITHDRAWAL_ADDRESSES, // _withdrawalAddresses
    WITHDRAWAL_ALLOCATION_PERCENTAGE_NUMERATORS, // _withdrawalAllocationPercentageNumerators
    BASE_URI, // initBaseURI
  ]);

  // 2. Call the airdrop function on the contract with the participants and mint amounts.
  m.call(birddogNFT, 'airdropToBirdDogMemecoinParticipants', [
    AIRDROP_TEST_PARTICIPANTS,
    AIRDROP_TEST_MINT_AMOUNTS,
  ]);

  return { birddogNFT };
});

export default BirddogNFTModule;
