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

function coordToKey(coord) {
  return `${coord.x}-${coord.y}`;
}

function segToPoints(a, b) {
  const points = [];
  if (a.x === b.x) {
    const start = a.y <= b.y ? a.y : b.y;
    const end = a.y <= b.y ? b.y : a.y;
    for (let i = start; i <= end; i++) {
      points.push({x: a.x, y: i});
    }
  }
  else if (a.y === b.y) {
    const start = a.x <= b.x ? a.x : b.x;
    const end = a.x <= b.x ? b.x : a.x;
    for (let i = start; i <= end; i++) {
      points.push({x: i, y: a.y});
    }
  }
  return points;
}

function parseInput(content) {
  let solids = new Set();
  const lines = content.split('\n');
  let maxX = 0;
  for (const line of lines) {
    const coordinates = line.split(' -> ').map(seg => {
      const [y, x] = seg.split(',').map(s => parseInt(s))
      maxX = maxX < x ? x : maxX;
      return { x, y };
    });

    for(let i = 0; i < coordinates.length - 1; i++) {
      let a = coordinates[i], b = coordinates[i + 1];
      const points = segToPoints(a, b);
      points.forEach(point => solids.add(coordToKey(point)));
    }
  }
  return { maxX, solids };
}

function clone(coord) {
  return Object.assign({}, coord);
}

function step(movingSand, restSands, solids, maxX) {
  const isVoid = pos =>
    !solids.has(coordToKey(pos)) && !restSands.has(coordToKey(pos)) &&
    ( maxX ? pos.x <= maxX + 1 : true );

  // try going down one tile
  let newMovingSand = { x: movingSand.x + 1, y: movingSand.y };
  if (isVoid(newMovingSand)) {
    // no obstruction!
    return { newMovingSand, newRestSands: restSands };
  }

  // try down-left
  newMovingSand = { x: movingSand.x + 1, y: movingSand.y - 1 };
  if (isVoid(newMovingSand)) {
    // no obstruction!
    return { newMovingSand, newRestSands: restSands };
  }

  // try down-right
  newMovingSand = { x: movingSand.x + 1, y: movingSand.y + 1 };
  if (isVoid(newMovingSand)) {
    // no obstruction!
    return { newMovingSand, newRestSands: restSands };
  }

  // cannot move anymore, become rest
  restSands.add(coordToKey(movingSand));
  return {
    newMovingSand: { x: 0, y: 500 },
    newRestSands: restSands
  };
}

function simulate(solids, maxX) {
  let movingSand = {x: 0, y: 500};
  let restSands = new Set();

  while(true) {
    let oldSize = restSands.size;
    const { newMovingSand, newRestSands } = step(movingSand, restSands, solids);
    if (oldSize !== newRestSands.size) {
      console.log(`${newRestSands.size} - ${newMovingSand.x} ${newMovingSand.y}`);
    }
    movingSand = newMovingSand;
    restSands = newRestSands;
    if (movingSand.x > maxX) {
      return restSands;
    }
  }
}

function keyToCoord(key) {
  const c = key.split('-');
  return {
    x: parseInt(c[0]), y: parseInt(c[1])
  }
}
function print(solids, restSands, maxX) {
  return;
  const points = [...solids, ...restSands].map(s => keyToCoord(s));
  const minY = points.reduce((minY, point) => minY > point.y ? point.y : minY, Number.MAX_SAFE_INTEGER);
  const maxY = points.reduce((maxY, point) => maxY <= point.y ? point.y : maxY, 0);

  let result = '';
  for (let x = 0; x < maxX + 2; x++) {
    for (let y = minY - 10; y <= maxY + 10; y++) {
      const coord = { x, y };
      if (solids.has(coordToKey(coord))) {
        result += '#';
      }
      else if (restSands.has(coordToKey(coord))) {
        result += 'O';
      }
      else {
        result += '.';
      }
    }
    result += '\n';
  }
  return result;
}

function solution1(maxX, solids) {
  const restSands = simulate(solids, maxX);
  console.log(print(solids, restSands, maxX));
  return restSands.size;
}

function simulate2(solids, maxX) {
  let movingSand = {x: 0, y: 500};
  let restSands = new Set();

  while(true) {
    // console.log(`${restSands.length} - ${movingSand.x} ${movingSand.y}`);
    let oldSize = restSands.size;
    const { newMovingSand, newRestSands } = step(movingSand, restSands, solids, maxX);
    if (oldSize !== newRestSands.size) {
      console.log(`${newRestSands.size} - ${newMovingSand.x} ${newMovingSand.y}`);
    }
    movingSand = newMovingSand;
    restSands = newRestSands;
    if (restSands.has('0-500')) {
      console.log(print(solids, restSands, maxX));
      return restSands;
    }
  }
}

function solution2(maxX, solids) {
  const restSands = simulate2(solids, maxX);
  return restSands.size;
}

(function run() {
  try {
    const { file } = getArgvs();
    const content = readFileSync(file, { encoding:'utf8' }).trim();
    const { maxX, solids } = parseInput(content);

    let startTime = new Date().getTime();
    let answer = solution1(maxX, solids);
    let endTime = new Date().getTime();
    console.log(`Solution 1: ${endTime - startTime} ms`);
    console.log(answer);

    startTime = new Date().getTime();
    answer = solution2(maxX, solids);
    endTime = new Date().getTime();
    console.log(`Solution 2: ${endTime - startTime} ms`);
    console.log(answer);

  } catch (error) {
    console.error(error);
    process.exit(1);
  }

  process.exit(0);

})();
