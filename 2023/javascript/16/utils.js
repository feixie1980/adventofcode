import { printMap } from "../10/utils.js";

const RayMap = {
  ">,.": [">", [">"]],
  "<,.": ["<", ["<"]],
  "^,.": ["^", ["^"]],
  "v,.": ["v", ["v"]],

  ">,|": ["|", ["^", "v"]],
  "<,|": ["|", ["^", "v"]],
  "^,|": ["|", ["^"]],
  "v,|": ["|", ["v"]],

  ">,-": ["-", [">"]],
  "<,-": ["-", ["<"]],
  "^,-": ["-", ["<", ">"]],
  "v,-": ["-", ["<", ">"]],

  ">,/": ["/", ["^"]],
  "<,/": ["/", ["v"]],
  "^,/": ["/", [">"]],
  "v,/": ["/", ["<"]],

  ">,\\": ["\\", ["v"]],
  "<,\\": ["\\", ["^"]],
  "^,\\": ["\\", ["<"]],
  "v,\\": ["\\", [">"]],
};

function toKey(dir, tile) {
  return `${dir},${tile}`;
}

function getNewTileDirs(dir, tile) {
  const key = toKey(dir, tile);
  let newTile, newDirs;
  const r = RayMap[key];
  if (r) {
    newTile = r[0];
    newDirs = r[1];
  } else {
    const n = parseInt(tile);
    if (isNaN(n)) {
      newTile = '2';
    } else {
      newTile = `${n + 1}`;
    }
    newDirs = [dir];
  }
  return { newTile, newDirs };
}

function getNewPoint(newDir, x, y, grid) {
  let newP;
  switch (newDir) {
    case '>':
      newP = [x, y+1];
      break;
    case '<':
      newP = [x, y-1];
      break;
    case '^':
      newP = [x-1, y];
      break;
    case 'v':
      newP = [x+1, y];
      break;
    default:
      throw `unknown dir: ${newDir}`;
  }

  const validPoint = newP[0] >= 0 && newP[0] < grid.length && newP[1] >= 0 && newP[1] < grid[0].length;
  if (validPoint) {
    return newP;
  }
}

export function printGrid(grid) {
  console.log(grid.map(row => row.join(' ')).join('\n'));
}

export function trace(startP, startDir, inputGrid) {
  const grid = inputGrid.map(row => [...row]);

  let queue = [[startDir, startP]];
  const eSet = new Set();

  while(queue.length !== 0) {
    const [dir, p] = queue.shift();
    eSet.add(`${p[0]},${p[1]}`);

    const [x, y] = p;
    const tile = grid[x][y];
    if (tile === dir) {
      // repeating ray path
      continue;
    }
    const { newTile, newDirs } = getNewTileDirs(dir, tile);

    grid[x][y] = newTile;
    newDirs.forEach(newDir => {
      const newP = getNewPoint(newDir, x, y, grid);
      if (newP) {
        queue = [[newDir, newP], ...queue];
      }
    });
  }

  //printGrid(grid);
  return eSet;
}
