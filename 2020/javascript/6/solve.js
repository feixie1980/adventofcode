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

function parseInput(content) {
  return content.split('\n\n')
    .map(grpStr =>
      grpStr.split('\n')
        .map(line => line.split(''))
    );
}

function solution1a(groups) {
  let sum = 0;
  for (const persons of groups) {
    let answerSet = new Set();
    for (const answers of persons) {
      answerSet = new Set([...answerSet, ...answers]);
    }
    sum += answerSet.size;
  }
  return sum;
}

function solution2a(groups) {
  let sum = 0;
  for (const persons of groups) {
    let commonAnswers = persons[0];
    for (const answers of persons) {
      const filtered = answers.filter(answer => commonAnswers.includes(answer));
      commonAnswers = commonAnswers.filter(commonAnswer => filtered.includes(commonAnswer));
    }
    sum += commonAnswers.length;
  }
  return sum;
}


(function run() {
  try {
    const { file } = getArgvs();
    const content = fs.readFileSync(file, { encoding:'utf8' }).trim();
    const groups = parseInput(content);

    let startTime = new Date().getTime();
    let sum = solution1a(groups);
    let endTime = new Date().getTime();
    console.log(`Solution 1.a: ${endTime - startTime} ms`);
    console.log(` Sum is: ${sum}.`);

    startTime = new Date().getTime();
    sum = solution2a(groups);
    endTime = new Date().getTime();
    console.log(`Solution 1.a: ${endTime - startTime} ms`);
    console.log(` Sum is: ${sum}.`);

  } catch (error) {
    console.error(error);
    process.exit(1);
  }

  process.exit(0);

})();
