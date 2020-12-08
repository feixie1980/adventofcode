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

// lines:
//   light red bags contain 1 bright white bag, 2 muted yellow bags.
//   bright white bags contain 1 shiny gold bag.
//   dotted black bags contain no other bags.
// parse into: { name:"light red bags", children: { num: 1, name: "bright white bag" }
function parseInput(content) {
  const lines =  content.split('\n');
  return lines.map(line => {
    const parts = line.split(/contain no other bags.|contain|,|\./)
      .map(s => s.trim())
      .filter(s => !!s);
    const name = parts[0].replace(/bags|bag/, '').trim();
    const children = parts.slice(1).map(s => {
      const parts = s.split(' ');
      return { numRequired: parseInt(parts.shift()), name: parts.join(' ').replace(/bags|bag/, '').trim() };
    });
    return { name, children };
  });
}

function createIfNotExisted(nodeMap, bagName) {
  if (!nodeMap.has(bagName)) {
    nodeMap.set(bagName, { parentNames:[], children:[] });
  }
}

function rowsToNodeMap(rows) {
  let nodeMap = new Map();
  for (const row of rows) {
    const { name, children } = row;

    // Create nodes if not existed
    createIfNotExisted(nodeMap, name);
    children.forEach(child => createIfNotExisted(nodeMap, child.name));

    const node = nodeMap.get(name);
    node.children = children;
    node.children.forEach(child => {
      nodeMap.get(child.name).parentNames.push(name);
    });
  }
  return nodeMap;
}

function getAncestors(nodeMap, bagName) {
  const node = nodeMap.get(bagName);
  if (!node) {
    throw `Encounter unknown color: ${bagName}`;
  }

  if (node.parentNames.length === 0) {
    // This is the root
    return [bagName];
  }
  else {
    return node.parentNames.reduce((allAncestors, parentName) => {
      allAncestors = [...allAncestors, ...getAncestors(nodeMap, parentName)];
      return allAncestors;
    }, [...node.parentNames]);
  }
}

function getDescendantBagCount(nodeMap, bagName) {
  const node = nodeMap.get(bagName);
  if (!node) {
    throw `Encounter unknown color: ${bagName}`;
  }

  if (node.children.length === 0) {
    return 1;
  }
  else {
    return node.children.reduce((bagCount, child) => {
      return bagCount + child.numRequired * getDescendantBagCount(nodeMap, child.name);
    }, 0) + 1;
  }
}

function solution1a(nodeMap, bagName) {
  const ancestors = getAncestors(nodeMap, bagName);
  return new Set([...ancestors]).size;
}

function solution2a(nodeMap, bagName) {
  return getDescendantBagCount(nodeMap, bagName) - 1;
}


(function run() {
  try {
    const { file } = getArgvs();
    const content = fs.readFileSync(file, { encoding:'utf8' }).trim();
    const rows = parseInput(content);


    let startTime = new Date().getTime();
    const nodeMap = rowsToNodeMap(rows);
    let count = solution1a(nodeMap, 'shiny gold');
    let endTime = new Date().getTime();
    console.log(`Solution 1.a: ${endTime - startTime} ms`);
    console.log(` Count is: ${count}.`);

    startTime = new Date().getTime();
    count = solution2a(nodeMap, 'shiny gold');
    endTime = new Date().getTime();
    console.log(`Solution 2.a: ${endTime - startTime} ms`);
    console.log(` Count is: ${count}.`);

  } catch (error) {
    console.error(error);
    process.exit(1);
  }

  process.exit(0);

})();
