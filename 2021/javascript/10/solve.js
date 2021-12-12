import { readFileSync, Stats } from 'fs';
import Yargs from "yargs";

const pairs = [
  { open: '(', close: ')', score: 3, comScore: 1 },
  { open: '[', close: ']', score: 57, comScore: 2 },
  { open: '{', close: '}', score: 1197, comScore: 3 },
  { open: '<', close: '>', score: 25137, comScore: 4 }
];

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
  return content.split('\n');
}

function checkLineStatus(line) {
  let openQueue = [];
  const opens = pairs.map(pair => pair.open);
  const closes = pairs.map(pair => pair.close);

  for (const c of [...line]) {
    if (opens.includes(c)) {
      openQueue.push(c);
    }
    else if (closes.includes(c)) {
      const lastOpen = openQueue.pop();
      if (opens.indexOf(lastOpen) !== closes.indexOf(c)) {
        return { pass: false, corrupt: c };
      }
    }
  }

  // incompleted
  let completion = '';
  while (openQueue.length !== 0) {
    const open = openQueue.pop();
    const close = closes[opens.indexOf(open)];
    completion += close;
  }

  return { 
    pass: !completion, 
    completion
  };
}

function solution1(lines) {
  let score = 0;
  for(const line of lines) {
    const status = checkLineStatus(line);
    const { pass, corrupt } = status;
    if (!pass && corrupt) {
      console.log(`corrpt found: ${line}, at: ${corrupt}`);
      score += pairs.find(pair => pair.close === status.corrupt).score;
    }    
  }
  return score;
}

function completionScore(completion) {
  const closes = pairs.map(pair => pair.close);
  const comScores = pairs.map(pair => pair.comScore);
  return [...completion].reduce((score, c) => {
    return score * 5 + comScores[closes.indexOf(c)];
  }, 0);
}

function solution2(lines) {
  let scores = [];
  for(const line of lines) {
    const status = checkLineStatus(line);
    const { pass, completion } = status;
    if (!pass && completion) {
      const score = completionScore(completion);
      scores.push(score);
      console.log(`incompleted found: ${line}, completion: ${completion}, score: ${score}`);
    }    
  }
  return scores.sort((a, b) => a - b)[Math.floor(scores.length / 2)];
}

(function run() {
  try {
    const { file } = getArgvs();
    const content = readFileSync(file, { encoding:'utf8' }).trim();
    const lines = parseInput(content);

    let startTime = new Date().getTime();
    let answer = solution1(lines);
    let endTime = new Date().getTime();
    console.log(`Solution 1: ${endTime - startTime} ms`);
    console.log(answer);

    startTime = new Date().getTime();
    answer = solution2(lines);
    endTime = new Date().getTime();
    console.log(`Solution 2: ${endTime - startTime} ms`);
    console.log(answer);

  } catch (error) {
    console.error(error);
    process.exit(1);
  }

  process.exit(0);

})();
