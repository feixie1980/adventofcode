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
  const patterns = content.split('\n\n').map(pattern => {
    return {
      horizontal: pattern.split('\n')
    };
  })

  patterns.forEach(pattern => {
    const vertical = [];
    for(let i = 0; i < pattern.horizontal[0].length; i++) {
      vertical.push(pattern.horizontal.map(line => line[i]).join(''));
    }
    pattern.vertical = vertical;
  });

  return patterns;
}

function isMirrorLine(lines, index) {
  for(let i = index; i >= 0; i--) {
    let upIndex = 2 * index - i + 1;
    if (upIndex >= lines.length) {
      break;
    }
    if (lines[i] !== lines[upIndex]) {
      return false;
    }
  }
  return true;
}

function findMirrorLine(lines) {
  const candidateIndexes = [];
  lines.forEach((line, i) => {
    if (i !== lines.length - 1 && line === lines[i + 1]) {
      candidateIndexes.push(i);
    }
  });

  for(let candidateIndex of candidateIndexes) {
    if (isMirrorLine(lines, candidateIndex)) {
      return candidateIndex;
    }
  }

  return -1;
}

function findMirrorIndex(pattern) {
  return {
    hIndex: findMirrorLine(pattern.horizontal),
    vIndex: findMirrorLine(pattern.vertical)
  };
}

function findMirrorLines(lines) {
  const candidateIndexes = [];
  lines.forEach((line, i) => {
    if (i !== lines.length - 1 && line === lines[i + 1]) {
      candidateIndexes.push(i);
    }
  });

  return candidateIndexes.filter(candidateIndex => isMirrorLine(lines, candidateIndex));
}

function findMirrorIndexList(pattern) {
  return {
    hIndexList: findMirrorLines(pattern.horizontal),
    vIndexList: findMirrorLines(pattern.vertical)
  };
}

function solution1(patterns) {
  let hScore = 0, vScore = 0;
  for(let pattern of patterns) {
    const { vIndex, hIndex } = findMirrorIndex(pattern);
    if (hIndex !== -1) {
      hScore += hIndex + 1;
    } else if (vIndex !== -1) {
      vScore += vIndex + 1;
    }
  }
  return 100 * hScore + vScore;
}

function smudge(pattern, [i, j]) {
  const newHorizontal = [...pattern.horizontal];
  const newHArray = newHorizontal[i].split('');
  newHArray[j] = newHArray[j] === '#' ? '.' : '#';
  newHorizontal[i] = newHArray.join('');

  const newVertical = [...pattern.vertical];
  const newVArray = newVertical[j].split('');
  newVArray[i] = newVArray[i] === '#' ? '.' : '#';
  newVertical[j] = newVArray.join('');

  return {
    horizontal: newHorizontal,
    vertical: newVertical
  }
}

function findSmugMirrorIndex(pattern) {
  // console.log(pattern.vertical);
  const { hIndex: oldHIndex, vIndex: oldVIndex } = findMirrorIndex(pattern);

  for(let i = 0; i < pattern.horizontal.length; i++) {
    for(let j = 0; j < pattern.horizontal[i].length; j++) {
      const newPattern = smudge(pattern, [i, j]);
      const { hIndexList, vIndexList } = findMirrorIndexList(newPattern);
      const newHIndex = hIndexList.find(hIndex => hIndex !== -1 && hIndex !== oldHIndex);
      const newVIndex = vIndexList.find(vIndex => vIndex !== -1 && vIndex !== oldVIndex);

      if (newHIndex !== undefined) {
        return { index: newHIndex, isVertical: false };
      }
      if (newVIndex !== undefined) {
        return { index: newVIndex, isVertical: true };
      }
    }
  }

  throw `no new mirror line found`;
}

function solution2(patterns) {
  let hScore = 0, vScore = 0;
  for(let pattern of patterns) {
    const { index, isVertical } = findSmugMirrorIndex(pattern);
    if (isVertical) {
      vScore += index + 1;
    } else {
      hScore += index + 1;
    }
  }
  return 100 * hScore + vScore;
}

(function run() {
  try {
    const { file } = getArgvs();
    const content = readFileSync(file, { encoding:'utf8' }).trim();
    const patterns = parseInput(content);

    let startTime = new Date().getTime();
    let answer = solution1(patterns);
    let endTime = new Date().getTime();
    console.log(`Solution 1: ${endTime - startTime} ms`);
    console.log(answer);

    startTime = new Date().getTime();
    answer = solution2(patterns);
    endTime = new Date().getTime();
    console.log(`Solution 2: ${endTime - startTime} ms`);
    console.log(answer);

  } catch (error) {
    console.error(error);
    process.exit(1);
  }

  process.exit(0);

})();
