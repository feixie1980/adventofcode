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

function parseAlmanac(input) {
  const sections = input.split('\n\n'); // Split into sections based on double newlines
  const seedNumbers = sections[0].split(': ')[1].split(' ').map(Number); // Parse seed numbers

  // Helper to get map from a section
  const getMapFromSection = (section) => {
    const lines = section.split('\n').slice(1); // Ignore the first line (title)
    return lines.map(line => {
      const [dest, src, len] = line.split(' ').map(Number);
      return {dest, src, len};
    });
  };

  // Extract all maps
  const maps = sections.slice(1).map(getMapFromSection);

  return {seedNumbers, maps};
}

// Helper function to transform a number using the provided map
function transformNumber(number, map) {
  for (const {dest, src, len} of map) {
    if (number >= src && number < src + len) {
      return dest + (number - src);
    }
  }
  return number; // Number unchanged if not in map
}

function solution1(input) {
  const {seedNumbers, maps} = parseAlmanac(input);

  // Process each seed through the conversion maps
  const locationNumbers = seedNumbers.map((seed) => {
    let number = seed;
    for (const map of maps) {
      number = transformNumber(number, map);
    }
    return number;
  });

  // Return the lowest location number
  return Math.min(...locationNumbers);
}

function parseAlmanac2(input) {
  const sections = input.split('\n\n'); // Split into sections based on double newlines
  let seedSection = sections[0].split(': ')[1].split(' ');
  let seedRanges = [];
  for (let i = 0; i < seedSection.length; i += 2) {
    const start = parseInt(seedSection[i]);
    const length = parseInt(seedSection[i + 1]);
    for (let j = start; j < start + length; j++) {
      seedRanges.push(j);
    }
  }

  // Helper to get map from a section
  const getMapFromSection = (section) => {
    const lines = section.split('\n').slice(1); // Ignore the first line (title)
    return lines.map(line => {
      const [dest, src, len] = line.split(' ').map(Number);
      return {dest, src, len};
    });
  };

  // Extract all maps
  const maps = sections.slice(1).map(getMapFromSection);

  return {seedNumbers: seedRanges, maps};
}

function parseAlmanacSection(sectionText) {
  const [title, ...mappingsRaw] = sectionText.trim().split('\n');
  if (!title.startsWith(title.toLowerCase() + ' map')) {
    throw new Error('Unexpected section format');
  }

  const ranges = mappingsRaw.map(line => {
    const [destStart, srcStart, len] = line.trim().split(' ').map(Number);
    return { destStart, srcStart, len };
  });

  return ranges;
}

function createMapFunction(ranges) {
  return (number) => {
    for (const { destStart, srcStart, len } of ranges) {
      if (number >= srcStart && number < srcStart + len) {
        return destStart + (number - srcStart);
      }
    }
    return number; // default when the number is not in any range
  };
}

function solution2(inputText) {
  const sections = inputText.trim().split('\n\n');
  const seedsSection = sections.shift();
  const seedRanges = parseAlmanacSection(seedsSection).flatMap(({ destStart, len }) =>
    Array.from({ length: len }, (_, i) => destStart + i)
  );

  const mapFunctions = sections.map(parseAlmanacSection).map(createMapFunction);

  let lowestLocation = Infinity;
  for (const seed of seedRanges) {
    let transformedValue = seed;
    for (const mapFunction of mapFunctions) {
      transformedValue = mapFunction(transformedValue);
    }
    lowestLocation = Math.min(lowestLocation, transformedValue);
  }

  return lowestLocation;
}

(function run() {
  try {
    const { file } = getArgvs();
    const content = readFileSync(file, { encoding:'utf8' }).trim();

    let startTime = new Date().getTime();
    let answer = solution1(content);
    let endTime = new Date().getTime();
    console.log(`Solution 1: ${endTime - startTime} ms`);
    console.log(answer);

    startTime = new Date().getTime();
    answer = solution2(content);
    endTime = new Date().getTime();
    console.log(`Solution 2: ${endTime - startTime} ms`);
    console.log(answer);

  } catch (error) {
    console.error(error);
    process.exit(1);
  }

  process.exit(0);

})();
