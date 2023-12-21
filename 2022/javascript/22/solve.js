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

function parseMap(lines) {
  const regions = [];
  const rWidth = lines[0].trim().length;
  const rHeight = lines.length / 3;

  /**
   * Regions
   *
   *          1
   *      2 3 4
   *          5 6
   */

  // region 1
  let region = lines.slice(0, rHeight).map(line => [...line.trim()]);
  regions.push(region);

  // region 2
  region = lines.slice(rHeight, rHeight * 2).map(line => [...line].slice(0, rWidth));
  regions.push(region);

  // region 3
  region = lines.slice(rHeight, rHeight * 2).map(line => [...line].slice(rWidth, rWidth * 2));
  regions.push(region);

  // region 4
  region = lines.slice(rHeight, rHeight * 2).map(line => [...line].slice(rWidth * 2, rWidth * 3));
  regions.push(region);

  // region 5
  region = lines.slice(rHeight * 2, rHeight * 3).map(line => [...line.trim()].slice(0, rWidth));
  regions.push(region);

  // region 6
  region = lines.slice(rHeight * 2, rHeight * 3).map(line => [...line.trim()].slice(rWidth, rWidth * 2));
  regions.push(region);

  return regions;
}

function parseInstructions(line) {
  const array = [...line.matchAll(/[0-9]+|L|R/g)];
  return array.map(match => isNaN(match[0]) ? match[0] : parseInt(match[0]));
}

function parseInput(content) {
  const lines = content.split('\n');
  const regions = parseMap(lines.slice(0, lines.length - 3));
  const insList = parseInstructions(lines[lines.length - 2]);
  return { regions, insList };
}

function findNewRegionIdAndPoint(fromPoint, fromRegionId, toPoint, regions) {
  let newRegionId = fromRegionId;
  let newPoint = Object.assign({}, fromPoint);

  const xDiff = toPoint.x - fromPoint.x;
  const yDiff = toPoint.y - fromPoint.y;

  switch (fromRegionId) {
    case 0:
      if (xDiff > 0) { // wrapping
        newPoint.x = 0;
      }
      if (xDiff < 0) { // wrapping
        newPoint.x = regions[0][0].length - 1;
      }
      if (yDiff > 0) {
        newRegionId = 3;
        newPoint.y = 0;
      }
      if (yDiff < 0) {
        newRegionId = 4;
        newPoint.y = regions[newRegionId].length - 1;
      }
      break;

    case 1:
      if (xDiff > 0) {
        newRegionId = 2;
        newPoint.x = 0;
      }
      if (xDiff < 0) {
        newRegionId = 3;
        newPoint.x = regions[newRegionId][0].length - 1;
      }
      if (yDiff > 0) { // wrapping
        newPoint.y = 0;
      }
      if (yDiff < 0) { // wrapping
        newPoint.y = regions[1].length - 1;
      }
      break;

    case 2:
      if (xDiff > 0) {
        newRegionId = 3;
        newPoint.x = 0;
      }
      if (xDiff < 0) {
        newRegionId = 1;
        newPoint.x = regions[newRegionId][0].length - 1;
      }
      if (yDiff > 0) { // wrapping
        newPoint.y = 0;
      }
      if (yDiff < 0) { // wrapping
        newPoint.y = regions[2].length - 1;
      }
      break;

    case 3:
      if (xDiff > 0) {
        newRegionId = 1;
        newPoint.x = 0;
      }
      if (xDiff < 0) {
        newRegionId = 2;
        newPoint.x = regions[newRegionId][0].length - 1;

      }
      if (yDiff > 0) {
        newRegionId = 4;
        newPoint.y = 0;
      }
      if (yDiff < 0) {
        newRegionId = 0;
        newPoint.y = regions[newRegionId].length - 1;
      }
      break;

    case 4:
      if (xDiff > 0) {
        newRegionId = 5;
        newPoint.x = 0;
      }
      if (xDiff < 0) {
        newRegionId = 5;
        newPoint.x = regions[newRegionId][0].length - 1;
      }
      if (yDiff > 0) {
        newRegionId = 0;
        newPoint.y = 0;
      }
      if (yDiff < 0) {
        newRegionId = 3;
        newPoint.y = regions[newRegionId].length - 1;
      }
      break;

    case 5:
      if (xDiff > 0) {
        newRegionId = 4;
        newPoint.x = 0;
      }
      if (xDiff < 0) {
        newRegionId = 4;
        newPoint.x = regions[newRegionId][0].length - 1;
      }
      if (yDiff > 0) {
        newPoint.y = 0;
      }
      if (yDiff < 0) {
        newPoint.y = regions[5].length - 1;
      }
      break;

    default:
      throw `Invalid region id: ${fromRegionId}`;
  }

  return { newRegionId, newPoint };
}

