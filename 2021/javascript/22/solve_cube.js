import { readFileSync } from 'fs';
import Yargs from "yargs";

const INIT_REGION = {
  xRange: [-50, 50],
  yRange: [-50, 50],
  zRange: [-50, 50]
};

class Timer {
  constructor() {
    this.t1 = 0;
    this.t2 = 0;
  }

  start() {
    this.t1 = new Date().getTime();
  }

  end() {
    this.t2 = new Date().getTime();
  }

  latency() {
    return this.t2 - this.t1;
  }
}
const timer = new Timer();

function printUsage() {
  console.log("\nUsage: node solve.js --file=input.txt --isInit=true|false");
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
  return content
    .split('\n')
    .map(line => {
      let step;
      line.replace(/(on|off)(\sx=)(\-?[0-9]+)(\.\.)(\-?[0-9]+)(,y=)(\-?[0-9]+)(\.\.)(\-?[0-9]+)(,z=)(\-?[0-9]+)(\.\.)(\-?[0-9]+)/g,
      (match, operation, s1, xStart, s2, xEnd, s3, yStart, s4, yEnd, s5, zStart, s6, zEnd) => {
        step = {
          operation,
          xRange: [parseInt(xStart), parseInt(xEnd)],
          yRange: [parseInt(yStart), parseInt(yEnd)],
          zRange: [parseInt(zStart), parseInt(zEnd)]
        };
      });
      return step;
    });
}

function cropRange(range, maxRange) {
  if (range[0] > maxRange[1] || range[1] < maxRange[0]) {
    return null;
  }
  return [
    range[0] >= maxRange[0] ? range[0] : maxRange[0],
    range[1] <= maxRange[1] ? range[1] : maxRange[1]
  ];
}

function cropCuboid(cuboid, cropRegion) {
  const { xRange, yRange, zRange } = cuboid;

  const newXRange = cropRange(xRange, cropRegion.xRange);
  if (!newXRange)
    return null;

  const newYRange = cropRange(yRange, cropRegion.yRange);
  if (!newYRange)
    return null;

  const newZRange = cropRange(zRange, cropRegion.zRange);
  if (!newZRange)
    return null;

  return {
    xRange: newXRange, yRange: newYRange, zRange: newZRange
  };
}

function getCuboidKey(cuboid) {
  const { xRange, yRange, zRange } = cuboid;
  return `${xRange[0]}..${xRange[1]}-${yRange[0]}..${yRange[1]}-${zRange[0]}..${zRange[1]}`;
}

function rangesOverlap(range1, range2) {
  return !(range1[1] < range2[0] || range1[0] > range2[1]);
}

function rangesEnclose(range1, range2) {
  return range1[0] <= range2[0] && range1[1] >= range2[0];
}

function cuboidsOverlap(c1, c2) {
  return rangesOverlap(c1.xRange, c2.xRange) &&
    rangesOverlap(c1.yRange, c2.yRange) &&
    rangesOverlap(c1.zRange, c2.zRange);
}

function cuboidsEnclose(c1, c2) {
  return rangesEnclose(c1.xRange, c2.xRange) &&
    rangesEnclose(c1.yRange, c2.yRange) &&
    rangesEnclose(c1.zRange, c2.zRange);
}

// break range2 base on range1
function breakRange(range1, range2) {
  const sorted = [range2[0], range2[1], range1[0], range1[1]].sort((a, b) => a - b);
  let segments = [];
  if (range2[0] < range1[0]) {
    if (range2[1] < range1[0]) {
      // (r2,0)====(r2,1)  (r1,0)----(r1,1)
      segments.push([range2[0], range2[1]]);
    }
    else if (range2[1] >= range1[0] && range2[1] <= range1[1]) {
      // (r2,0)====(r1,0)====(r2,1)----(r1,1)
      segments.push(
        [range2[0], range1[0] - 1],
        [range1[0], range2[1]],
      );
    }
    else { // range2[1] > range1[1]
      // (r2,0)====(r1,0)=====(r1,1)=====(r2,1)
      segments.push(
        [range2[0], range1[0] - 1],
        [range1[0], range1[1]],
        [range1[1] + 1, range2[1]],
      );
    }
  }
  else if(range2[0] >= range1[0] && range2[0] <= range1[1]) {
    if (range2[1] <= range1[1]) {
      // (r1,0)----(r2,0)====(r2,1)----(r1,1)
      segments.push(
        [range2[0], range2[1]]
      );
    } else { // range2[1] > range1[1]
      // (r1,0)----(r2,0)====(r1,1)====(r2,1)
      segments.push(
        [range2[0], range1[1]],
        [range1[1] + 1, range2[1]]
      );
    }
  }
  else { // range2[0] > range1[1]
    // (r1,0)----(r1,1) (r2,0)====(r2,1)
    segments.push([range2[0], range2[1]]);
  }
  return segments;
}

