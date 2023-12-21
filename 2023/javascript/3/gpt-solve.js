import { readFileSync } from 'fs';
import Yargs from "yargs";

const args = Yargs(process.argv.slice(2)).argv;
function getArgvs() {
  let file = args.file;

  if (!file) {
    console.error(`Missing file`);
    process.exit(1);
  }

  return { file };
}

function sumPartNumbers(schematic) {
  const rows = schematic.split('\n').map(row => row.split(''));
  const symbols = new Set('*#$@&!%+-'); // Add any other symbols you expect to encounter
  let partNumbersSet = new Set();
  let sum = 0;

  function isSymbol(cell) {
    return isNaN(cell) && cell !== '.';
  }

  function addIfPartNumber(i, j) {
    const current = rows[i]?.[j];
    if (current && !isNaN(current)) {
      if (current !== '.') {
        let numStr = '';
        // We also need to check for multi-digit numbers
        while (rows[i]?.[j] && !isNaN(rows[i][j]) && rows[i][j] !== '.') {
          numStr += rows[i][j];
          j++;
        }
        // Check if this number has already been added
        if (!partNumbersSet.has(numStr)) {
          partNumbersSet.add(numStr);
          sum += parseInt(numStr, 10);
        }
      }
    }
  }

  for (let i = 0; i < rows.length; i++) {
    for (let j = 0; j < rows[i].length; j++) {
      const cell = rows[i][j];
      if (isSymbol(cell)) {
        // Check for adjacent part numbers in all 8 directions
        addIfPartNumber(i - 1, j - 1); // top left
        addIfPartNumber(i - 1, j);     // top
        addIfPartNumber(i - 1, j + 1); // top right
        addIfPartNumber(i, j - 1);     // left
        addIfPartNumber(i, j + 1);     // right
        addIfPartNumber(i + 1, j - 1); // bottom left
        addIfPartNumber(i + 1, j);     // bottom
        addIfPartNumber(i + 1, j + 1); // bottom right
      }
    }
  }

  return sum;
}

(function run() {
  try {
    const { file } = getArgvs();
    const content = readFileSync(file, { encoding:'utf8' }).trim();

    let startTime = new Date().getTime();
    let answer = sumPartNumbers(content);
    let endTime = new Date().getTime();
    console.log(`Solution 1: ${endTime - startTime} ms`);
    console.log(answer);

    startTime = new Date().getTime();
    answer = sumPartNumbers(content);
    endTime = new Date().getTime();
    console.log(`Solution 2: ${endTime - startTime} ms`);
    console.log(answer);

  } catch (error) {
    console.error(error);
    process.exit(1);
  }

  process.exit(0);

})();
