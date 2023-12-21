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
  return content.split('\n').map(line => line.split(''));
}

function findSE(map) {
  let S, E;
  for (let x = 0; x < map.length; x++) {
    for (let y = 0; y < map[x].length; y++) {
      if (map[x][y] === 'S')
        S = { x, y };
      if (map[x][y] === 'E')
        E = { x, y };
    }
  }
  return { S, E };
}

function height(c) {
  if (c === 'S')
    return 'a'.codePointAt(0) - 1;
  if (c === 'E')
    return 'z'.codePointAt(0) + 1;
  return c.codePointAt(0);
}

function heightAtPoint(map, p) {
  return height(map[p.x][p.y]);
}

function getAdjacents(map, p) {
  const adjacent = [];
  if (p.x !== 0)
    adjacent.push({ x: p.x - 1, y: p.y });
  if (p.x !== map.length - 1)
    adjacent.push({ x: p.x + 1, y: p.y });
  if (p.y !== 0)
    adjacent.push({ x: p.x, y: p.y - 1 });
  if (p.y !== map[p.x].length - 1)
    adjacent.push({ x: p.x, y: p.y + 1 });
  return adjacent;
}

function samePoint(a, b) {
  return a.x === b.x && a.y === b.y;
}

/**
 * Find the shortest path from start to dest.
 *
 * @param map
 * @param start
 * @param dest
 * @param path The path taken from E to start, including start
 * @return {boolean|*[]}
 */
function shortestPath(map, start, dest, path) {
  console.log(`${map[start.x][start.y]}   ${start.x} ${start.y}`);
  console.log(`${path.map(p => map[p.x][p.y]).join('')}`);
  const hStart = height(map[start.x][start.y]);
  const accPoints =
    getAdjacents(map, start)
      .filter(p => {
        const diff = hStart - height(map[p.x][p.y]);
        return (diff <= 1) && !path.some(point => samePoint(p, point));
      } );

  if (accPoints.length === 0) {
    // dead end
    return false;
  }

  let min = Number.MAX_SAFE_INTEGER, shortest;
  for (const p of accPoints) {
    if (samePoint(p, dest)) {
      return [start, dest];
    }
    const altPath = shortestPath(map, p, dest, [...path, start]);

    if (!altPath) {
      continue;
    }

    if (altPath.length < min) {
      min = altPath.length;
      shortest = altPath;
    }
  }

  if (!shortest) {
    return false;
  }

  return [start, ...shortest];
}

function pointToKey(point) {
  return `${point.x}-${point.y}`;
}

/**
 *
 * @param map
 * @param point
 * @param knownMap
 */
function fillRegionMap(map, point, regionMap) {
  const char = map[point.x][point.y];
  const adjPoints = getAdjacents(map, point)
    .filter(p => map[p.x][p.y] === char && !regionMap.has(pointToKey(p)));
  regionMap.set(pointToKey(point), point);
  for (const p of adjPoints) {
    fillRegionMap(map, p, regionMap);
  }
}

function shortestPathInRegion(map, regionMap, start, end) {
  return shortestPathInRegionImpl(map, regionMap, end, start, []).slice(1).reverse();
}

/**
 * Shortest path from start to end within the points in regionMap. The start point is not
 * included in the regionMap, but end must be in regionMap
 *
 * @param map
 * @param start
 * @param end
 * @param regionMap
 */
function shortestPathInRegionImpl(map, regionMap, start, end, path) {
  if (!regionMap.has(pointToKey(end))) {
    throw `shortestPathInRegion: end point (${printPoint(map, end)}) is expected to be in the regionMap`;
  }

  const regionChar = map[end.x][end.y];
  const adjs = getAdjacents(map, start)
    .filter(p =>
      map[p.x][p.y] === regionChar && !path.some(a => samePoint(a, p)));

  if (adjs.length === 0) {
    // dead end
    return false;
  }

  let min = Number.MAX_SAFE_INTEGER, shortest;
  for (const adjP of adjs) {
    if (samePoint(adjP, end)) {
      return [start, end];
    }

    const altPath = shortestPathInRegionImpl(map, regionMap, adjP, end, [...path, start]);

    if (!altPath) {
      continue;
    }

    if (altPath.length < min) {
      min = altPath.length;
      shortest = altPath;
    }
  }

  if (!shortest) {
    return false;
  }

  return [start, ...shortest];
}

