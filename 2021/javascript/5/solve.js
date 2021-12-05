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
  const lines = content.split('\n');
  let lineConfigs = [];
  for (const line of lines) {
    line.replace(/([0-9]+)(,)([0-9]+)(\s->\s)([0-9]+)(,)([0-9]+)/g,
      (match, x1, c1, y1, arrow, x2, c2, y2) => {
        lineConfigs.push({
          p1: { x: parseInt(x1), y: parseInt(y1) },
          p2: { x: parseInt(x2), y: parseInt(y2) }
        });  
      });
  }
  return lineConfigs;
}

function printCoords(coords) {
  coords.forEach(line => {
    console.log(line.join('\t'));
  });
  console.log();
}

function genCoords(lineConfigs) {
  const xMax = Math.max(...lineConfigs.map(lineConfig => Math.max(lineConfig.p1.x, lineConfig.p2.x)));
  const yMax = Math.max(...lineConfigs.map(lineConfig => Math.max(lineConfig.p1.y, lineConfig.p2.y)));
  let coords = new Array(yMax + 1).fill();
  coords = coords.map(() => new Array(xMax + 1).fill(0));
  return coords;
}

function markLine(coords, lineConfig, excludeDiagonal) {
  const { p1, p2 } = lineConfig;  
  const dX = p1.x < p2.x ? 1 : p1.x > p2.x ? -1 : 0;
  const dY = p1.y < p2.y ? 1 : p1.y > p2.y ? -1 : 0;

  if (excludeDiagonal && dX && dY) {
    return;
  }

  let x = p1.x, y = p1.y;
  coords[y][x] += 1;
  while (x != p2.x || y != p2.y) {
    x = x === p2.x ? x : x + dX;
    y = y === p2.y ? y : y + dY;
    coords[y][x] += 1;
  }  
}

function count(coords) {
  return coords.reduce((cnt, line) => cnt + line.filter(v => v > 1).length, 0);
}

function solution1(lineConfigs) {
  const coords = genCoords(lineConfigs);
  //printCoords(coords);
  for (const lineConfig of lineConfigs) {
    //console.log(`(${lineConfig.p1.x}, ${lineConfig.p1.y}) -> (${lineConfig.p2.x}, ${lineConfig.p2.y})`);
    markLine(coords, lineConfig, true);
    //printCoords(coords);
  }
  //printCoords(coords);
  return count(coords);
}

function solution2(lineConfigs) {
  const coords = genCoords(lineConfigs);
  //printCoords(coords);
  for (const lineConfig of lineConfigs) {
    markLine(coords, lineConfig, false);
    //console.log(`(${lineConfig.p1.x}, ${lineConfig.p1.y}) -> (${lineConfig.p2.x}, ${lineConfig.p2.y})`);
    //printCoords(coords);
  }
  //printCoords(coords);
  return count(coords);
}

(function run() {
  try {
    const { file } = getArgvs();
    const content = readFileSync(file, { encoding:'utf8' }).trim();
    const lineConfigs = parseInput(content);

    let startTime = new Date().getTime();
    let answer = solution1(lineConfigs);
    let endTime = new Date().getTime();
    console.log(`Solution 1: ${endTime - startTime} ms`);
    console.log(answer);

    startTime = new Date().getTime();
    answer = solution2(lineConfigs);
    endTime = new Date().getTime();
    console.log(`Solution 2: ${endTime - startTime} ms`);
    console.log(answer);

  } catch (error) {
    console.error(error);
    process.exit(1);
  }

  process.exit(0);

})();
