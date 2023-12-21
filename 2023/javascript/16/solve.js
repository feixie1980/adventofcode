import { readFileSync } from 'fs';
import Yargs from "yargs";
import { trace } from "./utils.js";

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
  return content.split('\n').map(line => line.split(''));
}

function solution1(grid) {
  const eSet = trace([0, 0], '>', grid);
  return eSet.size;
}

const range = (start, stop, step = 1) =>
  Array.from({ length: (stop - start) / step + 1 }, (_, i) => start + i * step);

function solution2(grid) {
  let max = 0;

  // left border
  range(0, grid.length - 1).forEach((x) => {
    const eSet = trace([x, 0], '>', grid);
    max = max > eSet.size ? max : eSet.size;
  });

  // right border
  range(0, grid.length - 1).forEach((x) => {
    const eSet = trace([x, grid[0].length - 1], '<', grid);
    max = max > eSet.size ? max : eSet.size;
  });

  // top border
  range(0, grid[0].length - 1).forEach((y) => {
    const eSet = trace([0, y], 'v', grid);
    max = max > eSet.size ? max : eSet.size;
  });

  // bottom border
  range(0, grid[0].length - 1).forEach((y) => {
    const eSet = trace([grid.length - 1, y], '^', grid);
    max = max > eSet.size ? max : eSet.size;
  });

  return max;
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
