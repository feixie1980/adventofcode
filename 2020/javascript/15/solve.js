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
  return content.split('\n').map(line => line.split(',').map(c => parseInt(c)));
}

function playGame1(numbers, maxTurns) {
  let spokenMap = numbers.reduce((map, number, i) => {
    map.set(number, { count: 1, history: [i] });
    return map;
  }, new Map());
  let lastSpoken = numbers[numbers.length - 1];

  for (let i = numbers.length; i < maxTurns; i++) {
    let thisSpoken;

    // last time was 1st time spoken
    const s = spokenMap.get(lastSpoken);
    if (s.history.length === 1) {
      thisSpoken = 0;
    } else {
      thisSpoken = s.history[1] - s.history[0];
    }

    if (!spokenMap.has(thisSpoken)) {
      spokenMap.set(thisSpoken, { count: 1, history: [i]});
    } else {
      let history = spokenMap.get(thisSpoken).history;
      if (history.length === 2) {
        history.shift();
      }
      history.push(i);
      spokenMap.get(thisSpoken).count += 1;
    }
    lastSpoken = thisSpoken;
  }

  for (let key of spokenMap.keys()) {
    console.log(`${key}\t${spokenMap.get(key).count}`);
  }

  return lastSpoken;
}

function solution1a(numbersList) {
  const maxTurns = 30000000;
  let answers = [];
  for (const numbers of numbersList) {
    answers.push({ numbers, answer:playGame1(numbers, maxTurns)});
    break;
  }
  return answers;
}



function solution2a(instructions) {
  return 0;
}

(function run() {
  try {
    const { file } = getArgvs();
    const content = fs.readFileSync(file, { encoding:'utf8' }).trim();
    const numbersList = parseInput(content);

    let startTime = new Date().getTime();
    let answers = solution1a(numbersList);
    let endTime = new Date().getTime();
    console.log(`Solution 1.a: ${endTime - startTime} ms`);
    console.log(answers);

    /*
    startTime = new Date().getTime();
    result = solution2a(instructions);
    endTime = new Date().getTime();
    console.log(`Solution 2.a: ${endTime - startTime} ms`);
    console.log(` answer is: ${result}`);
     */
  } catch (error) {
    console.error(error);
    process.exit(1);
  }

  process.exit(0);

})();
