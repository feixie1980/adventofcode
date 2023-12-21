import { readFileSync } from 'fs';
import Yargs from "yargs";
import { CardValue, compareHands, compareJHands, typeOfHand } from "./utils.js";

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
    const parts = line.split(' ');
    return { hand: parts[0], bid: parseInt(parts[1]) };
  });
}

function solution1(game) {
  game.sort((g1, g2) => compareHands(g1.hand, g2.hand));
  return game.reduce((total, g, i) => g.bid * (i + 1) + total, 0);
}

function solution2(game) {
  game.sort((g1, g2) => compareJHands(g1.hand, g2.hand));
  return game.reduce((total, g, i) => g.bid * (i + 1) + total, 0);
}

(function run() {
  try {
    const { file } = getArgvs();
    const content = readFileSync(file, { encoding:'utf8' }).trim();
    const game = parseInput(content);

    let startTime = new Date().getTime();
    let answer = solution1(game);
    let endTime = new Date().getTime();
    console.log(`Solution 1: ${endTime - startTime} ms`);
    console.log(answer);

    startTime = new Date().getTime();
    answer = solution2(game);
    endTime = new Date().getTime();
    console.log(`Solution 2: ${endTime - startTime} ms`);
    console.log(answer);

  } catch (error) {
    console.error(error);
    process.exit(1);
  }

  process.exit(0);

})();
