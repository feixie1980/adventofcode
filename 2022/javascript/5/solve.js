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
  let readingInit = true;
  let stacks = [], moves = [];

  for (const line of content.split('\n')) {
    if (line === '') {
      continue;
    }

    if (readingInit) { // read initial crate positions
      if(line.includes('1')) {
        readingInit = false; // reading the label line
        continue;
      }
      for (let i = 0; i < line.length; i = i + 4) {
        const crate = line[i + 1];
        if (crate !== ' ') {
          const stackIndex = i / 4;

          // extend array if needed
          const diff = stackIndex + 1 - stacks.length;
          if (diff > 0) {
            stacks = [...stacks, ...Array(diff).fill().map(() => [])];
          }

          // set crate
          stacks[stackIndex].unshift(crate);
        }
      }
    }
    else { // read moves
      // Lines
      // move 3 from 2 to 1
      line.replace(/(move\s)([0-9]+)(\sfrom\s)([0-9]+)(\sto\s)([0-9]+)/,
        (match, lbMove, count, lbFrom, from, lbTo, to) => {
          moves.push({
            count: parseInt(count),
            from: parseInt(from),
            to: parseInt(to)
          });
        });
    }
  }

  return {stacks, moves};
}

function operate9000(stacks, move) {
  const {count, from, to} = move;
  const movedCrates = stacks[from - 1].splice(stacks[from - 1].length - count, count);
  for (let i = movedCrates.length - 1; i >= 0; i--) {
    stacks[to - 1].push(movedCrates[i]);
  }
}

function solution1(iniStacks, moves) {
  let stacks = iniStacks.map(stack => [...stack]);
  for (const move of moves) {
    operate9000(stacks, move)
  }
  return stacks.map(stack => stack[stack.length - 1]).join('');
}

function operate9001(stacks, move) {
  const {count, from, to} = move;
  const movedCrates = stacks[from - 1].splice(stacks[from - 1].length - count, count);
  stacks[to - 1] = [...stacks[to - 1], ...movedCrates];
}

function solution2(iniStacks, moves) {
  let stacks = iniStacks.map(stack => [...stack]);
  for (const move of moves) {
    operate9001(stacks, move)
  }
  return stacks.map(stack => stack[stack.length - 1]).join('');
}

(function run() {
  try {
    const { file } = getArgvs();
    const content = readFileSync(file, { encoding:'utf8' });
    const {stacks, moves} = parseInput(content);

    let startTime = new Date().getTime();
    let answer = solution1(stacks, moves);
    let endTime = new Date().getTime();
    console.log(`Solution 1: ${endTime - startTime} ms`);
    console.log(answer);

    startTime = new Date().getTime();
    answer = solution2(stacks, moves);
    endTime = new Date().getTime();
    console.log(`Solution 2: ${endTime - startTime} ms`);
    console.log(answer);

  } catch (error) {
    console.error(error);
    process.exit(1);
  }

  process.exit(0);

})();
