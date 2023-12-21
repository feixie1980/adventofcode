import { readFileSync } from 'fs';
import Yargs from "yargs";
import { ROUND, tilt } from "./utils.js";

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

function getLoad(platform) {
  let total = 0;
  for(let i = 0; i < platform.length; i++) {
    const weight = platform.length - i;
    total += platform[i].filter(t => t === ROUND).length * weight;
  }
  return total;
}

function solution1(platform) {
  const newPlatform = tilt(platform, 0);
  return getLoad(newPlatform);
}

function toString(platform) {
  return platform.map(row => row.join('')).join('\n');
}

function findCycle(platform) {
  let newPlatform = platform;
  const cache = [];
  const weights = [];

  console.log(`Finding cycle`);
  for(let i = 0; i < 1000000000; i++) {
    console.log(i);
    newPlatform = tilt(newPlatform, 0);
    newPlatform = tilt(newPlatform, 2);
    newPlatform = tilt(newPlatform, 1);
    newPlatform = tilt(newPlatform, 3);

    const key = toString(newPlatform);
    const index = cache.indexOf(key);
    if (index !== -1) {
      console.log(`find cycle at ${index} at step ${i}`);
      return {
        cycleStart: index,
        cycle: i - index,
        weights: weights.slice(index, i)
      };
    }

    cache.push(key);
    weights.push(getLoad(newPlatform));
  }
}

function solution2(platform) {
  const { weights, cycle, cycleStart } = findCycle(platform);
  const i = (1000000000 - cycleStart) % cycle;
  console.log(weights)
  return weights[i - 1];
}

(function run() {
  try {
    const { file } = getArgvs();
    const content = readFileSync(file, { encoding:'utf8' }).trim();
    const platform = parseInput(content);

    let startTime = new Date().getTime();
    let answer = solution1(platform);
    let endTime = new Date().getTime();
    console.log(`Solution 1: ${endTime - startTime} ms`);
    console.log(answer);

    startTime = new Date().getTime();
    answer = solution2(platform);
    endTime = new Date().getTime();
    console.log(`Solution 2: ${endTime - startTime} ms`);
    console.log(answer);

  } catch (error) {
    console.error(error);
    process.exit(1);
  }

  process.exit(0);

})();
