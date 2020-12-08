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

// lines:
//   nop +0
//   acc +1
//   jmp +4
function parseInput(content) {
  const lines =  content.split('\n');
  return lines.map(line => {
    const [ op, val ] = line.split(' ');
    return {
      op, val: parseInt(val)
    };
  });
}

function execute(instruction) {
  let indexChange = 0;
  let accumulatorChange = 0;
  switch (instruction.op) {
    case 'nop':
      indexChange = 1;
      break;

    case 'acc':
      indexChange = 1;
      accumulatorChange = instruction.val;
      break;

    case 'jmp':
      indexChange = instruction.val;
      break;

    default:
      throw `Invalid op: ${instruction.op}`
  }
  return { indexChange, accumulatorChange };
}

function solution1a(instructions) {
  let executedIndexSet = new Set();
  let accumulator = 0;
  let index = 0;

  while (index < instructions.length) {
    const instruction = instructions[index];

    if (executedIndexSet.has(index)) {
      break;
    }

    executedIndexSet.add(index);
    const { indexChange, accumulatorChange } = execute(instruction);
    index += indexChange;
    accumulator += accumulatorChange;
  }

  return accumulator;
}

function isLoop(instructions) {
  let index = 0, executedIndexSet = new Set();
  while (index < instructions.length) {
    const instruction = instructions[index];
    if (executedIndexSet.has(index)) {
      return true;
    }
    executedIndexSet.add(index);
    const { indexChange } = execute(instruction);
    index += indexChange;
  }
  return false;
}

function constructUnloopingInstructions(instructions) {
  let indexToModify = -1, newInstructions = [...instructions];
  while (isLoop(newInstructions)) {
    indexToModify = instructions
      .findIndex((instruction, i) => (instruction.op === 'nop' || instruction.op === 'jmp') && i > indexToModify);
    if (indexToModify === -1) {
      return null;
    }
    const { op, val } = instructions[indexToModify];
    newInstructions = [...instructions];
    newInstructions[indexToModify] = { op: op === 'nop' ? 'jmp' : 'nop', val };
  }
  return newInstructions;
}

function solution2a(instructions) {
  const newInstructions = constructUnloopingInstructions(instructions);
  return solution1a(newInstructions);
}


(function run() {
  try {
    const { file } = getArgvs();
    const content = fs.readFileSync(file, { encoding:'utf8' }).trim();
    const instructions = parseInput(content);


    let startTime = new Date().getTime();
    let accumulator = solution1a(instructions);
    let endTime = new Date().getTime();
    console.log(`Solution 1.a: ${endTime - startTime} ms`);
    console.log(` accumulator is: ${accumulator}.`);

    startTime = new Date().getTime();
    accumulator = solution2a(instructions);
    endTime = new Date().getTime();
    console.log(`Solution 2.a: ${endTime - startTime} ms`);
    console.log(` accumulator is: ${accumulator}.`);


  } catch (error) {
    console.error(error);
    process.exit(1);
  }

  process.exit(0);

})();
