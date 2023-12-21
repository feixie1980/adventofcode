import { readFileSync } from 'fs';
import Yargs from "yargs";
import { findLCM } from "./utils.js";

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
  const instructions = content.split('\n\n')[0].split('');
  const map = {};
  content.split('\n\n')[1].split('\n').map(line => {
    let node;
    line.replace(/^(\w+) = \((\w+), (\w+)\)$/,
      (match, id, left, right) => {
        map[id] = [left, right];
      });
  });
  return { instructions, map };
}

function solution1({ instructions, map }) {
  let current = 'AAA', steps = 0;
  while (current !== 'ZZZ') {
    const dir = instructions[steps % instructions.length];
    current = dir === 'L' ? map[current][0] : map[current][1];
    steps++;
  }

  return steps;
}

function solution2({ instructions, map }) {
  let curList = Object.keys(map).filter(key => key.endsWith('A'));
  let diffList = curList.map(() => 0);
  let steps = 0;

  while (true) {
    const dir = instructions[steps % instructions.length];
    curList = curList.map(cur => dir === 'L' ? map[cur][0] : map[cur][1]);
    steps++;

    curList.forEach((node, i) => {
      if (node.endsWith('Z')) {
        if (diffList[i] === 0) {
          diffList[i] = steps;
        }
      }
    });

    if (!diffList.some(diff => diff === 0)) {
      break;
    }
  }

  return findLCM(diffList);
}

(function run() {
  try {
    const { file } = getArgvs();
    const content = readFileSync(file, { encoding:'utf8' }).trim();
    const maze = parseInput(content);

    let startTime = new Date().getTime();
    let answer = solution2(maze);
    let endTime = new Date().getTime();
    console.log(`Solution 1: ${endTime - startTime} ms`);
    console.log(answer);

    /*
    startTime = new Date().getTime();
    answer = solution2(maze);
    endTime = new Date().getTime();
    console.log(`Solution 2: ${endTime - startTime} ms`);
    console.log(answer);

     */

  } catch (error) {
    console.error(error);
    process.exit(1);
  }

  process.exit(0);

})();
