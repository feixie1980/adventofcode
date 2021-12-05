import { readFileSync } from 'fs';
import Yargs from "yargs";
import * as BitUtils from '../../../utils/javascript/bits.js'

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
  const numbers = content.split('\n').map(line => parseInt(line, 2));
  const length = content.split('\n')[0].length;
  return { numbers, length };
}

function solution1(numbers, length) {
  const bitSums = new Array(length);
  bitSums.fill(0);

  for (const number of numbers) {
    for (let i = 0; i < length; i++) {      
      const bit = BitUtils.mask(number, length - i - 1);
      bitSums[i] += bit;
    }
  }
  const gammaStr = bitSums.map(bitSum => `${Math.round(bitSum / numbers.length)}`).join('');
  const gamma = parseInt(gammaStr, 2);
  const epsilon = BitUtils.flip(gamma, length);
  return gamma * epsilon;
}

function findValue(numbers, length, type) {
  for (let i = 0; i < length; i++) {
    let bitSum = 0, zeroNumbers = [], oneNumbers = [];
    for (const number of numbers) {
      const bit = BitUtils.mask(number, length - i - 1);      
      bitSum += bit;
      if (bit) {
        oneNumbers.push(number);
      }
      else {
        zeroNumbers.push(number);
      }
    }
    const mcBit = Math.round(bitSum / numbers.length);

    if (type === 'oxygen') {
      numbers = mcBit ? oneNumbers : zeroNumbers;
    } else {
      numbers = mcBit ? zeroNumbers : oneNumbers;
    }

    if (numbers.length === 1) {
      return numbers[0];
    }
  }

  return null;
}

function solution2(numbers, length) {
    const oxygenValue = findValue(numbers, length, "oxygen");
    //console.log(`oxygen: ${oxygenValue}`);
    const co2Value = findValue(numbers, length, 'co2');
    //console.log(`co2: ${co2Value}`);
    return oxygenValue * co2Value;
}

(function run() {
  try {
    const { file } = getArgvs();
    const content = readFileSync(file, { encoding:'utf8' }).trim();
    const { numbers, length } = parseInput(content);

    let startTime = new Date().getTime();
    let answer = solution1(numbers, length);
    let endTime = new Date().getTime();
    console.log(`Solution 1: ${endTime - startTime} ms`);
    console.log(answer);

    startTime = new Date().getTime();
    answer = solution2(numbers, length);
    endTime = new Date().getTime();
    console.log(`Solution 2: ${endTime - startTime} ms`);
    console.log(answer);

  } catch (error) {
    console.error("haha");
    console.error(error);
    process.exit(1);
  }

  process.exit(0);

})();