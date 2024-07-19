// prettier-ignore
import fs from 'fs';
import path from 'path';

const JSON_DIRECTORY = path.join(__dirname, '/json');

// Function to modify the image field in each JSON file
const modifyImageField = () => {
  if (!fs.existsSync(JSON_DIRECTORY)) {
    console.error('Directory does not exist:', JSON_DIRECTORY);
    return;
  }

  let fileCount = 0;
  const files = fs.readdirSync(JSON_DIRECTORY);
  console.log('Processing JSON files...');
  for (const file of files) {
    const imageNumber = parseInt(file.split('.')[0]); // Extract number from file name
    const fullFilePath = path.join(JSON_DIRECTORY, file);

    if (path.extname(file).includes('.json') === false) {
      console.error('File is not a JSON file:', file, 'Stopping the script...');
      return;
    }

    const data = fs.readFileSync(fullFilePath, 'utf8');
    let json;
    try {
      json = JSON.parse(data);
    } catch (error) {
      console.error('Error parsing JSON for file:', file, error);
      return;
    }

    json.name = `BIRDDOG #${imageNumber}`;

    const ipfsHash = 'QmR1eRsCqpMsHq9KaGHBGRw4YWjhj9kCwyeozCoH7am2Vb';
    json.image = `ipfs://${ipfsHash}/${imageNumber}.png`;

    json.description =
      `BIRDDOG NFT #${imageNumber} of 3000. ` +
      `Each BIRDDOG NFT is a unique, hand-drawn art piece minted on ` +
      `the Ethereum L2 blockchain, Base, and designed as an homage to ` +
      `Matt Furie's Boy's Club character, BirdDog. Join the community ` +
      `at: t.me/BaseBirdDog, follow us on Twitter/x at: x.com/Birddog_base., ` +
      `and buy the meme coin at www.basebirddog.com`;

    fs.writeFileSync(fullFilePath, JSON.stringify(json, null, 2), 'utf8');
    fileCount++;
  }

  console.log(`All JSON files have been processed. (files processed: ${fileCount})`);
};

// Execute the function
modifyImageField();
