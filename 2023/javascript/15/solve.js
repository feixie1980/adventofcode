import { readFileSync } from 'fs';
import Yargs from "yargs";
import { hash } from "./utils.js";

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
  return content.split(',');
}

function solution1(sequences) {
  return sequences.reduce((sum, sequence) => hash(sequence) + sum, 0);
}

function parseSteps(sequences) {
  return sequences.map(sequence => {
    const step = {};
    sequence.replace(/([a-zA-Z]+)([=-])([0-9]*)/, (match, label, op, n) => {
      step.label = label;
      step.op = op;
      step.power = parseInt(n);
    });
    return step;
  });
}

function printMap(hashMap) {
  let keys = [...hashMap.keys()];
  keys.sort((a, b) => parseInt(a) - parseInt(b));
  const str = keys.map(key => {
    if (hashMap.get(key).length !== 0)
      return key + ':' + hashMap.get(key).map(v => `[${v.label} ${v.power}]`).join('');
  }).filter(v => !!v).join('\n');
  console.log(str + '\n');
}

function totalPower(hashMap) {
  const powers = [...hashMap.keys()].map(key => {
    const boxV = parseInt(key) + 1;
    return hashMap.get(key).reduce((sum, lens, i) => sum + boxV * (i + 1) * lens.power, 0);
  });
  return powers.reduce((sum, power) => sum + power, 0);
}

function solution2(sequences) {
  const steps = parseSteps(sequences);
  const hashMap = new Map();

  for (let step of steps) {
    const { label, op, power } = step;
    const key = hash(label);
    if (!hashMap.has(key)) {
      hashMap.set(key, []);
    }

    const lensList = hashMap.get(key);
    const index = lensList.findIndex(lens => lens.label === label);

    switch (op) {
      case '=': {
        if (index === -1) {
          lensList.push({label, power});
        }
        else {
          lensList[index] = {label, power};
        }
      }
      break;

      case '-': {
        if (index !== -1) {
          lensList.splice(index, 1);
        }
      }
      break;

      default:
        throw  `unknown op: ${op}`;
    }
    // printMap(hashMap);
  }

  return totalPower(hashMap);
}

(function run() {
  try {
    const { file } = getArgvs();
    const content = readFileSync(file, { encoding:'utf8' }).trim();
    const sequences = parseInput(content);

    let startTime = new Date().getTime();
    let answer = solution1(sequences);
    let endTime = new Date().getTime();
    console.log(`Solution 1: ${endTime - startTime} ms`);
    console.log(answer);

    startTime = new Date().getTime();
    answer = solution2(sequences);
    endTime = new Date().getTime();
    console.log(`Solution 2: ${endTime - startTime} ms`);
    console.log(answer);

  } catch (error) {
    console.error(error);
    process.exit(1);
  }

  process.exit(0);

})();
