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
  return content.split(',').map(s => parseInt(s));
}

function solution1(positions) {
  const min = Math.min(...positions), max = Math.max(...positions);
  const cntMap = positions.reduce((map, position) => {
    if (!map[`${position}`]) {
      map[`${position}`] = 1;
    }
    else {
      map[`${position}`] += 1;
    }
    return map;
  }, {});

  let minFuels = Number.MAX_VALUE, minPosition = Number.MAX_VALUE;
  for (let n = min; n <= max; n++) {
    let fuels = 0;
    for (let position of Object.keys(cntMap).map(k => parseInt(k))) {
      fuels += Math.abs(n - position) * cntMap[`${position}`];
    }
    if (fuels < minFuels) {
      minFuels = fuels;
      minPosition = n;
    }
  }

  console.log(`${minPosition} - ${minFuels}`);
  return minFuels;
}

function solution2(positions) {
  const min = Math.min(...positions), max = Math.max(...positions);
  const cntMap = positions.reduce((map, position) => {
    if (!map[`${position}`]) {
      map[`${position}`] = 1;
    }
    else {
      map[`${position}`] += 1;
    }
    return map;
  }, {});
  
  let minFuels = Number.MAX_VALUE, minPosition = Number.MAX_VALUE;
  for (let n = min; n <= max; n++) {
    let fuels = 0;
    for (let position of Object.keys(cntMap).map(k => parseInt(k))) {
      let distance = Math.abs(n - position);
      fuels +=  distance * (1 + distance) / 2 * cntMap[`${position}`];
    }
    if (fuels < minFuels) {
      minFuels = fuels;
      minPosition = n;
    }
  }

  console.log(`${minPosition} - ${minFuels}`);
  return minFuels;
}

(function run() {
  try {
    const { file } = getArgvs();
    const content = readFileSync(file, { encoding:'utf8' }).trim();
    const positions = parseInput(content);

    let startTime = new Date().getTime();
    let answer = solution1(positions);
    let endTime = new Date().getTime();
    console.log(`Solution 1: ${endTime - startTime} ms`);
    console.log(answer);

    startTime = new Date().getTime();
    answer = solution2(positions);
    endTime = new Date().getTime();
    console.log(`Solution 2: ${endTime - startTime} ms`);
    console.log(answer);

  } catch (error) {
    console.error(error);
    process.exit(1);
  }

  process.exit(0);

})();
