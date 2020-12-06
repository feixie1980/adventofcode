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

function solution1a(passports) {

}


// B->1, F->0, R->1, L->0
function transformToSeats(lines) {
  let seats = [];

  for (const line of lines) {
    let rowStr = line.substr(0, 7);
    rowStr = [...rowStr].map(c => c === 'B' ? 1 : 0).join('');
    const row = parseInt(rowStr, 2);

    let colStr = line.substr(7, 3);
    colStr = [...colStr].map(c => c === 'R' ? 1 : 0).join('');
    const column = parseInt(colStr, 2);

    seats.push({
      original: line, row, column, id: row * 8 + column
    })
  }

  return seats;
}

function findMax(seats) {
  let max = 0;
  seats.forEach(seat => {
    if (seat.id > max) {
      max = seat.id;
    }
  });
  return max;
}

function findMissing(seats) {
  const idList = seats.map(seat => seat.id);
  idList.sort((a, b) => a - b);
  let prevId = null;
  for(const id of idList) {
    if (prevId !== null && id - prevId > 1) {
      return id -1;
    }
    prevId = id;
  }
}

(function run() {
  try {
    const { file } = getArgvs();
    const lines = fs.readFileSync(file, { encoding:'utf8' }).split('\n').filter(line => !!line);

    let startTime = new Date().getTime();
    const seats = transformToSeats(lines);
    const max = findMax(seats);
    const missing  = findMissing(seats);
    let endTime = new Date().getTime();
    console.log(`Solution 1.a: ${endTime - startTime} ms`);
    console.log(`  Highest id is: ${max}.`);
    console.log(`  My id is: ${missing}.`);

  } catch (error) {
    console.error(error);
    process.exit(1);
  }

  process.exit(0);

})();
