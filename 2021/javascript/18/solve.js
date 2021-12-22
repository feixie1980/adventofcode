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
  let numbers = [];
  const lines = content.split('\n');
  for (const line of lines) {
    const number = parseSNNumber(line);
    numbers.push(number);
  }
  return numbers;
}

function parseInput_text(content) {
  return content.split('\n');
}

// Get a SNNumber from the start of the str, may match only part of the string
function obtainSNNumber(str) {
  let strPos = 0;
  let c = str[strPos];

  if (!isNaN(c)) {
    const nonNumIndex = [...str].findIndex(char => isNaN(char)); // assume we allow more than single digit integer
    return {
      position: nonNumIndex - 1,
      number: parseInt(str.slice(0, nonNumIndex))
    };
  }

  if (c === '[') {
    let number = { 
      left: null,
      right: null
    };

    strPos++;
    let parseResult = obtainSNNumber(str.slice(strPos));
    number.left = parseResult.number;
    if (typeof number.left === 'object') {
      number.left.parent = number;
    }

    strPos += parseResult.position + 2; // +2 to skip ','
    parseResult = obtainSNNumber(str.slice(strPos)); 
    number.right = parseResult.number;
    if (typeof number.right === 'object') {
      number.right.parent = number;
    }

    strPos += parseResult.position + 1; // +1 to advance to ']'
    return { number, position: strPos };
  }

  throw 'Should not get here during parsing!';
}

function parseSNNumber(str) {
  return obtainSNNumber(str).number;
}

function stringifySNumber(number) {
  if (!isNaN(number)) {
    return number;
  }
  return `[${stringifySNumber(number.left)},${stringifySNumber(number.right)}]`;
}

function findNumberToExplode(number, depth) {
  if (isNaN(number) && depth === 4) {
    return number;
  }

  if (isNaN(number.left)) {
    const result = findNumberToExplode(number.left, depth + 1);
    if (result) {
      return result;
    }
  }

  if (isNaN(number.right)) {
    const result = findNumberToExplode(number.right, depth + 1);
    if (result) {
      return result;
    }
  }

  return null;
}

function firstLeftIntIndex(s, idx) {
  for (let i = idx - 1; i >= 0; i--) {
    if (!isNaN(s[i]))
      return i;
  }
  return -1;
}

function firstRightIntIndex(s, idx) {
  for (let i = idx + 1; i <= s.length; i++) {
    if (!isNaN(s[i]))
      return i;
  }
  return -1;
}

function isLeftChild(number) {
  return number.parent.left === number;
}

function isRightChild(number) {
  return number.parent.right === number;
}

function addToLeftMostValue(number, amount) {
  let n = number.left;

}

function explode(number) {
  number = parseSNNumber(stringifySNumber(number)); // clone
  const numToExplode = findNumberToExplode(number, 0);

  let n = numToExplode;
  while(n.parent && isLeftChild(n)) {
    n = n.parent;
  }
  if (n.parent) {
    if (typeof n.parent.left === 'number') {
      n.parent.left += numToExplode.left;
    }
    else {
      n = n.parent.left;
      while (typeof n.right !== 'number') {
        n = n.right;
      }
      n.right += numToExplode.left;
    }
  }
  


  // first replace the current number with a zero
  if (numToExplode === numToExplode.parent.left) {
    numToExplode.parent.left = 0;
  } else {
    numToExplode.parent.right = 0;
  }

  /*
  // add left, right values to 1st left, right integers
  let s = stringifySNumber(number);
  const idx = s.indexOf('0');
  const rightIdx = firstRightIntIndex(s, idx);
  if (rightIdx !== -1) {
    s = `${s.substring(0, rightIdx)}${parseInt(s[rightIdx]) + numToExplode.right}${s.substring(rightIdx + 1)}`;
  }
  const leftIdx = firstLeftIntIndex(s, idx);
  if (leftIdx !== -1) {
    s = `${s.substring(0, leftIdx)}${parseInt(s[leftIdx]) + numToExplode.left}${s.substring(leftIdx + 1)}`;
  }

  return parseSNNumber(s);
  */
}

function add(n1, n2) {
  // first combine n1 and n2
  let sum = { left: n1, right: n2 };
  n1.parent = sum;
  n2.parent = sum;

  // reduction
  while(true) {
    const { result, exploded } = explode(sum);
    if (!exploded) {
      break;
    }
    if (exploded) {
      sum = result;
      sum = split(sum);
    }    
  }

  return sum;
}

