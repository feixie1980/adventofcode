import { readFileSync } from 'fs';
import Yargs from "yargs";
import {
  connectMapping,
  findConnectedPositions,
  findLoopRoute,
  findStartPos,
  getNeighbours, isInside, isSamePos,
  printMap,
  range
} from "./utils.js";

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
  return content.split('\n').map(line => line.split(''));
}

function solution1(map) {
  const start = findStartPos(map);
  const route = findLoopRoute(map, start);
  return  Math.floor(route.length / 2);
}

function toKey(pos) {
  return `${pos[0]},${pos[1]}`;
}

function isUncategorized(map, borderSet, n) {
  return !borderSet.has(toKey(n))
    && map[n[0]][n[1]] !== 'O'
    && map[n[0]][n[1]] !== '*';
}

function findCluster(map, borderSet, startPoint) {
  const visited = new Map();
  const queue = [startPoint];
  while(queue.length !== 0) {
    const curPoint = queue.pop();
    visited.set(toKey(curPoint), curPoint);
    let neighbours = getNeighbours(curPoint);
    neighbours = neighbours.filter(n =>
      n[0] >= 0 && n[0] < map.length
      && n[1] >= 0 && n[1] < map[n[0]].length
    );
    neighbours = neighbours.filter(n =>
      !visited.has(toKey(n))
      && !queue.some(p => isSamePos(p, n))
      && isUncategorized(map, borderSet, n)
    );
    queue.push(...neighbours);
  }
  return [...visited.values()];
}

function updateMapWithCluster(map, cluster, label) {
  cluster.forEach(p => map[p[0]][p[1]] = label);
}

function fillOutsidePointsFromPoint(map, borderSet, p) {
  if (!isUncategorized(map, borderSet, p)) {
    return;
  }

  const cluster = findCluster(map, borderSet, p);
  updateMapWithCluster(map, cluster, 'O');
}

function fillOutsidePointsFromBorders(map, borderSet) {
  const xLength = map.length, yLength = map[0].length;

  range(0, xLength - 1).forEach(x => {
    fillOutsidePointsFromPoint(map, borderSet, [x, 0]);
    fillOutsidePointsFromPoint(map, borderSet, [x, yLength - 1]);
  });

  range(0, yLength - 1).forEach(y => {
    fillOutsidePointsFromPoint(map, borderSet, [0, y]);
    fillOutsidePointsFromPoint(map, borderSet, [xLength - 1, y]);
  });

}

function solution2(map) {
  const start = findStartPos(map);
  const loopRoute = findLoopRoute(map, start);
  const loopPointSet = loopRoute.reduce((s, p) => s.add(toKey(p)), new Set());
  let insideCount = 0;

  fillOutsidePointsFromBorders(map, loopPointSet);
  // console.log(printMap(map));
  // console.log('\n\n\n');

  for (let i = 0; i < map.length; i++) {
    for (let j = 0; j < map[i].length; j++) {
      const p = [i, j];
      if (!isUncategorized(map, loopPointSet, p)) {
        continue;
      }
      const cluster = findCluster(map, loopPointSet, p);
      if (cluster.length === 0) {
        continue;
      }

      const inside = isInside(map, loopRoute, cluster[0]);
      if (inside) {
        updateMapWithCluster(map, cluster, inside ? '*' : 'O');
        insideCount += cluster.length;
        // console.log(printMap(map));
        // console.log('\n\n\n');
      }
    }
  }

  // console.log(printMap(map));

  return insideCount;
}

(function run() {
  try {
    const { file } = getArgvs();
    const content = readFileSync(file, { encoding:'utf8' }).trim();
    const map = parseInput(content);

    let startTime = new Date().getTime();
    let answer = solution1(map);
    let endTime = new Date().getTime();
    console.log(`Solution 1: ${endTime - startTime} ms`);
    console.log(answer);

    startTime = new Date().getTime();
    answer = solution2(map);
    endTime = new Date().getTime();
    console.log(`Solution 2: ${endTime - startTime} ms`);
    console.log(answer);

  } catch (error) {
    console.error(error);
    process.exit(1);
  }

  process.exit(0);

})();