function printPoint(map, point) {
  return `${map[point.x][point.y]}: ${point.x} ${point.y}`;
}

const regionReg = new Map();
function getRegionInfoByPoint(map, point) {
  const char = map[point.x][point.y];
  if (!regionReg.has(char)) {
    regionReg.set(char, []);
  }
  const regionInfos = regionReg.get(char);
  let regionInfo = regionInfos.find(regionInfo => regionInfo.regionMap.has(pointToKey(point)));
  if (!regionInfo) {
    const regionMap = new Map();
    fillRegionMap(map, point, regionMap);
    const regionInfo = {
      regionMap,
      isDeadEnd: false
    };
    regionInfos.push(regionInfo);
    return regionInfo;
  }
  else {
    return regionInfo;
  }
}


const pathCache = new Map();
function shortest2(map, start, dest, path) {
  let startChar = map[start.x][start.y];
  console.log(`${startChar} - ${start.x + 1} ${start.y + 1}`);

  /*
  const regionInfo = getRegionInfoByPoint(map, start);
  if (regionInfo.isDeadEnd) {
    return false;
  }
  const regionMap = regionInfo.regionMap;

   */
  const regionMap = new Map();
  fillRegionMap(map, start, regionMap);

  const lowBorderMap = [...regionMap.values()]
    .reduce((lowMap, p) => {
      const adjLowers = getAdjacents(map, p)
        .filter(adj => {
            const diff = heightAtPoint(map, p) - heightAtPoint(map, adj);
            return diff <= 1 && !path.some(point => samePoint(point, adj)) && !samePoint(start, adj);
          }
        );
      adjLowers.forEach(p => lowMap.set(pointToKey(p), p));
      return lowMap;
    }, new Map());

  /*
  if (lowBorderMap.size === 0) {
    regionInfo.isDeadEnd = true;
    return false;
  }
   */

  let min = Number.MAX_SAFE_INTEGER, shortest;
  for (const lowBorderPt of lowBorderMap.values()) {
    const minPathInRegion = shortestPathInRegion(map, regionMap, start, lowBorderPt);

    if (samePoint(lowBorderPt, dest)) {
      // dest is on the border, directly return shortest path from start to dest
      return minPathInRegion;
    }

    let altPath = shortest2(map, lowBorderPt, dest, [...path, ...minPathInRegion]);

    if (!altPath) {
      continue;
    }

    const wholePath = [...minPathInRegion, ...altPath];
    if (wholePath.length < min) {
      min = wholePath.length;
      shortest = wholePath;
    }
  }

  if (!shortest) {
    return false;
  }

  return shortest;
}

function solution1(map) {
  const { S, E } = findSE(map);

  /*
  const end = {x:17, y:71};
  const start = {x:22, y:76}

  // const shortest = shortestPathRegion(map, t, S, []);
  let regionMap = new Map();
  fillRegionMap(map, start, regionMap);
  const shortest = shortestPathInRegion(map, regionMap, start, end, []);
  //for(let i = shortest.length - 1; i >=0; i--) {

   */

  const shortest = shortest2(map, E, S, []);
  for(let i = 0; i < shortest.length; i++) {
    console.log(shortest[i]);
    console.log(map[shortest[i].x][shortest[i].y]);
  }
  return shortest.length;
}

function solution2() {
  return false;
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
    answer = solution2();
    endTime = new Date().getTime();
    console.log(`Solution 2: ${endTime - startTime} ms`);
    console.log(answer);

  } catch (error) {
    console.error(error);
    process.exit(1);
  }

  process.exit(0);

})();
