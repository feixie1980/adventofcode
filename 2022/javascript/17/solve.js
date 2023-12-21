import { readFileSync, writeFileSync } from 'fs';
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
  return content.split('');
}

function newRock(index, y) {
  switch (index) {
    case 0:
      // ####
      return [
        { x: 2, y }, { x: 3, y }, { x: 4, y }, { x: 5, y },
      ];

    case 1:
      /*
         .#.
         ###
         .#.
       */
      return [
        { x: 3, y: y },
        { x: 2, y: y + 1 }, { x: 3, y: y + 1 }, { x: 4, y: y + 1 },
        { x: 3, y: y + 2 },
      ];

    case 2:
      /*
        ..#
        ..#
        ###
       */
      return [
        { x: 2, y: y }, { x: 3, y: y }, { x: 4, y: y },
        { x: 4, y: y + 1 },
        { x: 4, y: y + 2 },
      ];

    case 3:
      /*
        #
        #
        #
        #
       */
      return [
        { x: 2, y: y },
        { x: 2, y: y + 1 },
        { x: 2, y: y + 2 },
        { x: 2, y: y + 3 }
      ];

    case 4:
      /*
        ##
        ##
       */
      return [
        { x: 2, y: y }, { x: 3, y: y },
        { x: 2, y: y + 1 }, { x: 3, y: y + 1 },
      ];
  }
  throw `Unsupported index: ${index}, y is ${y}`;
}

function coordToKey(coord) {
  return `${coord.x}-${coord.y}`;
}

function move(dir, rock, pieceSet) {
  let hasBlocker;

  switch(dir) {
    case '<':
      // check any left blockers
      hasBlocker = rock.some(piece => {
        const newPos = { x: piece.x -1, y: piece.y };
        if (newPos.x < 0 || pieceSet.has(coordToKey(newPos))) {
          return true;
        }
      });
      if (!hasBlocker) {
        rock.forEach(rock => rock.x -= 1);
      }
      break;

    case '>':
      // check any right blockers
      hasBlocker = rock.some(rock => {
        const newPos = { x: rock.x + 1, y: rock.y };
        if (newPos.x > 6 || pieceSet.has(coordToKey(newPos))) {
          return true;
        }
      });
      if (!hasBlocker) {
        rock.forEach(rock => rock.x += 1);
      }
      break;

    case 'down': // down
      // check any bottom blockers
      hasBlocker = rock.some(rock => {
        const newPos = { x: rock.x, y: rock.y - 1 };
        if (newPos.y < 0 || pieceSet.has(coordToKey(newPos))) {
          return true;
        }
      });
      if (!hasBlocker) {
        rock.forEach(rock => rock.y -= 1);
      } else {
        return false; // come to a rest
      }
      break;

    default:
      throw `Unexpected dir: ${dir}`;
  }

  return true; // can continue
}

function print(maxY, pieceSet, rock, dir, simpleMode) {
  const lines = [];
  for (let y = maxY; y >=0; y--) {
    let line = '|';
    for(let x = 0; x < 7; x++) {
      const coord = {x, y};
      const hasPiece = pieceSet.has(coordToKey(coord))
        || rock.some(piece => piece.x === coord.x && piece.y === coord.y);
      line += hasPiece ? '#' : '.';
    }
    line += `|`;
    line += simpleMode ? '' : `${y}`;
    lines.push(line);
  }
  lines.push(`+-------+  ${dir}`);
  return lines.join('\n') + '\n\n';
}

function detectCycle(stream) {
  const id = stream[stream.length - 1].id;
  const indexList = [stream.length - 1];
  for(let i = stream.length - 2; i >= 0; i--) {
    if (stream[i].id === id) {
      indexList.push(i);
    }
    if (indexList.length === 3) {
      if (indexList[0] - indexList[1] === indexList[1] - indexList[2]) {
        // cycle found
        return stream.slice(indexList[1]);
      }
    }
  }
  return [];
}

function tetris(dirs, num, useCycleDetect) {
  let maxY = -1, dirIndex = 0, pieceSet = new Set();
  const stream = [];

  for (let i = 0; i < num; i++) {
    const rockIndex = i % 5;
    const rock = newRock(rockIndex, maxY + 4);
    if (!useCycleDetect) {
      //console.log(`index ${i}\theight:${maxY+1}\t${rockIndex}-${dirIndex}`);
    }

    if (useCycleDetect) {
      // cycle detection
      stream.push({
        id:`${rockIndex}-${dirIndex}`,
        index: i,
        height: maxY + 1
      });
      const cycle = detectCycle(stream);
      // cycle:   |2, 3, 5, 10, 5|, 2
      if (cycle.length > 0) {
        const cycleLength = cycle.length - 1;

        // detected cycles, no need to continue simulation, do calculation instead!
        const baseHeight = cycle[0].height;
        const diffHeight = cycle[cycle.length - 1].height - cycle[0].height;

        // how many rocks remaining, how many cycles, and the remainder
        const numRemaining = num - i;
        const numCycles = Math.floor(numRemaining / cycleLength);
        const remainder = numRemaining % cycleLength;

        let newIndex = cycle[cycle.length - 1].index + numCycles * cycleLength;
        let finalHeight = maxY + 1 + numCycles * diffHeight;
        finalHeight += cycle[remainder ].height - baseHeight;

        return finalHeight;
      }
    }

    while(true) {
      const dir = dirs[dirIndex];
      if (++dirIndex % dirs.length === 0) {
        dirIndex = 0;
      }

      move(dir, rock, pieceSet);
      // drop down
      if (!move('down', rock, pieceSet)) {
        // rock comes to a rest
        rock.forEach(piece => pieceSet.add(coordToKey(piece)));
        maxY = maxY < rock[rock.length - 1].y ? rock[rock.length - 1].y : maxY;
        //console.log(print(maxY + 4, pieceSet, [], 'down', true));
        break;
      }
    }

    if (!useCycleDetect && i === num - 1) {
      console.log(`index ${i}\theight:${maxY+1}\t${rockIndex}-${dirIndex}`);
    }
  }

  // console.log(print(maxY + 4, pieceSet, [], 'down', true));
  return maxY + 1;
}

function solution1(dirs) {
  return tetris(dirs, 2022, false);
}

function solution2(dirs) {
  return tetris(dirs, 1000000000000, true);
}

(function run() {
  try {
    const { file } = getArgvs();
    const content = readFileSync(file, { encoding:'utf8' }).trim();
    const dirs = parseInput(content);

    let startTime = new Date().getTime();
    let answer = solution1(dirs);
    let endTime = new Date().getTime();
    console.log(`Solution 1: ${endTime - startTime} ms`);
    console.log(answer);

    startTime = new Date().getTime();
    answer = solution2(dirs);
    endTime = new Date().getTime();
    console.log(`Solution 2: ${endTime - startTime} ms`);
    console.log(answer);

  } catch (error) {
    console.error(error);
    process.exit(1);
  }

  process.exit(0);

})();
