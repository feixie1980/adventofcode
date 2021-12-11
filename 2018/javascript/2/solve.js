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
  return content.split('\n');
}

function solution1a(ids) {
  let twosCnt = 0, threesCnt = 0;
  ids.forEach(id => {
    let cntMap = new Map();
    id.split('').forEach(letter => {
      if (!cntMap.has(letter)) {
        cntMap.set(letter, 0);
      }
      const cnt = cntMap.get(letter);
      cntMap.set(letter, cnt + 1);
    });

    if (!![...cntMap.entries()].find(([key, value]) => value === 2)) {
      twosCnt++;
    }

    if (!![...cntMap.entries()].find(([key, value]) => value === 3)) {
      threesCnt++;
    }
  });

  return twosCnt * threesCnt;
}

function insertToMatchMap(matchMap, position, letter, idIndex) {
  if (!matchMap.has(position)) {
    matchMap.set(position, new Map());
  }
  let letterMap = matchMap.get(position);
  if (!letterMap.has(letter)) {
    letterMap.set(letter, new Set());
  }
  letterMap.get(letter).add(idIndex);
}

function findSimilarIdIndex(matchingIndexesList, length) {
  let cntMap = new Map();
  for (const matchingIndexes of matchingIndexesList) {
    for (const idIndex of matchingIndexes) {
      if (!cntMap.has(idIndex))
        cntMap.set(idIndex, 0);
      const cnt = cntMap.get(idIndex);
      if (cnt === length - 2) {
        // found!
        return idIndex;
      }
      cntMap.set(idIndex, cnt + 1);
    }
  }

  return null;
}

function solution2a(ids) {
  let matchMap = new Map();
  for (let i = 0; i < ids.length; i++) {
    const id = ids[i];
    let matchingIndexesList = [];

    [...id].forEach((letter, position) => {
      const idIndexSet = matchMap.get(position) && matchMap.get(position).get(letter);
      if (!idIndexSet) {
        matchingIndexesList.push([]);
      } else {
        matchingIndexesList.push([...idIndexSet]);
      }
      insertToMatchMap(matchMap, position, letter, i);
    });

    const similarIdIndex = findSimilarIdIndex(matchingIndexesList, id.length);
    if (!!similarIdIndex) {
      const diffPosition = matchingIndexesList.findIndex(matchingIndexes =>  !matchingIndexes.includes(similarIdIndex));
      return id.substring(0, diffPosition) + id.substring(diffPosition + 1);
    }
  }

  return null;
}

function solution2b(ids) {
  for(const id of ids) {
    for(const id2 of ids) {
      if (id === id2)
        continue;

      let matches = [];
      for(let i = 0; i < id.length; i++) {
        matches.push(id.charAt(i) == id2.charAt(i));
      }

      if (matches.filter(m => m).length === id.length -1) {
        const diffPosition = matches.indexOf(false);
        return id.substring(0, diffPosition) + id.substring(diffPosition + 1);
      }
    }
  }

  return null;
}

(function run() {
  try {
    const { file } = getArgvs();
    const content = fs.readFileSync(file, { encoding:'utf8' }).trim();
    const ids = parseInput(content);

    let startTime = new Date().getTime();
    let result = solution1a(ids);
    let endTime = new Date().getTime();
    console.log(`Solution 1.a: ${endTime - startTime} ms`);
    console.log(result);

    startTime = new Date().getTime();
    result = solution2a(ids);
    endTime = new Date().getTime();
    console.log(`Solution 2.a: ${endTime - startTime} ms`);
    console.log(result);

    startTime = new Date().getTime();
    result = solution2b(ids);
    endTime = new Date().getTime();
    console.log(`Solution 2.b: ${endTime - startTime} ms`);
    console.log(result);

  } catch (error) {
    console.error(error);
    process.exit(1);
  }

  process.exit(0);

})();
