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
// L.L#.LL.LL
// . -> 0, L -> 1, # -> 2
function parseInput(content) {
  return content.split('\n')
    .map(line => {
      return line.split('').map(c => {
        switch(c) {
          case '.':
            return 0;

          case 'L':
            return 1;

          case '#':
            return 2;

          default:
            throw `Unexpected symbol encountered: ${c}`;
        }
      })
    });
}

function applyRule1(x, y, seats) {
  let allEmpty = true;
  for (let i = x - 1; i <= x + 1; i++) {
    for (let j = y - 1; j <= y + 1; j++) {
      if (i === x && j === y || i < 0 || j < 0 || i >= seats.length || j >= seats[x].length)
        continue;
      if (seats[i][j] === 2) {
        allEmpty = false;
        break;
      }
    }
    if (!allEmpty)
      break;
  }

  return allEmpty ? 2 : 1;
}

function applyRule2(x, y, seats) {
  let occupiedCnt = 0, emptySeat = false;
  for (let i = x - 1; i <= x + 1; i++) {
    for (let j = y - 1; j <= y + 1; j++) {
      if (i === x && j === y || i < 0 || j < 0 || i >= seats.length || j >= seats[x].length)
        continue;
      if (seats[i][j] === 2) {
        occupiedCnt++;
        if (occupiedCnt >= 4) {
          emptySeat = true;
          break;
        }
      }
    }
    if (emptySeat)
      break;
  }

  return emptySeat ? 1 : 2;
}

function round(seats) {
  let newSeats = [];
  for (let x = 0; x < seats.length; x++) {
    newSeats[x] = [...seats[x]];
    for (let y = 0; y < seats[x].length; y++) {
      const seat = seats[x][y];
      if (seat === 1) {
        newSeats[x][y] = applyRule1(x, y, seats);
      } else if (seat === 2) {
        newSeats[x][y] = applyRule2(x, y, seats);
      }
    }
  }
  return newSeats;
}

function upSeatSeen(x, y, seats) {
  for (let i = x - 1; i >= 0; i--) {
    if (seats[i][y] !== 0)
      return seats[i][y];
  }
  return 0;
}

function downSeatSeen(x, y, seats) {
  for (let i = x + 1; i < seats.length; i++) {
    if (seats[i][y] !== 0)
      return seats[i][y];
  }
  return 0;
}

function leftSeatSeen(x, y, seats) {
  for (let j = y - 1; j >= 0; j--) {
    if (seats[x][j] !== 0)
      return seats[x][j];
  }
  return 0;
}

function rightSeatSeen(x, y, seats) {
  for (let j = y + 1; j < seats[x].length; j++) {
    if (seats[x][j] !== 0)
      return seats[x][j];
  }
  return 0;
}

function leftUpSeatSeen(x, y, seats) {
  for (let i = x - 1, j = y - 1; i >= 0 && j >= 0; i--, j--) {
    if (seats[i][j] !== 0)
      return seats[i][j];
  }
  return 0;
}

function leftDownSeatSeen(x, y, seats) {
  for (let i = x - 1, j = y + 1; i >= 0 && j < seats[x].length; i--, j++) {
    if (seats[i][j] !== 0)
      return seats[i][j];
  }
  return 0;
}

function rightUpSeatSeen(x, y, seats) {
  for (let i = x + 1, j = y - 1; i < seats.length && j >= 0; i++, j--) {
    if (seats[i][j] !== 0)
      return seats[i][j];
  }
  return 0;
}

function rightDownSeatSeen(x, y, seats) {
  for (let i = x + 1, j = y + 1; i < seats.length && j < seats[x].length; i++, j++) {
    if (seats[i][j] !== 0)
      return seats[i][j];
  }
  return 0;
}