function genCuboids(xFragments, yFragments, zFragments) {
  let cuboids = [];
  for (const xRange of xFragments)
    for (const yRange of yFragments)
      for (const zRange of zFragments) {
        cuboids.push({ xRange, yRange, zRange });
      }
  return cuboids;
}

function intersectAndBreak(cuboidAnchor, cuboidToBreak) {
  const xFragments = breakRange(cuboidAnchor.xRange, cuboidToBreak.xRange);
  const yFragments = breakRange(cuboidAnchor.yRange, cuboidToBreak.yRange);
  const zFragments = breakRange(cuboidAnchor.zRange, cuboidToBreak.zRange);
  let cuboids = genCuboids(xFragments, yFragments, zFragments);
  return cuboids.filter(c => !cuboidsEnclose(cuboidAnchor, c));  
}

/**
 * Add a new cuboid. For each existing cuboid, the new cuboid will be broken into cube pieces which
 * have no overlap with existing cuboids.
 * @param {*} cuboidMap 
 * @param {*} cuboidToAdd 
 * @returns 
 */
function addOnCuboid(cuboidMap, cuboidToAdd, status) {
  const key = getCuboidKey(cuboidToAdd);
  if (cuboidMap.has(key)) {
    return; // the cuboid overlap exactly an existing ON cuboid    
  }

  let newCuboids = [cuboidToAdd], i = 0;
  for (const [anchorKey, anchorCuboid] of cuboidMap) {
    let breakups = [], overlaps = [];
    newCuboids.forEach(c => { // skip non overlapping cuboids
      if(cuboidsOverlap(anchorCuboid, c)) {
        overlaps.push(c);
      } else {
        breakups.push(c);
      }
    });
    
    for (const c of overlaps) {
      const newBreakups = intersectAndBreak(anchorCuboid, c);
      breakups = breakups.concat(newBreakups);     
    }
    newCuboids = breakups;

    // logging
    if (i++ % 100 === 0) {
      //console.log(`${status ? status : ''}\t${i} of ${cuboidMap.size}\tbrokens:${newCuboids.length}`);      
    }
  }
  newCuboids.forEach(c => cuboidMap.set(getCuboidKey(c), c));
}

/**
 * Add a new "dark" or destructive cuboid. For each existing cuboid, it will be broken into cube pieces based
 * on how it interact witht the dark cuboid.
 * @param {*} cuboidMap 
 * @param {*} darkCuboid 
 */
function addDarkCuboid(cuboidMap, darkCuboid) {
  const existingCuboidEntries = [...cuboidMap.entries()];
  for (const [key, existCuboid] of existingCuboidEntries) {
    cuboidMap.delete(key);
    const breakups = intersectAndBreak(darkCuboid, existCuboid);
    breakups.forEach(c => cuboidMap.set(getCuboidKey(c), c));
  }
}

function getCuboidCount(cuboid) {
  const { xRange, yRange, zRange } = cuboid;
  return (xRange[1] - xRange[0] + 1) * (yRange[1] - yRange[0] + 1) * (zRange[1] - zRange[0] + 1);
}