/**
 Orientation:

 x  -------->
 y  0 1 2 3
 |  0 1 2 3
 |  0 1 2 3
 v  ...
 */
function advanceOne(pos, regions) {
  const { dir, point, regionId } = pos;
  const region = regions[regionId];

  let newPoint = Object.assign({}, point);
  switch (dir) {
    case 0: // R
      newPoint.x++;
      break;

    case 1: // D
      newPoint.y++;

    case 2: // L
      newPoint.x--;
      break;

    case 3:
      break;

    default:
      throw `Impossible direction ${dir}`;
  }
}

/**
 * Move the player
 *
 * @param steps
 * @param pos
 * @param regions
 */
function move(steps, pos, regions) {
  let i = steps;
  while (i > 0) {
    let newPoint = advanceOne(pos, regions);
  }
}

/**
 * Execute one instruction
 * @param ins num | 'R'
 * @param pos { region, point: {x, y}, dir 0(R) 1(D) 2(L) 3(U) }
 * @param regions
 */
function executeIns(ins, pos, regions) {
  let newPos = Object.assign({}, pos);
  if (isNaN(ins)) {
    // changing direction
    newPos.dir += ins === 'R' ? 1 : -1;
    if (newPos.dir === -1) {
      newPos.dir = 3;
    }
    else if (newPos.dir === 4) {
      newPos.dir = 0;
    }
  }
  else {
    // advancing
    move(ins, pos, regions);
  }

  return newPos;
}

