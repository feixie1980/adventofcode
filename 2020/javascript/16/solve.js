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

function parseInput(content) {
  const parts = content.split('\n\n');
  const rules = parts[0].split('\n')
    .map(line => {
      let name, range1, range2;
      line.replace(/(.+)(:\s*)([0-9]+-[0-9]+)(\sor\s)([0-9]+-[0-9]+)/g,
        (match, ruleName, p1, r1, p2, r2) => {
          name = ruleName;
          range1 = r1.split('-').map(s => parseInt(s));
          range2 = r2.split('-').map(s => parseInt(s));
        });
      return { name, range1, range2, possibleIndexes: new Set(), impossibleIndexes: new Set() };
    });
  const myTicket = parts[1].split('\n')[1].split(',').map(s => parseInt(s));
  const nearTickets = parts[2].split('\n').slice(1)
    .map(line => line.split(',').map(s => parseInt(s)));
  return { rules, myTicket, nearTickets };
}

function isValidNumber(number, rules) {
  for(const rule of rules) {
    if (number >= rule.range1[0] && number <= rule.range1[1] ||
        number >= rule.range2[0] && number <= rule.range2[1])
      return true;
  }
  return false;
}

function isValidNumberForRule(number, rule) {
  return number >= rule.range1[0] && number <= rule.range1[1] || number >= rule.range2[0] && number <= rule.range2[1];
}

function solution1a(rules, myTicket, nearTickets) {
  let invalidNumbers = [], validTickets = [];
  for(const ticket of [myTicket, ...nearTickets]) {
    let isValidTicket = true;
    for (const number of ticket) {
      if (!isValidNumber(number, rules)) {
        invalidNumbers.push(number);
        isValidTicket = false;
      }
    }
    if (isValidTicket) {
      validTickets.push(ticket);
    }
  }

  return {
    invalidSum: invalidNumbers.reduce((sum, num) => sum + num, 0),
    validTickets
  };
}

function computePossibilities(rules, validTickets) {
  for (const ticket of validTickets) {
    for (let i = 0; i < ticket.length; i++) {
      for (const rule of rules) {
        const { possibleIndexes, impossibleIndexes } = rule;
        if (impossibleIndexes.has(i)) {
          continue;
        }
        if (isValidNumberForRule(ticket[i], rule)) {
          possibleIndexes.add(i);
        } else {
          possibleIndexes.delete(i);
          impossibleIndexes.add(i);
        }
      }
    }
  }
}

function consolidatePossibilities(rules, indexCount) {
  for(let i = 0; i < indexCount; i++) {
    const rulesWithOneP = rules.filter(rule => rule.possibleIndexes.size === 1);
    if (rulesWithOneP.length === rules.length)
      return;
    rules.forEach(rule => {
      if (rulesWithOneP.includes(rule))
        return;
      for(const ruleOneP of rulesWithOneP) {
        const indexToDelete = [...ruleOneP.possibleIndexes.values()][0];
        rule.possibleIndexes.delete(indexToDelete)
      }
    });
  }
}

function solution2a(rules, myTicket, validTickets) {
  computePossibilities(rules, validTickets);
  consolidatePossibilities(rules, myTicket.length);

  console.log(rules);
  return rules.filter(rule => rule.name.indexOf('departure') === 0)
    .reduce((product, rule) => {
      const index = [...rule.possibleIndexes.values()][0];
      console.log(`${rule.name}\t index: ${index}\t value: ${myTicket[index]}`);
      return product * myTicket[index];
    }, 1);
}

(function run() {
  try {
    const { file } = getArgvs();
    const content = fs.readFileSync(file, { encoding:'utf8' }).trim();
    const { rules, myTicket, nearTickets } = parseInput(content);

    let startTime = new Date().getTime();
    let { invalidSum, validTickets } = solution1a(rules, myTicket, nearTickets);
    let endTime = new Date().getTime();
    console.log(`Solution 1.a: ${endTime - startTime} ms`);
    console.log(invalidSum);

    startTime = new Date().getTime();
    let result = solution2a(rules, myTicket, validTickets);
    endTime = new Date().getTime();
    console.log(`Solution 2.a: ${endTime - startTime} ms`);
    console.log(` answer is: ${result}`);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }

  process.exit(0);

})();
