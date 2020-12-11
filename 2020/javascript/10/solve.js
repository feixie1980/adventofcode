const argv = require('yargs').argv;
const fs = require('fs');

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

// generate n-wise pair combination for array
function combinationN(array, n) {
  if (n === 1) {
    return array.map(s => [s]);
  }

  if (n === array.length) {
    return [array];
  }

  let all = [];
  for (let i = 0; i <= array.length - n; i++) {
    const subCombinations = combinationN(array.slice(i+1), n -1);
    const allCombinations = subCombinations.map(comb => [array[i], ...comb]);
    all = [...all, ...allCombinations];
  }
  return all;
}

function combination(array) {
  let all = [];
  for (let n = 2; n < array.length; n++) {
    all = [...all, ...combinationN(array, n)];
  }
  return [...all, array];
}

function* combGenerator(array) {
  const combinationNGen = function*(array, n) {
    if (n === 1) {
      yield array.map(s => [s]);
    }

    if (n === array.length) {
      yield [array];
    }

    let all = [];
    for (let i = 0; i <= array.length - n; i++) {
      for (const comb of combinationNGen(array.slice(i+1), n -1)) {
        yield comb;
        yield [array[i], ...comb];
      }
    }
  };

  for (let n = 2; n < array.length; n++) {
    yield * combinationN(array, n);
  }

  yield array;
}

function solution1a(adapters) {
  const sortedAdapters = [...adapters];
  sortedAdapters.sort((a, b) => a - b);
  const deviceJolt = sortedAdapters[sortedAdapters.length - 1] + 3;

  const diffs = genDiffs(sortedAdapters, deviceJolt);

  const diffOne = diffs.filter(diff => diff === 1).length;
  const diffThree = diffs.filter(diff => diff === 3).length;
  return { diffOne, diffThree, product: diffOne * diffThree };
}

// brute force by getting all combination of adapters (Do Not Work)
function solution2a(adapters) {
  const sortedAdapters = [...adapters];
  sortedAdapters.sort((a, b) => a - b);
  const deviceJolt = sortedAdapters[sortedAdapters.length - 1] + 3;

  let validCnt = 0, i = 0;
  for (const comb of combGenerator(sortedAdapters)) {
    i++;
    if (i % 1000 === 0) {
      console.log(`processed ${i} combinations`);
    }
    const diffs = genDiffs(comb, deviceJolt);
    let valid = true;
    for (let diff of diffs) {
      if (diff > 3) {
        valid = false;
        break;
      }
    }
    if (valid) {
      validCnt++;
    }
  }

  //console.log(comb);
  return validCnt;
}


// exhaustive search by finding the next valid adapters from the last  (Will take too long)
function solution2b(adapters) {
  const sortedAdapters = [...adapters];
  sortedAdapters.sort((a, b) => a - b);
  const deviceJolt = sortedAdapters[sortedAdapters.length - 1] + 3;

  let stack = [{index: -1, value: 0}], cnt = 0, level = 0;
  while (stack.length > 0) {
    console.log(`stack level: ${level++}, stack size: ${stack.length}`);
    let newStack = [];
    for (const item of stack) {
      if (item.value === deviceJolt - 3) {
        cnt++;
        continue;
      }

      let validNextItems = [];
      let i = item.index + 1;
      let a = 0;
      while (sortedAdapters[i] - item.value <= 3) {
        validNextItems.push({ index: i, value:sortedAdapters[i] });
        i++;
      }

      newStack.push.apply(newStack, validNextItems);
    }
    stack = newStack;
  }

  return cnt;
}

function genDiffs(sortedAdapters, deviceJolt) {
  let diffs = sortedAdapters.map((adapter, i) => i === 0 ? adapter : adapter - sortedAdapters[i-1] );
  diffs.push(deviceJolt - sortedAdapters[sortedAdapters.length - 1]);
  return diffs;
}

function combCount(n) {
  if (n === 1)
    return 1;

  if (n === 2)
    return 2;

  if (n === 3)
    return 4;

  return combCount(n-1) + combCount(n-2) + combCount(n-3);
}

/**
 * One count method
 *
 * Observe that the diff is either 1 or 3. There is only one way to go between adapters with diff 3
 * from one another. However, when there is a contiguous group of adapters whose diffs are all 1 from
 * the preview to next, then there will be more than one way to go from the first and last adapters
 * within this group.
 *
 * For instance, there are 2 ways if the diff group is: [1, 1]; 4 ways if [1, 1, 1], and so on. The number
 * of ways can be computed recursively.
 *
 * @param adapters
 * @returns {number}
 */
function solution2c(adapters) {
  const sortedAdapters = [...adapters];
  sortedAdapters.sort((a, b) => a - b);
  const deviceJolt = sortedAdapters[sortedAdapters.length - 1] + 3;
  const diffs = genDiffs(sortedAdapters, deviceJolt);

  let oneCounts = [0];
  for (const diff of diffs) {
    if (diff === 3) {
      oneCounts.push(0);
    }
    else {
      oneCounts[oneCounts.length - 1] += 1;
    }
  }
  oneCounts = oneCounts.filter(count => count !== 0);
  return oneCounts.reduce((product, oneCount) => product * combCount(oneCount), 1);
}


(function run() {
  try {
    const { file } = getArgvs();
    const content = fs.readFileSync(file, { encoding:'utf8' }).trim();
    const adapters = parseInput(content);

    let startTime = new Date().getTime();
    let result = solution1a(adapters);
    let endTime = new Date().getTime();
    console.log(result);
    console.log(`Solution 1.a: ${endTime - startTime} ms`);
    console.log(` answer is: ${result.product}.`);

    startTime = new Date().getTime();
    let validCnt = solution2c(adapters);
    endTime = new Date().getTime();
    console.log(`Solution 4.a: ${endTime - startTime} ms`);
    console.log(` valid count is: ${validCnt}`);

  } catch (error) {
    console.error(error);
    process.exit(1);
  }

  process.exit(0);

})();
