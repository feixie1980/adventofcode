const argv = require('yargs').argv;
const fs = require('fs');

function printUsage() {
  console.log("\nUsage: node solve.js --file=input.txt");
}

function getArgvs() {
  let file = argv.file;

  if (!file) {
    console.error(`Missing file`);
    printUsage();
    process.exit(1);
  }

  return { file };
}

function parseInput(content) {
  return content.split('\n').map(s => parseInt(s));
}

function solution1a(frequencies) {
  return frequencies.reduce((sum, f) => sum + f, 0);
}

function solution2a(frequencies) {
  let sumSet = new Set();
  let i = 0, sum = frequencies[i];
  while(!sumSet.has(sum)) {
    sumSet.add(sum);
    i++;
    sum += frequencies[i % frequencies.length];
  }
  return sum;
}

(function run() {
  try {
    const { file } = getArgvs();
    const content = fs.readFileSync(file, { encoding:'utf8' }).trim();
    const frequencies = parseInput(content);

    let startTime = new Date().getTime();
    let result = solution1a(frequencies);
    let endTime = new Date().getTime();
    console.log(`Solution 1.a: ${endTime - startTime} ms`);
    console.log(result);

    startTime = new Date().getTime();
    result = solution2a(frequencies);
    endTime = new Date().getTime();
    console.log(`Solution 2.a: ${endTime - startTime} ms`);
    console.log(result);


  } catch (error) {
    console.error(error);
    process.exit(1);
  }

  process.exit(0);

})();
