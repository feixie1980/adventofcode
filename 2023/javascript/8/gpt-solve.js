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

function parseInput(inputText) {
  const lines = inputText.trim().split("\n");
  const directions = lines[0].split('');
  const nodeMap = lines.slice(1).reduce((map, line) => {
    const [node, mapping] = line.split(" = ");
    const [leftNode, rightNode] = mapping.slice(1, -1).split(", ");
    map[node] = [leftNode, rightNode];
    return map;
  }, {});
  return [directions, nodeMap];
}

function initialNodes(nodeMap) {
  const nodes = new Set();
  for (let node in nodeMap) {
    if (node.slice(-1) === 'A') {
      nodes.add(node);
    }
  }
  return nodes;
}

function solution1(inputText) {
  const [directions, nodeMap] = parseInput(inputText);
  let steps = 0;
  let currentNodes = initialNodes(nodeMap);

  const nodeMove = (node, direction) => {
    if(nodeMap[node]) {
      return nodeMap[node][(direction === 'L' ? 0 : 1)];
    }
    return node;
  };

  while(![...currentNodes].every(node => node.endsWith("Z"))) {
    let newNodes = new Set();
    for (let node of currentNodes) {
      let direction = directions[steps % directions.length];
      let newNode = nodeMove(node, direction);
      newNodes.add(newNode);
    }

    for (let node of newNodes) {
      if (node.endsWith("Z") && node !== "ZZZ") {
        newNodes.delete(node);
        newNodes.add("ZZZ");
      }
    }

    currentNodes = newNodes;
    steps++;
  }
  return steps;
}

(function run() {
  try {
    const { file } = getArgvs();
    const content = readFileSync(file, { encoding:'utf8' }).trim();

    let startTime = new Date().getTime();
    let answer = solution1(content);
    let endTime = new Date().getTime();
    console.log(`Solution 1: ${endTime - startTime} ms`);
    console.log(answer);

  } catch (error) {
    console.error(error);
    process.exit(1);
  }

  process.exit(0);

})();
