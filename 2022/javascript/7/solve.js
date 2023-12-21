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

class Node {
  constructor(parent) {
    this.parent = parent;
    this.children = {};
  }
}

class File {
  constructor(size) {
    this.size = size;
  }
}

function isCD(line) {
  return line.startsWith("$ cd ");
}

function cdParam(line) {
  return line.substring(5);
}

function traverse(root, curDir, param) {
  switch (param) {
    case '/':
      return root;

    case '..':
      return curDir.parent;

    default: // cd a
      if (!curDir.children[param]) {
        curDir.children[param] = new Node(curDir);
      }
      return curDir.children[param];
  }
}

function isLS(line) {
  return line.startsWith("$ ls");
}

function parseInput(content) {
  const root = new Node(null);
  let curDir = root;

  for (const line of content.split('\n')) {
    if (isCD(line)) {
      const param = cdParam(line);
      curDir = traverse(root, curDir, param);
    }
    else if (isLS(line)) {
      // no op for now
    }
    else { // outputs of ls command
      if (line.startsWith('dir')) {
        // ignore for now
      }
      else { // 29116 f
        const [sizeStr, fileName] = line.split(' ');
        curDir.children[fileName] = new File(parseInt(sizeStr));
      }
    }
  }

  return root;
}

function nodeAsJsonString(node) {
  function replacer(key, value) {
    // Filtering out properties
    if (key === "parent") {
      return undefined;
    }
    return value;
  }
  return JSON.stringify(node, replacer, 2);
}

function calDirSize(node) {
  let size = 0, subDirSizes = [];
  for(const name of Object.keys(node.children)) {
    const child = node.children[name];
    if (child instanceof File) {
      size += child.size;
    }
    else if (child instanceof Node) {
      const {size: subDirSize, subDirSizes: childSubDirSizes} = calDirSize(child);
      size += subDirSize;
      subDirSizes.push({ name, size: subDirSize });
      subDirSizes = [...subDirSizes, ... childSubDirSizes];
    }
  }
  return { size, subDirSizes };
}

function solution1(root) {
  const { size, subDirSizes } = calDirSize(root);
  subDirSizes.push({ name: '/', size });
  return subDirSizes
    .filter(obj => obj.size <= 100000)
    .reduce((sum, obj) => sum + obj.size, 0);
}

function solution2(root) {
  const { size, subDirSizes } = calDirSize(root);
  subDirSizes.push({ name: '/', size });
  subDirSizes.sort((a, b) => a.size - b.size);
  const minToFree = 30000000 - (70000000 - size);
  const dirToFree = subDirSizes.find(obj => obj.size >= minToFree);
  return dirToFree.size;
}

(function run() {
  try {
    const { file } = getArgvs();
    const content = readFileSync(file, { encoding:'utf8' }).trim();
    const root = parseInput(content);

    let startTime = new Date().getTime();
    let answer = solution1(root);
    let endTime = new Date().getTime();
    console.log(`Solution 1: ${endTime - startTime} ms`);
    console.log(answer);

    startTime = new Date().getTime();
    answer = solution2(root);
    endTime = new Date().getTime();
    console.log(`Solution 2: ${endTime - startTime} ms`);
    console.log(answer);

  } catch (error) {
    console.error(error);
    process.exit(1);
  }

  process.exit(0);

})();