/* Text manipulation implementation */
function indexToExplode(numStr) {
  let numOpenBrackets  = 0;
  for (let i = 0; i < numStr.length; i++) {
    const c = numStr[i];
    if (c === '[') {
      numOpenBrackets++;
      const regNumPairs = numStr.substring(i).match(/^\[\d+,\d+\]/g);
      if (regNumPairs && numOpenBrackets >= 5)
        return { idx:i, explodePair: regNumPairs[0] };
    }
    else if (c === ']') {
      numOpenBrackets--;
    }
  }
  return { idx: -1, explodePair: null };
}

function addToNearestLeftValue_text(numStr, value) {
  let i = numStr.length - 1;
  while (isNaN(numStr[i]) && i >= 0) {
    i--;
  }
  if (i === -1) {
    return numStr; // no nearest left value found, no change
  }

  let valueStr = '';
  while (!isNaN(numStr[i])) {
    valueStr = numStr[i] + valueStr;
    i--;
  }
  i++;
  return `${numStr.substring(0, i)}${parseInt(valueStr) + value}${numStr.substring(i + valueStr.length)}`;
}

function addToNearestRightValue_text(numStr, value) {
  let i = 0;
  while (isNaN(numStr[i]) && i < numStr.length) {
    i++;
  }
  if (i === numStr.length) {
    return numStr; // no nearest right value found, no change
  }


  let valueStr = '';
  while (!isNaN(numStr[i])) {
    valueStr = valueStr + numStr[i];
    i++;
  }
  return `${numStr.substring(0, i - valueStr.length)}${parseInt(valueStr) + value}${numStr.substring(i)}`;

}

function explode_text(numStr) {
  const { idx, explodePair } = indexToExplode(numStr);
  if (idx === -1) {
    return numStr;
  }
  const { left, right } = parseSNNumber(explodePair); // get [l,r]
  let leftPart = addToNearestLeftValue_text(numStr.substring(0, idx), left);
  let rightPart = addToNearestRightValue_text(numStr.substring(idx + explodePair.length), right);
  return `${leftPart}0${rightPart}`; // replace [l,r] with 0
}

function findSplits_text(numStr) {
  let splits = [];
  let i = 0;
  while(i < numStr.length) {
    const regNums = numStr.substring(i).match(/^\d+/g); //match any number that starts at i
    if (!regNums || regNums[0].length === 1) {
      i++;
    }
    else {
      // found a value to split
      splits.push({
        index: i,
        value: parseInt(regNums[0])
      });
      i += regNums[0].length;
    }
  }
  return splits;
}

function split_text(numStr) {
  let splits = findSplits_text(numStr);
  if (splits.length === 0) {
    return numStr;
  }
  const {index, value} = splits[0];
  const newPair = `[${Math.floor(value / 2)},${Math.ceil(value / 2)}]`;
  return `${numStr.substring(0, index)}${newPair}${numStr.substring(index + 2)}`;
}

function add_text(numStr1, numStr2) {
  if (!numStr1) {
    return numStr2
  }

  if (!numStr2) {
    return numStr1
  }

  // first combine numStr1 and numStr2
  let sum = `[${numStr1},${numStr2}]`;

  // reduction
  while(true) {
    const exploded = explode_text(sum);
    const newSum = split_text(exploded);
    if (newSum === sum) {
      break;
    }
    sum = newSum;
  }

  return sum;
}

function solution1(numbers) {
  let sum = null;
  for(const number of numbers) {
    console.log(`+ ${number}`);
    sum = add_text(sum, number);
    console.log(`sum: ${sum}`);
  }
  return false;
}

function solution2(input) {
    return false;
}

(function run() {
  try {
    const { file } = getArgvs();
    const content = readFileSync(file, { encoding:'utf8' }).trim();
    const numbers = parseInput_text(content);

    let startTime = new Date().getTime();
    let answer = solution1(numbers);
    let endTime = new Date().getTime();
    console.log(`Solution 1: ${endTime - startTime} ms`);
    console.log(answer);

    startTime = new Date().getTime();
    answer = solution2(numbers);
    endTime = new Date().getTime();
    console.log(`Solution 2: ${endTime - startTime} ms`);
    console.log(answer);

  } catch (error) {
    console.error(error);
    process.exit(1);
  }

  process.exit(0);

})();
