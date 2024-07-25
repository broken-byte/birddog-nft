import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

type AirdropParticipant = {
  Addresses: string;
  MintAmount: number;
};

export const parseCSV = (filePath: string): Promise<AirdropParticipant[]> => {
  return new Promise((resolve, reject) => {
    const csvFilePath = path.resolve(filePath);
    const csvFile = fs.readFileSync(csvFilePath, 'utf8');

    Papa.parse(csvFile, {
      header: true,
      complete: (result: Papa.ParseResult<AirdropParticipant>) => {
        const filteredData = result.data
          .filter((row) => {
            const isAddressValid = row.Addresses !== '';
            const isMintAmountValid =
              !isNaN(Number(row.MintAmount)) && Number(row.MintAmount) !== 0;

            return isAddressValid && isMintAmountValid;
          })
          .map(({ Addresses, MintAmount }) => ({
            Addresses: Addresses.trim(),
            MintAmount: Number(MintAmount),
          }));

        resolve(filteredData);
      },
      error: (error: Error) => reject(error),
      skipEmptyLines: true,
    });
  });
};

const filePath = './airdrop/airdrop.csv';
let participants: string[] = [];
let mintAmounts: number[] = [];
parseCSV(filePath)
  .then((participantData) => {
    participantData.map((participantDatum) => {
      participants.push(participantDatum.Addresses);
      mintAmounts.push(participantDatum.MintAmount);
    });

    console.log('Participants:', participants);
    console.log('Mint Amounts:', mintAmounts);
  })
  .catch((error) => {
    console.error('Error parsing CSV:', error);
  });

// const filePath = './airdrop/airdrop.csv';
// parseCSV(filePath)
//   .then((participants) => {
//     console.log('Parsed Participants:', participants);
//     console.log('==============================');
//     console.log('Count: ', participants.length);

//     let sum = 0;
//     participants.map((participant) => {
//       sum += participant.MintAmount;
//     });

//     console.log('Total Mint Amount: ', sum);
//   })
//   .catch((error) => {
//     console.error('Error parsing CSV:', error);
//   });
