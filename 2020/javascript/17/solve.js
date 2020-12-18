const argv = require('yargs').argv;
const fs = require('fs');

const ACTIVE = 'active';
const INACTIVE = 'inactive';

function printUsage() {
  console.log("\nUsage: node solve.js --file=input.txt");
}

function getArgvs() {
  let file = argv.file;

  if (!file) {
    console.error(`Missing file`);
    printUsage();
    process.exit(1);
  }

  return { file };
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

function parseInput(content) {
  let grid = {};
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const chars = lines[i].split('');
    for (let j = 0; j < chars.length; j++) {
      const z = 0;
      if (chars[j] === '#') {
        setCube(grid, [i, j, 0], ACTIVE);
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

/*
function playCycle(grid) {
  let newGrid = {};
  Object.keys(grid).sort((a,b)=> parseInt(a) - parseInt(b)).forEach(x => {
    Object.keys(grid[x]).sort((a,b)=> parseInt(a) - parseInt(b)).forEach(y => {
      Object.keys(grid[x][y]).sort((a,b)=> parseInt(a) - parseInt(b)).forEach(z => {
        x = parseInt(x);
        y = parseInt(y);
        z = parseInt(z);
        for (let i = x - 1; i <= x + 1; i++) {
          for (let j = y - 1; j <= y + 1; j++) {
            for (let k = z - 1; k <= z + 1; k++) {
              if (!newGrid[i] || !newGrid[i][j] || !newGrid[i][j][k] ) {
                const newState = getNewActivatedState(grid, [i, j, k]);
                setCube(newGrid, [i, j, k], newState);
              }
            }
          }
        }
      });
    })
  });
  return newGrid;
}


 */
function countActivated(grid) {
  let cnt = 0;
  for(const x in grid) {
    for (const y in grid[x]) {
      cnt += Object.keys(grid[x][y]).length;
    }
  }
  return cnt;
}

function printGrid(grid, zLevels) {
  let minX = 100000;
  let minY = 100000;
  let maxX = -100000;
  let maxY = -100000;
  for(let x in grid) {
    x = parseInt(x);
    minX = x < minX ? x : minX;
    maxX = x > maxX ? x : maxX;
    for(let y in grid[x]) {
      y = parseInt(y);
      minY = y < minY ? y : minY;
      maxY = y > maxY ? y : maxY;
    }
  }

  for (let z = -zLevels; z <= zLevels; z++) {
    let lines = [];
    for(let x = minX; x <= maxX; x++) {
      let line = '';
      for(let y = minY; y <= maxY; y++) {
        line += isActivated(grid, [x, y, z]) ? '#' : '.';
      }
      lines.push(line);
    }
    console.log(`z=${z}`);
    console.log(lines.join('\n'));
    console.log(`\n\n`);
  }
}

function solution1a(grid) {
  let finalGrid = grid;
  printGrid(finalGrid, 0);

  for (let cycle = 0; cycle < 6; cycle++) {
    finalGrid = playCycle(finalGrid);
    removeInactiveCubes(finalGrid);
    console.log(`Cycle: ${cycle + 1}`);
    printGrid(finalGrid, cycle + 1);
  }

  return countActivated(finalGrid);
}


function solution2a(rules, myTicket, validTickets) {
  return null;
}

(function run() {
  try {
    const { file } = getArgvs();
    const content = fs.readFileSync(file, { encoding:'utf8' }).trim();
    const grid = parseInput(content);

    let startTime = new Date().getTime();
    let result = solution1a(grid);
    let endTime = new Date().getTime();
    console.log(`Solution 1.a: ${endTime - startTime} ms`);
    console.log(result);
/*
    startTime = new Date().getTime();
    let result = solution2a(rules, myTicket, validTickets);
    endTime = new Date().getTime();
    console.log(`Solution 2.a: ${endTime - startTime} ms`);
    console.log(` answer is: ${result}`);

 */
  } catch (error) {
    console.error(error);
    process.exit(1);
  }

  process.exit(0);

})();
