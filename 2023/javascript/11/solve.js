import { readFileSync } from 'fs';
import Yargs from "yargs";
import { genDistanceMap, shortestPath } from "./utils.js";

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
  return content.split('\n').map(line => line.split(''));
}

function getGalaxyPairs(universe) {
  const galaxies = universe
    .flatMap((row, i) => row.map((s, j) => s === '#' ? [i, j] : null))
    .filter(g => !!g);

  const pairs = [];
  for(let i = 0; i < galaxies.length; i++) {
    for(let j = i +1; j < galaxies.length; j++) {
      pairs.push([galaxies[i], galaxies[j]]);
    }
  }
  return pairs;
}

function solution1(universe) {
  const distMap =  genDistanceMap(universe, 2);
  const pairs = getGalaxyPairs(universe);
  const distances = pairs.map(pair => shortestPath(distMap, pair));
  return distances.reduce((sum, d) => sum + d, 0);
}

function solution2(universe) {
  const distMap =  genDistanceMap(universe, 1000000);
  const pairs = getGalaxyPairs(universe);
  const distances = pairs.map(pair => shortestPath(distMap, pair));
  return distances.reduce((sum, d) => sum + d, 0);
}

(function run() {
  try {
    const { file } = getArgvs();
    const content = readFileSync(file, { encoding:'utf8' }).trim();
    const universe = parseInput(content);

    let startTime = new Date().getTime();
    let answer = solution1(universe);
    let endTime = new Date().getTime();
    console.log(`Solution 1: ${endTime - startTime} ms`);
    console.log(answer);

    startTime = new Date().getTime();
    answer = solution2(universe);
    endTime = new Date().getTime();
    console.log(`Solution 2: ${endTime - startTime} ms`);
    console.log(answer);

  } catch (error) {
    console.error(error);
    process.exit(1);
  }

  process.exit(0);

})();
