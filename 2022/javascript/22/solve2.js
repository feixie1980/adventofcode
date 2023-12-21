import { readFileSync } from 'fs';
import Yargs from "yargs";

const WALL = '#', SPACE = '.', VOID = ' ';

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

function parseMap(lines) {
  const walls = [];
  let bounds = [], curBound;

  for (let y = 0; y < lines.length; y++) {
    const line = lines[y];
    if (line === '') {
      // exit map reading
      curBound.yRange[1] = y - 1;
      bounds.push(curBound);
      break;
    }

    let x, lineXRange = [null, null];
    for (x = 0; x < line.length; x++) {
      const c = line[x];
      if (c !== VOID) {
        if (lineXRange[0] === null) {
          lineXRange[0] = x;
        }
      }

      if (c === WALL) {
        walls.push([x, y]);
      }
    }
    lineXRange[1] = x - 1;

    if (!curBound) {
      // create first bound
      curBound =  { xRange: lineXRange, yRange: [y, null] };
    }
    else if (curBound.xRange[0] !== lineXRange[0] || curBound.xRange[1] !== lineXRange[1]) {
      // create a new bound
      curBound.yRange[1] = y - 1;
      bounds.push(curBound);
      curBound = { xRange: lineXRange, yRange: [y, null] };
    }
  }

  return { bounds, walls };
}

function parseInstructions(line) {
  const array = [...line.matchAll(/[0-9]+|L|R/g)];
  return array.map(match => isNaN(match[0]) ? match[0] : parseInt(match[0]));
}

function parseInput(content) {
  const lines = content.split('\n');
  const { bounds, walls } = parseMap(lines.slice(0, lines.length - 2));
  const insList = parseInstructions(lines[lines.length - 2]);
  return { bounds, walls, insList };
}

/**
 * Find the combined yRange for a given x, y
 * @param bounds
 * @param bound
 */
function findYRange({x, y}, bounds) {
  let boundsOnX = bounds.filter(bound => bound.xRange[0] <= x && bound.xRange[1] >= x);
  let curBoundIndex = boundsOnX.findIndex(bound => bound.yRange[0] <= y && bound.yRange[1] >= y);
  let finalYRange = [...boundsOnX[curBoundIndex].yRange];

  for (let i = curBoundIndex - 1; i >=0; i--) {
    let bound = boundsOnX[i];
    if (finalYRange[0] - bound.yRange[1] === 1) {
      finalYRange[0] = bound.yRange[0];
    }
    else {
      break;
    }
  }

  for (let i = curBoundIndex + 1; i < boundsOnX.length; i++) {
    let bound = boundsOnX[i];
    if (bound.yRange[0] - finalYRange[1] === 1) {
      finalYRange[1] = bound.yRange[1];
    }
    else {
      break;
    }
  }

  return finalYRange;
}

/**
 * Try to hit a wall with the player
 * @param x
 * @param y
 * @param facing
 * @param bounds
 * @param walls
 * @return {null|*}
 */
