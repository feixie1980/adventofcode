const argv = require('yargs').argv;
const fs = require('fs');

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
  let players = [];
  content.split('\n\n').forEach(part => {
    players.push(part.split('\n').slice(1).map(s => parseInt(s)));
  });
  return players;
}

function playRound(player1, player2) {
  const card1 = player1.shift();
  const card2 = player2.shift();
  const winner = card1 > card2 ? player1 : player2;
  const inserts = card1 > card2 ? [card1, card2] : [card2, card1];
  winner.push(...inserts);
  return winner;
}

function solution1a(players) {
  const player1 = players[0], player2 = players[1];

  // play rounds
  let winner;
  while (player1.length !== 0 && player2.length !==0) {
    winner = playRound(player1, player2);
  }

  // compute score
  return winner.reduce((score, card, index) => score + card * (winner.length - index), 0);
}

function sameDecks(decks1, decks2) {
  if (decks1[0].length !== decks2[0].length)
    return false;
  if (decks1[1].length !== decks2[1].length)
    return false;
  for (let i = 0; i < decks1[0].length; i++) {
    if (decks1[0][i] !== decks2[0][i])
      return false;
  }
  for (let i = 0; i < decks2[1].length; i++) {
    if (decks1[1][i] !== decks2[1][i])
      return false;
  }
  return true;
}

function existed(players, history) {
  for(const past of history) {
    if (sameDecks(past, players))
      return true;
  }
  return false;
}

let gameIndex = 1;

function playGameR(players, shouldPrint) {
  const curGameIndex = gameIndex++;
  if (shouldPrint)
    console.log(`\n=== Game ${curGameIndex} === \n`);
  const player1 = players[0], player2 = players[1];
  let history = [], totalCnt = [...player1, ...player2].length;
  let winner = player1;

  let round = 1;
  while (winner.length !== totalCnt) {
    if (shouldPrint) {
      console.log(`-- Round${round++} (Game ${curGameIndex}) --`);
      console.log(`Player 1's deck: ${player1.join(', ')}`);
      console.log(`Player 2's deck: ${player2.join(', ')}`);
    }

    // draw cards
    const card1 = player1.shift();
    const card2 = player2.shift();
    if (shouldPrint) {
      console.log(`Player 1 plays: ${card1}`);
      console.log(`Player 2 plays: ${card2}`);
    }

    let inserts;
    if (card1 <= player1.length && card2 <= player2.length) {
      // play sub game recursively
      const subPlayer1 = player1.slice(0, card1);
      const subPlayer2 = player2.slice(0, card2);
      const subWinner = playGameR([subPlayer1, subPlayer2], shouldPrint);
      winner = subWinner === subPlayer1 ? player1 : player2;
    }
    else {
      winner = card1 > card2 ? player1 : player2;
    }

    inserts = winner === player1 ? [card1, card2] : [card2, card1];
    winner.push(...inserts);

    if (existed([player1, player2], history)) {
      winner = player1;
      break;
    }

    if (shouldPrint) {
      console.log(`${winner === player1 ? 'player1' : 'player2'} wins round ${round} of game ${curGameIndex}\n`);
    }
    history.push([[...player1], [...player2]]);
  }

  return winner;
}

function solution2a(players) {
  const winner = playGameR(players, false);
  console.log(winner);
  return winner.reduce((score, card, index) => score + card * (winner.length - index), 0);
}

(function run() {
  try {
    const { file, dimension, cycles } = getArgvs();
    const content = fs.readFileSync(file, { encoding:'utf8' }).trim();
    const players = parseInput(content, dimension);

    let startTime = new Date().getTime();
    let result = solution1a([[...players[0]], [...players[1]]]);
    let endTime = new Date().getTime();
    console.log(`Solution 1.a: ${endTime - startTime} ms`);
    console.log(result);

    startTime = new Date().getTime();
    result = solution2a([[...players[0]], [...players[1]]]);
    endTime = new Date().getTime();
    console.log(`Solution 2.a: ${endTime - startTime} ms`);
    console.log(result);


  } catch (error) {
    console.error(error);
    process.exit(1);
  }

  process.exit(0);

})();
