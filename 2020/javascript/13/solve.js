const argv = require('yargs').argv;
const fs = require('fs');

const OOSId = -1;

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
// 939
// 7,13,x,x,59,x,31,19
function parseInput(content) {
  const lines = content.split('\n');
  const timestamp = parseInt(lines[0]);
  const busIds = lines[1].split(',').map(id => isNaN(id) ? OOSId : parseInt(id));
  return { timestamp, busIds };
}

function solution1a(timestamp, busIds) {
  return busIds.filter(id => id !== OOSId)
    .reduce((minResult, id) => {
      const waitTime = id - timestamp % id;
      if (waitTime < minResult.waitTime) {
        return {
          id, waitTime
        };
      }
      return minResult;
    }, { id: null, waitTime: Number.MAX_SAFE_INTEGER });
}

function findCycle(baseId, busId) {
  let cycle = [0];
  let remain = 0, i = 0;
  do {
    i++;
    remain = busId - (baseId * i) % busId;
    remain = remain % busId === 0 ? 0 : remain;
    if (remain !== 0)
      cycle.push(remain);
  } while (remain !== 0);
  return cycle;
}

/**
 * Observe that the bus can only start at the timestamp which is a multiple of the 1st
 *
 *  7	13	x	x	59	x	31	19
 *
    	7	13	-1	-1	59	-1	31	19
 0:	  0	0	0	0	0	0	0	0
 7:	  0	6	0	0	52	0	24	12
 14:	0	12	0	0	45	0	17	5
 21:	0	5	0	0	38	0	10	17
 28:	0	11	0	0	31	0	3	10
 35:	0	4	0	0	24	0	27	3
 42:	0	10	0	0	17	0	20	15
 49:	0	3	0	0	10	0	13	8
 56:	0	9	0	0	3	0	6	1
 63:	0	2	0	0	55	0	30	13
 70:	0	8	0	0	48	0	23	6
 77:	0	1	0	0	41	0	16	18
 84:	0	7	0	0	34	0	9	11
 91:	0	0	0	0	27	0	2	4
 98:	0	6	0	0	20	0	26	16
 105:	0	12	0	0	13	0	19	9
 112:	0	5	0	0	6	0	12	2
 119:	0	11	0	0	58	0	5	14
 126:	0	4	0	0	51	0	29	7
 133:	0	10	0	0	44	0	22	0
 140:	0	3	0	0	37	0	15	12
 147:	0	9	0	0	30	0	8	5
 154:	0	2	0	0	23	0	1	17
 161:	0	8	0	0	16	0	25	10
 168:	0	1	0	0	9	0	18	3
 175:	0	7	0	0	2	0	11	15
 182:	0	0	0	0	54	0	4	8
 189:	0	6	0	0	47	0	28	1
 196:	0	12	0	0	40	0	21	13
 203:	0	5	0	0	33	0	14	6
 *
 * @param busIds
 * @returns {[]}
 */
function findCycles(busIds) {
  let cycles = [];
  for (let i = 0; i < busIds.length; i++) {
    if (busIds[i] === OOSId || busIds[i] % busIds[0] === 0) {
      cycles.push(null);
    }
    else {
      cycles.push(findCycle(busIds[0], busIds[i]));
    }
  }
  return cycles;
}

function printCycles(busIds) {
  console.log(`id:\t${busIds.join('\t')}\n\n`);
  let i = 0, base = busIds[0];
  while (i < 30) {
    const time = base * i;
    const remains = busIds.map(busId => {
      let remain = busId - time % busId;
      remain = remain % busId === 0 ? 0 : remain;
      return remain;
    });
    console.log(`${time}:\t${remains.join('\t')}`);
    i++;
  }
}

function findLeastLineupTurns(remainCycleObjs) {
  const minOffset = Math.min(...remainCycleObjs.map(obj => obj.offset));
  const base = remainCycleObjs.find(obj => obj.offset === minOffset).cycleLength;

  console.log(`computing base: ${base.toExponential(2)}`);
  console.log(remainCycleObjs);

  const adjusted = remainCycleObjs.map(obj => {
    return Object.assign({}, obj, {
      offset: obj.offset - minOffset
    });
  });
  let found, turns, i = 0;
  do {
    turns = base * i++;
    found = true;
    for (const obj of adjusted) {
      const diffMod = (turns - obj.offset) % obj.cycleLength;
      if (diffMod !== 0)
        found = false;
    }
    const str = adjusted.map(obj => (turns - obj.offset) % obj.cycleLength).join('\t');

    if (i % 1000000 === 0) {
      console.log(`base: ${base.toExponential(2)} \t turns: ${turns.toExponential(2)}`);
    }
  } while(!found);
  return turns + minOffset;
}

function what(remainCycleObjs) {
  let stack = remainCycleObjs;

  let level = 0;
  do {
    console.log(`level: ${level++}, stack length: ${stack.length}`);
    let newStack = [];
    for(let i = 0; i < stack.length - 1; i += 2) {
      const objs = stack.slice(i, i + 2);
      const turns = findLeastLineupTurns(objs);
      newStack.push({
        offset: turns,
        cycleLength: objs[0].cycleLength * objs[1].cycleLength
      });
    }
    if (stack.length % 2 === 1) {
      newStack.push(stack[stack.length - 1]);
    }
    stack = newStack;
  } while (stack.length > 1);

  return stack[0].offset;
}

function solution2a(busIds) {
  printCycles(busIds);
  const remainCycles = findCycles(busIds);
  let remainCycleObjs = remainCycles.map((cycle, index) => {
    if (!cycle) {
      return {
        cycleLength: 0
      }
    }

    const cycleIndex = index % cycle.length;
    return {
      index,
      offset: cycle.indexOf(cycleIndex),
      cycleLength: cycle.length
    };
  });

  remainCycleObjs = remainCycleObjs
    .filter(obj => obj.cycleLength !== 0);
  console.log(remainCycleObjs);

  const turns = what(remainCycleObjs);

  return turns * busIds[0];
}

(function run() {
  try {
    const { file } = getArgvs();
    const content = fs.readFileSync(file, { encoding:'utf8' }).trim();
    const { timestamp, busIds } = parseInput(content);

    let startTime = new Date().getTime();
    let result = solution1a(timestamp, busIds);
    let endTime = new Date().getTime();
    console.log(`Solution 1.a: ${endTime - startTime} ms`);
    console.log(` answer is: ${result.id * result.waitTime}`);

    startTime = new Date().getTime();
    result = solution2a(busIds);
    endTime = new Date().getTime();
    console.log(`Solution 4.a: ${endTime - startTime} ms`);
    console.log(` answer is: ${result}`);


  } catch (error) {
    console.error(error);
    process.exit(1);
  }

  process.exit(0);

})();
