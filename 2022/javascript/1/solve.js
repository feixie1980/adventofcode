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
  let foods = [[]];
  let i = 0;
  for(const line of content.split('\n')) {
    if (line === '') {
      foods.push([]);
      i++;
    }
    else {
      foods[i].push(parseInt(line));
    }
  }
  return foods;
}

function solution1(foods) {
  const totalCals = foods.map(cals => cals.reduce((a, b) => a + b), 0);
  return totalCals.reduce((a, b) => a > b ? a : b, 0);
}

function solution2(foods) {
  const totalCals = foods.map(cals => cals.reduce((a, b) => a + b), 0);
  totalCals.sort((a, b) => b - a);
  return totalCals[0] + totalCals[1] + totalCals[2];
}

(function run() {
  try {
    const { file } = getArgvs();
    const content = readFileSync(file, { encoding:'utf8' }).trim();
    const foods = parseInput(content);

    let startTime = new Date().getTime();
    let answer = solution1(foods);
    let endTime = new Date().getTime();
    console.log(`Solution 1: ${endTime - startTime} ms`);
    console.log(answer);

    startTime = new Date().getTime();
    answer = solution2(foods);
    endTime = new Date().getTime();
    console.log(`Solution 2: ${endTime - startTime} ms`);
    console.log(answer);

  } catch (error) {
    console.error(error);
    process.exit(1);
  }

  process.exit(0);

})();
