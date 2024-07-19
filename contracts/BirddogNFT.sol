// SPDX-License-Identifier: MIT

/**
 /$$$$$$$  /$$$$$$ /$$$$$$$  /$$$$$$$  /$$$$$$$   /$$$$$$   /$$$$$$ 
| $$__  $$|_  $$_/| $$__  $$| $$__  $$| $$__  $$ /$$__  $$ /$$__  $$
| $$  \ $$  | $$  | $$  \ $$| $$  \ $$| $$  \ $$| $$  \ $$| $$  \__/
| $$$$$$$   | $$  | $$$$$$$/| $$  | $$| $$  | $$| $$  | $$| $$ /$$$$
| $$__  $$  | $$  | $$__  $$| $$  | $$| $$  | $$| $$  | $$| $$|_  $$
| $$  \ $$  | $$  | $$  \ $$| $$  | $$| $$  | $$| $$  | $$| $$  \ $$
| $$$$$$$/ /$$$$$$| $$  | $$| $$$$$$$/| $$$$$$$/|  $$$$$$/|  $$$$$$/
|_______/ |______/|__/  |__/|_______/ |_______/  \______/  \______/ 
                                                                                                                 
 /$$   /$$ /$$$$$$$$ /$$$$$$$$
| $$$ | $$| $$_____/|__  $$__/
| $$$$| $$| $$         | $$   
| $$ $$ $$| $$$$$      | $$   
| $$  $$$$| $$__/      | $$   
| $$\  $$$| $$         | $$   
| $$ \  $$| $$         | $$   
|__/  \__/|__/         |__/                                                      
 */

pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Royalty.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BirddogNFT is ERC721Enumerable, ERC721Royalty, Ownable {
  using Strings for uint256;

  // States for the contract
  enum TokenState {
    Default,
    Launched,
    BirddogCoinHoldersAirdropped,
    Soldout
  }
  TokenState public state = TokenState.Default;
  string public baseURI;
  string public baseExtension = ".json";
  uint256 public cost = 0.04 ether;
  uint256 public maxSupply = 3000;
  uint256 public maxMintAmount = 5;
  bool public paused = true;

  modifier inState(TokenState _state) {
    require(_state == state, "Function cannot be called in this state");
    _;
  }

  constructor(
    string memory _name,
    string memory _symbol,
    address owner,
    string memory _initBaseURI
  ) ERC721(_name, _symbol) Ownable(owner) {
    setBaseURI(_initBaseURI);
    state = TokenState.Launched;
  }

  function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
    _requireOwned(tokenId);

    string memory currentBaseURI = _baseURI();
    return
      bytes(currentBaseURI).length > 0
        ? string(abi.encodePacked(currentBaseURI, tokenId.toString(), baseExtension))
        : "";
  }

  function mintAirdropToCoinHoldersOfBirddogAndArtist(
    address[] memory recipients,
    uint256[] memory recipientAmounts,
    address artist
  ) public onlyOwner inState(TokenState.Launched) {
    require(state == TokenState.Launched, "Token is not in Launched state");
    require(recipients.length == recipientAmounts.length, "Array lengths do not match");

    for (uint256 i = 0; i < recipients.length; i++) {
      uint mintAmount = recipientAmounts[i];
      require(mintAmount <= maxMintAmount, "Mint amount exceeds max mint amount");
      uint256 supply = totalSupply();

      // Reserve token #37 for artist
      if (supply + mintAmount >= 37 && supply < 37) {
        uint256 tokenGapBetweenCurrentSupplyAnd37 = 37 - supply - 1; // offset by 1 because supply is 0 indexed
        for (uint j = 1; j <= tokenGapBetweenCurrentSupplyAnd37; j++) {
          _safeMint(recipients[i], supply + j);
        }

        _safeMint(artist, 37);

        // mint the rest of the tokens owed to the to the current recipient, if any
        mintAmount -= tokenGapBetweenCurrentSupplyAnd37;
        if (mintAmount > 0) {
          for (uint j = 38; j < 38 + mintAmount; j++) {
            _safeMint(recipients[i], j);
          }
        }
      } else {
        for (uint j = 1; j <= mintAmount; j++) {
          _safeMint(recipients[i], supply + j);
        }
      }
    }

    // Mint 5 more tokens to the artist at the end
    for (uint256 i = 1; i <= 5; i++) {
      _safeMint(artist, totalSupply() + i);
    }

    state = TokenState.BirddogCoinHoldersAirdropped;
  }

  function _baseURI() internal view virtual override returns (string memory) {
    return baseURI;
  }

  function mint(
    address _to,
    uint256 _mintAmount
  ) public payable inState(TokenState.BirddogCoinHoldersAirdropped) {
    uint256 supply = totalSupply();
    require(!paused);
    require(_mintAmount > 0);
    require(_mintAmount <= maxMintAmount);
    require(supply + _mintAmount <= maxSupply);

    if (msg.sender != owner()) {
      require(msg.value >= cost * _mintAmount);
    }

    for (uint256 i = 1; i <= _mintAmount; i++) {
      _safeMint(_to, supply + i);
    }

    if (supply + _mintAmount == maxSupply) {
      state = TokenState.Soldout;
    }
  }

  function getTokensOwnedByAddress(address _address) public view returns (uint256[] memory) {
    uint256 ownerTokenCount = balanceOf(_address);
    uint256[] memory tokenIds = new uint256[](ownerTokenCount);
    for (uint256 i; i < ownerTokenCount; i++) {
      tokenIds[i] = tokenOfOwnerByIndex(_address, i);
    }
    return tokenIds;
  }

  function setCost(uint256 _newCost) public onlyOwner {
    cost = _newCost;
  }

  // Changed from Hashlips
  function setMaxMintAmount(uint256 _newmaxMintAmount) public onlyOwner {
    maxMintAmount = _newmaxMintAmount;
  }

  function setBaseURI(string memory _newBaseURI) public onlyOwner {
    baseURI = _newBaseURI;
  }

  function setBaseExtension(string memory _newBaseExtension) public onlyOwner {
    baseExtension = _newBaseExtension;
  }

  function pause(bool _state) public onlyOwner {
    paused = _state;
  }

  function withdraw() public payable onlyOwner {
    // This will payout the owner 100% of the contract balance.
    // Do not remove this otherwise you will not be able to withdraw the funds.
    // =============================================================================
    (bool os, ) = payable(owner()).call{value: address(this).balance}("");
    require(os);
    // =============================================================================
  }

  // ERC721Royalty Override
  function supportsInterface(
    bytes4 interfaceId
  ) public view virtual override(ERC721Enumerable, ERC721Royalty) returns (bool) {
    return super.supportsInterface(interfaceId);
  }

  // ERC721Enumerable Overrides

  function _increaseBalance(
    address account,
    uint128 value
  ) internal virtual override(ERC721, ERC721Enumerable) {
    super._increaseBalance(account, value);
  }

  function _update(
    address to,
    uint256 tokenId,
    address auth
  ) internal virtual override(ERC721, ERC721Enumerable) returns (address) {
    return super._update(to, tokenId, auth);
  }
}
