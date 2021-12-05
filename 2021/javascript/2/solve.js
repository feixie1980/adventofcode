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
  return content.split('\n').map(line => line.split(' '));
}

function solution1(operations) {
  let horizontal = 0, depth = 0;
  for (const operation of operations) {
    const op = operation[0];
    const steps = parseInt(operation[1]);
    switch (op) {
      case "forward":
        horizontal += steps;
        break;

      case "up":
        depth -= steps;
        break;
      
      case "down":
        depth += steps;
        break;

      default:
        throw `Invalid operation ${op}`;
    }
  }    

  return horizontal * depth;
}

function solution2(operations) {
  let horizontal = 0, depth = 0;
  let aim = 0;
  for (const operation of operations) {
    const op = operation[0];
    const value = parseInt(operation[1]);
    switch (op) {
      case "forward":
        horizontal += value;
        depth += aim * value;
        break;

      case "up":
        aim -= value;
        break;
      
      case "down":
        aim += value;
        break;

      default:
        throw `Invalid operation ${op}`;
    }
  }    

  return horizontal * depth;
}

(function run() {
  try {
    const { file } = getArgvs();
    const content = readFileSync(file, { encoding:'utf8' }).trim();
    const operations = parseInput(content);

    let startTime = new Date().getTime();
    let answer = solution1(operations);
    let endTime = new Date().getTime();
    console.log(`Solution 1: ${endTime - startTime} ms`);
    console.log(answer);

    startTime = new Date().getTime();
    answer = solution2(operations);
    endTime = new Date().getTime();
    console.log(`Solution 2: ${endTime - startTime} ms`);
    console.log(answer);

  } catch (error) {
    console.error(error);
    process.exit(1);
  }

  process.exit(0);

})();