function test() {
  function testEqual() {
    let c1 = {
      xRange: [0, 100],
      yRange: [0, 100],
      zRange: [0, 100]
    };
  
    let c2 = {
      xRange: [0, 100],
      yRange: [0, 100],
      zRange: [0, 100]
    };
    const cuboidMap = new Map();
    cuboidMap.set(getCuboidKey(c1), c1);
    addOnCuboid(cuboidMap, c2);
    let success = cuboidMap.size === 1;
    if (success) {
      console.log(`testEqual passes`);
    }
    else {
      console.error(`***** testEqual fails *****`);
    }
  }
  
  function testEnclose() {
    let c1 = {
      xRange: [0, 100],
      yRange: [0, 100],
      zRange: [0, 100]
    };
  
    let c2 = {
      xRange: [10, 90],
      yRange: [10, 100],
      zRange: [10, 70]
    };
    const cuboidMap = new Map();
    cuboidMap.set(getCuboidKey(c1), c1);
    addOnCuboid(cuboidMap, c2);
    let success = cuboidMap.size === 1 && JSON.stringify(c1) === JSON.stringify([...cuboidMap.values()][0]);
    if (success) {
      console.log(`testEnclose passes`);
    }
    else {
      console.error(`***** testEnclose fails *****`);
    }
  }
  
  function testCutInHalf() {
    let c1 = {
      xRange: [0, 100],
      yRange: [0, 100],
      zRange: [0, 100]
    };
  
    let c2 = {
      xRange: [10, 200],
      yRange: [0, 100],
      zRange: [0, 100]
    };
    const cuboidMap = new Map();
    cuboidMap.set(getCuboidKey(c1), c1);
    addOnCuboid(cuboidMap, c2);
    
    let success = cuboidMap.size === 2 && cuboidMap.has(getCuboidKey(c1));  
    //printCuboids([...cuboidMap.values()]);
  
    if (success) {
      console.log(`testCutInHalf passes`);
    }
    else {
      console.error(`***** testCutInHalf fails *****`);
    }
  }
  
  function testCutIntoThree() {
    let c1 = {
      xRange: [0, 100],
      yRange: [0, 100],
      zRange: [0, 100]
    };
  
    let c2 = {
      xRange: [-100, 200],
      yRange: [10, 50],
      zRange: [10, 50]
    };
    const cuboidMap = new Map();
    cuboidMap.set(getCuboidKey(c1), c1);
    addOnCuboid(cuboidMap, c2);
    
    let success = cuboidMap.size === 3 && cuboidMap.has(getCuboidKey(c1));
    success = success && cuboidMap.has('-100..-1-10..50-10..50') && cuboidMap.has('101..200-10..50-10..50');
    //printCuboids([...cuboidMap.values()]);
  
    if (success) {
      console.log(`testCutIntoThree passes`);
    }
    else {
      console.error(`***** testCutIntoThree fails *****`);
    }
  }
  
  function testCutIntoEight() {
    let c1 = {
      xRange: [0, 100],
      yRange: [0, 100],
      zRange: [0, 100]
    };
  
    let c2 = {
      xRange: [70, 150],
      yRange: [70, 150],
      zRange: [70, 150]
    };
    const cuboidMap = new Map();
    cuboidMap.set(getCuboidKey(c1), c1);
    addOnCuboid(cuboidMap, c2);
    
    let success = cuboidMap.size === 8 && cuboidMap.has(getCuboidKey(c1));
    success = success && cuboidMap.has('70..100-70..100-101..150');
    //printCuboids([...cuboidMap.values()]);
  
    if (success) {
      console.log(`testCutIntoEight passes`);
    }
    else {
      console.error(`***** testCutIntoEight fails *****`);
    }
  }
  
  function testCutInto27() {
    let c1 = {
      xRange: [0, 100],
      yRange: [0, 100],
      zRange: [0, 100]
    };
  
    let c2 = {
      xRange: [-100, 200],
      yRange: [-100, 200],
      zRange: [-100, 200]
    };
    const cuboidMap = new Map();
    cuboidMap.set(getCuboidKey(c1), c1);
    addOnCuboid(cuboidMap, c2);
    
    let success = cuboidMap.size === 27 && cuboidMap.has(getCuboidKey(c1));
    success = success && cuboidMap.has('101..200-101..200-101..200');
    //printCuboids([...cuboidMap.values()]);
  
    if (success) {
      console.log(`testCutIntoNine passes`);
    }
    else {
      console.error(`***** testCutIntoNine fails *****`);
    }
  }
  
  function test3CubesOverlapping() {
    let c1 = {
      xRange: [0, 100],
      yRange: [0, 100],
      zRange: [0, 100]
    };
  
    let c2 = {
      xRange: [10, 100],
      yRange: [10, 100],
      zRange: [10, 100]
    };
  
    let c3 = {
      xRange: [30, 90],
      yRange: [20, 100],
      zRange: [10, 80]
    };
    const cuboidMap = new Map();
    cuboidMap.set(getCuboidKey(c1), c1);
    addOnCuboid(cuboidMap, c2);
    addOnCuboid(cuboidMap, c3);
    
    let success = cuboidMap.size === 1 && cuboidMap.has(getCuboidKey(c1));
    //printCuboids([...cuboidMap.values()]);
  
    if (success) {
      console.log(`test3CubesOverlapping passes`);
    }
    else {
      console.error(`***** test3CubesOverlapping fails *****`);
    }
  }
  
  function test3CubesCutIn3() {
    let c1 = {
      xRange: [0, 100],
      yRange: [0, 100],
      zRange: [0, 100]
    };
  
    let c2 = {
      xRange: [10, 200],
      yRange: [0, 100],
      zRange: [0, 100]
    };
  
    let c3 = {
      xRange: [-10, 50],
      yRange: [0, 100],
      zRange: [0, 100]
    };
  
    const cuboidMap = new Map();
    cuboidMap.set(getCuboidKey(c1), c1);
    addOnCuboid(cuboidMap, c2);
    addOnCuboid(cuboidMap, c3);
    
    let success = cuboidMap.size === 3 && cuboidMap.has(getCuboidKey(c1));
    //printCuboids([...cuboidMap.values()]);
  
    if (success) {
      console.log(`test3CubesCutIn3 passes`);
    }
    else {
      console.error(`***** test3CubesCutIn3 fails *****`);
    }
  }
  
  function test3CubesCutInto11() {
    let c1 = {
      xRange: [0, 100],
      yRange: [0, 100],
      zRange: [0, 100]
    };
  
    let c2 = {
      xRange: [-100, 400],
      yRange: [10, 50],
      zRange: [10, 50]
    };
  
    let c3 = {
      xRange: [200, 300],
      yRange: [0, 100],
      zRange: [0, 100]
    };
  
    const cuboidMap = new Map();
    cuboidMap.set(getCuboidKey(c1), c1);
    addOnCuboid(cuboidMap, c2);
    addOnCuboid(cuboidMap, c3);
    
    let success = cuboidMap.size === 11 && cuboidMap.has(getCuboidKey(c1));
    //success = success && cuboidMap.has('-100..-1-10..50-10..50') && cuboidMap.has('101..200-10..50-10..50');
    //printCuboids([...cuboidMap.values()]);
  
    if (success) {
      console.log(`test3CubesCutInto11 passes`);
    }
    else {
      console.error(`***** test3CubesCutInto11 fails *****`);
    }
  }
  
  function testDark_Equal() {
    let c1 = {
      xRange: [0, 100],
      yRange: [0, 100],
      zRange: [0, 100]
    };
  
    let darkC = {
      xRange: [0, 100],
      yRange: [0, 100],
      zRange: [0, 100]
    };
    const cuboidMap = new Map();
    cuboidMap.set(getCuboidKey(c1), c1);
    addDarkCuboid(cuboidMap, darkC);
    let success = cuboidMap.size === 0;
    if (success) {
      console.log(`testDark_Equal passes`);
    }
    else {
      console.error(`***** testDark_Equal fails *****`);
    }
  }
  
  function testDark_Enclose() {
    let c1 = {
      xRange: [0, 100],
      yRange: [0, 100],
      zRange: [0, 100]
    };
  
    let darkC = {
      xRange: [20, 70],
      yRange: [10, 80],
      zRange: [20, 70]
    };
    const cuboidMap = new Map();
    cuboidMap.set(getCuboidKey(c1), c1);
    addDarkCuboid(cuboidMap, darkC);
    //printCuboids([...cuboidMap.values()]);
  
    let success = cuboidMap.size === 26;
    if (success) {
      console.log(`testDark_Enclose passes`);
    }
    else {
      console.error(`***** testDark_Enclose fails *****`);
    }
  }

  testEqual();
  testEnclose();
  testCutInHalf();
  testCutIntoThree();
  testCutInto27();
  testCutIntoEight();
  test3CubesOverlapping();
  test3CubesCutIn3();
  test3CubesCutInto11();
  testDark_Equal();
  testDark_Enclose();
}

