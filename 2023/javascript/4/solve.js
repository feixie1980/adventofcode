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
  return content.split('\n').map(line => {
    const [_, winningStr, numberStr] = line.split(/[:|]/);
    return {
      winningSet: winningStr.trim().split(' ').map(s => parseInt(s)).reduce((set, n) => set.add(n), new Set()),
      numbers: numberStr.trim().split(/\s+/).map(s => parseInt(s)),
    }
  });
}

function solution1(scratchCards) {
  return scratchCards.reduce((total, card) => {
    const matching = card.numbers.filter(number => card.winningSet.has(number)).length;
    return matching !== 0 ? total + Math.pow(2, matching - 1) : total;
  }, 0);
}

function solution2(scratchCards) {
  scratchCards = scratchCards.map(card => {
    return {
      ...card,
      copies: 1,
    };
  });

  scratchCards.forEach((card, i) => {
    const { winningSet, numbers, copies } = card;
    const matching = card.numbers.filter(number => winningSet.has(number)).length;
    for(let j = 1; j <= matching; j++) {
      scratchCards[i + j].copies += copies;
    }
  });
  return scratchCards.reduce((sum, card) => sum + card.copies, 0);
}

(function run() {
  try {
    const { file } = getArgvs();
    const content = readFileSync(file, { encoding:'utf8' }).trim();
    const scratchCards = parseInput(content);

    let startTime = new Date().getTime();
    let startHRTime = process.hrtime.bigint();
    let answer = solution1(scratchCards);
    let endTime = new Date().getTime();
    let endHRTime = process.hrtime.bigint();
    console.log(`Solution 1: ${endTime - startTime} ms ${(endHRTime - startHRTime) / 1000n} us`);
    console.log(answer);

    startTime = new Date().getTime();
    startHRTime = process.hrtime.bigint();
    answer = solution2(scratchCards);
    endTime = new Date().getTime();
    endHRTime = process.hrtime.bigint();
    console.log(`Solution 2: ${endTime - startTime} ms ${(endHRTime - startHRTime) / 1000n} us`);
    console.log(answer);

  } catch (error) {
    console.error(error);
    process.exit(1);
  }

  process.exit(0);

})();
