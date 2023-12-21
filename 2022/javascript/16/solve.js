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
  const valveMap = new Map();
  content.split('\n').map(line => {
    line.replace(/(Valve\s)([A-Z]+)(\shas\sflow\srate=)([0-9]+)(;\stunnels\slead\sto\svalves\s)(.+)/,
        (whole, l1, name, l2, rateStr, l3, tunnelsStr) => {
        valveMap.set(name, {
          name, rate: parseInt(rateStr), on: name === 'AA',
          tunnelMap: tunnelsStr.split(',')
            .map(s => { return { valveName:s.trim(), cost:1 }} )
            .reduce((tMap, {valveName, cost}) => {
              tMap.set(valveName, cost);
              return tMap;
            }, new Map())
        });
      });
  });
  return valveMap;
}

/**
 * Remove valves with rate=0, and instead create tunnels with different cost
 *
 * @param valveMap
 */
function compressValveMap(valveMap) {
  const zeroValves = [...valveMap.values()]
    .filter(valve => valve.rate === 0 && valve.name !== 'AA');
  console.log(zeroValves);

  // example: Valve FF has flow rate=0; tunnels lead to valves EE, GG
  for(const zeroValve of zeroValves) {
    for (const targetValveName of zeroValve.tunnelMap.keys()) {
      const targetValve = valveMap.get(targetValveName);
      const otherTargetValves = [...zeroValve.tunnelMap.keys()]
        .filter(n => n !== targetValveName)
        .map(n => valveMap.get(n));
      for (const otherTargetValve  of otherTargetValves) {
        const newCost = zeroValve.tunnelMap.get(targetValve.name)
          + zeroValve.tunnelMap.get(otherTargetValve.name);
        if (!otherTargetValve.tunnelMap.has(targetValve.name)) {
          // create a new virtual tunnel with sum of costs
          otherTargetValve.tunnelMap.set(targetValve.name, newCost);
        }
        else {
          const existedTunnelCost = otherTargetValve.tunnelMap.get(targetValve.name);
          if (existedTunnelCost > newCost) {
            // it is shorter to go through the current zeroValve
            otherTargetValve.tunnelMap.set(targetValve.name, newCost);
          }
        }
      }
      targetValve.tunnelMap.delete(zeroValve.name);
    }

    valveMap.delete(zeroValve.name);
  }
}

function scoreForRounds(valveMap, numRounds) {
  return [...valveMap.values()].reduce((sum, valve) => sum + valve.on ? valve.rate * numRounds : 0, 0);
}

function valvePairToKey(v1, v2) {
  return `${v1.name}-${v2.name}`;
}

function getPathCost(valveMap, path) {
  if (path.length <= 1) {
    return 0;
  }

  // check if cost is already calculated
  const first = path[0], second = path[1];
  if (!first.tunnelMap.has(second.name)) {
    throw `${first.name} is not connected to ${second.name}`;
  }
  const cost = first.tunnelMap.get(second.name);
  return cost + getPathCost(valveMap, path.slice(1));
}

function findMinCostPath(from, to, valveMap, path, minCostMap) {
  if (from === to) {
    return [to];
  }

  const tunnelValveNames = [...from.tunnelMap.keys()].filter(valveName => !path.some(v => v.name === valveName));
  let minCost = Number.MAX_SAFE_INTEGER, minPath = null;
  for(const tunnelValveName of tunnelValveNames) {
    const adjValve = valveMap.get(tunnelValveName);
    const adjCost = from.tunnelMap.get(tunnelValveName);
    const subPath = findMinCostPath(adjValve, to, valveMap, [...path, from], minCostMap);
    if (!subPath) {
      continue;
    }
    const subPathCost = getPathCost(valveMap, subPath);
    const totalCost = adjCost + subPathCost;

    if (totalCost < minCost) {
      minCost = totalCost;
      minPath = [from, ...subPath];
    }
  }

  if (minPath) {
    minCostMap.set(valvePairToKey(from, to), minCost);
    minCostMap.set(valvePairToKey(to, from), minCost);
  }

  return minPath;
}

/**
 * return Map {
 *   'v1-v2': dist,
 *   'v2-v1': dist
 * }
 * @param valveMap
 */
function genMinCostMap(valveMap) {
  const minCostMap = new Map();
  for (const from of valveMap.values()) {
    for (const to of valveMap.values()) {
      if (from === to) {
        continue;
      }
      if (!minCostMap.has(valvePairToKey(from, to))) {
        findMinCostPath(from, to, valveMap, [], minCostMap);
      }
    }
  }
  return minCostMap;
}

function sortOffValves(from, offValves, minCostMap, timeRemaining) {
  const valveScores = [];

  for(const offValve of offValves) {
    const minCost = minCostMap.get(valvePairToKey(from, offValve));
    const productionTime = timeRemaining - minCost - 1;

    let score = 0;
    if (productionTime > 0) {
      score = productionTime * offValve.rate;
    }

    valveScores.push({valve: offValve, score});
  }
  valveScores.sort((a, b) => b.score - a.score);
  return valveScores.map(e => e.valve);
}

function cloneValveMap(iMap) {
  const vMap = new Map();
  for (const key of iMap.keys()) {
    vMap.set(key, Object.assign({}, iMap.get(key)));
  }
  return vMap;
}

function simulate(curValve, valveMap, minCostMap, timeRemaining) {
  const clonedValveMap = cloneValveMap(valveMap);
  const offValves = [...clonedValveMap.values()].filter(v => !v.on);
  const sortedOffValves = sortOffValves(curValve, offValves, minCostMap, timeRemaining);
  for (const nextValve of sortedOffValves) {
    simulate(nextValve, clonedValveMap, )
  }
}

function solution1(valveMap) {
  compressValveMap(valveMap);
  const minCostMap = genMinCostMap(valveMap);

  let curValve = valveMap.get('AA'), timeRemaining = 30;
  let offValves = [...valveMap.values()].filter(v => !v.on);
  offValves = sortOffValves(curValve, offValves, minCostMap, timeRemaining);
  let totalScore = 0;

  /*
  while (offValves.length !== 0 || timeRemaining >= 0) {
    const nextValve = getNextValveToOpen(curValve, offValves, minCostMap, timeRemaining);
    if (!nextValve) {
      totalScore += scoreForRounds(valveMap, timeRemaining);
      break;
    }
    let timeElapsed = minCostMap.get(valvePairToKey(curValve, nextValve)) + 1
    totalScore += scoreForRounds(valveMap, timeElapsed);
    nextValve.on = true;
    timeRemaining = timeRemaining - timeElapsed;
    curValve = nextValve;
  }

   */

  return totalScore;
}

function solution2(valveMap) {
  return false;
}

(function run() {
  try {
    const { file } = getArgvs();
    const content = readFileSync(file, { encoding:'utf8' }).trim();
    const valveMap = parseInput(content);

    let startTime = new Date().getTime();
    let answer = solution1(valveMap);
    let endTime = new Date().getTime();
    console.log(`Solution 1: ${endTime - startTime} ms`);
    console.log(answer);

    startTime = new Date().getTime();
    answer = solution2(valveMap);
    endTime = new Date().getTime();
    console.log(`Solution 2: ${endTime - startTime} ms`);
    console.log(answer);

  } catch (error) {
    console.error(error);
    process.exit(1);
  }

  process.exit(0);

})();
