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
    if (line === 'noop') {
      return null;
    }
    else {
      return parseInt(line.split(' ')[1]);
    }
  });
}

function* cycleGenerator(program) {
  let x = 1, programPtr = 0;

  let instPhase = 0;
  while(programPtr <= program.length) {
    yield x;

    if (program[programPtr] !== null) {
      if (instPhase === 0) {
        instPhase++;
      }
      else {
        x += program[programPtr];
        instPhase = 0;
        programPtr++;
      }
    }
    else {
      programPtr++;
    }
  }
}

function solution1(program) {
  let cycle = 1, sum = 0;
  const gen = cycleGenerator(program);

  while (true) {
    const { value: x, done } = gen.next();
    if (cycle === 20 || (cycle - 20) % 40 === 0) {
      sum += cycle * x;
    }
    if (done) {
      break;
    }
    cycle++;
  }

  return sum;
}

function printSprite(sprites) {
  let line = '';
  for(let i = 0; i < 40; i++) {
      line += sprites.includes(i) ? '#' : '.';
  }
  return line;
}

function solution2(program) {
  let cycle = 1, crt = [], crtLine = -1;
  const gen = cycleGenerator(program);

  while (true) {
    if(cycle % 40 === 1) {
      crt.push("");
      crtLine++;
    }

    const { value: x, done } = gen.next();
    const sprites = [x-1, x, x+1];
    const pixel = cycle % 40  - 1;
    crt[crtLine] += sprites.includes(pixel) ? '#' : '.';

    if (done) {
      break;
    }
    cycle++;
  }

  console.log(crt);

  return;
}

(function run() {
  try {
    const { file } = getArgvs();
    const content = readFileSync(file, { encoding:'utf8' }).trim();
    const program = parseInput(content);

    let startTime = new Date().getTime();
    let answer = solution1(program);
    let endTime = new Date().getTime();
    console.log(`Solution 1: ${endTime - startTime} ms`);
    console.log(answer);

    startTime = new Date().getTime();
    answer = solution2(program);
    endTime = new Date().getTime();
    console.log(`Solution 2: ${endTime - startTime} ms`);
    console.log(answer);

  } catch (error) {
    console.error(error);
    process.exit(1);
  }

  process.exit(0);

})();
