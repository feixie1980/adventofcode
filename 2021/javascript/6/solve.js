import { readFileSync } from 'fs';
import Yargs from "yargs";

function printUsage() {
  console.log("\nUsage: node solve.js --days=18 --file=input.txt");
}

const args = Yargs(process.argv.slice(2)).argv;
function getArgvs() {
  let file = args.file;
  const days = args.days ? args.days : 18;

  if (!file) {
    console.error(`Missing file`);
    printUsage();
    process.exit(1);
  }

  return { days, file };
}

function parseInput(content) {
  return content.split(',').map(s => parseInt(s));
}

function solution1(initalFishes, days) {
  let fishs = [...initalFishes];
  
  for (let i = 0; i < days; i++) {
    const zeroCnt = fishs.filter(timer => timer === 0).length;
    fishs = fishs.map(timer => timer - 1 === -1 ? 6 : timer - 1);
    fishs = [...fishs, ...(new Array(zeroCnt)).fill(8)];
    //console.log(`After\t${i+1} days: ${fishs.join(',')}`);
  }
  return fishs.length;
}

function solution1b(initalFishs, days) {
  //console.log(initalFishs);
  let timeBuckets = new Array(9).fill(0);
  initalFishs.forEach(timer => timeBuckets[timer] += 1);

  for (let i = 0; i < days; i++) {
    //console.log(`${timeBuckets.map((cnt, i) => `${i}:${cnt}`).join(', ')}`);
    let newTimeBuckets = timeBuckets.map((cnt, i) => i !== 8 ? timeBuckets[i + 1] : 0);
    newTimeBuckets[8] = timeBuckets[0];
    newTimeBuckets[6] += timeBuckets[0];
    timeBuckets = newTimeBuckets;
  }
  
  return timeBuckets.reduce((sum, cnt) => sum + cnt, 0);
}

function solution2(fishs) {
    return false;
}

(function run() {
  try {
    const { days, file } = getArgvs();
    const content = readFileSync(file, { encoding:'utf8' }).trim();
    const fishs = parseInput(content);

    let startTime = new Date().getTime();
    let answer = solution1b(fishs, days);
    let endTime = new Date().getTime();
    console.log(`Solution 1: ${endTime - startTime} ms`);
    console.log(answer);

    startTime = new Date().getTime();
    answer = solution2(fishs);
    endTime = new Date().getTime();
    console.log(`Solution 2: ${endTime - startTime} ms`);
    console.log(answer);

  } catch (error) {
    console.error(error);
    process.exit(1);
  }

  process.exit(0);

})();
