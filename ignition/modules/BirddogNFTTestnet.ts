import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';
import {
  BASE_URI,
  BIRDDOG_NFT_NAME,
  BIRDDOG_NFT_SYMBOL,
  BROKENBYTE_ENGINEERING_DEPLOYER,
  WITHDRAWAL_ADDRESSES,
  WITHDRAWAL_ALLOCATION_PERCENTAGE_NUMERATORS,
  ROYALTY_MULTISIG,
  COLLECTION_LEVEL_BASE_URI,
} from '../../Constants';

const BirddogNFTModule = buildModule('BirddogNFT', (m) => {
  // 1. Deploy contract with dummy artist address (engineer instead of artist)
  const birddogNFT = m.contract('BirddogNFT', [
    BIRDDOG_NFT_NAME, // name
    BIRDDOG_NFT_SYMBOL, // symbol
    BROKENBYTE_ENGINEERING_DEPLOYER, // owner
    BROKENBYTE_ENGINEERING_DEPLOYER, // artist
    ROYALTY_MULTISIG, // royaltyMultisig
    WITHDRAWAL_ADDRESSES, // _withdrawalAddresses
    WITHDRAWAL_ALLOCATION_PERCENTAGE_NUMERATORS, // _withdrawalAllocationPercentageNumerators
    BASE_URI, // initBaseURI
    COLLECTION_LEVEL_BASE_URI, // _collectionBaseURI
  ]);

  // 2. Unpause the contract
  m.call(birddogNFT, 'pause', [false]);

  return { birddogNFT };
});

export default BirddogNFTModule;
