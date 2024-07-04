import * as fs from 'fs';

interface Attribute {
  trait_type: string;
  value: string;
}

interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  dna: string;
  edition: number;
  date: number;
  attributes: Attribute[];
  compiler: string;
}

// Load metadata
const metadata: NFTMetadata[] = JSON.parse(fs.readFileSync('./assets/json/_metadata.json', 'utf8'));

// Count occurrences of each trait value
const traitCounts: Record<string, Record<string, number>> = {};
const totalNFTs = metadata.length;

metadata.forEach((nft) => {
  nft.attributes.forEach((attribute) => {
    const traitType = attribute.trait_type;
    const traitValue = attribute.value;

    if (!traitCounts[traitType]) {
      traitCounts[traitType] = {};
    }

    if (!traitCounts[traitType][traitValue]) {
      traitCounts[traitType][traitValue] = 0;
    }

    traitCounts[traitType][traitValue] += 1;
  });
});

// Calculate rarity percentages
const traitRarity: Record<string, Record<string, number>> = {};

Object.keys(traitCounts).forEach((traitType) => {
  traitRarity[traitType] = {};
  Object.keys(traitCounts[traitType]).forEach((traitValue) => {
    traitRarity[traitType][traitValue] = (traitCounts[traitType][traitValue] / totalNFTs) * 100;
  });
});

// Output rarity percentages
console.log(traitRarity);

// Save the rarity to a file if needed
fs.writeFileSync('trait_rarity.json', JSON.stringify(traitRarity, null, 2), 'utf8');