function tryHitWall( {x, y, facing}, bounds, walls) {
  const curBound =  bounds.find(bound => isInBound({x, y}, bound));
  let range, modBase, filterCondition, findWall, wrappedWall, getStepsToWall, getNewPos;
  switch (facing) {
    case 0: // >>
      range = curBound.xRange;
      modBase = range[1] - range[0];
      filterCondition = wall => wall[1] === y;
      findWall = wallList => wallList.find(wall => wall[0] > x);
      wrappedWall = walls => walls[0];
      getStepsToWall = wall => wall[0] > x ?
        wall[0] - x - 1
        :
        (range[1] - x) + (wall[0] - range[0]);
      getNewPos = wall => wall[0] === range[0] ? [range[1], y] : [wall[0] - 1, y];
      break;

    case 1: // v
      range = findYRange({x, y}, bounds);
      filterCondition = wall => wall[0] === x;
      findWall = wallList => wallList.find(wall => wall[1] > y);
      wrappedWall = walls => walls[0];
      getStepsToWall = wall => wall[1] - y
      getStepsToWall = wall => wall[1] > y ?
        wall[1] - y - 1
        :
        (range[1] - y) + (wall[1] - range[0]);
      getNewPos = wall => wall[1] === range[0] ? [x, range[1]] : [x, wall[1] - 1];
      break;

    case 2: // <<
      range = curBound.xRange;
      filterCondition = wall => wall[1] === y;
      findWall = wallList => wallList.findLast(wall => wall[0] < x);
      wrappedWall = walls => walls[walls.length - 1];
      getStepsToWall = wall => wall[0] < x ?
        x - wall[0] - 1
        :
        (x - range[0]) + (range[1] - wall[0]);
      getNewPos = wall => wall[0] === range[1] ? [range[0], y] : [wall[0] + 1, y];
      break;

    case 3: // ^
      range = findYRange({x, y}, bounds);
      filterCondition = wall => wall[0] === x;
      findWall = wallList => wallList.findLast(wall => wall[1] < y);
      wrappedWall = walls => walls[walls.length - 1];
      getStepsToWall = wall => wall[1] < y ?
        y - wall[1] - 1
        :
        (y - range[0]) + (range[1] - wall[1]);
      getNewPos = wall => wall[1] === range[1] ? [x, range[0]] : [x, wall[1] + 1];
      break;

    default:
      throw `Unexpected dir ${facing}`;
  }

  const wallList = walls.filter(filterCondition);
  if (wallList.length === 0) {
    return { wall:null, stepsToWall: null, newPos: null };
  }

  let wall = findWall(wallList);
  if (typeof wall === 'undefined') {
    wall = wrappedWall(wallList);
  }

  const stepsToWall = getStepsToWall(wall);
  const newPos = getNewPos(wall)
  return { wall, stepsToWall, newPos };
}

function move({x, y, facing}, steps, bounds) {
  const curBound =  bounds.find(bound => isInBound({x, y}, bound));
  let range, base, change, modBase;
  switch (facing) {
    case 0:
      range = curBound.xRange;
      base = range[0];
      change = x - range[0] + steps;
      modBase = range[1] - range[0] + 1;
      break;

    case 1:
      range = findYRange({x, y}, bounds);
      base = range[0];
      change = y - range[0] + steps;
      modBase = range[1] - range[0] + 1;
      break;

    case 2:
      range = curBound.xRange;
      base = range[1];
      change = -(range[1] - x + steps);
      modBase = range[1] - range[0] + 1;
      break;

    case 3:
      range = findYRange({x, y}, bounds);
      base = range[1];
      change = -(range[1] - y + steps);
      modBase = range[1] - range[0] + 1;
      break;

    default:
      throw `Unexpected dir ${facing}`;
  }

  const newValue = base + change % modBase;
  if (facing === 0 || facing === 2) {
    return [newValue, y];
  }
  else {
    return [x, newValue];
  }
}

function advance(player, steps, bounds, walls) {
  let { wall, stepsToWall, newPos } = tryHitWall(player, bounds, walls);
  if (wall && (stepsToWall <= steps)) {
    // hit a wall
    return newPos;
  }
  else {
    return move(player, steps, bounds);
  }
}

function isInBound({x, y}, bound) {
  return bound.xRange[0] <= x && bound.xRange[1] >= x && bound.yRange[0] <= y && bound.yRange[1] >= y;
}

