const argv = require('yargs').argv;
const fs = require('fs');

const target = 2020;

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

function solution1a(map, slope) {
  let treeCount = 0, treePairs = [];
  let x = 0, y = 0, bottom = map.length, width = map[0].length;

  while (x < bottom) {
    for(let i=0; i < slope.right; i++) {
      y++;
      if(y === width) {
        y = 0;
      }
    }

    for(let i=0; i < slope.down; i++) {
      x++;
    }

    if (x < bottom) {
      if (map[x][y] === 1) {
        treePairs.push({x, y});
        treeCount++;
      }
    }
  }
  return { treeCount, treePairs };
}

function solution2a(map, slopes) {
  let answers = [];
  for (const slope of slopes) {
    const solution = solution1a(map, slope);
    answers.push(solution.treeCount);
  }
  return answers;
}

// line sample:  "....###.#....###......#....#..#"
function parseInput(content) {
  const lines = content.split('\n');
  return lines.map(line => [...line].map(c => c === '#' ? 1 : 0));
}

(function run() {
  try {
    const { file } = getArgvs();
    const content = fs.readFileSync(file, { encoding:'utf8' });
    const map = parseInput(content);
    const slope = { right:3, down:1 };

    let startTime = new Date().getTime();
    let solution = solution1a(map, slope);
    let endTime = new Date().getTime();
    console.log(`Solution 1.a: ${endTime - startTime} ms`);
    console.log(`  Answer is: ${solution.treeCount}.`);
    //console.log(solution.treePairs);

    const slopes = [
      { right:1 , down:1 },
      { right:3 , down:1 },
      { right:5 , down:1 },
      { right:7 , down:1 },
      { right:1 , down:2 }
    ];
    startTime = new Date().getTime();
    const treeCounts = solution2a(map, slopes);
    const answer = treeCounts.reduce((r,x) => r * x, 1);
    endTime = new Date().getTime();
    console.log(`Solution 1.a: ${endTime - startTime} ms`);
    console.log(treeCounts);
    console.log(`  Answer: ${answer}`);

  } catch (error) {
    console.error(error);
    process.exit(1);
  }

  process.exit(0);

})();
