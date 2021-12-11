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
  return content.split('\n').map(line => line.split('').map(d => parseInt(d)));
}

function getNeighbors(heightmap, x, y) {
  let neighbours = [];
  if (x !== 0)
    neighbours.push({y, x: x-1});
  if (x !== heightmap[y].length - 1)
    neighbours.push({y, x: x+1});
  if (y !== 0)
    neighbours.push({y: y-1, x});
  if (y !== heightmap.length - 1)
    neighbours.push({y: y+1, x});
  return neighbours;
}

function findLowPoints(heightmap) {
  let lowPoints = [];
  for (let y = 0; y < heightmap.length; y++) {
    for (let x = 0; x < heightmap[y].length; x++) {
      const value = heightmap[y][x];
      const neighbor = getNeighbors(heightmap, x, y);
      if (value < Math.min(...neighbor.map(p => heightmap[p.y][p.x]))) {
        lowPoints.push({x, y});
      }
    }
  }
  return lowPoints;
}

function solution1(heightmap) {
  const lowPoints = findLowPoints(heightmap);
  return lowPoints.reduce((sum, p) => sum + heightmap[p.y][p.x] + 1, 0);
}

function findBasin(lowPoint, heightmap, exploremap) {
  let basinPoints = [lowPoint];
  let frontierPoints = [lowPoint];
  exploremap[lowPoint.y][lowPoint.x] = true;

  while (frontierPoints.length != 0) {
    let newFrontierPoints = [];
    for (const frontierPoint of frontierPoints) {
      const fpValue = heightmap[frontierPoint.y][frontierPoint.x];
      const neighbors = getNeighbors(heightmap, frontierPoint.x, frontierPoint.y);
      //console.log(`  frontier point: ${JSON.stringify(frontierPoint)}`)
      //console.log(`  neighbors: ${JSON.stringify(neighbors)}`)

      // find unexplored neighbors that are not 9 or is larger than itself
      let newBasinPoints = neighbors.filter(p => !exploremap[p.y][p.x] && heightmap[p.y][p.x] >= fpValue && heightmap[p.y][p.x] !== 9);

      // mark these points as explored
      newBasinPoints.forEach(p => exploremap[p.y][p.x] = true);

      newFrontierPoints = [...newFrontierPoints, ...newBasinPoints];
      //console.log(`  new frontier points: ${JSON.stringify(frontierPoints)}`)
      //console.log(`  new frontier values: ${frontierPoints.map(p => heightmap[p.y][p.x])}`)
    }
    basinPoints = [...basinPoints, ...newFrontierPoints];
    frontierPoints = newFrontierPoints;
  }

  return basinPoints;
}

function solution2(heightmap) {
  let exploremap = new Array(heightmap.length).fill();
  exploremap = exploremap.map(() => new Array(heightmap[0].length).fill(false));

  const lowPoints = findLowPoints(heightmap);
  //console.log(`low points: ${JSON.stringify(lowPoints)}`);

  let basinSizes = [];
  for (const lowPoint of lowPoints) {
    //console.log(`low point: ${JSON.stringify(lowPoint)}`);
    const basinPoints = findBasin(lowPoint, heightmap, exploremap);
    basinSizes.push(basinPoints.length);
    //console.log(`  basin size: ${basinPoints.length}`);
  }

  const l = basinSizes.length;
  basinSizes.sort((a, b) => b - a);
  console.log(`Number of basins: ${l}`);
  console.log(`Basin sizes: ${basinSizes}`);
  return basinSizes[0] * basinSizes[1] * basinSizes[2];
}

(function run() {
  try {
    const { file } = getArgvs();
    const content = readFileSync(file, { encoding:'utf8' }).trim();
    const heightmap = parseInput(content);

    let startTime = new Date().getTime();
    let answer = solution1(heightmap);
    let endTime = new Date().getTime();
    console.log(`Solution 1: ${endTime - startTime} ms`);
    console.log(answer);

    startTime = new Date().getTime();
    answer = solution2(heightmap);
    endTime = new Date().getTime();
    console.log(`Solution 2: ${endTime - startTime} ms`);
    console.log(answer);

  } catch (error) {
    console.error(error);
    process.exit(1);
  }

  process.exit(0);

})();
