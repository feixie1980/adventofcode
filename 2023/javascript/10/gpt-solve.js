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
  return null;
}

const DIRS = {
  "North": [-1, 0],
  "South": [1, 0],
  "East": [0, 1],
  "West": [0, -1]
}

const PIPES = {
  "|": ["North", "South"],
  "-": ["East", "West"],
  "L": ["North", "East"],
  "J": ["North", "West"],
  "7": ["South", "West"],
  "F": ["South", "East"]
}

function solution1(map) {
  map = map.split('\n').map(row => [...row]);

  const directions = [[0, -1, '|'], [0, 1, '|'], [-1, 0, '-'], [1, 0, '-']];
  const curves = ['J', 'L', '7', 'F'];
  const [sx, sy] = [map.findIndex(row => row.includes('S')), map[map.findIndex(row => row.includes('S'))].indexOf('S')];

  let distance = {}, maxLength = 0;
  const findLoop = queue => {
    distance[`${sx}-${sy}`] = 0;
    while (queue.length) {
      let [x, y, d] = queue.shift();
      for (const [dx, dy, pipe] of directions) {
        const [nx, ny] = [x + dx, y + dy];
        if (map[nx] && (map[nx][ny] == pipe || curves.includes(map[nx][ny]) || (nx == sx && ny == sy))) {
          const key = `${nx}-${ny}`;
          if (distance[key] != undefined && distance[key] == d) {
            queue = [[nx, ny, 0]];
            break;
          } else {
            distance[key] = d;
            queue.push([nx, ny, d + 1]);
          }
        }
      }
    }
    distance = {};
    distance[`${sx}-${sy}`] = 0;
    while (queue.length) {
      let [x, y, d] = queue.shift();
      for (const [dx, dy, pipe] of directions) {
        const [nx, ny] = [x + dx, y + dy];
        if (nx == sx && ny == sy) continue;
        if ((map[nx] && (map[nx][ny] == pipe || curves.includes(map[nx][ny])) && distance[`${nx}-${ny}`] == undefined)) {
          distance[`${nx}-${ny}`] = d + 1;
          queue.push([nx, ny, d + 1]);
          maxLength = Math.max(maxLength, d + 1);
        }
      }
    }
    return maxLength;
  }
  return findLoop([[sx, sy, 0]]);
}

function determineTile([x, y], map) {
  let candidateTiles = Object.keys(PIPES);
  for(let i = 0; i < candidateTiles.length; i++) {
    let tile = candidateTiles[i];
    let dirs = PIPES[tile];
    let valid = true;
    for(let j = 0; j < dirs.length; j++) {
      let dir = dirs[j];
      let nX = x + DIRS[dir][0];
      let nY = y + DIRS[dir][1];
      if(nX < 0 || nY < 0 || nX >= map.length || nY >= map[0].length) {
        valid = false;
        break;
      }
      let adj = map[nX][nY];
      if(adj === '.' || !PIPES[adj].includes(opposite(dir))) {
        valid = false;
        break;
      }
    }
    if(valid) return tile;
  }
  throw new Error('Cannot determine tile.');
}

function opposite(dir) {
  switch(dir) {
    case "North": return "South";
    case "South": return "North";
    case "East": return "West";
    case "West": return "East";
  }
}

function solution2() {
  return false;
}

(function run() {
  try {
    const { file } = getArgvs();
    const content = readFileSync(file, { encoding:'utf8' }).trim();

    let startTime = new Date().getTime();
    let answer = solution1(content);
    let endTime = new Date().getTime();
    console.log(`Solution 1: ${endTime - startTime} ms`);
    console.log(answer);

    startTime = new Date().getTime();
    answer = solution2();
    endTime = new Date().getTime();
    console.log(`Solution 2: ${endTime - startTime} ms`);
    console.log(answer);

  } catch (error) {
    console.error(error);
    process.exit(1);
  }

  process.exit(0);

})();
