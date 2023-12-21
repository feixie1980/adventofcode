import { readFileSync } from 'fs';
import Yargs from "yargs";
import { findLowestWithSeed, toSourceSegments } from "./utils.js";

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
  const sections = content.split('\n\n');
  const seeds = sections[0].split(': ')[1].split(' ').map(s => parseInt(s));
  const categories = [];
  for(let section of sections) {
    const category = { name: null, ranges: [] };
    if (section.startsWith('seeds:')) {
      continue;
    }
    section.split('\n').forEach((line, i) => {
      if (i === 0) { // name line
        category.name = line.split(' ')[0];
        return;
      }
      category.ranges.push(line.split(' ').map(s => parseInt(s)));
    });
    category.ranges.sort((a, b) => a[0] - b[0]);
    categories.push(category);
  }
  return { seeds, categories };
}

function toTargetValue(v, ranges) {
  for(const range of ranges) {
    const [destStart, sourceStart, length] = range;
    if (v >= sourceStart && v < sourceStart + length) {
      return destStart + v - sourceStart;
    }
  }
  return v;
}

function solution1({ seeds, categories }) {
  let curValues = seeds;
  for (const category of categories) {
    curValues = curValues.map(v => toTargetValue(v, category.ranges));
  }
  return curValues.reduce((min, v) => v < min ? v : min, Number.MAX_SAFE_INTEGER);
}

const range = (start, stop, step = 1) =>
  Array.from({ length: (stop - start) / step + 1 }, (_, i) => start + i * step);

function padCategories(categories) {
  for(const category of categories) {
    const newRanges = [], ranges = category.ranges;
    for(let i = 0; i < ranges.length; i++) {
      const [destStart, sourceStart, length] = ranges[i];
      if (i === 0) {
        if (destStart !== 0) {
          newRanges.push([0, 0, destStart]);
        }
      }
      else {
        const [prevDestStart, prevSourceStart, prevLength] = ranges[i - 1];
        if (destStart > prevDestStart + prevLength) {
          newRanges.push([destStart + length, destStart + length, prevDestStart - (destStart + length)]);
        }
      }
      newRanges.push(ranges[i]);
    }

    const lastRange = newRanges[newRanges.length - 1];
    const endRangeStart = lastRange[0] + lastRange[2];
    newRanges.push([endRangeStart, endRangeStart, Number.MAX_SAFE_INTEGER - endRangeStart]); // to max
    category.ranges = newRanges;
  }
}

function solution2({ seeds, categories }) {
  // fill the missing ranges
  padCategories(categories);
  const seedSegments = seeds.reduce((segments, num, i) => {
    if (i % 2 === 0) {
      segments.push([seeds[i], seeds[i +1]]);
    }
    return segments;
  }, []);
  seedSegments.sort((a, b) => a[0] - b[0]);

  let humToLocCategory = categories[categories.length - 1];
  let segments = humToLocCategory.ranges.map(range => [range[0], range[2]]);
  for (const segment of segments) {
    const lowest = findLowestWithSeed(segment, categories, seedSegments);
    if (lowest) {
      return lowest;
    }
  }
  return false;
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
