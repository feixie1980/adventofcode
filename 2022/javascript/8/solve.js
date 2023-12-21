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
  return content.split('\n').map(line => line.split('').map(n => parseInt(n)));
}

function isHidden(trees, x, y) {
  const tree = trees[x][y];

  let blockOnLeft = false;
  for (let i = 0; i < y; i++) {
    if ( trees[x][i] >= tree ) {
      blockOnLeft = true;
      break;
    }
  }

  let blockOnRight = false;
  for (let i = y + 1; i < trees[x].length; i++) {
    if ( trees[x][i] >= tree ) {
      blockOnRight = true;
      break;
    }
  }

  let blockOnTop = false;
  for (let i = 0; i < x; i++) {
    if ( trees[i][y] >= tree ) {
      blockOnTop = true;
      break;
    }
  }

  let blockOnBottom = false;
  for (let i = x + 1; i < trees.length; i++) {
    if ( trees[i][y] >= tree ) {
      blockOnBottom = true;
      break;
    }
  }

  return blockOnTop && blockOnBottom && blockOnRight && blockOnLeft;
}

function solution1(trees) {
  // edges are visible
  let visible = trees.length * 2 + (trees[0].length - 2) * 2;
  for (let i = 1; i < trees.length - 1; i++) {
    for (let j = 1; j < trees[i].length - 1; j++) {
      if (!isHidden(trees, i, j)) {
        visible++;
      }
    }
  }
  return visible;
}

function scenicScore(trees, x, y) {
  const tree = trees[x][y];

  let scoreOnLeft = 0;
  for (let i = y - 1; i >= 0; i--) {
    if ( trees[x][i] < tree ) {
      scoreOnLeft++;
    }
    else {
      scoreOnLeft++;
      break;
    }
  }

  let scoreOnRight = 0;
  for (let i = y + 1; i < trees[x].length; i++) {
    if ( trees[x][i] < tree ) {
      scoreOnRight++;
    }
    else {
      scoreOnRight++;
      break;
    }
  }

  let scoreOnTop = 0;
  for (let i = x - 1; i >= 0; i--) {
    if ( trees[i][y] < tree ) {
      scoreOnTop++;
    }
    else {
      scoreOnTop++;
      break;
    }
  }

  let scoreOnBottom = 0;
  for (let i = x + 1; i < trees.length; i++) {
    if ( trees[i][y] < tree ) {
      scoreOnBottom++;
    }
    else {
      scoreOnBottom++;
      break;
    }
  }

  return scoreOnTop * scoreOnRight * scoreOnLeft * scoreOnBottom;
}

function solution2(trees) {
  let max = 0;
  for (let i = 0; i < trees.length; i++) {
    for (let j = 0; j < trees[i].length; j++) {
      const score = scenicScore(trees, i, j);
      max = score > max ? score : max;
    }
  }
  return max;
}

(function run() {
  try {
    const { file } = getArgvs();
    const content = readFileSync(file, { encoding:'utf8' }).trim();
    const trees = parseInput(content);

    let startTime = new Date().getTime();
    let answer = solution1(trees);
    let endTime = new Date().getTime();
    console.log(`Solution 1: ${endTime - startTime} ms`);
    console.log(answer);

    startTime = new Date().getTime();
    answer = solution2(trees);
    endTime = new Date().getTime();
    console.log(`Solution 2: ${endTime - startTime} ms`);
    console.log(answer);

  } catch (error) {
    console.error(error);
    process.exit(1);
  }

  process.exit(0);

})();
