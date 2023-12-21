import { readFileSync } from 'fs';
import Yargs from "yargs";
import { digGround, digGroundSegments, getDigCounts, isInside, normalize } from "./utils.js";

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
  return content.split('\n').map(line => {
    const parts = line.split(' ');
    return {
      dir: parts[0],
      length: parseInt(parts[1]),
      color: parts[2],
    }
  });
}

function printGround(ground) {
  console.log(ground.map(row => row.join('')).join('\n'));
}

function getDigCount(ground) {
  return ground.reduce((sum, row) => sum + row.filter(c => c === '#').length, 0);
}

function fillDig(ground) {
  return ground.map(
    (row, x) => row
      .map((c, y) => isInside(ground, [x,y]) ? '#' : '.')
  );
}

function getXRange(segments) {
  let min = Number.MAX_SAFE_INTEGER, max = 0;
  segments.forEach(({ start, end }) => {
    min = Math.min(min, start[0], end[0]);
    max = Math.max(max, start[0], end[0]);
  });
  return [min, max];
}

function solution1(digPlan) {
  let segments = [];
  let start = [0, 0];
  for (let digIns of digPlan) {
    segments = digGroundSegments(start, digIns, segments);
    start = segments[segments.length - 1].end;
  }
  segments = normalize(segments);

  const [min, max] = getXRange(segments);
  let total = 0;
  for(let i = min; i <= max; i++) {
    if (i % 100000 === 0) {
      console.log(`${i.toLocaleString()} of ${max.toLocaleString()}`);
    }
    const count = getDigCounts(segments, i);
    total += count;
  }
  return total;
}

function solution1_old(digPlan) {
  let endPos = [0, 0];
  let ground = [['.']];
  for(let digIns of digPlan) {
    // console.log(`${endPos}, ${digIns.dir}, ${digIns.length}`);
    const r = digGround(endPos, digIns, ground);
    ground = r.ground;
    endPos = r.endPos;
    // printGround(ground);
  }

  ground = fillDig(ground);
  // printGround(ground);
  return getDigCount(ground);
}

function newDigPlan(digPlan) {
  return digPlan.map(digIns => {
    const { color } =  digIns;
    const dirStr = color.charAt(7);
    let dir;
    switch (dirStr) {
      case `0`:
        dir = 'R';
        break;

      case '1':
        dir = 'D';
        break;

      case '2':
        dir = 'L';
        break;

      case '3':
        dir = 'U';
        break;
    }
    const length = parseInt(color.substring(2,7), 16);
    return {
      dir,
      length,
    };
  });
}

function solution2(digPlan) {
  digPlan = newDigPlan(digPlan);
  return solution1(digPlan);
}

(function run() {
  try {
    const { file } = getArgvs();
    const content = readFileSync(file, { encoding:'utf8' }).trim();
    const digPlan = parseInput(content);

    let startTime = new Date().getTime();
    let answer = false; // solution1(digPlan);
    let endTime = new Date().getTime();
    console.log(`Solution 1: ${endTime - startTime} ms`);
    console.log(answer);

    startTime = new Date().getTime();
    answer = solution2(digPlan);
    endTime = new Date().getTime();
    console.log(`Solution 2: ${endTime - startTime} ms`);
    console.log(answer);

  } catch (error) {
    console.error(error);
    process.exit(1);
  }

  process.exit(0);

})();
