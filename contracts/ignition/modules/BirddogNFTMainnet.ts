import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';
import { IPFS_HASH, BIRDDOG_NFT_NAME, BIRDDOG_NFT_SYMBOL } from '../../../Constants';

const BirddogNFTModule = buildModule('BirddogNFT', (m) => {
  const ownerAddress = '0x566bD9Df983BfEFf836A2C3b644553e6A80850Fa'; // BrokenByte Engineering Deployer;;
  const artistAddress = '0xa7470329c95A45a3EBBF58b2368ba996281bb0eA';
  const royaltyMultisigAddress = '0x073418FF5773Dd93c03C04E85Cb0Abd66796F866';

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
