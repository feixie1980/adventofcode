const argv = require('yargs').argv;
const fs = require('fs');

const ACTIVE = 'active';
const INACTIVE = 'inactive';

function printUsage() {
  console.log("\nUsage: node solve.js --file=input.txt");
}

function getArgvs() {
  let file = argv.file;
  let dimension = argv.dimension ? parseInt(argv.dimension) : 3;
  let cycles = argv.cycles ? parseInt(argv.cycles) : 5;

  if (!file) {
    console.error(`Missing file`);
    printUsage();
    process.exit(1);
  }

  return { file, dimension, cycles };
}

function setCube(grid, point, value) {
  let obj = grid;
  for (let i = 0; i < point.length - 1; i++) {
    const coordinate = point[i];
    obj[coordinate] = !obj[coordinate] ? {} : obj[coordinate];
    obj = obj[coordinate];
  }
  obj[point[point.length - 1]] = value;
}

function isActivated(grid, point) {
  let obj = grid;
  for (let i = 0; i < point.length; i++) {
    const coordinate = point[i];
    obj = obj[coordinate];
    if (!obj) {
      return false;
    }
  }
  return obj === ACTIVE;
}

function existed(grid, point) {
  let obj = grid;
  for (let i = 0; i < point.length; i++) {
    const coordinate = point[i];
    obj = obj[coordinate];
    if (!obj) {
      return false;
    }
  }
  return true;
}

function removeInactiveCubes(grid) {
  Object.keys(grid).forEach(x => {
    if (typeof grid[x] === 'string') {
      if (grid[x] === INACTIVE) {
        delete grid[x];
      }
    }
    else {
      removeInactiveCubes(grid[x]);
      if (Object.keys(grid[x]).length === 0) {
        delete grid[x];
      }
    }
  });
}

function parseInput(content, dimension) {
  let grid = {};
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const chars = lines[i].split('');
    for (let j = 0; j < chars.length; j++) {
      if (chars[j] === '#') {
        const extraCoords = (new Array(dimension - 2)).fill(0);
        setCube(grid, [i, j, ...extraCoords], ACTIVE);
      }
    }
  }
  return grid;
}

function getNeighbours(point) {
  point = point.map(p => parseInt(p));

  if(point.length === 0) {
    return [[]];
  }

  let neighbours = [];
  for (let i = point[0] - 1; i <= point[0] + 1; i++) {
    let subNeighbours = getNeighbours(point.slice(1));
    subNeighbours = subNeighbours.map(s => [i, ...s]);
    neighbours = [...neighbours, ...subNeighbours];
  }
  return neighbours;
}

function isSamePoint(p1, p2) {
  for (let i = 0; i < p1.length; i++) {
    if (p1[i] !== p2[i])
      return false;
  }
  return true;
}

function getNewActivatedState(grid, point) {
  let activatedCnt = 0;

  const neighbours = getNeighbours(point);
  for (const neighbour of neighbours) {
    if ( isSamePoint(neighbour, point) )
      continue;

    if (isActivated(grid, neighbour)) {
      activatedCnt++;
    }
  }

  if (isActivated(grid, point)) {
    if (activatedCnt === 2 || activatedCnt === 3)
      return ACTIVE;
  }
  else {
    if (activatedCnt === 3)
      return ACTIVE;
  }
  return INACTIVE;
}

function allGridPoints(grid) {
  let allPoints = [];
  Object.keys(grid).forEach(x => {
    if (typeof grid[x] === 'string') {
      allPoints.push([x]);
    }
    else {
      let subPoints = allGridPoints(grid[x]);
      subPoints = subPoints.map(s => [x, ...s]);
      allPoints = [...allPoints, ...subPoints];
    }
  });
  return allPoints;
}

function playCycle(grid) {
  let newGrid = {};
  const gridPoints = allGridPoints(grid);
  for (const point of gridPoints) {
    const neighbours = getNeighbours(point);
    for (const neighbour of neighbours) {
      if (!existed(newGrid, neighbour)) {
        const newState = getNewActivatedState(grid, neighbour);
        setCube(newGrid, neighbour, newState);
      }
    }
  }
  return newGrid;
}

function countActivated(grid) {
  const gridPoints = allGridPoints(grid);
  return gridPoints.length;
}

function solution1a(grid, cycles) {
  let finalGrid = grid;

  for (let cycle = 0; cycle < cycles; cycle++) {
    let startTime = new Date().getTime();
    finalGrid = playCycle(finalGrid);
    removeInactiveCubes(finalGrid);
    let endTime = new Date().getTime();
    console.log(`Cycle: ${cycle + 1}\tCount: ${countActivated(finalGrid)}\ttime:${endTime - startTime}ms`);
  }

  return countActivated(finalGrid);
}


(function run() {
  try {
    const { file, dimension, cycles } = getArgvs();
    const content = fs.readFileSync(file, { encoding:'utf8' }).trim();
    const grid = parseInput(content, dimension);

    let startTime = new Date().getTime();
    let result = solution1a(grid, cycles);
    let endTime = new Date().getTime();
    console.log(`Solution 1.a: ${endTime - startTime} ms`);
    console.log(result);

  } catch (error) {
    console.error(error);
    process.exit(1);
  }

  process.exit(0);

})();