function boot(steps) {
  let cuboidMap = new Map();
  let i = 1;
  for(const step of steps) {
    const { operation, xRange, yRange, zRange } = step;
    const cuboid = { xRange, yRange, zRange };

    const status = `${i++}/${steps.length}`;
    //console.log(`${status}: ${operation}`);
    if (operation === 'on') {
      addOnCuboid(cuboidMap, cuboid, status);
    }
    else {
      addDarkCuboid(cuboidMap, cuboid, status);     
    }
    //console.log(`\t${cuboidMap.size}\n`);
  }
  return cuboidMap;
}

function solution1(steps) {    
  steps = steps.map(step => {
    const { operation, xRange, yRange, zRange } = step; 
    const newCuboid = cropCuboid({xRange, yRange, zRange}, INIT_REGION);
    return newCuboid ? Object.assign({}, step, newCuboid) : null;
  })
  .filter(step => !!step);
 
  const cuboidMap = boot(steps);
  return [...cuboidMap.values()].reduce((sum, c) => sum + getCuboidCount(c), 0);
}

function solution2(steps) {  
  const cuboidMap = boot(steps);
  return [...cuboidMap.values()].reduce((sum, c) => sum + getCuboidCount(c), 0);
}

(function run() {
  try {
    const { file } = getArgvs();
    const content = readFileSync(file, { encoding:'utf8' }).trim();
    const steps = parseInput(content);
    
    test();

    let startTime = new Date().getTime();
    let answer = solution1(steps);
    let endTime = new Date().getTime();
    console.log(`Solution 1: ${endTime - startTime} ms`);
    console.log(answer);

    startTime = new Date().getTime();
    answer = solution2(steps);
    endTime = new Date().getTime();
    console.log(`Solution 2: ${endTime - startTime} ms`);
    console.log(answer);
    

  } catch (error) {
    console.error(error);
    process.exit(1);
  }

  process.exit(0);

})();
