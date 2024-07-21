import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';
import {
  IPFS_HASH,
  BIRDDOG_NFT_NAME,
  BIRDDOG_NFT_SYMBOL,
  BROKENBYTE_ENGINEERING_DEPLOYER,
  ARTIST,
  WITHDRAWAL_ADDRESSES,
  WITHDRAWAL_ALLOCATION_PERCENTAGE_NUMERATORS,
  ROYALTY_MULTISIG,
} from '../../../Constants';

const BirddogNFTModule = buildModule('BirddogNFT', (m) => {
  const initBaseURI = `ipfs://${IPFS_HASH}/`;

  /**
   * constructor(
    string memory _name,
    string memory _symbol,
    address owner,
    address artist,
    address royaltyMultisig,
    address[] memory _withdrawAddresses,
    uint256[] memory _withdrawPercentageNumerators,
    string memory _initBaseURI
  )
   */

  // 1. Deploy contract
  const birddogNFT = m.contract('BirddogNFT', [
    BIRDDOG_NFT_NAME, // name
    BIRDDOG_NFT_SYMBOL, // symbol
    BROKENBYTE_ENGINEERING_DEPLOYER, // owner
    ARTIST, // artist
    ROYALTY_MULTISIG, // royaltyMultisig
    initBaseURI, // initBaseURI
  ]);

  // // 2. Mint liquidity to the deployer address in prep for liquidity provision
  // m.call(birddogNFT, 'mintRemainingSupplyForManualLiquidityProvisioning', [
  //   uniswapRouterAddressFinal,
  // ]);

  return { birddogNFT };
});

export default BirddogNFTModule;
