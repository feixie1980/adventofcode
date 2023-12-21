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
  return content.split('\n').map(line =>
    line.split(',').map(section => {
      const [begin, end] = section.split('-').map(d => parseInt(d));
      return { begin, end };
    })
  );
}

function hasCompleteOverlap(pair) {
  return pair[0].begin >= pair[1].begin && pair[0].end <= pair[1].end ||
    pair[1].begin >= pair[0].begin && pair[1].end <= pair[0].end;
}

function solution1(pairs) {
  return pairs.filter(pair => hasCompleteOverlap((pair))).length;
}

function hasOverlap(pair) {
  return pair[0].begin >= pair[1].begin && pair[0].begin <= pair[1].end ||
    pair[0].end >= pair[1].begin && pair[0].end <= pair[1].end ||
    pair[1].begin >= pair[0].begin && pair[1].begin <= pair[0].end ||
    pair[1].end >= pair[0].begin && pair[1].end <= pair[0].end;
}

function solution2(pairs) {
  return pairs.filter(pair => hasOverlap((pair))).length;
}

(function run() {
  try {
    const { file } = getArgvs();
    const content = readFileSync(file, { encoding:'utf8' }).trim();
    const pairs = parseInput(content);

    let startTime = new Date().getTime();
    let answer = solution1(pairs);
    let endTime = new Date().getTime();
    console.log(`Solution 1: ${endTime - startTime} ms`);
    console.log(answer);

    startTime = new Date().getTime();
    answer = solution2(pairs);
    endTime = new Date().getTime();
    console.log(`Solution 2: ${endTime - startTime} ms`);
    console.log(answer);

  } catch (error) {
    console.error(error);
    process.exit(1);
  }

  process.exit(0);

})();
