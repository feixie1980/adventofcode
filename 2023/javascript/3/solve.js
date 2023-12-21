import { readFileSync } from 'fs';
import Yargs from "yargs";

function printUsage() {
  console.log("\nUsage: node solve.js --file=input.txt");
}

const args = Yargs(process.argv.slice(2)).argv;
function getArgvs() {
  let file = args.file;

  if (!file) {
    console.error(`Missing file`);
    printUsage();
    process.exit(1);
  }

  return { file };
}

function parseInput(content) {
  return content.split('\n').map(line => [...line]);
}

function findIndex(array, fromIndex, callback) {
  if (fromIndex >= array.length || fromIndex < 0) {
    return -1;
  }

  const i = array.slice(fromIndex).findIndex(callback);
  if (i === -1) {
    return -1;
  }

  return i + fromIndex;
}

const range = (start, stop, step = 1) =>
  Array.from({ length: (stop - start) / step + 1 }, (_, i) => start + i * step);

function isSymbol(grid, rowIndex, columIndex) {
  if (rowIndex < 0 || rowIndex >= grid.length) {
    return false;
  }
  if (columIndex < 0 || columIndex >= grid[rowIndex].length) {
    return false;
  }
  const c = grid[rowIndex][columIndex];
  return c !== '.' && isNaN(c);
}

function adjacentToSymbol(grid, rowIndex, [startNumIndex, endNumIndex]) {
  const adjPoints = [
    ...range(startNumIndex - 1, endNumIndex + 1).map(n => [rowIndex - 1, n]),
    ...[[rowIndex, startNumIndex - 1], [rowIndex, endNumIndex + 1]],
    ...range(startNumIndex - 1, endNumIndex + 1).map(n => [rowIndex + 1, n]),
  ];
  return adjPoints.some(([rowIndex, columnIndex]) => isSymbol(grid, rowIndex, columnIndex));
}

function solution1(grid) {
  let sum = 0;
  for (let i = 0; i < grid.length; i++) {
    const row = grid[i];

    // console.log(row.join(''));
    let fromIndex = 0;
    do {
      const startNumIndex = findIndex(row, fromIndex, c => !isNaN(c));
      if (startNumIndex === -1) {
        // no more numbers
        break;
      }
      let endNumIndex = findIndex(row, startNumIndex, c => isNaN(c));
      endNumIndex = endNumIndex === -1 ? row.length - 1 : endNumIndex - 1; // the last char may be a digit

      const isAdjToSymbol = adjacentToSymbol(grid, i, [startNumIndex, endNumIndex]);
      // console.log(`${row.slice(startNumIndex, endNumIndex + 1).join('')}: ${isAdjToSymbol}`);
      if (isAdjToSymbol) {
        const number = parseInt(row.slice(startNumIndex, endNumIndex + 1).join(''));
        sum += number;
      }

      fromIndex = endNumIndex + 1;
    } while(fromIndex < row.length);
  }
  return sum;
}

function isStar(grid, rowIndex, columIndex) {
  if (rowIndex < 0 || rowIndex >= grid.length) {
    return false;
  }
  if (columIndex < 0 || columIndex >= grid[rowIndex].length) {
    return false;
  }
  return grid[rowIndex][columIndex] === '*';
}

function findAdjacentStar(grid, rowIndex, [startNumIndex, endNumIndex]) {
  const adjPoints = [
    ...range(startNumIndex - 1, endNumIndex + 1).map(n => [rowIndex - 1, n]),
    ...[[rowIndex, startNumIndex - 1], [rowIndex, endNumIndex + 1]],
    ...range(startNumIndex - 1, endNumIndex + 1).map(n => [rowIndex + 1, n]),
  ];
  return adjPoints.find(([rowIndex, columnIndex]) => isStar(grid, rowIndex, columnIndex));
}

function solution2(grid) {
  const gearMap = {};

  for (let i = 0; i < grid.length; i++) {
    const row = grid[i];

    // console.log(row.join(''));
    let fromIndex = 0;
    do {
      const startNumIndex = findIndex(row, fromIndex, c => !isNaN(c));
      if (startNumIndex === -1) {
        // no more numbers
        break;
      }
      let endNumIndex = findIndex(row, startNumIndex, c => isNaN(c));
      endNumIndex = endNumIndex === -1 ? row.length - 1 : endNumIndex - 1; // the last char may be a digit

      const position = findAdjacentStar(grid, i, [startNumIndex, endNumIndex]);
      // console.log(`${row.slice(startNumIndex, endNumIndex + 1).join('')}: ${isAdjToSymbol}`);
      if (position) {
        const [starRowIndex, startColumnIndex] = position;
        const gearKey = `${starRowIndex},${startColumnIndex}`;
        if (!gearMap[gearKey]) {
          gearMap[gearKey] = [];
        }
        const number = parseInt(row.slice(startNumIndex, endNumIndex + 1).join(''));
        gearMap[gearKey].push(number);
        // console.log(JSON.stringify(gearMap, null, 2));
      }

      fromIndex = endNumIndex + 1;
    } while(fromIndex < row.length);
  }

  return Object.keys(gearMap)
    .filter(gearKey => gearMap[gearKey].length === 2)
    .reduce((sum, gearKey) => sum + gearMap[gearKey][0] * gearMap[gearKey][1], 0)
}

(function run() {
  try {
    const { file } = getArgvs();
    const content = readFileSync(file, { encoding:'utf8' }).trim();
    const grid = parseInput(content);

    let startTime = new Date().getTime();
    let answer = solution1(grid);
    let endTime = new Date().getTime();
    console.log(`Solution 1: ${endTime - startTime} ms`);
    console.log(answer);

    startTime = new Date().getTime();
    answer = solution2(grid);
    endTime = new Date().getTime();
    console.log(`Solution 2: ${endTime - startTime} ms`);
    console.log(answer);

  } catch (error) {
    console.error(error);
    process.exit(1);
  }

  process.exit(0);

})();
