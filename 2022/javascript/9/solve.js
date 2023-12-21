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
  return content.split('\n').map(line => {
    const [dir, steps] = line.split(' ');
    return { dir, steps: parseInt(steps) };
  });
}

function updateNextKnotPos(newPrevKnotPos, nextKnotPos) {
  const xDiff = newPrevKnotPos[0] - nextKnotPos[0];
  const yDiff = newPrevKnotPos[1] - nextKnotPos[1];

  if ( Math.abs(xDiff) === 2 && yDiff === 0) {
    // move tail vertically
    return [nextKnotPos[0] + (xDiff > 0 ? 1 : -1), nextKnotPos[1]];
  }

  if ( Math.abs(yDiff) === 2 && xDiff === 0) {
    // move tail horizontally
    return [nextKnotPos[0], nextKnotPos[1] + (yDiff > 0 ? 1 : -1)];
  }

  if ( Math.abs(xDiff) === 2 && Math.abs(yDiff) === 1 ||
       Math.abs(xDiff) === 1 && Math.abs(yDiff) === 2 ) {
    // move tail diagonally
    return [nextKnotPos[0] + (xDiff > 0 ? 1 : -1), nextKnotPos[1] + (yDiff > 0 ? 1 : -1)];
  }

  if ( Math.abs(xDiff) === 2 && Math.abs(yDiff) === 2) {
    // move tail diagonally
    return [nextKnotPos[0] + (xDiff > 0 ? 1 : -1), nextKnotPos[1] + (yDiff > 0 ? 1 : -1)];
  }

  if ( Math.abs(xDiff) <= 1 && Math.abs(yDiff) <= 1)
    return nextKnotPos; //no move

  throw `Impossible positions detected - prev:${newPrevKnotPos}, next:${nextKnotPos}`;
}

function moveHeadOneStep(headPos, dir) {
  let newHeadPos;
  switch (dir) {
    case 'R':
      newHeadPos = [headPos[0], headPos[1] + 1];
      break;

    case 'L':
      newHeadPos = [headPos[0], headPos[1] - 1];
      break;

    case 'U':
      newHeadPos = [headPos[0] + 1, headPos[1]];
      break;

    case 'D':
      newHeadPos = [headPos[0] - 1, headPos[1]];
      break;

    default:
      throw `Invalid dir: ${dir}`;
  }
  return newHeadPos;
}

function moveOneStep(headPos, tailPos, dir) {
  const newHeadPos = moveHeadOneStep(headPos, dir);
  const newTailPos = updateNextKnotPos(newHeadPos, tailPos);
  return { newHeadPos, newTailPos };
}

function solution1(moves) {
  let headPos = [0, 0], tailPos = [0, 0];
  let tailPosSet = new Set();
  for (const move of moves) {
    const { dir, steps } = move;
    for (let i = 0; i < steps; i++) {
      const { newHeadPos, newTailPos } = moveOneStep(headPos, tailPos, dir);
      //console.log(`h:${newHeadPos}, t:${newTailPos}`);
      tailPosSet.add(`${newTailPos[0]}-${newTailPos[1]}`);
      headPos = newHeadPos;
      tailPos = newTailPos;
    }
  }
  return tailPosSet.size;
}

function moveOneStepKnots(knotPosList, dir) {
  const newKnotPosList = knotPosList.map(knotPos => [...knotPos]);
  newKnotPosList[0] = moveHeadOneStep(knotPosList[0], dir);
  for (let i = 1; i < knotPosList.length; i++) {
    newKnotPosList[i] = updateNextKnotPos(newKnotPosList[i - 1], knotPosList[i]);
  }
  return newKnotPosList;
}

function solution2(moves) {
  let knotPosList = Array(10).fill(0).map(_ => [0, 0]);
  let tailPosSet = new Set();
  for (const move of moves) {
    const { dir, steps } = move
    // console.log(`=== ${dir} ${steps} ===`);
    for (let i = 0; i < steps; i++) {
      const newKnotPosList = moveOneStepKnots(knotPosList, dir);
      // console.log(newKnotPosList);
      tailPosSet.add(`${newKnotPosList[9][0]}-${newKnotPosList[9][1]}`);
      knotPosList = newKnotPosList;
    }
  }
  return tailPosSet.size;
}

(function run() {
  try {
    const { file } = getArgvs();
    const content = readFileSync(file, { encoding:'utf8' }).trim();
    const moves = parseInput(content);

    let startTime = new Date().getTime();
    let answer = solution1(moves);
    let endTime = new Date().getTime();
    console.log(`Solution 1: ${endTime - startTime} ms`);
    console.log(answer);

    startTime = new Date().getTime();
    answer = solution2(moves);
    endTime = new Date().getTime();
    console.log(`Solution 2: ${endTime - startTime} ms`);
    console.log(answer);

  } catch (error) {
    console.error(error);
    process.exit(1);
  }

  process.exit(0);

})();
