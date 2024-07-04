import * as fs from 'fs';
import * as Papa from 'papaparse';

interface TraitRarity {
  [traitType: string]: {
    [traitValue: string]: number;
  };
}

// Load the JSON data
const rawData = fs.readFileSync('./assets/trait_rarity.json', 'utf8');
const traitRarity: TraitRarity = JSON.parse(rawData);

// Convert the JSON data to a CSV-compatible format
const rarityData = [];

for (const traitType in traitRarity) {
  if (traitRarity.hasOwnProperty(traitType)) {
    for (const traitValue in traitRarity[traitType]) {
      if (traitRarity[traitType].hasOwnProperty(traitValue)) {
        rarityData.push({
          'Trait Type': traitType,
          'Trait Value': traitValue,
          'Rarity (%)': traitRarity[traitType][traitValue],
        });
      }
    }
  }
}

// Convert the data to CSV
const csv = Papa.unparse(rarityData);

// Save the CSV to a file
fs.writeFileSync('trait_rarity.csv', csv);

console.log('CSV file saved to trait_rarity.csv');
