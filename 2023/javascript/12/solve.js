import { readFileSync } from 'fs';
import Yargs from "yargs";
import {
  findArrangements, findArrangementsBrute,
  genReplacedSprings,
  matchConfiguration,
  permuSprings,
  replaceSprings,
  solveUnfolded, solveUnfolded_mem
} from "./utils.js";
import { range } from "../10/utils.js";

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
  return content.split('\n').map(line => {
    return {
      springs: line.split(' ')[0].split(''),
      configuration: line.split(' ')[1].split(',').map(s => parseInt(s))
    }
  });
}

function brute(records) {
  let total = 0;
  records.forEach(({ springs, configuration }, i) => {
    console.log(`${i}: ${springs.join('')}`)
    const arrs = findArrangementsBrute(springs, configuration);
    const matchCount = arrs.length;
    total += matchCount;
  });
  return total;
}

function sane(records) {
  let total = 0;
  records.forEach(({ springs, configuration }, i) => {
    console.log(`${i}: ${springs.join('')}`)
    const arr = findArrangements(springs, configuration);
    console.log(`${arr.length}`)
    total += arr.length;
  });
  return total;
}



function findMatches(springs, configuration, unitLength, cache) {
  const minWindow = configuration.reduce((sum, c) => sum + c + 1, 0);

  for(let start = 0; start < unitLength + 1; start++) {
    let hasCount = false;
    for (let window = minWindow; window <= unitLength * 3; window++) {
      try {
        const s = springs.slice(start, start + window);
        const key = s.join('');

        if (!cache.has(key)) {
          const arr = findArrangements(s, configuration);
          cache.set(key, arr.length);
        }
        const l = cache.get(key);
        if (l === 0 && hasCount) {
          break;
        }

        if (l !== 0) {
          hasCount = true;
          console.log(`${l}\tstart:${start}, window:${window}`);
        }
      } catch (e) {
        continue;
      }
    }
  }
}

function fit(record) {
  const { springs, configuration } = record;
  const unfolded = unfold(record, 5);
  const { springs: unfoldedSprings, configurations: unfoldedConfs } = unfolded;
  const minWindow = configuration.reduce((sum, c) => sum + c + 1, 0);

  const cache = new Map();
  for(let start = 0; start < springs.length + 1; start++) {
    let hasCount = false;
    for(let window = minWindow; window <= springs.length * 3; window++) {
      try {
        const s = unfoldedSprings.slice(start, start + window);
        const key = s.join('');

        if (!cache.has(key)) {
          const arr = findArrangements(s, configuration);
          cache.set(key, arr.length);
        }
        const l = cache.get(key);
        if (l === 0 && hasCount) {
          break;
        }

        if (l !== 0) {
          hasCount = true;
          console.log(`${l}\tstart:${start}, window:${window}`);
        }
      } catch(e) {
        continue;
      }
    }
  }
}

function test(records) {
  fit(records[1]);
}

function test2(records) {
  const record = records[1];
  const { springs, configuration } = record;
  const unfolded = unfold(record, 5);
  const unfoldedSpring = unfolded.springs;

  console.log(`shrink front:`)
  for(let i = 0; i < 10; i++) {
    try {
      const s = unfoldedSpring.slice(0, springs.length - i);
      const arr = findArrangements(s, configuration);
      if (arr.length === 0)
        break;
      console.log(`${arr.length}\t${i}: ${s}`)
    } catch(e) {
     break;
    }
  }

  console.log(`shrink back:`)
  for(let i = 0; i < 10; i++) {
    try {
      const s = springs.slice(i);
      const arr = findArrangements(s, configuration);
      if (arr.length === 0)
        break;
      console.log(`${arr.length}\t${i}: ${s}`)
    }
    catch(e) {
      break;
    }
  }
}

function solution1(records) {
  return brute(records);
  // return sane(records);
}

function unfold(record, times) {
  return {
    springs: range(0, times - 1).map(_ => record.springs.join('')).join('?').split(('')),
    configuration: range(0, times - 1).reduce((c, _) => [...c, ...record.configuration], []),
    configurations: range(0, times - 1).reduce((c, _) => [...c, record.configuration], [])
  }

  return {
    springs: [...record.springs, '?', ...record.springs, '?', ...record.springs, '?', ...record.springs, '?', ...record.springs],
    configuration: [...record.configuration, ...record.configuration, ...record.configuration, ...record.configuration, ...record.configuration],
    configurations: [record.configuration, record.configuration, record.configuration, record.configuration, record.configuration]
  }
}

function solution2(records) {
  const unfoldedRecords = records.map(record => unfold(record, 5));
  let total = 0;
  let cacheMap = new Map();

  //for(let i = 0; i < 1; i++) {
  for(let i = 0; i < unfoldedRecords.length; i++) {
    const { springs, configurations }  = unfoldedRecords[i];
    console.log(`${i}: ${springs.join('')}\t${configurations.join(',')}`);
    const start = new Date().getTime();
    const arrangements = solveUnfolded([...springs], configurations, records[i].springs.length * 2 + 2, new Map(), true);
    const end = new Date().getTime();
    console.log(`count: ${arrangements.length}, time:${end - start}ms`);
    total += arrangements.length;
  }

  return total;
}

(function run() {
  try {
    const { file } = getArgvs();
    const content = readFileSync(file, { encoding:'utf8' }).trim();
    const records = parseInput(content);

    let startTime = new Date().getTime();
    let answer = true; //solution1(records);
    let endTime = new Date().getTime();
    console.log(`Solution 1: ${endTime - startTime} ms`);
    console.log(answer);

    startTime = new Date().getTime();
    answer = solution2(records);
    endTime = new Date().getTime();
    console.log(`Solution 2: ${endTime - startTime} ms`);
    console.log(answer);

  } catch (error) {
    console.error(error);
    process.exit(1);
  }

  process.exit(0);

})();
