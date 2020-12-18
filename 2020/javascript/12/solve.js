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

// lines:
// F10
// N3
// F7
// R90
function parseInput(content) {
  return content.split('\n')
    .map(line => {
      return {
        op: line[0], val: parseInt(line.substring(1))
      }
    });
}

function solution1a(instructions) {
  let dEast = 0, dNorth = 0;
  dNorth += instructions.reduce((sum, ins) => sum + (ins.op === 'N' ? ins.val : 0), 0);
  dNorth -= instructions.reduce((sum, ins) => sum + (ins.op === 'S' ? ins.val : 0), 0);
  dEast += instructions.reduce((sum, ins) => sum + (ins.op === 'E' ? ins.val : 0), 0);
  dEast -= instructions.reduce((sum, ins) => sum + (ins.op === 'W' ? ins.val : 0), 0);

  let angles = 0, eastFactor = 1, northFactor = 0;
  const dirIns = instructions.filter(ins => ins.op === 'F' || ins.op === 'L' || ins.op === 'R');
  for (const ins of dirIns) {
    if (ins.op === 'F') {
      dEast += eastFactor * ins.val;
      dNorth += northFactor * ins.val;
      continue;
    }

    if (ins.op === 'R') {
      angles += ins.val;
    } else if (ins.op === 'L') {
      angles -= ins.val;
    }

    let remainder = (angles / 90) % 4;
    remainder = remainder >= 0 ? remainder : remainder + 4;
    switch (remainder) {
      case 0:
        eastFactor = 1;
        northFactor = 0;
        break;

      case 1:
        eastFactor = 0;
        northFactor = -1;
        break;

      case 2:
        eastFactor = -1;
        northFactor = 0;
        break;

      case 3:
        eastFactor = 0;
        northFactor = 1;
        break;
    }
  }

  console.log(`${dEast}, ${dNorth}`);
  return Math.abs(dEast) + Math.abs(dNorth);
}

function rotateWaypoint(waypoint, direction, rotation) {
  if (direction === 'L') {
    rotation = rotation * -1;
  }

  let remainder = (rotation / 90) % 4;
  remainder = remainder >= 0 ? remainder : remainder + 4;
  switch (remainder) {
    case 0:
      return waypoint;

    case 1:
      return {
        east: waypoint.north,
        north: -waypoint.east
      };

    case 2:
      return {
        east: -waypoint.east,
        north: -waypoint.north
      };

    case 3:
      return {
        east: -waypoint.north,
        north: waypoint.east
      };
  }

  throw `invalid rotation remainder ${remainder}`;
}

function solution2a(instructions) {
  let dEast = 0, dNorth = 0;
  let waypoint = { east: 10, north: 1 };

  for (const ins of instructions) {
    switch (ins.op) {
      case 'N':
        waypoint.north += ins.val;
        break;

      case 'S':
        waypoint.north -= ins.val;
        break;

      case 'E':
        waypoint.east += ins.val;
        break;

      case 'W':
        waypoint.east -= ins.val;
        break;

      case 'L':
      case 'R':
        waypoint = rotateWaypoint(waypoint, ins.op, ins.val);
        break;

      case 'F':
        dEast += waypoint.east * ins.val;
        dNorth += waypoint.north * ins.val;
        break;

      default:
        throw `unknown op: ${ins.op}`
    }
  }

  console.log(`${dEast}, ${dNorth}`);
  return Math.abs(dEast) + Math.abs(dNorth);
}


(function run() {
  try {
    const { file } = getArgvs();
    const content = fs.readFileSync(file, { encoding:'utf8' }).trim();
    const instructions = parseInput(content);

    let startTime = new Date().getTime();
    let result = solution1a(instructions);
    let endTime = new Date().getTime();
    console.log(`Solution 1.a: ${endTime - startTime} ms`);
    console.log(` answer is: ${result}`);

    startTime = new Date().getTime();
    result = solution2a(instructions);
    endTime = new Date().getTime();
    console.log(`Solution 4.a: ${endTime - startTime} ms`);
    console.log(` answer is: ${result}`);


  } catch (error) {
    console.error(error);
    process.exit(1);
  }

  process.exit(0);

})();
