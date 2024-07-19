import pinataSDK from '@pinata/sdk';

const pinata = new pinataSDK({ pinataJWTKey: process.env.PINATA_JWT });
const directoryNameActual = 'birddog-nft-metadata';
const directoryNameTest = 'birddog-nft-metadata-test';

const directoryPathActual = './assets/json';
const directoryPathTest = './test-assets/json';
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
