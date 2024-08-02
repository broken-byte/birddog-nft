export const BIRDDOG_NFT_NAME = 'BirdDog: The NFT';
export const BIRDDOG_NFT_SYMBOL = 'BDOG';

export const IPFS_HASH = 'Qmb9uEcioFv23uRkwXpVpcmU1RqhbNeGxwty2yNAauTwxg';
export const COLLECTION_LEVEL_IPFS_HASH = 'QmSkpcQG91F2ARb3Jg31WZsWgm5pwZ77nCvqrkkwSG4McE';
// URI for individual token id metadata
export const BASE_URI = `ipfs://${IPFS_HASH}/`;
// URI for collection level metadata
export const COLLECTION_LEVEL_BASE_URI = `ipfs://${COLLECTION_LEVEL_IPFS_HASH}/`;

const mintAllocationAddressTA = '0x23a3e11A7b66Ed7019144dB4557E20278E63b7d8';
const mintAllocationAddressBrokenByte = '0x55B554EFaDdB6a229A3785cc535779E54be5308c';
const mintAllocationAddressJoeRahn = '0xa7470329c95A45a3EBBF58b2368ba996281bb0eA';
const mintAllocationAddressBirddogTreasury = '0x716696054A38819cf03f0e18347765faEbeA3A2D';
const mintAllocationAddressZlurpeeTreasury = '0x7B54A3EB099B25913cae7593A531774f7b4F9A36';

export const WITHDRAWAL_ADDRESSES = [
  mintAllocationAddressBirddogTreasury,
  mintAllocationAddressZlurpeeTreasury,
  mintAllocationAddressTA,
  mintAllocationAddressBrokenByte,
  mintAllocationAddressJoeRahn,
];
export const WITHDRAWAL_ALLOCATION_PERCENTAGE_NUMERATORS = [3500, 3500, 1000, 1000, 1000];

export const BROKENBYTE_ENGINEERING_DEPLOYER = '0x566bD9Df983BfEFf836A2C3b644553e6A80850Fa';
export const ARTIST = '0xa7470329c95A45a3EBBF58b2368ba996281bb0eA';
export const ROYALTY_MULTISIG = '0x073418FF5773Dd93c03C04E85Cb0Abd66796F866';
export const BROKENBYTE_TESTER = '0x49C3cD7706991A639774932490747f5D6F60c6b9';

export const AIRDROP_TEST_PARTICIPANTS = [BROKENBYTE_ENGINEERING_DEPLOYER, BROKENBYTE_TESTER];
export const AIRDROP_TEST_MINT_AMOUNTS = [3, 5];
