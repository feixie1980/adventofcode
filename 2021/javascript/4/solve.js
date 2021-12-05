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
  const lines = content.split('\n');
  const calls = lines[0].trim().split(',').map(s => parseInt(s));
  const boards = [];

  let curBoard = null;
  for (const line of lines.slice(1)) {
    // create a new bingo board
    if (line.trim() === '') {
      if (curBoard) {
        boards.push(curBoard);
      }
      curBoard = [];
      continue;
    }

    curBoard.push(
      line.trim().split(' ').filter(s => s)
      .map(s => (
        { 
          value: parseInt(s), 
          marked: false
        })
      )
    );
  }
  boards.push(curBoard);
  return { calls, boards };
}

function callNumber(call, board) {
  const v = board.flatMap(line => line).filter(v => v.value === call)[0];
  if (v) {
    v.marked = true;
  }
}

function bingo(boards) {
  const winningBoards = [];

  for (const board of boards) {
    // check rows
    let win = false;
    for (const line of board) {
      if (line.filter(v => !v.marked).length === 0) {
        win = true;
        break;
      }
    }

    if (win) {
      winningBoards.push(board);
      continue;
    }

    // check columns
    for (let i = 0; i < board.length; i++) {
      if (board.map(line => line[i]).filter(v => !v.marked).length === 0) {
        winningBoards.push(board);
        break;
      }
    }
  }

  return winningBoards;
}

function solution1(calls, boards) {
  for (const call of calls) {
    //console.log(`\ncall ${call}\n`);
    for (const board of boards) {
      callNumber(call, board);
      //printBoard(board);    
      //console.log();  
    }
    
    const bingoBoards = bingo(boards);
    if (bingoBoards.length > 0) {
      const bingoBoard = bingoBoards[0];
      const unMarks = bingoBoard.flatMap(line => line.filter(s => !s.marked).map(s => s.value));
      return unMarks.reduce((sum, n) => sum + n, 0) * call;
    }
  }

  return null;
}

function solution2(calls, boards) {
  for (const call of calls) {
    //console.log(`\ncall ${call}\n`);
    //console.log(`remaining boards:${boards.length}`);
    for (const board of boards) {
      callNumber(call, board);
      //printBoard(board);    
      //console.log();  
    }

    const bingoBoards = bingo(boards);
    boards = boards.filter(board => !bingoBoards.includes(board));
    if (boards.length === 0) {
      const unMarks = bingoBoards[0].flatMap(line => line.filter(s => !s.marked).map(s => s.value));
      return unMarks.reduce((sum, n) => sum + n, 0) * call;      
    }
  }

  return null;
}

function printBoard(board) {
  for (const line of board) {
    console.log(line.map(n => `${n.value}${n.marked ? '(x)' : ''}`).join('\t'));
  }
}

(function run() {
  try {
    const { file } = getArgvs();
    const content = readFileSync(file, { encoding:'utf8' }).trim();
    var { calls, boards } = parseInput(content);

    /*
    console.log(calls.join(' '));
    for (const board of boards) {
      console.log('\n');
      printBoard(board);
    }
    */

    let startTime = new Date().getTime();
    let answer = solution1(calls, boards);
    let endTime = new Date().getTime();
    console.log(`Solution 1: ${endTime - startTime} ms`);
    console.log(answer);

    var { calls, boards } = parseInput(content);
    startTime = new Date().getTime();
    answer = solution2(calls, boards);
    endTime = new Date().getTime();
    console.log(`Solution 2: ${endTime - startTime} ms`);
    console.log(answer);

  } catch (error) {
    console.error(error);
    process.exit(1);
  }

  process.exit(0);

})();