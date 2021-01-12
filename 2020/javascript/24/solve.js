const argv = require('yargs').argv;
const fs = require('fs');
const unit = 1;

function replacer(key, value) {
  const originalObject = this[key];
  if(originalObject instanceof Map) {
    return {
      dataType: 'Map',
      value: Array.from(originalObject.entries()), // or with spread: value: [...originalObject]
    };
  } else {
    return value;
  }
}

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
  return content.split('\n').map(s => s.match(/e|se|sw|w|nw|ne/g));
}

const sqrt3 = Math.sqrt(3);

function roundPoint(p) {
  return { x: +p.x.toFixed(3), y: +p.y.toFixed(3) };
};

function travel(identifier) {
  let p = { x:0, y:0 };
  for (const direction of identifier) {
    switch (direction) {
      case 'e':
        p = { x: p.x + unit, y: p.y };
        break;

      case 'w':
        p = { x: p.x - unit, y: p.y };
        break;

      case 'ne':
        p = { x: p.x + unit / 2, y: p.y + unit / 2 * sqrt3 };
        break;

      case 'nw':
        p = { x: p.x - unit / 2, y: p.y + unit / 2 * sqrt3 };
        break;

      case 'se':
        p = { x: p.x + unit / 2, y: p.y - unit / 2 * sqrt3 };
        break;

      case 'sw':
        p = { x: p.x - unit / 2, y: p.y - unit / 2 * sqrt3 };
        break;

      default:
        throw `unknown direction ${direction}`;
    }
  }
  return roundPoint(p);
}

function day0(identifiers) {
  const blackTiles = [];
  for (const identifier of identifiers) {
    let p = travel(identifier);
    const index = blackTiles.findIndex(v => v.x === p.x && v.y === p.y);
    if (index === -1) {
      blackTiles.push(p);
    }
    else {
      blackTiles.splice(index, 1);
    }
  }
  return blackTiles;
}

function getNeighbours(p) {
  return [
    { x: p.x + unit, y: p.y },
    { x: p.x - unit, y: p.y },
    { x: p.x + unit / 2, y: p.y + unit / 2 * sqrt3 },
    { x: p.x - unit / 2, y: p.y + unit / 2 * sqrt3 },
    { x: p.x + unit / 2, y: p.y - unit / 2 * sqrt3 },
    { x: p.x - unit / 2, y: p.y - unit / 2 * sqrt3 }
  ].map(point => roundPoint(point));
}

function solution1a(identifiers) {
  const blackPoints = day0(identifiers);
  return blackPoints.length;
}

function isSamePoint(p1, p2) {
  return p1.x === p2.x && p1.y === p2.y;
}

function day0(identifiers) {
  const blackPoints = [];
  for (const identifier of identifiers) {
    let p = travel(identifier);
    const index = blackPoints.findIndex(v => isSamePoint(v, p));
    if (index === -1) {
      blackPoints.push(p);
    }
    else {
      blackPoints.splice(index, 1);
    }
  }
  return blackPoints;
}

function dayN(blackPoints) {
  let newBlackPoints = [];

  let rule1Cnt = 0, rule2Cnt = 0;

  for (const blackPoint of blackPoints) {
    // rule1
    const neighbours = getNeighbours(blackPoint);
    const blackNeighbours = neighbours.filter(n => !!blackPoints.find(p => isSamePoint(p, n)));
    const whiteNeighbours = neighbours.filter(n => !blackPoints.find(p => isSamePoint(p, n)));

    if (blackNeighbours.length > 0 && blackNeighbours.length <= 2) {
      newBlackPoints.push(blackPoint);
      rule1Cnt++;
    }

    // rule 2, check neighbours of blackpoint
    for(const point of whiteNeighbours) {
      if (!!newBlackPoints.find(v => isSamePoint(v, point))) {
        //p is a black tile in previous day, or p is already a black tile today
        continue;
      }
      const neighbours = getNeighbours(point);
      const blackNeighbours = neighbours.filter(n => !!blackPoints.find(p => isSamePoint(p, n)));
      if (blackNeighbours.length === 2) {
        newBlackPoints.push(point);
        rule2Cnt++;
      }
    }
  }

  return newBlackPoints;
}

function solution2a(identifiers) {
  let blackPoints = day0(identifiers);
  for (let i = 0; i < 100; i++) {
    blackPoints = dayN(blackPoints);
    console.log(`Day ${i+1}: ${blackPoints.length}`);
  }
}

(function run() {
  try {
    const { file } = getArgvs();
    const content = fs.readFileSync(file, { encoding:'utf8' }).trim();
    const identifiers = parseInput(content);

    let startTime = new Date().getTime();
    let result = solution1a(identifiers);
    let endTime = new Date().getTime();
    console.log(`Solution 1.a: ${endTime - startTime} ms`);
    console.log(result);

    startTime = new Date().getTime();
    result = solution2a(identifiers);
    endTime = new Date().getTime();
    console.log(`Solution 2.a: ${endTime - startTime} ms`);
    console.log(result);


  } catch (error) {
    console.error(error);
    process.exit(1);
  }

  process.exit(0);

})();
