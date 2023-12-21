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
  const games = content.split('\n').map(line =>
    line.split(':')[1].trim().split(';'));
  const result = [];

  return games.map(game => {
    return game.map(bagStr => {
      let obj = {};
      bagStr.trim().split(',').forEach(cubeStr => {
        const [quantity, color] = cubeStr.trim().split(' ');
        obj[color] = parseInt(quantity);
      })
      return obj;
    })

  });
}

function minPossibleCubes(game) {
  const minPossibles = { red: 0, blue: 0, green: 0 };
  for (let set of game) {
    Object.entries(set).forEach(([color, quantity]) => {
      if (minPossibles[color] < quantity) {
        minPossibles[color] = quantity;
      }
    })
  }
  return  minPossibles;
}

function isPossible(game) {
  let remains = { red: 12, green: 13, blue: 14 };
  for (let set of game) {
    if (set.red > remains.red || set.blue > remains.blue || set.green > remains.green) {
      return false;
    }
  }
  return true;
}

function solution1(games) {
  let sum = 0;
  for (let i = 0; i < games.length; i++) {
    const game = games[i];
    if (isPossible(game)) {
      sum += i + 1;
    }
  }
  return sum;
}

function solution2(games) {
  let sum = 0;
  for(let game of games) {
    const mins = minPossibleCubes(game);
    sum += mins.red * mins.blue * mins.green;
  }
  return sum;
}

(function run() {
  try {
    const { file } = getArgvs();
    const content = readFileSync(file, { encoding:'utf8' }).trim();
    const input = parseInput(content);

    let startTime = new Date().getTime();
    let answer = solution1(input);
    let endTime = new Date().getTime();
    console.log(`Solution 1: ${endTime - startTime} ms`);
    console.log(answer);

    startTime = new Date().getTime();
    answer = solution2(input);
    endTime = new Date().getTime();
    console.log(`Solution 2: ${endTime - startTime} ms`);
    console.log(answer);

  } catch (error) {
    console.error(error);
    process.exit(1);
  }

  process.exit(0);

})();
