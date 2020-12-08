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

function solution1a(numbers) {
  let steps = 0;
  for (let i = 0; i < numbers.length; i++) {
    const n1 = numbers[i];
    for (let j = 0; j < numbers.length; j++) {
      steps++;
      const n2 = numbers[j];
      if (i !== j) {
        if (n1 + n2 === target) {
          return { n1, n2, answer: n1 * n2, steps};
        }
      }
    }
  }

  return {};
}

function solution1b(numbers) {
  let steps = 0;
  let array = [];
  for (const n of numbers) {
    steps++;
    const complement = target - n;
    if (array[complement]) {
      return {n1: complement, n2: n, answer: complement * n, steps }
    } else {
      array[n] = true;
    }
  }
  return {};
}

function solution2a(numbers) {
  let steps = 0;
  for (let i = 0; i < numbers.length; i++) {
    const n1 = numbers[i];
    for (let j = 0; j < numbers.length; j++) {
      const n2 = numbers[j];
      for (let k = 0; k < numbers.length; k++) {
        steps++;
        const n3 = numbers[k];
        if (i !== j && i !== k && j !== k) {
          if (n1 + n2 + n3 === target) {
            return { n1, n2, n3, answer: n1 * n2 * n3, steps};
          }
        }
      }
    }
  }

  return {};
}

function solution2b(numbers) {
  let steps = 0;
  let array = [];
  for (let i = 0; i < numbers.length; i++) {
    const n = numbers[i];
    const complement = target - n;
    if (array[complement]) {
      steps++;
      const { n1, n2 } = array[complement];
      const n3 = n;
      return { n1, n2, n3, answer: n1 * n2 * n3, steps};
    }
    else {
      for (let j = i + 1; j < numbers.length; j++) {
        steps++;
        array[n + numbers[j]] = { n1: n, n2: numbers[j]};
      }
    }
  }
  return {};
}

(function run() {
  try {
    const { file } = getArgvs();
    const numbers = fs.readFileSync(file, { encoding:'utf8' }).split('\n').map(n => parseInt(n));

    let startTime = new Date().getTime();
    let solution = solution1a(numbers);
    let endTime = new Date().getTime();
    console.log(`Solution 1.a: ${endTime - startTime} ms, ${solution.steps} steps`);
    console.log(`  Answer is: ${solution.answer}.  The two numbers are ${solution.n1} ${solution.n2}`);

    startTime = new Date().getTime();
    solution = solution1b(numbers);
    endTime = new Date().getTime();
    console.log(`Solution 1.b: ${endTime - startTime} ms, ${solution.steps} steps`);
    console.log(`  Answer is: ${solution.answer}.  The two numbers are ${solution.n1} ${solution.n2}`);

    startTime = new Date().getTime();
    solution = solution2a(numbers);
    endTime = new Date().getTime();
    console.log(`Solution 2.a: ${endTime - startTime} ms, ${solution.steps} steps`);
    console.log(`  Answer is: ${solution.answer}.  The three numbers are ${solution.n1} ${solution.n2} ${solution.n3}`);

    startTime = new Date().getTime();
    solution = solution2b(numbers);
    endTime = new Date().getTime();
    console.log(`Solution 2.b: ${endTime - startTime} ms, ${solution.steps} steps`);
    console.log(`  Answer is: ${solution.answer}.  The three numbers are ${solution.n1} ${solution.n2} ${solution.n3}`);

  } catch (error) {
    console.error(error);
    process.exit(1);
  }

  process.exit(0);

})();
