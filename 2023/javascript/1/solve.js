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
  return content.split('\n');
}

function solution1(input) {
  const numbers = input.map(line => {
    const first = [...line].find(c => !isNaN(c));
    const last = [...line].findLast(c => !isNaN(c));
    return parseInt(`${first}${last}`);
  });
  return numbers.reduce((n, sum) => sum + n, 0);
}

const digitLetters = [
  'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'
];

function matchingDigit(str, i) {
  const c = str[i];
  if (!isNaN(c)) {
    return parseInt(c);
  }
  const letterIndex = digitLetters.findIndex(digitLetter => str.slice(i).startsWith(digitLetter));
  if (letterIndex !== -1) {
    return letterIndex + 1;
  }
  return undefined;
}

function solution2(input) {
  const numbers = input.map(line => {
    let first;
    for(let i = 0; i < line.length; i++) {
      const digit = matchingDigit(line, i);
      if (digit !== undefined) {
        first = digit;
        break;
      }
    }
    let last;
    for(let i = line.length - 1; i >= 0; i--) {
      const digit = matchingDigit(line, i);
      if (digit !== undefined) {
        last = digit;
        break;
      }
    }
    return parseInt(`${first}${last}`);
  });
  return numbers.reduce((n, sum) => sum + n, 0);
}

(function run() {
  try {
    const { file } = getArgvs();
    const content = readFileSync(file, { encoding:'utf8' }).trim();
    const input = parseInput(content);

    let startTime = new Date().getTime();
    let answer = solution1(input);
    let endTime = new Date().getTime();
    console.log(`Solution 1: ${endTime - startTime} ms`);
    console.log(answer);

    startTime = new Date().getTime();
    answer = solution2(input);
    endTime = new Date().getTime();
    console.log(`Solution 2: ${endTime - startTime} ms`);
    console.log(answer);

  } catch (error) {
    console.error(error);
    process.exit(1);
  }

  process.exit(0);

})();
