import pinataSDK from '@pinata/sdk';
import path from 'path';

const pinata = new pinataSDK({ pinataJWTKey: process.env.PINATA_JWT });
const directoryNameActual = 'birddog-nft-images';
const directoryNameTest = 'birddog-nft-images-test';

const directoryPathActual = './assets/images';
const directoryPathTest = './test-assets/images';
const isTestUpload = false;

async function uploadDirectoryToIPFS({
  directoryName,
  directoryPath,
}: {
  directoryName: string;
  directoryPath: string;
}) {
  try {
    console.log(`Attempting to upload directory to IPFS as: ${directoryName}\nStandby...`);
    const options = {
      pinataMetadata: {
        name: directoryName,
      },
      pinataOptions: {
        wrapWithDirectory: false,
      },
    };
    const res = await pinata.pinFromFS(directoryPath, options);
  } catch (error) {
    console.error('Error uploading directory to IPFS\n');
    throw error;
  }
}

uploadDirectoryToIPFS({
  directoryName: isTestUpload ? directoryNameTest : directoryNameActual,
  directoryPath: isTestUpload ? directoryPathTest : directoryPathActual,
})
  .then(() => console.log('Upload successfully completed!'))
  .catch((err) => console.error('Error uploading files:', err));
