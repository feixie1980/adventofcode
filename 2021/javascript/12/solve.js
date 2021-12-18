import { readFileSync } from 'fs';
import Yargs from "yargs";

const START_CAVE = "start", END_CAVE = "end";

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
  const connections = content.split('\n').map(line => line.split('-'));
  let caveMap = new Map();
  for (const connection of connections) {
    const [cave1, cave2] = connection;
    if (!caveMap.has(cave1)) {
      caveMap.set(cave1, [cave2]);
    }
    else {
      caveMap.get(cave1).push(cave2);
    }

    if (!caveMap.has(cave2)) {
      caveMap.set(cave2, [cave1]);
    }
    else {
      caveMap.get(cave2).push(cave1);
    }
  }
  return caveMap;
}

function isSmallCave(cave) {
  return cave.toLowerCase() === cave;
}

function isValidConnCave(cave, visitedSmall, enableTwice) {
  if (cave === START_CAVE) {
    return false;
  }

  if (enableTwice) {
    const hasTwiceVisitedSmallCave = [...visitedSmall.values()].filter(n => n === 2).length !== 0;
    if (hasTwiceVisitedSmallCave) {
      return !isSmallCave(cave) || !visitedSmall.get(cave);
    }
    else {
      return true;
    }
    
  }
  else {
    return !isSmallCave(cave) || !visitedSmall.get(cave)
  }
}

function traverse(cave, caveMap, visitedSmall, enableTwice = false) {
  let paths = [];

  if (cave === END_CAVE) {
    return [[END_CAVE]];    
  }

  if (isSmallCave(cave)) {
    if (!visitedSmall.get(cave)) {
      visitedSmall.set(cave, 1);
    }
    else {
      visitedSmall.set(cave, 2);
    }
  }

  const connCaves = caveMap.get(cave).filter(connCave => isValidConnCave(connCave, visitedSmall, enableTwice));

  for(const connCave of connCaves) {
    let subPaths = traverse(connCave, caveMap, visitedSmall, enableTwice);
    paths = [...paths, ...subPaths.map(subPath => [cave, ...subPath])];
  }

  if (isSmallCave(cave)) {
    if (visitedSmall.has(cave) && visitedSmall.get(cave) === 2) {
      visitedSmall.set(cave, 1);
    }
    else {
      visitedSmall.delete(cave);
    }
  }

  return paths;
}

function solution1(caveMap) {
  let visitedSmall = new Map();
  const paths = traverse(START_CAVE, caveMap, visitedSmall);
  return paths.length;
}

function solution2(caveMap) {
  let visitedSmall = new Map();
  const paths = traverse(START_CAVE, caveMap, visitedSmall, true);
  return paths.length;
}

(function run() {
  try {
    const { file } = getArgvs();
    const content = readFileSync(file, { encoding:'utf8' }).trim();
    const caveMap = parseInput(content);

    let startTime = new Date().getTime();
    let answer = solution1(caveMap);
    let endTime = new Date().getTime();
    console.log(`Solution 1: ${endTime - startTime} ms`);
    console.log(answer);

    startTime = new Date().getTime();
    answer = solution2(caveMap);
    endTime = new Date().getTime();
    console.log(`Solution 2: ${endTime - startTime} ms`);
    console.log(answer);

  } catch (error) {
    console.error(error);
    process.exit(1);
  }

  process.exit(0);

})();