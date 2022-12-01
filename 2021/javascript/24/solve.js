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
  const lines = content.split('\n');
  const program = lines.map(line => {
    const [op, left, right] = line.split(' ');
    return { op, left, right };
  })
  return { program };
}

const cacheMap = new Map();

function executeChunks(programChunks, chunkIndex, inputDigit, initZ) {
  if (programChunks.length === 0 || chunkIndex + 1 > programChunks.length) {
    throw `Invalid programChunk or chunkIndex`;
  }

  if (inputDigit <= 0 || inputDigit > 9) {
    throw `Invalide inputDigit ${inputDigit}`;
  }

  const key = `${chunkIndex}-${inputDigit}-${initZ}`;
  if (!cacheMap.has(key)) {
    const regs = execute([inputDigit], programChunks[chunkIndex], initZ);
    cacheMap.set(key, regs);
  }
  return cacheMap.get(key);
}

function execute(input, program, initZ=0) {
  let inputIndex = 0;
  const registers = { w: 0, x: 0, y: 0, z:initZ };
  for(const ins of program) {
    let rValue
    if (ins.right) {
      rValue = parseInt(ins.right);
      if (isNaN(rValue)) {
        rValue = registers[ins.right];
      }
    }

    switch (ins.op) {
      case 'inp':
        registers[ins.left] = input[inputIndex++];
        break;

        case 'add':
          registers[ins.left] += rValue;
          break;

      case 'mul':
        registers[ins.left] *= rValue;
        break;

      case 'div':
        registers[ins.left] = Math.floor(registers[ins.left] / rValue);
        break;

      case 'mod':
        registers[ins.left] = registers[ins.left] % rValue;
        break;

      case 'eql':
        registers[ins.left] = registers[ins.left] === rValue ? 1 : 0;
        break;

      default:
        throw `Invalid operator ${ins.op}`;
    }
    //console.log(ins);
    //console.log(registers);
  }
  return registers;
}

function divideToInputChunks(program) {
  const chunks = [];
  for(const ins of program) {
    if (ins.op === 'inp') {
      chunks.push([]);
    }
    chunks[chunks.length - 1].push(ins);
  }
  return chunks;
}

function findInitZValues(program, targetZ) {
  const results = [];
  let initZ = 0;
  while(results.length < 9) {
    for(let i = 1; i <= 9; i++) {
      const regs = execute([i], program, initZ);
      if (regs.z === targetZ) {
        results.push({ input: i, initZ });
      }
    }
    initZ++;
  }
  return results;
}

function test1(program) {
  // 11111111111111
  // 11111112111111
  // 11111113521294
  // 22222222222222
  // 33333333333333
  // 85219523152392
  // 99999999991121
  let count = 0;
  for(let i = 11111111111111; i <= 11111112111111; i++) {
    const input = `${i}`.split('').map(d => parseInt(d));
    if (input.includes(0)) {
      continue;
    }
    const regs = execute(input, program);
    if (regs.z === 0) {
      console.log(`${i}: ${regs.z}`);
      break;
    }
    if (count++ % 10000 === 0) {
      console.log(`${i}: ${regs.z}`);
    }
  }
}

let count = 0;
function DFS(programChunks, chunkIndex, initZ, parentInputs) {
  let chunkResults = [];
  for (let i = 9; i >= 1; i--) {
    const regs = executeChunks(programChunks, chunkIndex, i, initZ);
    chunkResults.push({
      input: i,
      z: regs.z
    });
  }

  if (chunkIndex === programChunks.length - 1) { // last digit
    if (parentInputs) {
      chunkResults.forEach(r => {
        if (count++ % 1000000 === 0) {
          console.log(`${parentInputs + r.input}: ${r.z}`);
        }
      })
    }
    const zeroResult = chunkResults.find(r => r.z === 0);
    if (zeroResult) {
      console.log(`Found zero!`);
      console.log(`${parentInputs + zeroResult.input}: ${zeroResult.z}`);
      process.exit(0);
      return [zeroResult];
    }
    else {
      return null;
    }
  }

  // chunkResults = chunkResults.sort((a, b) => b.z - a.z);
  for(const chunkResult of chunkResults) {
    const rPath = DFS(programChunks, chunkIndex + 1, chunkResult.z, parentInputs + chunkResult.input);
    if (rPath) {
      return rPath.unshift(chunkResult);
    }
  }
}

function

function test2(program) {
  const programChunks = divideToInputChunks(program);
  DFS(programChunks, 0, 0, '');
}

function test3(program) {
  const programChunks = divideToInputChunks(program);
  let initZ = 0, input = [1,3,5,7,2,2,4,6,8,9,4,9,9,2], i = 0;
  const regs = execute(input, program, 0);
  console.log(`z:${regs.z}`)

  programChunks.forEach((chunk, index) => {
    const regs = executeChunks(programChunks, index, input[index], initZ);
    initZ = regs.z;
  });
  console.log(`z:${initZ}`);
}

function test4(program) {
  const programChunks = divideToInputChunks(program);
  let iniZ = 0, i = 5;
  for (const chunk of programChunks) {
    const regs = execute([i], chunk, iniZ);
    console.log(`input:${i}, z:${regs.z}`)
    iniZ = regs.z;
  }
}

function test5(program) {
  const programChunks = divideToInputChunks(program);
  let rGroup = [{
    inputs: '',
    targetZ: 0
  }];


  for (let k = programChunks.length - 1; k >= 0; k--) {
    const chunk = programChunks[k];
    let newGroup = [];
    for(const rConf of rGroup) {
      const results = findInitZValues(chunk, rConf.targetZ);
      const g = results.map(r => {
        return {inputs: `${r.input}${rConf.inputs}`, targetZ: r.initZ};
      });
      //console.log(JSON.stringify(g, null, 2));
      newGroup = newGroup.concat(g);
    }
    rGroup = newGroup;
    let sorted = rGroup.map(r => r.targetZ).sort((a,b) => a - b);
    console.log(`sorted z`);
    console.log(sorted.join(', '));
  }
}

function solution1(program) {
  test2(program);
}

function solution2() {
    return false;
}

(function run() {
  try {
    const { file } = getArgvs();
    const content = readFileSync(file, { encoding:'utf8' }).trim();
    const { program } = parseInput(content);

    let startTime = new Date().getTime();
    let answer = solution1(program);
    let endTime = new Date().getTime();
    console.log(`Solution 1: ${endTime - startTime} ms`);
    console.log(answer);

    startTime = new Date().getTime();
    answer = solution2();
    endTime = new Date().getTime();
    console.log(`Solution 2: ${endTime - startTime} ms`);
    console.log(answer);

  } catch (error) {
    console.error(error);
    process.exit(1);
  }

  process.exit(0);

})();
