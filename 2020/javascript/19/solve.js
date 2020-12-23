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

  // parse rules
  const ruleMap = parts[0].split('\n')
    .reduce((ruleMap, line) => {
      const ruleParts = line.split(':');
      const index = ruleParts[0];
      ruleMap.set(index, parseRule(ruleParts[1]));
      return ruleMap;
    }, new Map());

  const messages = parts[1].split('\n');
  
  return { ruleMap, messages };
}

function parseRule(ruleStr) {
  ruleStr = ruleStr.trim();
  if (ruleStr.startsWith('"')) {
    return ruleStr.charAt(1);
  } else {
    return ruleStr.split('|').map(s => s.trim().split(' '));
  }
}

function match(ruleIndex, ruleMap, message) {
  const rule = ruleMap.get(ruleIndex);
  
  if (typeof rule === 'string') {
    if (!message || message[0] !== rule) {
      return -1;
    }
    return 0;
  }

  for (const subRuleIndexList of rule) {
    let lastMatchIndex = -1;
    for (const subRuleIndex of subRuleIndexList) {
      const matchIndex = match(subRuleIndex, ruleMap, message.substring(lastMatchIndex + 1));
      if (matchIndex === -1) {
        lastMatchIndex = -1;
        break;
      }
      else {
        lastMatchIndex += matchIndex + 1;
      }
    }

    if (lastMatchIndex !== -1) {
      return lastMatchIndex;
    }
  }

  return -1;
}

// 8: 42 | 42 8
function match8(ruleMap, message) {
  let lastMatchIndex = -1, matchIndexList = [];
  while (lastMatchIndex < message.length) {
    const matchIndex = match('42', ruleMap, message.substr(lastMatchIndex + 1));
    if (matchIndex === -1) {
      break;
    } else {
      lastMatchIndex += matchIndex + 1;
      matchIndexList.push(lastMatchIndex);
    }
  }
  return matchIndexList;
}

// 11: 42 31 | 42 11 31
function match11(ruleMap, message) {
  let lastMatchIndex = 0, matchIndexList = [];

  // Base case
  let match42Index = match('42', ruleMap, message);
  if (match42Index === -1) {
    return [];
  }

  let match31Index = match('31', ruleMap, message.substr(match42Index + 1));
  if (match31Index !== -1) {
    lastMatchIndex = match42Index + match31Index + 1;
    matchIndexList.push(lastMatchIndex);
  }

  const subMatch11IndexList = match11(ruleMap, message.substr(match42Index + 1));
  for (const subMatch11Index of subMatch11IndexList) {
    lastMatchIndex = match42Index + subMatch11Index + 1;
    const match31Index = match('31', ruleMap, message.substr(lastMatchIndex + 1));
    if (match31Index !== -1) {
      matchIndexList.push(lastMatchIndex + match31Index + 1);
    }
  }

  return matchIndexList;
}

// 0: 8 11
function match0(ruleMap, message) {
  const match8IndexList = match8(ruleMap, message);
  for(const match8Index of match8IndexList) {
    const match11IndexList = match11(ruleMap, message.substr(match8Index + 1));
    for (const match11Index of match11IndexList) {
      if (match8Index + match11Index + 1 === message.length - 1) {
        return true;
      }
    }
  }
  return false;
}

function solution1a(ruleMap, messages) {
  let cnt = 0;
  for (const message of messages) {
    const matchIndex = match('0', ruleMap, message);
    if (matchIndex === message.length - 1) {
      console.log(`yes\t${matchIndex}\t${message}`);
      cnt++;
    }
  }
  return cnt;
}

function solution2a(ruleMap, messages) {
  let cnt = 0;
  for (const message of messages) {
    const match = match0(ruleMap, message);
    if (match) {
      console.log(`yes\t${message}`);
      cnt++;
    }
    else {
      console.log(`no\t${message}`);
    }
  }
  return cnt;
}


(function run() {
  try {
    const { file, dimension, cycles } = getArgvs();
    const content = fs.readFileSync(file, { encoding:'utf8' }).trim();
    const { ruleMap, messages } = parseInput(content, dimension);

    let startTime = new Date().getTime();
    let result = solution2a(ruleMap, messages);
    let endTime = new Date().getTime();
    console.log(`Solution 1.a: ${endTime - startTime} ms`);
    console.log(result);

    /*
    startTime = new Date().getTime();
    result = solution2a(lines);
    endTime = new Date().getTime();
    console.log(`Solution 2.a: ${endTime - startTime} ms`);
    console.log(result);

     */

  } catch (error) {
    console.error(error);
    process.exit(1);
  }

  process.exit(0);

})();
