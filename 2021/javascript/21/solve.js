import { readFileSync } from 'fs';
import Yargs from "yargs";

const quantumDice = new QuantumDice();
const WINNING_SCORE = 21;

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
  return content.split(',').map(s => parseInt(s));
}

class DeterministicDice {
  constructor() {
    this.rolls = 0;
    this.head = 1;
  }

  roll = () => {
    this.rolls++;
    const currentHead = this.head;
    this.head++;
    if (this.head > 100) {
      this.head = 1;
    }
    return currentHead;
  };
}

function playTurn(dice, positions, scores) {
  let newPositions = [...positions], newScores = [...scores];

  for (let i = 0; i < 2; i++) {
    const { newPosition, newScore } = compute([dice.roll(), dice.roll(), dice.roll()], positions[i], scores[i]);
    newPositions[i] = newPosition;
    newScores[i] = newScore;
    if ([newScores[i]] >= 1000) {
      return {
        newPositions, newScores, loser: i === 0 ? 1 : 0
      };
    }
  }

  return { newPositions, newScores, loser: -1 };
}

function solution1(starts) {
  const dice = new DeterministicDice();
  let positions = [...starts], scores = [0, 0];
  //console.log(`positions: ${positions}, scores: ${scores}`);

  while(true) {
    const { newPositions, newScores, loser } = playTurn(dice, positions, scores);
    positions = newPositions;
    scores = newScores;
    //console.log(`positions: ${positions}, scores: ${scores}`);
    if (loser !== -1) {
      return scores[loser] * dice.rolls;
    }
  }
}

class QuantumDice {
  constructor() {
    this.results = [];

    // initialize quantum dice results
    for (let i = 1; i <= 3; i++)
      for (let j = 1; j <= 3; j++)
        for (let k = 1; k <= 3; k++)
          this.results.push([i, j, k]);
  }

  roll3Times = () => {
    return this.results;
  };
}

function compute(rollResult, position, score) {
  let steps = (rollResult[0] + rollResult[1] + rollResult[2]) % 10; // how many actual steps forward
  let newPosition = position + steps;
  newPosition = newPosition <= 10 ? newPosition : newPosition - 10;
  const newScore = score + newPosition;
  return { newPosition, newScore };
}


function playPlayer(player, universes) {
  const rollResults = quantumDice.roll3Times();
  let newUniverses = [], win = 0;

  for (const universe of universes) {
    const { positions, scores } = universe;
    for (const rollResult of rollResults) { // splitting the universe!
      let newUniverse = { positions: [...positions], scores: [...scores] };
      const { newPosition, newScore } = compute(rollResult, positions[player], scores[player]);
      newUniverse.positions[player] = newPosition;
      newUniverse.scores[player] = newScore;
      if (newScore >= WINNING_SCORE) {
        win++
      }
      else {
        newUniverses.push(newUniverse);
      }
    }
  }

  return { newUniverses, win };
}

function playQuantumTurn(universes) {
  let wins = [0, 0];

  let result = playPlayer(0, universes);
  let newUniverses = result.newUniverses;
  wins[0] = result.win;
  console.log(`\tplayer 1 -\tuniverse size: ${newUniverses.length}\twins:${wins[0]}`);

  result = playPlayer(1, newUniverses);
  newUniverses = result.newUniverses;
  wins[1] = result.win;
  console.log(`\tplayer 2 -\tuniverse size: ${newUniverses.length}\twins:${wins[1]}`);

  return { newUniverses, wins };
}

function getUniverseKey(universe) {
  return `${universe.positions.join('-')}:${universe.scope.join('-')}`;
}

/* 2nd version */
function playPlayer_collapsed(player, universeMap) {
  const rollResults = quantumDice.roll3Times();
  let newUniverseMap = new Map(), win = 0;

  for (const entry of universeMap.entities()) {
    const { universeKey, universe } = entry;
    const { positions, scores, count } = universe;
    for (const rollResult of rollResults) { // splitting the universe!
      const { newPosition, newScore } = compute(rollResult, positions[player], scores[player]);
      if (newScore >= WINNING_SCORE) {
        win += count;
        continue;
      }

      let newUniverse = { positions: [...positions], scores: [...scores], count };
      newUniverse.positions[player] = newPosition;
      newUniverse.scores[player] = newScore;
      const newKey = getUniverseKey(newUniverse);

      if (!newUniverseMap.has(newKey)) {
        newUniverseMap.set(newKey, newUniverse);
      } else {
        newUniverseMap.get(newKey).count += newUniverse.count; // combine groups of universes
      }
    }
  }

  return { newUniverseMap, win };
}

function playQuantumTurn_collapsed(universeMap) {
  let wins = [0, 0];

  let result = playPlayer(0, universeMap);
  let newUniverseMap = result.newUniverseMap;
  wins[0] = result.win;
  console.log(`\tplayer 1 -\tuniverse size: ${newUniverseMap.size}\twins:${wins[0]}`);

  result = playPlayer(1, newUniverseMap);
  newUniverseMap = result.newUniverseMap;
  wins[1] = result.win;
  console.log(`\tplayer 2 -\tuniverse size: ${newUniverseMap.length}\twins:${wins[1]}`);

  return { newUniverseMap, wins };
}

function solution2(starts) {
  let universes = [ { positions: [...starts], scores: [0, 0]} ];
  let totalWins = [0, 0];

  let turn = 1;
  while(universes.length !== 0) {
    console.log(`turn ${turn++}`);
    const { newUniverses, wins } = playQuantumTurn(universes);
    universes = newUniverses;
    totalWins[0] += wins[0];
    totalWins[1] += wins[1];
  }

  return Math.max(...totalWins);
}

function solution2_collapsed(starts) {
  let universeMap = new Map([  ]);
  let initUniverse = { positions: [...starts], scores: [0, 0], count: 1};
  universeMap.set(getUniverseKey(initUniverse), initUniverse);
  let totalWins = [0, 0];

  let turn = 1;
  while(universeMap.size !== 0) {
    console.log(`turn ${turn++}`);
    const { newUniverses, wins } = playQuantumTurn_collapsed(universeMap);
    universes = newUniverses;
    totalWins[0] += wins[0];
    totalWins[1] += wins[1];
  }

  return Math.max(...totalWins);
}

(function run() {
  try {
    const { file } = getArgvs();
    const content = readFileSync(file, { encoding:'utf8' }).trim();
    const starts = parseInput(content);

    let startTime = new Date().getTime();
    let answer = solution1(starts);
    let endTime = new Date().getTime();
    console.log(`Solution 1: ${endTime - startTime} ms`);
    console.log(answer);

    /*
    startTime = new Date().getTime();
    answer = solution2(starts);
    endTime = new Date().getTime();
    console.log(`Solution 2: ${endTime - startTime} ms`);
    console.log(answer);
     */

    startTime = new Date().getTime();
    answer = solution2_collapsed(starts);
    endTime = new Date().getTime();
    console.log(`Solution 2.b: ${endTime - startTime} ms`);
    console.log(answer);

  } catch (error) {
    console.error(error);
    process.exit(1);
  }

  process.exit(0);

})();