function testHillWall(bounds, walls) {
  let player, errorMsg, wall, stepsToWall, newPos, r;

  errorMsg = `tryHitWall failed`;

  player = { facing: 0, x: 8, y: 0 };
  r = tryHitWall(player, bounds, walls);
  wall = r.wall;
  stepsToWall = r.stepsToWall;
  newPos = r.newPos;
  console.assert(
    wall[0] === 11 && wall[1] === 0 &&
    newPos[0] === 10 && newPos[1] === 0 &&
    stepsToWall === 2, '%o', { player, errorMsg });

  player = { facing: 2, x: 8, y: 0 };
  r = tryHitWall(player, bounds, walls);
  wall = r.wall;
  stepsToWall = r.stepsToWall;
  newPos = r.newPos;
  console.assert(
    wall[0] === 11 && wall[1] === 0 &&
    newPos[0] === 8 && newPos[1] === 0 &&
    stepsToWall === 0, '%o', { player, errorMsg });

  player = { facing: 0, x: 10, y: 1 };
  r = tryHitWall(player, bounds, walls);
  wall = r.wall;
  stepsToWall = r.stepsToWall;
  newPos = r.newPos;
  console.assert(
    wall[0] === 9 && wall[1] === 1 &&
    newPos[0] === 8 && newPos[1] === 1 &&
    stepsToWall === 2, '%o', { player, errorMsg });

  player = { facing: 2, x: 10, y: 1 };
  r = tryHitWall(player, bounds, walls);
  wall = r.wall;
  stepsToWall = r.stepsToWall;
  newPos = r.newPos;
  console.assert(
    wall[0] === 9 && wall[1] === 1 &&
    newPos[0] === 10 && newPos[1] === 1 &&
    stepsToWall === 0, '%o', { player, errorMsg });

  player = { facing: 0, x: 10, y: 3 };
  r = tryHitWall(player, bounds, walls);
  wall = r.wall;
  stepsToWall = r.stepsToWall;
  console.assert(
    wall === null && stepsToWall === null, '%o', { player, errorMsg });

  player = { facing: 0, x: 4, y: 6 };
  r = tryHitWall(player, bounds, walls);
  wall = r.wall;
  stepsToWall = r.stepsToWall;
  newPos = r.newPos;
  console.assert(
    wall[0] === 7 && wall[1] === 6 &&
    newPos[0] === 6 && newPos[1] === 6 &&
    stepsToWall === 2, '%o', { player, errorMsg });

  player = { facing: 2, x: 4, y: 6 };
  r = tryHitWall(player, bounds, walls);
  wall = r.wall;
  stepsToWall = r.stepsToWall;
  newPos = r.newPos;
  console.assert(
    wall[0] === 2 && wall[1] === 6 &&
    newPos[0] === 3 && newPos[1] === 6 &&
    stepsToWall === 1, '%o', { player, errorMsg });

  player = { facing: 2, x: 0, y: 6 };
  r = tryHitWall(player, bounds, walls);
  wall = r.wall;
  stepsToWall = r.stepsToWall;
  newPos = r.newPos;
  console.assert(
    wall[0] === 7 && wall[1] === 6 &&
    newPos[0] === 8 && newPos[1] === 6 &&
    stepsToWall === 4, '%o', { player, errorMsg });

  player = { facing: 1, x: 8, y: 0 };
  r = tryHitWall(player, bounds, walls);
  wall = r.wall;
  stepsToWall = r.stepsToWall;
  newPos = r.newPos;
  console.assert(
    wall[0] === 8 && wall[1] === 2 &&
    newPos[0] === 8 && newPos[1] === 1 &&
    stepsToWall === 1, '%o', { player, errorMsg });

  player = { facing: 3, x: 8, y: 0 };
  r = tryHitWall(player, bounds, walls);
  wall = r.wall;
  stepsToWall = r.stepsToWall;
  newPos = r.newPos;
  console.assert(
    wall[0] === 8 && wall[1] === 5 &&
    newPos[0] === 8 && newPos[1] === 6 &&
    stepsToWall === 6, '%o', { player, errorMsg });

  player = { facing: 1, x: 8, y: 3 };
  r = tryHitWall(player, bounds, walls);
  wall = r.wall;
  stepsToWall = r.stepsToWall;
  newPos = r.newPos;
  console.assert(
    wall[0] === 8 && wall[1] === 5 &&
    newPos[0] === 8 && newPos[1] === 4 &&
    stepsToWall === 1, '%o', { player, errorMsg });

  player = { facing: 3, x: 8, y: 3 };
  r = tryHitWall(player, bounds, walls);
  wall = r.wall;
  stepsToWall = r.stepsToWall;
  newPos = r.newPos;
  console.assert(
    wall[0] === 8 && wall[1] === 2 &&
    newPos[0] === 8 && newPos[1] === 3 &&
    stepsToWall === 0, '%o', { player, errorMsg });

  player = { facing: 1, x: 14, y: 9 };
  r = tryHitWall(player, bounds, walls);
  wall = r.wall;
  stepsToWall = r.stepsToWall;
  newPos = r.newPos;
  console.assert(
    wall[0] === 14 && wall[1] === 11 &&
    newPos[0] === 14 && newPos[1] === 10 &&
    stepsToWall === 1, '%o', { player, errorMsg });

  player = { facing: 3, x: 14, y: 9 };
  r = tryHitWall(player, bounds, walls);
  wall = r.wall;
  stepsToWall = r.stepsToWall;
  newPos = r.newPos;
  console.assert(
    wall[0] === 14 && wall[1] === 11 &&
    newPos[0] === 14 && newPos[1] === 8 &&
    stepsToWall === 1, '%o', { player, errorMsg });

  player = { facing: 3, x: 5, y: 6 };
  r = tryHitWall(player, bounds, walls);
  wall = r.wall;
  stepsToWall = r.stepsToWall;
  newPos = r.newPos;
  console.assert(
    wall === null &&
    newPos === null &&
    stepsToWall === null, '%o', { player, errorMsg });

  player = { facing: 0, x: 10, y: 5 };
  r = tryHitWall(player, bounds, walls);
  wall = r.wall;
  stepsToWall = r.stepsToWall;
  newPos = r.newPos;
  console.assert(
    wall[0] === 8 && wall[1] === 5 &&
    newPos[0] === 7 && newPos[1] === 5 &&
    stepsToWall === 9, '%o', { player, errorMsg });
}

