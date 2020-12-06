const argv = require('yargs').argv;
const fs = require('fs');

const target = 2020;

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

function solution1a(items) {
  let passCount = 0;
  let passArray = [];
  for (let item of items) {
    const { range: {min, max}, letter, password } = item;
    let count = 0;
    for (let c of password) {
      if (c === letter)
        count++;
    }
    if (count >= min && count <= max) {
      passCount++;
      passArray.push(item);
    }
  }
  return {passArray, passCount};
}

function solution2a(items) {
  let passCount = 0;
  let passArray = [];
  for (let item of items) {
    const { range: {min, max}, letter, password } = item;
    const in1stPosition = password[min-1] === letter;
    const in2ndPosition = password[max-1] === letter;
    const passed = (in1stPosition || in2ndPosition) && !(in1stPosition && in2ndPosition);
    if (passed) {
      passCount++;
      passArray.push(item);
    }
  }
  return {passArray, passCount};
}

// line sample:  "2-7 m: gczbmgk"
function parseInput(content) {
  const lines = content.split('\n');
  let items = [];
  for (const line of lines) {
    let range, letter, password;
    line.replace(/([0-9]+)(-)([0-9]+)(\s)([a-zA-Z]+)(:\s)(.*)/g,
      (match, min, p1, max, p2, matchString, p4, pss) => {
        let item = {
          range: {min, max},
          letter: matchString,
          password: pss
        };
        items.push(item);
      });
  }
  return items;
}

(function run() {
  try {
    const { file } = getArgvs();
    const content = fs.readFileSync(file, { encoding:'utf8' });
    const items = parseInput(content);


    let startTime = new Date().getTime();
    let solution = solution1a(items);
    let endTime = new Date().getTime();
    console.log(`Solution 1.a: ${endTime - startTime} ms`);
    //console.log(`  Passed items are: ${JSON.stringify(solution.passArray, null, 2)}.`);
    console.log(`  Total lines: ${items.length}.`);
    console.log(`  Answer is: ${solution.passCount}.`);

    startTime = new Date().getTime();
    solution = solution2a(items);
    endTime = new Date().getTime();
    console.log(`Solution 2.a: ${endTime - startTime} ms`);
    console.log(`  Passed items are: ${JSON.stringify(solution.passArray, null, 2)}.`);
    console.log(`  Total lines: ${items.length}.`);
    console.log(`  Answer is: ${solution.passCount}.`);

  } catch (error) {
    console.error(error);
    process.exit(1);
  }

  process.exit(0);

})();
