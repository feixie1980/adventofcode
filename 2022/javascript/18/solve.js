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
  return content.split('\n').map(line => line.split(',').map(n => parseInt(n)));
}

function createDimensionMap(cubes) {
  const dMap = cubes.reduce((dMap, cube) => {
    let key = `_-${cube[1]}-${cube[2]}`;
    if (!dMap.has(key))
      dMap.set(key, []);
    dMap.get(key).push(cube[0]);

    key = `${cube[0]}-_-${cube[2]}`;
    if (!dMap.has(key))
      dMap.set(key, []);
    dMap.get(key).push(cube[1]);

    key = `${cube[0]}-${cube[1]}-_`;
    if (!dMap.has(key))
      dMap.set(key, []);
    dMap.get(key).push(cube[2]);

    return dMap;
  }, new Map());

  [...dMap.keys()].forEach(key => {
    dMap.get(key).sort((a,b) => a - b);
  })
  return dMap;
}

function countAdjacentPairs(dimensionMap) {
  let count = 0;
  dimensionMap.forEach(numArray => {
    for(let i = 0; i < numArray.length - 1; i++) {
      if (numArray[i + 1] - numArray[i] === 1)
        count++;
    }
  });
  return count;
}

function findSpace(cubes) {
  let xMin = Number.MAX_SAFE_INTEGER, xMax = 0;
  let yMin = Number.MAX_SAFE_INTEGER, yMax = 0;
  let zMin = Number.MAX_SAFE_INTEGER, zMax = 0;


  for(const cube of cubes) {
    xMin = cube[0] < xMin ? cube[0] : xMin;
    yMin = cube[1] < yMin ? cube[1] : yMin;
    zMin = cube[2] < zMin ? cube[2] : zMin;

    xMax = cube[0] > xMax ? cube[0] : xMax;
    yMax = cube[1] > yMax ? cube[1] : yMax;
    zMax = cube[2] > zMax ? cube[2] : zMax;
  }

  return {
    xMin: xMin - 1, xMax: xMax + 1,
    yMin: yMin - 1, yMax: yMax + 1,
    zMin: zMin - 1, zMax: zMax + 1
  };
}

function solution1(cubes) {
  const dimensionMap = createDimensionMap(cubes);
  const totalFaces = cubes.length * 6;
  const numAdjacents = countAdjacentPairs(dimensionMap);
  return totalFaces - numAdjacents * 2;
}

function spaceToKey(cube) {
  return `${cube[0]}-${cube[1]}-${cube[2]}`;
}

function createSpaceMap(space) {
  const sMap = new Map();
  for (let x = space.xMin; x <= space.xMax; x++)
    for (let y = space.yMin; y <= space.yMax; y++)
      for (let z = space.zMin; z <= space.zMax; z++) {
        const cube = [x, y, z];
        sMap.set(spaceToKey(cube), cube);
      }
  return sMap;
}


function fillSpace(spaceMap, cubeSet, spaceRange, filledSpaceSet) {
  const isEmpty = space => {
    const key = spaceToKey(space);
    return !cubeSet.has(key) && !filledSpaceSet.has(key);
  }
  const outOfRange = space =>
    space[0] < spaceRange.xMin || space[0] > spaceRange.xMax ||
    space[1] < spaceRange.yMin || space[1] > spaceRange.yMax ||
    space[2] < spaceRange.zMin || space[2] > spaceRange.zMax;


  const spacesToExplore = [[spaceRange.xMin, spaceRange.yMin, spaceRange.zMin]];
  while (spacesToExplore.length > 0) {
    const startSpace = spacesToExplore.pop();
    if (outOfRange(startSpace)) {
      throw `startSpace out of range: ${startSpace}`;
    }

    if (isEmpty(startSpace)) {
      filledSpaceSet.add(spaceToKey(startSpace));
    }
    else {
      continue;
    }

    // get adjacent spaces
    const adjSpaces = [
      [startSpace[0] - 1, startSpace[1], startSpace[2]],
      [startSpace[0] + 1, startSpace[1], startSpace[2]],
      [startSpace[0], startSpace[1] + 1, startSpace[2]],
      [startSpace[0], startSpace[1] - 1, startSpace[2]],
      [startSpace[0], startSpace[1], startSpace[2] - 1],
      [startSpace[0], startSpace[1], startSpace[2] + 1],
    ];
    for (const adjSpace of adjSpaces) {
      if (!outOfRange(adjSpace) && isEmpty(adjSpace)) {
        spacesToExplore.push(adjSpace);
      }
    }
  }
}

function getUnfilledCubes(spaceMap, filledSpaceSet, cubeSet) {
  const unFilled = [];
  spaceMap.forEach((space, key) => {
    if (!cubeSet.has(key) && !filledSpaceSet.has(key)) {
      unFilled.push(space);
    }
  });
  return unFilled;
}

function solution2(cubes) {
  const spaceRange = findSpace(cubes);
  const spaceMap = createSpaceMap(spaceRange);
  const cubeSet = cubes.reduce((cSet, cube) => {
    cSet.add(spaceToKey(cube));
    return cSet;
  }, new Set);

  const filledSpaceSet = new Set();
  fillSpace(spaceMap, cubeSet, spaceRange, filledSpaceSet);
  const unFilledSpaces = getUnfilledCubes(spaceMap, filledSpaceSet, cubeSet);

  const totalFaces = solution1(cubes);
  const unFilledExtFaceCnt = solution1(unFilledSpaces);

  return totalFaces - unFilledExtFaceCnt;
}

(function run() {
  try {
    const { file } = getArgvs();
    const content = readFileSync(file, { encoding:'utf8' }).trim();
    const cubes = parseInput(content);

    let startTime = new Date().getTime();
    let answer = solution1(cubes);
    let endTime = new Date().getTime();
    console.log(`Solution 1: ${endTime - startTime} ms`);
    console.log(answer);

    startTime = new Date().getTime();
    answer = solution2(cubes);
    endTime = new Date().getTime();
    console.log(`Solution 2: ${endTime - startTime} ms`);
    console.log(answer);

  } catch (error) {
    console.error(error);
    process.exit(1);
  }

  process.exit(0);

})();
