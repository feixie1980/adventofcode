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
  return content.split('\n').map(line => line.split(''));
}

function priority(c) {
  const aCode = 'a'.codePointAt(0), zCode = 'z'.codePointAt(0), Acode = 'A'.codePointAt(0), Zcode = 'Z'.codePointAt(0);
  const charCode = c.codePointAt(0);
  if (aCode <= charCode && charCode <= zCode) {
    return charCode - aCode + 1;
  }
  if (Acode <= charCode && charCode <= Zcode) {
    return charCode - Acode + 27;
  }
  throw `Unexpected char encountered: '${c}'`;
}

function findMisplacedItem(rucksack) {
  const seenInFirst = rucksack
    .slice(0, rucksack.length / 2)
    .reduce((set, c) => {
      set.add(c);
      return set;
    }, new Set());

  return rucksack
    .slice(rucksack.length / 2, rucksack.length)
    .find(c => seenInFirst.has(c));
}

function solution1(rucksacks) {
  const misplaced = rucksacks.map(rucksack => findMisplacedItem(rucksack));
  return misplaced.reduce((sum, c) => sum + priority(c), 0);
}

function findBadgeItem(rucksacks) {
  if (rucksacks.length !== 3)
    throw 'Wrong number of rucksacks, must be 3!';
  return rucksacks[2].find(c => rucksacks[0].includes(c) && rucksacks[1].includes(c));
}

function solution2(rucksacks) {
  const badgeItems = [];
  for( let i = 0; i < rucksacks.length; i = i + 3) {
    const item = findBadgeItem([rucksacks[i], rucksacks[i + 1], rucksacks[i + 2]])
    badgeItems.push(item);
  }
  return badgeItems.reduce((sum, c) => sum + priority(c), 0);
}

(function run() {
  try {
    const { file } = getArgvs();
    const content = readFileSync(file, { encoding:'utf8' }).trim();
    const rucksack = parseInput(content);

    let startTime = new Date().getTime();
    let answer = solution1(rucksack);
    let endTime = new Date().getTime();
    console.log(`Solution 1: ${endTime - startTime} ms`);
    console.log(answer);

    startTime = new Date().getTime();
    answer = solution2(rucksack);
    endTime = new Date().getTime();
    console.log(`Solution 2: ${endTime - startTime} ms`);
    console.log(answer);

  } catch (error) {
    console.error(error);
    process.exit(1);
  }

  process.exit(0);

})();
