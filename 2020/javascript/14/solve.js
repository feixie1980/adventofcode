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

/**
 * Javascript does not support bit-wise ops on 64 bit numbers.  As such we wil have to find an alternative way to
 * store the bit array here.  We will create bit array with the same bit length as the mask.
 * @param value
 * @param bitLength
 * @returns {any[]}
 */
function toBitArray(value, bitLength) {
  const strVal = parseInt(value).toString(2);
  let bitArray = Array(bitLength - strVal.length).fill(0);
  bitArray.push(...strVal.split('').map(v => parseInt(v)));
  return bitArray;
}

// lines:
// mask = XXXXXXXXXXXXXXXXXXXXXXXXXXXXX1XXXX0X
// mem[8] = 11
// mem[7] = 101
// mem[8] = 0
function parseInput(content) {
  const lines = content.split('\n');
  let instructions = [], maskLength;
  for (const line of lines) {
    if (line.indexOf("mask") !== -1) {
      line.replace(/(mask\s=\s)([X01]+)/, (match, p1, mask) => {
        instructions.push({
          mask, writes: []
        });
        maskLength = mask.length;
      });
    }
    else {
      line.replace(/(mem\[)([0-9]+)(]\s=\s)([[0-9]+)/, (match, p1, index, p2, value) => {
        instructions[instructions.length - 1].writes.push({
          index: parseInt(index), vBitArray: toBitArray(value, maskLength)
        });
      });
    }
  }

  return instructions;
}

function applyMask(vBitArray, mask) {
  let newBitArray = [...vBitArray];
  for (let i = 0; i < mask.length; i++) {
    const maskVal = mask.charAt(i);
    newBitArray[i] = maskVal === 'X' ? newBitArray[i] : parseInt(maskVal);
  }
  return newBitArray;
}

function solution1a(instructions) {
  let mem = new Map();
  for (const ins of instructions) {
    const { mask, writes } = ins;
    for (const write of writes) {
      const { index, vBitArray } = write;
      mem.set(index, applyMask(vBitArray, mask));
    }
  }

  return [...mem.keys()].reduce((sum, index) => {
    const intVal = parseInt(mem.get(index).join(''), 2);
    return sum + intVal;
  }, 0);
}

function expandMaskedBitArray(maskedBitArray) {
  let addrBitArrayList = [[...maskedBitArray]];
  for (let i = 0; i < maskedBitArray.length; i++) {
    const maskedBit = maskedBitArray[i];
    if (maskedBit !== 'X')
      continue;

    // double the list, assign 0 & 1 to each half
    addrBitArrayList = [
      ...addrBitArrayList.map(addrBitArr => [...addrBitArr]),
      ...addrBitArrayList.map(addrBitArr => [...addrBitArr])
    ];
    addrBitArrayList.forEach((addrBitArray, j) => {
      addrBitArray[i] = j < addrBitArrayList.length / 2 ? 0 : 1;
    });
  }
  return addrBitArrayList.map(bitArray => parseInt(bitArray.join(''), 2));
}

function genMaskedBitArray(addrBitArray, mask) {
  let maskedBitArray = [...addrBitArray];
  for (let i = 0; i < mask.length; i++) {
    const maskVal = mask.charAt(i);
    if (maskVal === 'X') {
      maskedBitArray[i] = 'X';
    }
    if (maskVal === '1') {
      maskedBitArray[i] = 1;
    }
  }
  return maskedBitArray;
}
function decodeAddresses(address, mask) {
  const addrBitArray = toBitArray(address, mask.length);
  let maskedBitArray = genMaskedBitArray(addrBitArray, mask);
  return expandMaskedBitArray(maskedBitArray);
}

function solution2a(instructions) {
  let mem = new Map();
  for (const ins of instructions) {
    const { mask, writes } = ins;
    for (const write of writes) {
      const { index, vBitArray } = write;
      const indexList = decodeAddresses(index, mask);
      for (const index of indexList) {
        mem.set(index, vBitArray);
      }
    }
  }

  return [...mem.keys()].reduce((sum, index) => {
    const intVal = parseInt(mem.get(index).join(''), 2);
    return sum + intVal;
  }, 0);
}

(function run() {
  try {
    const { file } = getArgvs();
    const content = fs.readFileSync(file, { encoding:'utf8' }).trim();
    const instructions = parseInput(content);

    let startTime = new Date().getTime();
    let result = solution1a(instructions);
    let endTime = new Date().getTime();
    console.log(`Solution 1.a: ${endTime - startTime} ms`);
    console.log(` answer is: ${result}`);

    startTime = new Date().getTime();
    result = solution2a(instructions);
    endTime = new Date().getTime();
    console.log(`Solution 2.a: ${endTime - startTime} ms`);
    console.log(` answer is: ${result}`);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }

  process.exit(0);

})();
