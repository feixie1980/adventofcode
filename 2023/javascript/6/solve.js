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
  const [times, distances] = content.split('\n')
    .map(line =>
      line.split(':')[1].trim().split(/\s+/)
        .map(s => parseInt(s))
  );
  return times.map((time, i) => {
    return { time, record: distances[i] };
  })
}


function solution1(races) {
  const winningCounts = [];
  for(const race of races) {
    let count = 0;
    const { time, record } = race;
    for (let i = 0; i <= time; i++) {
      const dist = i * (time - i);
      if (dist > record) {
        count++;
      }
    }
    winningCounts.push(count);
  }
  return winningCounts.reduce((product, c) => product * c, 1);
}

function f(t, T, C) {
  return t * (T - t) - C;
}

function f_d(t, T, C) {
  return T - 2*t;
}

function findBoundaryTime(time, record) {
  let guess = Math.floor(time / 2) + 1;
  let value = f(guess, time, record), derivative = null;
  while ( Math.abs(value) > 0.001 ) {
    value = f(guess, time, record);
    console.log(`guess: ${guess}  v:${value}`);
    derivative = f_d(guess, time, record);
    guess = guess - value / derivative;
  }

  guess = derivative < 0 ? Math.floor(guess) : Math.ceil(guess);
  return [guess, derivative];
}

function solution2(races) {
  const time = parseInt(races.map(r => r.time).join(''));
  const record = parseInt(races.map(r => r.record).join(''));
  const [guess, derivative] = findBoundaryTime(time, record);
  if (derivative > 0) {
    return time - 2 * guess + 1;
  } else {
    return 2 * guess - time + 1;
  }
}

(function run() {
  try {
    const { file } = getArgvs();
    const content = readFileSync(file, { encoding:'utf8' }).trim();
    const races = parseInput(content);

    let startTime = new Date().getTime();
    let answer = solution1(races);
    let endTime = new Date().getTime();
    console.log(`Solution 1: ${endTime - startTime} ms`);
    console.log(answer);

    startTime = new Date().getTime();
    answer = solution2(races);
    endTime = new Date().getTime();
    console.log(`Solution 2: ${endTime - startTime} ms`);
    console.log(answer);

  } catch (error) {
    console.error(error);
    process.exit(1);
  }

  process.exit(0);

})();
