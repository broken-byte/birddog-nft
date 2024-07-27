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
