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

  uint256 public constant MAX_SUPPLY = 3000;

  uint256 public maxMintAmount = 5;
  uint256 public tokenMintCounter = 1;
  bool public paused = true;

  address[] public withdrawAddresses;
  uint256[] public withdrawPercentageNumerators;

  modifier inState(TokenState _state) {
    require(_state == state, "Function cannot be called in this state");
    _;
  }

  constructor(
    string memory _name,
    string memory _symbol,
    address owner,
    address artist,
    address royaltyMultisig,
    address[] memory _withdrawAddresses,
    uint256[] memory _withdrawPercentageNumerators,
    string memory _initBaseURI
  ) ERC721(_name, _symbol) Ownable(owner) {
    setBaseURI(_initBaseURI);

    _setDefaultRoyalty(royaltyMultisig, 750); // 7.5%

    require(
      _withdrawAddresses.length == _withdrawPercentageNumerators.length,
      "withdrawal array lengths do not match"
    );
    uint256 sumOfWithdawNumerators = 0;
    for (uint256 i = 0; i < _withdrawPercentageNumerators.length; i++) {
      sumOfWithdawNumerators += _withdrawPercentageNumerators[i];
    }
    require(
      sumOfWithdawNumerators == _feeDenominator(),
      "Withdrawal percentages do not add up to 100%"
    );
    withdrawAddresses = _withdrawAddresses;
    withdrawPercentageNumerators = _withdrawPercentageNumerators;

    // Mint first 5 to the artist
    for (uint256 i = 0; i < 5; i++) {
      _safeMint(artist, tokenMintCounter);
      tokenMintCounter++;
    }

    _safeMint(artist, 37); // Reserve token #37 for artist
    _safeMint(artist, 1248); // Reserve token #1248 for artist

    state = TokenState.Launched;
  }

  function airdropToBirdDogMemecoinParticipants(
    address[] memory recipients,
    uint256[] memory recipientAmounts
  ) public onlyOwner inState(TokenState.Launched) {
    require(state == TokenState.Launched, "Token is not in Launched state");
    require(recipients.length == recipientAmounts.length, "Array lengths do not match");

    for (uint256 i = 0; i < recipients.length; i++) {
      uint mintAmount = recipientAmounts[i];
      require(mintAmount <= maxMintAmount, "Mint amount exceeds max mint amount");

      for (uint j = 0; j < mintAmount; j++) {
        if (alreadyMinted(tokenMintCounter)) {
          tokenMintCounter++;
        }

        _safeMint(recipients[i], tokenMintCounter);
        tokenMintCounter++;
      }
    }

    state = TokenState.BirddogCoinHoldersAirdropped;
  }

  function alreadyMinted(uint256 tokenId) private view returns (bool) {
    require(tokenId <= 3000, "Token ID invalid");
    return _ownerOf(tokenId) != address(0);
  }

  function mint(
    address _to,
    uint256 _mintAmount
  ) public payable inState(TokenState.BirddogCoinHoldersAirdropped) {
    require(!paused, "Contract is paused");
    require(_mintAmount > 0, "You cannot mint 0 tokens");
    require(_mintAmount <= maxMintAmount, "You are not allowed to buy this many tokens at once");

    uint256 supply = totalSupply();
    require(supply + _mintAmount <= MAX_SUPPLY, "Exceeds maximum supply");
    if (supply + _mintAmount == MAX_SUPPLY) {
      state = TokenState.Soldout;
    }

    if (msg.sender != owner()) {
      require(msg.value >= cost * _mintAmount);
    }

    for (uint256 i = 0; i < _mintAmount; i++) {
      _safeMint(_to, tokenMintCounter);
      tokenMintCounter++;
    }
  }

  function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
    require(tokenId > 0 && tokenId <= 3000, "Token ID invalid");

    string memory currentBaseURI = _baseURI();
    return
      bytes(currentBaseURI).length > 0
        ? string(abi.encodePacked(currentBaseURI, tokenId.toString(), baseExtension))
        : "";
  }

  function _baseURI() internal view virtual override returns (string memory) {
    return baseURI;
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
    require(address(this).balance > 0, "No balance to withdraw");

    uint256 balanceToWithdraw = address(this).balance;
    for (uint256 i = 0; i < withdrawAddresses.length; i++) {
      (bool success, ) = payable(withdrawAddresses[i]).call{
        value: (balanceToWithdraw * withdrawPercentageNumerators[i]) / _feeDenominator()
      }("");
      require(success);
    }
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
