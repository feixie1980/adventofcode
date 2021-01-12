const argv = require('yargs').argv;
const fs = require('fs');
const unit = 1;

function replacer(key, value) {
  const originalObject = this[key];
  if(originalObject instanceof Map) {
    return {
      dataType: 'Map',
      value: Array.from(originalObject.entries()), // or with spread: value: [...originalObject]
    };
  } else {
    return value;
  }
}

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

function parseInput(content) {
  const [ publicCard, publicDoor ] = content.split('\n').map(s => parseInt(s));
  return { publicCard, publicDoor };
}

const factor = 20201227;
function findLoopSize(key) {
  const initSubjectNum = 7;
  let loopSize = 0, value = 1;
  while (value !== key) {
    value *= initSubjectNum;
    value = value % factor;
    loopSize++;
  }
  return loopSize;
}

function genEncryptionKey(loopSize, key) {
  let value = 1;
  for (let i = 0; i < loopSize; i++) {
    value *= key;
    value = value % factor;
  }
  return value;
}

function solution1a(publicCard, publicDoor) {
  const loopCard = findLoopSize(publicCard);
  const loopDoor = findLoopSize(publicDoor);

  const encryptCard = genEncryptionKey(loopCard, publicDoor);
  const encryptDoor = genEncryptionKey(loopDoor, publicCard);

  if (encryptCard !== encryptDoor)
    throw `encryption keys not matching!`;

  return encryptCard;
}



function solution2a(identifiers) {
  return 0;
}

(function run() {
  try {
    const { file } = getArgvs();
    const content = fs.readFileSync(file, { encoding:'utf8' }).trim();
    const { publicCard, publicDoor } = parseInput(content);

    let startTime = new Date().getTime();
    let result = solution1a(publicCard, publicDoor);
    let endTime = new Date().getTime();
    console.log(`Solution 1.a: ${endTime - startTime} ms`);
    console.log(result);

    startTime = new Date().getTime();
    result = solution2a(publicCard, publicDoor);
    endTime = new Date().getTime();
    console.log(`Solution 2.a: ${endTime - startTime} ms`);
    console.log(result);


  } catch (error) {
    console.error(error);
    process.exit(1);
  }

  process.exit(0);

})();
