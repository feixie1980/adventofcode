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
  const monkeyMap = new Map();
  for (const line of content.split('\n')) {
    line.replaceAll(/([a-z]+)(:\s)([a-z]+)(\s[\+\-\*\/]\s)([a-z]+)/g,
      (match, monkey1, l1, monkey2, op, monkey3) => {
        monkeyMap.set(monkey1, { left: monkey2, right: monkey3, op: op.trim()})
    });

    line.replaceAll(/([a-z]+)(:\s)([0-9]+)/g,
      (match, monkey1, l1, num) => {
      monkeyMap.set(monkey1, parseInt(num));
    });
  }
  return monkeyMap;
}

function isResolved(monkeyMap, monkey) {
  return !isNaN(monkeyMap.get(monkey));
}

function compute(op, v1, v2) {
  switch (op) {
    case '+':
      return v1 + v2;

    case '-':
      return v1 - v2;

    case '*':
      return v1 * v2;

    case '/':
      return v1 / v2;
  }

  throw `Impossible op: ${op}`;
}

function resolveMonkeys(monkeyMap, unResMonkeys) {
  for (const unResMonkey of unResMonkeys) {
    let { left, right, op } = monkeyMap.get(unResMonkey);

    if (left === 'TBD' || right === 'TBD') {
      // this is humn, skip
      continue;
    }

    if (isNaN(left) && isResolved(monkeyMap, left)) {
      left = monkeyMap.get(left);
    }
    if (isNaN(right) && isResolved(monkeyMap, right)) {
      right = monkeyMap.get(right);
    }
    if (!isNaN(left) && !isNaN(right)) {
      monkeyMap.set(unResMonkey, compute(op, left, right));
    } else {
      monkeyMap.set(unResMonkey, { left, right, op });
    }
  }
}

function solution1(monkeyMap) {
  let root = 'root';
  let unResMonkeys = [...monkeyMap.keys()].filter(monkey => !isResolved(monkeyMap, monkey));
  while (!isResolved(monkeyMap, root, 1)) {
    resolveMonkeys(monkeyMap, unResMonkeys);
    unResMonkeys = [...monkeyMap.keys()].filter(monkey => !isResolved(monkeyMap, monkey));
  }

  return monkeyMap.get(root);
}

// v op r = result
function reverseRight(op, v, result) {
  switch (op) {
    case '+':
      // r = result - v
      return result - v;

    case '-':
      // r = v - result
      return v - result;

    case '*':
      // r = result / v
      return result / v;

    case '/':
      // r = v / result
      return v / result;
  }

  throw `Impossible op: ${op}`;
}

// r op v = result
function reverseLeft(op, v, result) {
  switch (op) {
    case '+':
      // r = result - v
      return result - v;

    case '-':
      // r = result - v
      return v + result;

    case '*':
      // r = result / v
      return result / v;

    case '/':
      // r = v * result
      return v * result;
  }

  throw `Impossible op: ${op}`;
}

function reverseSolve(monkeyMap, root) {
  const { left, right } = monkeyMap.get(root);
  const monkey = isNaN(left) ? left : right;
  let solvables = [{ monkey, result: right }];

  while (solvables.length !== 0) {
    const newSolvables = [];
    for (const solvable of solvables) {
      const { monkey, result } = solvable;
      if (monkey === 'humn') {
        monkeyMap.set(monkey, result);
        return;
      }

      const { op, left, right } = monkeyMap.get(monkey);
      if (!isNaN(left) && !isNaN(right))
        throw `${monkey} has both left and right as numbers, should have been resolved.`;

      if (!isNaN(left)) {
        const rightValue = reverseRight(op, left, result);
        newSolvables.push({
          monkey: right, result: rightValue
        });
      } else if (!isNaN(right)) {
        const leftValue = reverseLeft(op, right, result);
        newSolvables.push({
          monkey: left, result: leftValue
        });
      }

      monkeyMap.set(monkey, result);
    }
    solvables = newSolvables;
  }
}

function solution2(monkeyMap) {
  // First update root ahd humn
  let root = 'root', humn = 'humn';
  monkeyMap.get(root).op = '==';
  monkeyMap.set(humn, 'TBD');
  let isResolvedV2 = (monkeyMap, monkey) => monkey !== humn && isResolved(monkeyMap, monkey)

  let unResolves = [...monkeyMap.keys()].filter(monkey => !isResolvedV2(monkeyMap, monkey));
  while (true) {
    resolveMonkeys(monkeyMap, unResolves);
    const newUnres = [...unResolves].filter(monkey => !isResolvedV2(monkeyMap, monkey));
    if (newUnres.length === unResolves.length) {
      break;
    }
    unResolves = newUnres;
  }
  resolveMonkeys(monkeyMap, [root]);
  reverseSolve(monkeyMap, root);

  return monkeyMap.get(humn);
}

(function run() {
  try {
    const { file } = getArgvs();
    const content = readFileSync(file, { encoding:'utf8' }).trim();
    let monkeyMap = parseInput(content);

    let startTime = new Date().getTime();
    let answer = solution1(monkeyMap);
    let endTime = new Date().getTime();
    console.log(`Solution 1: ${endTime - startTime} ms`);
    console.log(answer);

    monkeyMap = parseInput(content);
    startTime = new Date().getTime();
    answer = solution2(monkeyMap);
    endTime = new Date().getTime();
    console.log(`Solution 2: ${endTime - startTime} ms`);
    console.log(answer);

  } catch (error) {
    console.error(error);
    process.exit(1);
  }

  process.exit(0);

})();
