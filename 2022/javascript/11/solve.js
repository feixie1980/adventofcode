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

function getOpFunc(op, arg) {
  const v = parseInt(arg.trim());
  switch(op) {
    case '+':
      return old => isNaN(v) ? old + old : old + v;
      break;

    case '*':
      return old => isNaN(v) ? old * old : old * v;
      break;
  }
  throw `illegal op: ${op}, arg: ${arg}`;
}

function parseInput(content) {
  let monkeys = [];
  const lines = content.split('\n');
  for (let i = 0 ; i < lines.length; i += 7) {
    const monkey = { items: [], operation: null, testDivider: 1, targets: [], inspectCount: 0 };
    monkey.items = lines[i + 1].split(': ')[1].split(',').map(s => parseInt(s.trim()));
    const [op, arg] = lines[i + 2].split('old ')[1].split(' ');
    monkey.operation = getOpFunc(op, arg);
    monkey.testDivider = parseInt(lines[i + 3].split('by ')[1]);
    monkey.targets.push(parseInt(lines[i + 4].split('monkey ')[1]));
    monkey.targets.push(parseInt(lines[i + 5].split('monkey ')[1]));
    monkeys.push(monkey);
  }
  return monkeys;
}

function initRemainderItems(monkeys) {
  const dividers = monkeys.map(monkey => monkey.testDivider);
  monkeys.forEach(monkey => {
    monkey.remainderItems = monkey.items.map(item =>
      dividers.map(divider => {
        return {
          remainder: item % divider, divider
        }
      })
    );
    delete monkey.items;
  });
}

function parseInput2(content) {
  let monkeys =  parseInput(content);
  initRemainderItems(monkeys);
  return monkeys;
}

function playRound(monkeys, divider) {
  for (const monkey of monkeys) {
    for (const item of monkey.items) {
      const newWorry = Math.floor(monkey.operation(item) / divider);
      if ( newWorry % monkey.testDivider === 0) {
        monkeys[monkey.targets[0]].items.push(newWorry);
      }
      else {
        monkeys[monkey.targets[1]].items.push(newWorry);
      }
    }
    monkey.inspectCount += monkey.items.length;
    monkey.items = [];
  }
}

function solution1(monkeys) {
  const rounds = 20;
  for (let i = 0; i < rounds; i++) {
    playRound(monkeys, 3);
  }

  let counts = monkeys.map(monkey => monkey.inspectCount).sort((a,b) => b - a)
  return counts[0] * counts[1];
}

function computeNewRemainders(remainderItem, operation) {
  return remainderItem.map(o => {
    const n = operation(o.remainder);
    const r = n % o.divider;
    return {
      remainder: operation(o.remainder) % o.divider,
      divider: o.divider,
    }
  });
}

function playRound2(monkeys) {
  for (let i = 0; i < monkeys.length; i++) {
    const monkey = monkeys[i];
    for (const remainderItem of monkey.remainderItems) {
      const newRemainderItem = computeNewRemainders(remainderItem, monkey.operation);
      if (newRemainderItem[i].remainder === 0) {
        monkeys[monkey.targets[0]].remainderItems.push(newRemainderItem);
      }
      else {
        monkeys[monkey.targets[1]].remainderItems.push(newRemainderItem);
      }
    }
    monkey.inspectCount += monkey.remainderItems.length;
    monkey.remainderItems = [];
  }
}

function solution2(monkeys) {
  const rounds = 10000;

  for (let i = 0; i < rounds; i++) {
    if (i === 1 || i === 20 || i % 1000 === 0) {
      console.log(`################ after ${i} ###################`);
      console.log(monkeys.map(monkey => monkey.inspectCount));
    }
    playRound2(monkeys);
  }
  let counts = monkeys.map(monkey => monkey.inspectCount).sort((a,b) => b - a)
  return counts[0] * counts[1];
}

(function run() {
  try {
    const { file } = getArgvs();
    const content = readFileSync(file, { encoding:'utf8' }).trim();
    let monkeys = parseInput(content);

    let startTime = new Date().getTime();
    let answer = solution1(monkeys);
    let endTime = new Date().getTime();
    console.log(`Solution 1: ${endTime - startTime} ms`);
    console.log(answer);

    startTime = new Date().getTime();
    monkeys = parseInput2(content);
    answer = solution2(monkeys);
    endTime = new Date().getTime();
    console.log(`Solution 2: ${endTime - startTime} ms`);
    console.log(answer);

  } catch (error) {
    console.error(error);
    process.exit(1);
  }

  process.exit(0);

})();