function testMove(bounds, walls) {
  let player, errorMsg, wall, steps, newPos;
  errorMsg = `move failed`;

  player = { facing: 0, x: 8, y: 0 };
  steps = 2;
  newPos = move(player, steps, bounds);
  console.assert(
    newPos[0] === 10 && newPos[1] === 0,
    '%o', { player, errorMsg });

  player = { facing: 2, x: 8, y: 0 };
  steps = 2;
  newPos = move(player, steps, bounds);
  console.assert(
    newPos[0] === 10 && newPos[1] === 0,
    '%o', { player, errorMsg });

  player = { facing: 1, x: 8, y: 0 };
  steps = 2;
  newPos = move(player, steps, bounds);
  console.assert(
    newPos[0] === 8 && newPos[1] === 2,
    '%o', { player, errorMsg });

  player = { facing: 3, x: 8, y: 0 };
  steps = 2;
  newPos = move(player, steps, bounds);
  console.assert(
    newPos[0] === 8 && newPos[1] === 10,
    '%o', { player, errorMsg });

  player = { facing: 1, x: 5, y: 5 };
  steps = 2;
  newPos = move(player, steps, bounds);
  console.assert(
    newPos[0] === 5 && newPos[1] === 7,
    '%o', { player, errorMsg });

  player = { facing: 3, x: 5, y: 5 };
  steps = 2;
  newPos = move(player, steps, bounds);
  console.assert(
    newPos[0] === 5 && newPos[1] === 7,
    '%o', { player, errorMsg });
}

function solution1(bounds, walls, insList) {
  // testHillWall(bounds, walls, insList);
  // testMove(bounds, walls)

  let player = { facing: 0, x: bounds[0].xRange[0], y: bounds[0].yRange[0] };

  for (const ins of insList) {
    if (isNaN(ins)) {
      player.facing = player.facing + (ins === 'R' ? 1 : -1);
      if (player.facing === -1)
        player.facing = 3;
      player.facing = player.facing % 4;
    }
    else {
      const steps = ins;
      const newPos = advance(player, steps, bounds, walls);
      player.x = newPos[0];
      player.y = newPos[1];
    }
    // console.log(`${ins} - ${player.facing} (${player.x} ${player.y})`);
  }

  return 1000 * (player.y + 1) + 4 * (player.x + 1) + player.facing;
}

function solution2() {
  return false;
}

(function run() {
  try {
    const { file } = getArgvs();
    const content = readFileSync(file, { encoding:'utf8' });
    const { bounds, walls, insList } = parseInput(content);

    let startTime = new Date().getTime();
    let answer = solution1(bounds, walls, insList);
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
