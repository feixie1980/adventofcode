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
//   35
//   20
function parseInput(content) {
  return content.split('\n').map(s => parseInt(s));
}

function addNumberToPool(number, numberPool, sumMap) {
  let numObj = { number, sumMapKeySet: new Set() };
  for (const poolNumObj of numberPool) {
    const sum = number + poolNumObj.number;
    if (!sumMap.has(sum)) {
      sumMap.set(sum, 0);
    }
    sumMap.set(sum, sumMap.get(sum) + 1);
    numObj.sumMapKeySet.add(sum);
  }
  numberPool.push(numObj);
}

function shiftNumberPool(numberPool, sumMap) {
  const shifted = numberPool[0];
  numberPool.splice(0, 1);
  [...shifted.sumMapKeySet].forEach(sumMapKey => {
    const sumRefCount = sumMap.get(sumMapKey);
    if (sumRefCount > 0) {
      sumMap.set(sumMapKey, sumRefCount - 1);
    }
  });
}

function solution1a(numbers, preambleCount) {
  let sumMap = new Map(), numberPool = [];
  for (const number of numbers.slice(0, preambleCount)) {
    addNumberToPool(number, numberPool, sumMap);
  }
  for (let i = preambleCount; i < numbers.length; i++) {
    const number = numbers[i];

    if (!sumMap.has(number) || sumMap.get(number) === 0) {
      // found the invalid number
      return number;
    }

    shiftNumberPool(numberPool, sumMap);
    addNumberToPool(number, numberPool, sumMap);
  }
}

function solution2a(numbers, target) {
  let steps = 0;
  for (let i = 0; i < numbers.length - 1; i++) {
    for (let j = i + 1; j < numbers.length; j++) {
      const group = numbers.slice(i, j + 1);
      const sum = group.reduce((sum, num) => {
        steps++;
        return sum + num;
      }, 0);

      if (sum === target) {
        return { smallest: Math.min(...group), largest: Math.max(...group), range: { i, j }, steps};
      }
    }
  }
  return  null;
}

// dynamic programming
function solution2b(numbers, target) {
  let steps = 0, map = new Map();

  for (let i = 0; i < numbers.length; i++) {
    map.set(`${i}-${i}`, numbers[i]);
    for (let j = i + 1; j < numbers.length; j++) {
      steps++;
      let key = `${i}-${j-1}`;
      let sum = map.get(key) + numbers[j];
      if (sum === target) {
        const group = numbers.slice(i, j + 1);
        return { smallest: Math.min(...group), largest: Math.max(...group), range: { i, j }, steps};
      }
      else if (sum > target) {
        break;
      }
      map.set(`${i}-${j}`, sum);
    }
  }

  return null;
}


(function run() {
  try {
    const { file } = getArgvs();
    const content = fs.readFileSync(file, { encoding:'utf8' }).trim();
    const numbers = parseInput(content);

    let startTime = new Date().getTime();
    let invalidNumber = solution1a(numbers, 25);
    let endTime = new Date().getTime();
    console.log(`Solution 1.a: ${endTime - startTime} ms`);
    console.log(` 1st invalid is: ${invalidNumber}.`);

    startTime = new Date().getTime();
    let result = solution2a(numbers, invalidNumber);
    endTime = new Date().getTime();
    console.log(`Solution 2.a: ${endTime - startTime} ms`);
    console.log(result);
    console.log(` sum is: ${result.smallest + result.largest}.`);

    startTime = new Date().getTime();
    result = solution2b(numbers, invalidNumber);
    endTime = new Date().getTime();
    console.log(`Solution 2.b: ${endTime - startTime} ms`);
    console.log(result);
    console.log(` sum is: ${result.smallest + result.largest}.`);


  } catch (error) {
    console.error(error);
    process.exit(1);
  }

  process.exit(0);

})();
