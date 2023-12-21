import { readFileSync } from 'fs';
import Yargs from "yargs";

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

function isGamePossible(game, redCubes, greenCubes, blueCubes) {
  // Check each subset of cubes in the game
  for (const subset of game.subsets) {
    if (subset.red > redCubes || subset.green > greenCubes || subset.blue > blueCubes) {
      return false;
    }
  }
  return true;
}

function parseInput(input) {
  const parts = input.split(': ');
  const gameId = parseInt(parts[0].split(' ')[1], 10);
  const subsets = parts[1].split('; ').map(subset => {
    const counts = { red: 0, green: 0, blue: 0 };
    subset.split(', ').forEach(colorCount => {
      const [count, color] = colorCount.split(' ');
      counts[color] += parseInt(count, 10);
    });
    return counts;
  });
  return { gameId, subsets };
}

function sumOfPossibleGames(input) {
  const games = input.split('\n').map(parseInput);
  let sum = 0;

  for (const game of games) {
    if (isGamePossible(game, 12, 13, 14)) {
      sum += game.gameId;
    }
  }

  return sum;
}

function minCubesForGame(game) {
  let minRed = 0, minGreen = 0, minBlue = 0;

  // Find the maximum count of each color shown in the game
  for (const subset of game.subsets) {
    minRed = Math.max(minRed, subset.red);
    minGreen = Math.max(minGreen, subset.green);
    minBlue = Math.max(minBlue, subset.blue);
  }

  return { red: minRed, green: minGreen, blue: minBlue };
}

function powerOfCubes(cubes) {
  return cubes.red * cubes.green * cubes.blue;
}

function sumOfPowers(input) {
  const games = input.split('\n').map(parseInput);
  let sum = 0;

  for (const game of games) {
    const minCubes = minCubesForGame(game);
    sum += powerOfCubes(minCubes);
  }

  return sum;
}

(function run() {
  try {
    const { file } = getArgvs();
    const content = readFileSync(file, { encoding:'utf8' }).trim();

    let startTime = new Date().getTime();
    let answer = sumOfPossibleGames(content);
    let endTime = new Date().getTime();
    console.log(`Solution 1: ${endTime - startTime} ms`);
    console.log(answer);

    startTime = new Date().getTime();
    answer = sumOfPowers(content);
    endTime = new Date().getTime();
    console.log(`Solution 2: ${endTime - startTime} ms`);
    console.log(answer);

  } catch (error) {
    console.error(error);
    process.exit(1);
  }

  process.exit(0);

})();
