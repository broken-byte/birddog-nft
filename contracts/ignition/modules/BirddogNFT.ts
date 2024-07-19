import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';
import { IPFS_HASH, BIRDDOG_NFT_NAME, BIRDDOG_NFT_SYMBOL } from '../../../Constants';

const BirddogNFTModule = buildModule('BirddogNFT', (m) => {
  const ownerAddress = '0x566bD9Df983BfEFf836A2C3b644553e6A80850Fa'; // BrokenByte Engineering Deployer;;
  const artistAddress = '0xa7470329c95A45a3EBBF58b2368ba996281bb0eA';
  const royaltyMultisigAddress = '0x073418FF5773Dd93c03C04E85Cb0Abd66796F866';
  const mintAllocationAddressTA = '0x23a3e11A7b66Ed7019144dB4557E20278E63b7d8';
  const mintAllocationAddressBrokenByte = '0x55B554EFaDdB6a229A3785cc535779E54be5308c';
  const mintAllocationAddressJoeRahn = '0xa7470329c95A45a3EBBF58b2368ba996281bb0eA';
  const mintAllocationAddressBirddogTreasury = '0x716696054A38819cf03f0e18347765faEbeA3A2D';
  const mintAllocationAddressZlurpeeTreasury = '0x7B54A3EB099B25913cae7593A531774f7b4F9A36';
  const initBaseURI = `ipfs://${IPFS_HASH}/`;

  const isTestnet: Boolean = false;

  // 1. Deploy contract
  const birddogNFT = m.contract('BirddogNFT', [
    BIRDDOG_NFT_NAME, // name
    BIRDDOG_NFT_SYMBOL, // symbol
    ownerAddress, // owner
    artistAddress, // artist
    royaltyMultisigAddress, // royaltyMultisig
    initBaseURI, // initBaseURI
  ]);

  // // 2. Mint liquidity to the deployer address in prep for liquidity provision
  // m.call(birddogNFT, 'mintRemainingSupplyForManualLiquidityProvisioning', [
  //   uniswapRouterAddressFinal,
  // ]);

  return { birddogNFT };
});

export default BirddogNFTModule;
