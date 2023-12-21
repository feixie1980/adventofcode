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
  return null;
}

function solution1(input) {
  // Split the input into individual cards
  const cards = input.split('\n');

  let totalPoints = 0;

  cards.forEach(card => {
    // Remove the card label (e.g., "Card 1:") and then split into winning numbers and numbers you have
    const [winningNumbers, yourNumbers] = card.split(': ')[1].split(' | ').map(group =>
      group.split(' ').filter(n => n !== '').map(Number)); // Filtering out empty strings

    // Calculate points for this card
    let cardPoints = 0;
    yourNumbers.forEach(number => {
      if (winningNumbers.includes(number)) {
        cardPoints = cardPoints === 0 ? 1 : cardPoints * 2;
      }
    });

    // Add card points to total
    totalPoints += cardPoints;
  });

  return totalPoints;
}

function solution2(input) {
  const cards = input.split('\n').map(card => {
    const [winningNumbers, yourNumbers] = card.split(': ')[1].split(' | ').map(group =>
      group.split(' ').filter(n => n !== '').map(Number));
    return { winningNumbers, yourNumbers };
  });

  let cardCounts = new Array(cards.length).fill(1); // Initialize array with 1 for each original card

  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    const matches = card.yourNumbers.filter(number => card.winningNumbers.includes(number)).length;

    // Add copies for subsequent cards based on the number of matches
    for (let j = 1; j <= matches; j++) {
      const nextCardIndex = i + j;
      if (nextCardIndex < cards.length) {
        cardCounts[nextCardIndex] += cardCounts[i];
      }
    }
  }

  return cardCounts.reduce((total, count) => total + count, 0);
}


(function run() {
  try {
    const { file } = getArgvs();
    const content = readFileSync(file, { encoding:'utf8' }).trim();

    let startTime = new Date().getTime();
    let answer = solution1(content);
    let endTime = new Date().getTime();
    console.log(`Solution 1: ${endTime - startTime} ms`);
    console.log(answer);

    startTime = new Date().getTime();
    answer = solution2(content);
    endTime = new Date().getTime();
    console.log(`Solution 2: ${endTime - startTime} ms`);
    console.log(answer);

  } catch (error) {
    console.error(error);
    process.exit(1);
  }

  process.exit(0);

})();
