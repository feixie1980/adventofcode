import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import Yargs from "yargs";

let name = 'run';

function printUsage() {
  console.log("\nUsage: node solve.js --file=input.txt");
}

const args = Yargs(process.argv.slice(2)).argv;
function getArgvs() {
  let file = args.file;
  name = args.name ? args.name : "run";

  if (!file) {
    console.error(`Missing file`);
    printUsage();
    process.exit(1);
  }

  return { file };
}

function parseInput(content) {
  return content.split('\n').map(line => [...line].map(s => parseInt(s)));
}

let fileIndex = 0;
function outputGrid(octGrid) {
  return;
  const dir = `./output/${name}`;
  if (!existsSync(dir)){
    mkdirSync(dir);
  }
  const filepath = `${dir}/${fileIndex++}.txt`
  console.log(`\twriting to file ${filepath}`);
  writeFileSync(filepath, octGrid.map(row => row.join(' ')).join('\n'));
}

function printGrid(octGrid, withSapce) {
  const printGrdStr = octGrid.map(row => row.join(withSapce ? ' ' : '')).join('\n');
  console.log(`${printGrdStr}\n`);
}

function getEnergy10Coords(octGrid) {
  return octGrid.flatMap((row, y) => (
    row
      .map((e, x) => ({x, y, e}))
      .filter(p => p.e === 10))
  );
}

function adjacentCoords(octGrid, x, y) {
  let adjs = [];
  for (let i = y-1; i <= y+1; i++) {
    for (let j = x-1; j <= x+1; j++) {
      if (i >= 0 && i < octGrid.length && j >= 0 && j < octGrid[i].length) {
        if (i !== y || x !== j) {
          adjs.push({ x: j, y: i});
        }
      }
    }
  }
  return adjs;
}

function performFlashes(octGrid, coords10) {
  // make a copy of the input
  let newOctGrid = [...octGrid.map(row => [...row])];
  for (const coord of coords10) {
    const {x, y} = coord;
    
    // increase energy to 11, indicating flash has happenened
    newOctGrid[y][x] = 0;

    // increase adjancents' energy by 1
    const adjPoints = adjacentCoords(newOctGrid, x, y);
    adjPoints.forEach(p => {
      // increment adjacent points if they are less than 10 and they have not flashed in this step
      if (newOctGrid[p.y][p.x] < 10 && newOctGrid[p.y][p.x] !== 0) {
        newOctGrid[p.y][p.x] += 1;
      }
    });
  }
  return newOctGrid;
}

function playOneStep(octGrid) {
  // increment all by one
  let newOctGrid = octGrid.map(row => row.map(e => e+1));
  let flashCount = 0;
  //printGrid(newOctGrid, true);
  outputGrid(newOctGrid);

  let coords10 = getEnergy10Coords(newOctGrid);
  flashCount += coords10.length;
  while (coords10.length !== 0) {
    newOctGrid = performFlashes(newOctGrid, coords10);
    coords10 = getEnergy10Coords(newOctGrid);
    flashCount += coords10.length;
    //printGrid(newOctGrid, true);
    outputGrid(newOctGrid);
  }
  return { newOctGrid, flashCount };
}

function solution1(octGrid) {
  let flashTotal = 0;
  
  // make a copy of the input
  octGrid = [...octGrid.map(row => [...row])];
  console.log(`initial`)
  printGrid(octGrid);
  outputGrid(octGrid);

  let i = 1, allFlash = false;
  while(true) {
    console.log(`step ${i}`)
    const { newOctGrid, flashCount } = playOneStep(octGrid);

    octGrid = newOctGrid;
    flashTotal += flashCount;
    allFlash = octGrid.filter(row => row.filter(e => e !== 0).length === 0).length === octGrid.length;

    if (allFlash) {
      break;
    }
    
    i++;
    printGrid(octGrid);
  }

  return { step: i, flashTotal };
}

function solution2(input) {
    return false;
}

(function run() {
  try {
    const { file } = getArgvs();
    const content = readFileSync(file, { encoding:'utf8' }).trim();
    const octGrid = parseInput(content);

    let startTime = new Date().getTime();
    let answer = solution1(octGrid);
    let endTime = new Date().getTime();
    console.log(`Solution 1: ${endTime - startTime} ms`);
    console.log(answer);

    startTime = new Date().getTime();
    answer = solution2(octGrid);
    endTime = new Date().getTime();
    console.log(`Solution 2: ${endTime - startTime} ms`);
    console.log(answer);

  } catch (error) {
    console.error(error);
    process.exit(1);
  }

  process.exit(0);

})();
