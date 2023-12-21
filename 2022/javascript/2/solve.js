import { readFileSync } from 'fs';
import Yargs from "yargs";

const shapeScore = {
  A: 1, B: 2, C: 3,
  X: 1, Y: 2, Z: 3
}

const matchScore = {
  A: {
    X: 3,
    Y: 6,
    Z: 0
  },
  B: {
    X: 0,
    Y: 3,
    Z: 6
  },
  C: {
    X: 6,
    Y: 0,
    Z: 3
  }
}

const resultToShapeMap = {
  A: {
    X: 'C',
    Y: 'A',
    Z: 'B'
  },
  B: {
    X: 'A',
    Y: 'B',
    Z: 'C'
  },
  C: {
    X: 'B',
    Y: 'C',
    Z: 'A'
  }
}

const resultScoreMap = {
  X: 0,
  Y: 3,
  Z: 6
}

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
  return content.split('\n').map(line => line.split(' '));
}

function roundScore(round) {
  const [opponent, self] = round;
  return shapeScore[self] + matchScore[opponent][self];
}

function solution1(rounds) {
  return rounds.reduce((total, round) => total + roundScore(round), 0);
}

function roundScore2(round) {
  const [opponent, result] = round;
  const self = resultToShapeMap[opponent][result];
  return shapeScore[self] + resultScoreMap[result];
}

function solution2(rounds) {
  return rounds.reduce((total, round) => total + roundScore2(round), 0);
}

(function run() {
  try {
    const { file } = getArgvs();
    const content = readFileSync(file, { encoding:'utf8' }).trim();
    const rounds = parseInput(content);

    let startTime = new Date().getTime();
    let answer = solution1(rounds);
    let endTime = new Date().getTime();
    console.log(`Solution 1: ${endTime - startTime} ms`);
    console.log(answer);

    startTime = new Date().getTime();
    answer = solution2(rounds);
    endTime = new Date().getTime();
    console.log(`Solution 2: ${endTime - startTime} ms`);
    console.log(answer);

  } catch (error) {
    console.error(error);
    process.exit(1);
  }

  process.exit(0);

})();
