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
  const lines = content.split('\n');
  const pairs = [];
  for (let i = 0; i < lines.length; i+=3) {
    pairs.push({v1: JSON.parse(lines[i]), v2: JSON.parse(lines[i+1])});
  }
  return pairs;
}

function compare(a, b) {
  if (Array.isArray(a)) {
    if (Array.isArray(b)) { // a and b are both arrays
      // one of the array is empty
      if (a.length === 0)
        if (b.length === 0) return 0;
        else return -1;
      else if (b.length === 0) return 1;

      const r = compare(a[0], b[0]);
      if (r === 0) {
        return compare(a.slice(1), b.slice(1));
      }
      else {
        return r;
      }
    }
    else {
      return compare(a, [b]);
    }
  } else {
    if (Array.isArray(b)) {
      return compare([a], b);
    }
    else {
      return a - b;
    }
  }
}

function solution1(pairs) {
  let results = [];
  for (const pair of pairs) {
    const r = compare(pair.v1, pair.v2);
    results.push(r <= 0 ? true : false);
  }
  // results.forEach((r, i) => console.log(`${i+1}: ${r}`));
  return results.reduce((sum, r, i) => r ? sum + i + 1 : sum, 0);
}

function solution2(pairs) {
  const dividers = [[[2]], [[6]]];
  const allPackets = [...pairs.flatMap(pair => [pair.v1, pair.v2]), ...dividers];
  allPackets.sort((a, b) => compare(a, b));
  // allPackets.forEach(p => console.log(JSON.stringify(p)));
  const key = allPackets.reduce((mul, v, i) => dividers.some(d => compare(v, d) === 0) ? mul * (i + 1) : mul, 1);
  return key;
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
