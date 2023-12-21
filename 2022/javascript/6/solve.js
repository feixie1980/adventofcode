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
  return content.split('\n');
}

function countBeforeMarker(stream, distinctCount) {
  for (let i = distinctCount; i <= stream.length; i++) {
    let set = new Set();
    let isMarker = true;
    for (let j = i - distinctCount; j < i; j++) {
      if (set.has(stream[j])) {
        isMarker = false;
        break;
      }
      else {
        set.add(stream[j]);
      }
    }
    if (isMarker) {
      return i;
    }
  }
  return 0;
}

function solution1(streams) {
  let result = 0;
  for (const stream of streams) {
    result = countBeforeMarker(stream, 4);
    console.log(result);
  }
  return result;
}

function solution2(streams) {
  let result = 0;
  for (const stream of streams) {
    result = countBeforeMarker(stream, 14);
    console.log(result);
  }
  return result;
}

(function run() {
  try {
    const { file } = getArgvs();
    const content = readFileSync(file, { encoding:'utf8' }).trim();
    const streams = parseInput(content);

    let startTime = new Date().getTime();
    let answer = solution1(streams);
    let endTime = new Date().getTime();
    console.log(`Solution 1: ${endTime - startTime} ms`);
    console.log(answer + '\n');

    startTime = new Date().getTime();
    answer = solution2(streams);
    endTime = new Date().getTime();
    console.log(`Solution 2: ${endTime - startTime} ms`);
    console.log(answer);

  } catch (error) {
    console.error(error);
    process.exit(1);
  }

  process.exit(0);

})();
