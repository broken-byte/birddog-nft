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

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Royalty.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BirddogNFT is ERC721Royalty, Ownable {
  using Strings for uint256;

  string public baseURI;
  string public collectionBaseURI;
  string public metadataExtension = ".json";
  string public contractMetadataFileName = "birddog-nft";
  uint256 public cost = 0.04 ether;

  uint256 public constant MAX_SUPPLY = 3000;
  uint256 public totalSupply = 0;

  uint256 public maxMintAmount = 5;
  uint256 public sequentialMintCounter = 1;
  bool public paused = true;
  bool public isSoldOut = false;

  address[] public withdrawAddresses;
  uint256[] public withdrawPercentageNumerators;

  constructor(
    string memory _name,
    string memory _symbol,
    address owner,
    address artist,
    address royaltyMultisig,
    address[] memory _withdrawAddresses,
    uint256[] memory _withdrawPercentageNumerators,
    string memory _initBaseURI,
    string memory _collectionBaseURI
  ) ERC721(_name, _symbol) Ownable(owner) {
    setBaseURI(_initBaseURI);
    setCollectionBaseURI(_collectionBaseURI);

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
      _safeMint(artist, sequentialMintCounter, "" /* data */);
      sequentialMintCounter++;
    }

    // We don't move the sequentialMintCounter here because we are minting out of order.
    // mint() will take this into account with an 'alreadyMinted' check
    _safeMint(artist, 37, "" /* data */); // Reserve token #37 for artist
    _safeMint(artist, 1248, "" /* data */); // Reserve token #1248 for artist
  }

  function _safeMint(address to, uint256 tokenId, bytes memory data) internal virtual override {
    require(1 <= tokenId && tokenId <= MAX_SUPPLY, "Token ID invalid");
    super._safeMint(to, tokenId, data);
    totalSupply++;
  }

  function airdropToBirdDogMemecoinParticipants(
    address[] memory recipients,
    uint256[] memory recipientAmounts
  ) public onlyOwner {
    require(recipients.length == recipientAmounts.length, "Array lengths do not match");

    for (uint256 i = 0; i < recipients.length; i++) {
      uint mintAmount = recipientAmounts[i];
      require(mintAmount <= maxMintAmount, "Mint amount exceeds max mint amount");

      for (uint j = 0; j < mintAmount; j++) {
        if (alreadyMinted(sequentialMintCounter)) {
          sequentialMintCounter++;
        }

        _safeMint(recipients[i], sequentialMintCounter, "" /* data */);
        sequentialMintCounter++;
      }
    }
  }

  function alreadyMinted(uint256 tokenId) private view returns (bool) {
    require(tokenId <= 3000, "Token ID invalid");
    return _ownerOf(tokenId) != address(0);
  }

  function mint(address _to, uint256 _mintAmount) public payable {
    require(!paused, "Contract is paused");
    require(_mintAmount > 0, "You cannot mint 0 tokens");
    require(_mintAmount <= maxMintAmount, "You are not allowed to buy this many tokens at once");

    require(totalSupply + _mintAmount <= MAX_SUPPLY, "Exceeds maximum supply");
    if (totalSupply + _mintAmount == MAX_SUPPLY) {
      isSoldOut = true;
    }

    if (msg.sender != owner()) {
      require(msg.value >= cost * _mintAmount);
    }

    for (uint256 i = 0; i < _mintAmount; i++) {
      _safeMint(_to, sequentialMintCounter, "" /* data */);
      sequentialMintCounter++;
    }
  }

  function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
    require(tokenId > 0 && tokenId <= 3000, "Token ID invalid");

    string memory currentBaseURI = _baseURI();
    return
      bytes(currentBaseURI).length > 0
        ? string(abi.encodePacked(currentBaseURI, tokenId.toString(), metadataExtension))
        : "";
  }

  function contractURI() public view returns (string memory) {
    string memory currentCollectionBaseURI = collectionBaseURI;
    return
      bytes(currentCollectionBaseURI).length > 0
        ? string(
          abi.encodePacked(currentCollectionBaseURI, contractMetadataFileName, metadataExtension)
        )
        : "";
  }

  function _baseURI() internal view virtual override returns (string memory) {
    return baseURI;
  }

  function setCost(uint256 _newCost) public onlyOwner {
    cost = _newCost;
  }

  function setMaxMintAmount(uint256 _newmaxMintAmount) public onlyOwner {
    maxMintAmount = _newmaxMintAmount;
  }

  function setBaseURI(string memory _newBaseURI) public onlyOwner {
    baseURI = _newBaseURI;
  }

  function setCollectionBaseURI(string memory _newCollectionBaseURI) public onlyOwner {
    collectionBaseURI = _newCollectionBaseURI;
  }

  function setMetadataExtension(string memory _newMetadataExtension) public onlyOwner {
    metadataExtension = _newMetadataExtension;
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
}
