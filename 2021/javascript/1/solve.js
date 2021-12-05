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
  return content.split('\n').map(line => parseInt(line));
}

function solution1(numbers) {
  let increases = 0;
  for (let i = 1; i < numbers.length; i ++) {
      if (numbers[i] > numbers[i-1]) {
        increases++;
      }
  }
  return increases;
}

function solution2(numbers) {
  let increases = 0;
  for (let i = 3; i < numbers.length; i ++) {   
    if (numbers[i] > numbers[i-3]) {
      increases++;
    }
  }
  return increases;
}

(function run() {
  try {
    const { file } = getArgvs();
    const content = readFileSync(file, { encoding:'utf8' }).trim();
    const numbers = parseInput(content);

    let startTime = new Date().getTime();
    let answer = solution1(numbers);
    let endTime = new Date().getTime();
    console.log(`Solution 1: ${endTime - startTime} ms`);
    console.log(answer);

    startTime = new Date().getTime();
    answer = solution2(numbers);
    endTime = new Date().getTime();
    console.log(`Solution 2: ${endTime - startTime} ms`);
    console.log(answer);

  } catch (error) {
    console.error(error);
    process.exit(1);
  }

  process.exit(0);

})();
