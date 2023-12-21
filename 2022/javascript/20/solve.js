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
  return content.split('\n').map((n, i) => {
    return {
      id: i,
      value: parseInt(n)
    };
  });
}

function indexAfterMove(array, index, count) {
  const remainder = count % array.length;
  let newIndex = index + remainder;
  if (newIndex < 0) {
    newIndex = array.length + newIndex;
  }
  else if (newIndex >= array.length) {
    newIndex = newIndex - array.length;
  }
  return newIndex;
}

function indexAfter(array, index, count) {
  const remainder = count % array.length;
  let newIndex = index + remainder;
  if (newIndex < 0) {
    newIndex = array.length + newIndex;
  }
  else if (newIndex > array.length) {
    newIndex = newIndex - array.length;
  }
  return newIndex;
}

function move(array, index) {
  const obj = array[index];
  array.splice(index, 1);
  const newIndex = indexAfterMove(array, index, obj.value);
  array.splice(newIndex, 0, obj);
  return newIndex;
}

function findValuesAfterZero(array, posList) {
  const values = [];
  let zeroIndex = array.findIndex(obj => obj.value === 0);
  for (const pos of posList) {
    const index = indexAfter(array, zeroIndex, pos);
    values.push(array[index].value);
  }
  return values;
}

function solution1(objArray) {
  let curArray = [...objArray];
  let indexToMove = 0;
  // console.log(`0: ${curArray.map(obj => obj.value).join(' ')}`);
  for(let i = 0; i < objArray.length; i++) {
    const objToMove = objArray[indexToMove];
    const curIndex = curArray.indexOf(objToMove);
    if (curIndex === -1)
      throw `obj not found ${objToMove}!`;
    move(curArray, curIndex);
    indexToMove = (indexToMove + 1) % objArray.length;
    // console.log(`${i + 1}: ${curArray.map(obj => `${obj.value}(${obj.id})`).join(' ')}`);
  }
  const values = findValuesAfterZero(curArray, [1000, 2000, 3000]);
  return values.reduce((sum, v) => sum + v, 0);
}

function solution2(objArray) {
  const encryKey = 811589153;
  objArray = objArray.map(obj => Object.assign({}, obj, {value: obj.value * encryKey}));
  let curArray = [...objArray];
  let indexToMove = 0;
  // console.log(`0: ${curArray.map(obj => obj.value).join(' ')}`);
  for(let i = 0; i < objArray.length * 10; i++) {
    const objToMove = objArray[indexToMove];
    const curIndex = curArray.indexOf(objToMove);
    if (curIndex === -1)
      throw `obj not found ${objToMove}!`;
    move(curArray, curIndex);
    indexToMove = (indexToMove + 1) % objArray.length;

    if ( (i + 1) % objArray.length === 0) {
      console.log(`${i + 1}: ${curArray.map(obj => `${obj.value}`).join(' ')}`);
    }
  }
  const values = findValuesAfterZero(curArray, [1000, 2000, 3000]);
  return values.reduce((sum, v) => sum + v, 0);
}

(function run() {
  try {
    const { file } = getArgvs();
    const content = readFileSync(file, { encoding:'utf8' }).trim();
    const objArray = parseInput(content);

    let startTime = new Date().getTime();
    let answer = solution1(objArray);
    let endTime = new Date().getTime();
    console.log(`Solution 1: ${endTime - startTime} ms`);
    console.log(answer);

    startTime = new Date().getTime();
    answer = solution2(objArray);
    endTime = new Date().getTime();
    console.log(`Solution 2: ${endTime - startTime} ms`);
    console.log(answer);

  } catch (error) {
    console.error(error);
    process.exit(1);
  }

  process.exit(0);

})();
