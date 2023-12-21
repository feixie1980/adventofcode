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
  return content.split('\n').map(line => line.split(' ').map(s => parseInt(s)));
}

function predictNextValue(history, toLeft = false) {
  if (history.length === 0)
    throw `There should be more than one values in history, seeing none!`;

  if(new Set(history).size === 1) {
    return history[0];
  }

  const diffs = history.slice(1).map((v, i) => v - history[i]);
  const newDiff = predictNextValue(diffs, toLeft);
  return toLeft ? history[0] - newDiff : history[history.length - 1] + newDiff;
}

function solution1(histories) {
  const newValues = histories.map(history => predictNextValue(history));
  return newValues.reduce((sum, v) => sum + v, 0);
}

function solution2(histories) {
  const newValues = histories.map(history =>
    predictNextValue(history, true)
  );
  return newValues.reduce((sum, v) => sum + v, 0);
}

(function run() {
  try {
    const { file } = getArgvs();
    const content = readFileSync(file, { encoding:'utf8' }).trim();
    const histories = parseInput(content);

    let startTime = new Date().getTime();
    let answer = solution1(histories);
    let endTime = new Date().getTime();
    console.log(`Solution 1: ${endTime - startTime} ms`);
    console.log(answer);

    startTime = new Date().getTime();
    answer = solution2(histories);
    endTime = new Date().getTime();
    console.log(`Solution 2: ${endTime - startTime} ms`);
    console.log(answer);

  } catch (error) {
    console.error(error);
    process.exit(1);
  }

  process.exit(0);

})();