function applyRule1_part2(x, y, seats) {
  if (
    upSeatSeen(x, y, seats) !== 2 &&
    downSeatSeen(x, y, seats) !== 2 &&
    leftSeatSeen(x, y, seats) !== 2 &&
    rightSeatSeen(x, y, seats) !== 2 &&
    leftDownSeatSeen(x, y, seats) !== 2 &&
    leftUpSeatSeen(x, y, seats) !== 2 &&
    rightDownSeatSeen(x, y, seats) !== 2 &&
    rightUpSeatSeen(x, y, seats) !== 2
  )
    return 2;

  return 1;
}

function applyRule2_part2(x, y, seats) {
  let occupiedCnt = 0;
  if (upSeatSeen(x, y, seats) === 2)
    occupiedCnt++;
  if (downSeatSeen(x, y, seats) === 2)
    occupiedCnt++;
  if (leftSeatSeen(x, y, seats) === 2)
    occupiedCnt++;
  if (rightSeatSeen(x, y, seats) === 2)
    occupiedCnt++;
  if (leftDownSeatSeen(x, y, seats) === 2)
    occupiedCnt++;
  if (leftUpSeatSeen(x, y, seats) === 2)
    occupiedCnt++;
  if (rightDownSeatSeen(x, y, seats) === 2)
    occupiedCnt++;
  if (rightUpSeatSeen(x, y, seats) === 2)
    occupiedCnt++;

  return occupiedCnt >= 5 ? 1 : 2;
}

function round_part2(seats) {
  let newSeats = [];
  for (let x = 0; x < seats.length; x++) {
    newSeats[x] = [...seats[x]];
    for (let y = 0; y < seats[x].length; y++) {
      const seat = seats[x][y];
      if (seat === 1) {
        newSeats[x][y] = applyRule1_part2(x, y, seats);
      } else if (seat === 2) {
        newSeats[x][y] = applyRule2_part2(x, y, seats);
      }
    }
  }
  return newSeats;
}


function isSame(seats1, seats2) {
  for (let x = 0; x < seats1.length; x++) {
    for (let y = 0; y < seats1[x].length; y++) {
      if (seats1[x][y] !== seats2[x][y])
        return false;
    }
  }
  return true;
}

function printSeats(seats) {
  for (let x = 0; x < seats.length; x++) {
    let str = '';
    for (let y = 0; y < seats[x].length; y++) {
      if (seats[x][y] === 0) {
        str = str + '.';
      }
      if (seats[x][y] === 1) {
        str += 'L';
      }
      if (seats[x][y] === 2) {
        str += '#';
      }
    }
    console.log(str);
  }
  console.log(`\n\n`);
}

function countOccupied(seats) {
  let cnt = 0;
  for (let x = 0; x < seats.length; x++) {
    for (let y = 0; y < seats[x].length; y++) {
      if (seats[x][y] === 2)
        cnt++;
    }
  }
  return cnt;
}

function solution1a(seats) {
  let same = false;
  do {
    const newSeats = round(seats);
    same = isSame(seats, newSeats);
    seats = newSeats;
  } while (!same);

  return countOccupied(seats);
}

function solution2a(seats) {
  let same = false;
  //printSeats(seats);
  do {
    const newSeats = round_part2(seats);
    same = isSame(seats, newSeats);
    seats = newSeats;
    //printSeats(seats);
  } while (!same);

  return countOccupied(seats);
}


(function run() {
  try {
    const { file } = getArgvs();
    const content = fs.readFileSync(file, { encoding:'utf8' }).trim();
    const seats = parseInput(content);

    let startTime = new Date().getTime();
    let result = solution1a(seats);
    let endTime = new Date().getTime();
    console.log(`Solution 1.a: ${endTime - startTime} ms`);
    console.log(` answer is: ${result}.`);

    startTime = new Date().getTime();
    result = solution2a(seats);
    endTime = new Date().getTime();
    console.log(`Solution 4.a: ${endTime - startTime} ms`);
    console.log(` answer is: ${result}`);

  } catch (error) {
    console.error(error);
    process.exit(1);
  }

  process.exit(0);

})();