function testRegionCrossing_example(regions) {

  /*** Test region 0 ***/
  var { newRegionId, newPoint } = findNewRegionIdAndPoint(
    { x: 0, y: 0 }, 0, { x: 0, y: -1 }, regions);
  if (newRegionId !== 4) {
    throw `Wrong new region id`;
  }
  if ( newPoint.x !== 0 || newPoint.y !== 3)
  {
    throw `Wrong new point`;
  }

  var { newRegionId, newPoint } = findNewRegionIdAndPoint(
    { x: 0, y: 3 }, 0, { x: 0, y: 4 }, regions);
  if (newRegionId !== 3) {
    throw `Wrong new region id`;
  }
  if ( newPoint.x !== 0 || newPoint.y !== 0)
  {
    throw `Wrong new point`;
  }

  var { newRegionId, newPoint } = findNewRegionIdAndPoint(
    { x: 0, y: 0 }, 0, { x: -1, y: 0 }, regions);
  if (newRegionId !== 0) {
    throw `Wrong new region id`;
  }
  if ( newPoint.x !== 3 || newPoint.y !== 0)
  {
    throw `Wrong new point`;
  }

  var { newRegionId, newPoint } = findNewRegionIdAndPoint(
    { x: 3, y: 2 }, 0, { x: 4, y: 2 }, regions);
  if (newRegionId !== 0) {
    throw `Wrong new region id`;
  }
  if ( newPoint.x !== 0 || newPoint.y !== 2)
  {
    throw `Wrong new point`;
  }

  /*** Test region 1 ***/

  var { newRegionId, newPoint } = findNewRegionIdAndPoint(
    { x: 0, y: 2 }, 1, { x: -1, y: 2 }, regions);
  if (newRegionId !== 3) {
    throw `Wrong new region id`;
  }
  if ( newPoint.x !== 3 || newPoint.y !== 2)
  {
    throw `Wrong new point`;
  }

  var { newRegionId, newPoint } = findNewRegionIdAndPoint(
    { x: 3, y: 1 }, 1, { x: 4, y: 1 }, regions);
  if (newRegionId !== 2) {
    throw `Wrong new region id`;
  }
  if ( newPoint.x !== 0 || newPoint.y !== 1)
  {
    throw `Wrong new point`;
  }

  var { newRegionId, newPoint } = findNewRegionIdAndPoint(
    { x: 0, y: 0 }, 1, { x: 0, y: -1 }, regions);
  if (newRegionId !== 1) {
    throw `Wrong new region id`;
  }
  if ( newPoint.x !== 0 || newPoint.y !== 3)
  {
    throw `Wrong new point`;
  }

  var { newRegionId, newPoint } = findNewRegionIdAndPoint(
    { x: 3, y: 3 }, 1, { x: 3, y: 4 }), regions;
  if (newRegionId !== 1) {
    throw `Wrong new region id`;
  }
  if ( newPoint.x !== 3 || newPoint.y !== 0)
  {
    throw `Wrong new point`;
  }

  /*** Test region 2 ***/

  var { newRegionId, newPoint } = findNewRegionIdAndPoint(
    { x: 0, y: 2 }, 2, { x: -1, y: 2 }, regions);
  if (newRegionId !== 1) {
    throw `Wrong new region id`;
  }
  if ( newPoint.x !== 3 || newPoint.y !== 2)
  {
    throw `Wrong new point`;
  }

  var { newRegionId, newPoint } = findNewRegionIdAndPoint(
    { x: 3, y: 1 }, 2, { x: 4, y: 1 }, regions);
  if (newRegionId !== 3) {
    throw `Wrong new region id`;
  }
  if ( newPoint.x !== 0 || newPoint.y !== 1)
  {
    throw `Wrong new point`;
  }

  var { newRegionId, newPoint } = findNewRegionIdAndPoint(
    { x: 0, y: 0 }, 2, { x: 0, y: -1 }, regions);
  if (newRegionId !== 2) {
    throw `Wrong new region id`;
  }
  if ( newPoint.x !== 0 || newPoint.y !== 3)
  {
    throw `Wrong new point`;
  }

  var { newRegionId, newPoint } = findNewRegionIdAndPoint(
    { x: 3, y: 3 }, 2, { x: 3, y: 4 }), regions;
  if (newRegionId !== 2) {
    throw `Wrong new region id`;
  }
  if ( newPoint.x !== 3 || newPoint.y !== 0)
  {
    throw `Wrong new point`;
  }

  /*** Test region 3 ***/

  var { newRegionId, newPoint } = findNewRegionIdAndPoint(
    { x: 0, y: 0 }, 3, { x: -1, y: 0 }, regions);
  if (newRegionId !== 2) {
    throw `Wrong new region id`;
  }
  if ( newPoint.x !== 3 || newPoint.y !== 0)
  {
    throw `Wrong new point`;
  }

  var { newRegionId, newPoint } = findNewRegionIdAndPoint(
    { x: 3, y: 3 }, 3, { x: 4, y: 3 }, regions);
  if (newRegionId !== 1) {
    throw `Wrong new region id`;
  }
  if ( newPoint.x !== 0 || newPoint.y !== 3)
  {
    throw `Wrong new point`;
  }

  var { newRegionId, newPoint } = findNewRegionIdAndPoint(
    { x: 0, y: 0 }, 3, { x: 0, y: -1 }, regions);
  if (newRegionId !== 0) {
    throw `Wrong new region id`;
  }
  if ( newPoint.x !== 0 || newPoint.y !== 3)
  {
    throw `Wrong new point`;
  }

  var { newRegionId, newPoint } = findNewRegionIdAndPoint(
    { x: 1, y: 3 }, 3, { x: 1, y: 4 }), regions;
  if (newRegionId !== 4) {
    throw `Wrong new region id`;
  }
  if ( newPoint.x !== 1 || newPoint.y !== 0)
  {
    throw `Wrong new point`;
  }

  /*** Test region 4 ***/

  var { newRegionId, newPoint } = findNewRegionIdAndPoint(
    { x: 0, y: 0 }, 4, { x: -1, y: 0 }, regions);
  if (newRegionId !== 5) {
    throw `Wrong new region id`;
  }
  if ( newPoint.x !== 3 || newPoint.y !== 0)
  {
    throw `Wrong new point`;
  }

  var { newRegionId, newPoint } = findNewRegionIdAndPoint(
    { x: 3, y: 3 }, 4, { x: 4, y: 3 }, regions);
  if (newRegionId !== 5) {
    throw `Wrong new region id`;
  }
  if ( newPoint.x !== 0 || newPoint.y !== 3)
  {
    throw `Wrong new point`;
  }

  var { newRegionId, newPoint } = findNewRegionIdAndPoint(
    { x: 0, y: 0 }, 4, { x: 0, y: -1 }, regions);
  if (newRegionId !== 3) {
    throw `Wrong new region id`;
  }
  if ( newPoint.x !== 0 || newPoint.y !== 3)
  {
    throw `Wrong new point`;
  }

  var { newRegionId, newPoint } = findNewRegionIdAndPoint(
    { x: 1, y: 3 }, 4, { x: 1, y: 4 }), regions;
  if (newRegionId !== 0) {
    throw `Wrong new region id`;
  }
  if ( newPoint.x !== 1 || newPoint.y !== 0)
  {
    throw `Wrong new point`;
  }

  /*** Test region 5 ***/

  var { newRegionId, newPoint } = findNewRegionIdAndPoint(
    { x: 0, y: 0 }, 5, { x: -1, y: 0 }, regions);
  if (newRegionId !== 4) {
    throw `Wrong new region id`;
  }
  if ( newPoint.x !== 3 || newPoint.y !== 0)
  {
    throw `Wrong new point`;
  }

  var { newRegionId, newPoint } = findNewRegionIdAndPoint(
    { x: 3, y: 3 }, 5, { x: 4, y: 3 }, regions);
  if (newRegionId !== 4) {
    throw `Wrong new region id`;
  }
  if ( newPoint.x !== 0 || newPoint.y !== 3)
  {
    throw `Wrong new point`;
  }

  var { newRegionId, newPoint } = findNewRegionIdAndPoint(
    { x: 0, y: 0 }, 5, { x: 0, y: -1 }, regions);
  if (newRegionId !== 5) {
    throw `Wrong new region id`;
  }
  if ( newPoint.x !== 0 || newPoint.y !== 3)
  {
    throw `Wrong new point`;
  }

  var { newRegionId, newPoint } = findNewRegionIdAndPoint(
    { x: 1, y: 3 }, 5, { x: 1, y: 4 }), regions;
  if (newRegionId !== 5) {
    throw `Wrong new region id`;
  }
  if ( newPoint.x !== 1 || newPoint.y !== 0)
  {
    throw `Wrong new point`;
  }

  return true;
}

function solution1(regions, insList) {
  const pos = {
    regionId: 0,
    point: { x:0, y:0 },
    dir: 0
  };

  for (const ins of insList) {
    const newPos = executeIns(ins, pos, regions);
  }

  return false;
}

function solution2() {
  return false;
}

(function run() {
  try {
    const { file } = getArgvs();
    const content = readFileSync(file, { encoding:'utf8' });
    const { regions, insList } = parseInput(content);

    let startTime = new Date().getTime();
    //let answer = solution1(regions, insList);
    let answer = testRegionCrossing_example(regions);
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
