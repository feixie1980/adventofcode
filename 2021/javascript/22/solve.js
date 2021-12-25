import { readFileSync } from 'fs';
import Yargs from "yargs";
import { Worker, isMainThread, parentPort } from 'worker_threads';

class BigSet {
  constructor(maxSize) {
    this.setList = [new Set()];
    this.sizeLimit = 16777216;
    this.max = maxSize ? maxSize : 3;
  }

  add = e => {
    const lastSet = this.setList[this.setList.length - 1];
    if (lastSet.size < this.sizeLimit) {
      lastSet.add(e);
    } else {
      if (this.setList.length < this.max) {
        const newSet = new Set();
        newSet.add(e);
        this.setList.push(new Set());
      }
      else {
        throw `Exceeding max BigSet limit: ${this.max}!`
      }
    }
  }

  has = e => {
    for (const set of this.setList) {
      if (set.has(e)) {
        return true;
      }
    }
    return false;
  }

  delete = e => {
    for (const set of this.setList) {
      if (set.has(e)) {
        set.delete(e);
      }
    }
  }

  get size() {
    return this.setList.reduce((sum, set) => sum + set.size, 0);
  }
};

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

function getCubeKey(x, y, z) {
  return `${x}:${y}:${z}`;
}

function limitRange(range, maxRange) {
  return [
    range[0] >= maxRange[0] ? range[0] : maxRange[0],
    range[1] <= maxRange[1] ? range[1] : maxRange[1]
  ];
}

function operate(onCubesSet, step, region) {
  let { operation, xRange, yRange, zRange } = step;
  if (region) {
    xRange = limitRange(xRange, region.xRange);
    yRange = limitRange(yRange, region.yRange);
    zRange = limitRange(zRange, region.zRange);
  }

  for (let x = xRange[0]; x <= xRange[1]; x++) {
    for (let y = yRange[0]; y <= yRange[1]; y++) {
      for (let z = zRange[0]; z <= zRange[1]; z++) {
        const cubeKey = getCubeKey(x, y, z);
        if (operation === 'on') {
          if (!onCubesSet.has(cubeKey)) {
            try {
              onCubesSet.add(cubeKey);            
            } catch (e) {
              console.log(`failed at ${onCubesSet.size}`);
              throw e;
            }
          }
        }
        else {
          if (onCubesSet.has(cubeKey)) {
            onCubesSet.delete(cubeKey);
          }
        }
      }
    }
  }
}

function rebootOnRegion(steps, region) {
  let onCubesSet = new BigSet();
  for (const step of steps) {
    operate(onCubesSet, step, region);
  }
  return onCubesSet.size;
}

function solution1(steps) {
  return 0;

  const region = {
    xRange: [-50, 50],
    yRange: [-50, 50],
    zRange: [-50, 50]
  };
  return rebootOnRegion(steps, region);
}

function findLimits(steps) {
  let xRange = [0, 0];
  xRange[0] = Math.min(...steps.map(step => step.xRange[0]));
  xRange[1] = Math.max(...steps.map(step => step.xRange[1]));

  let yRange = [0, 0];
  yRange[0] = Math.min(...steps.map(step => step.yRange[0]));
  yRange[1] = Math.max(...steps.map(step => step.yRange[1]));

  let zRange = [0, 0];
  zRange[0] = Math.min(...steps.map(step => step.zRange[0]));
  zRange[1] = Math.max(...steps.map(step => step.zRange[1]));

  return { xRange, yRange, zRange };
}

function* genNextRegion(limits, size) {
  for(let x = limits.xRange[0]; x < limits.xRange[1]; x += size + 1) {
    for(let y = limits.yRange[0]; y < limits.yRange[1]; y += size + 1) {
      for(let z = limits.zRange[0]; z < limits.zRange[1]; z += size + 1) {
        yield {
          xRange: [x, x + size],
          yRange: [y, y + size],
          zRange: [z, z + size]
        };
      }
    }
  }
}

function numberWithCommas(x) {
  return x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
}

function estimateRegionSize(limits, size) { 
    return Math.ceil((limits.xRange[1] - limits.xRange[0]) / size) *
      Math.ceil((limits.yRange[1] - limits.yRange[0]) / size) *
      Math.ceil((limits.zRange[1] - limits.zRange[0]) / size);  
}

function solution2(steps) {  
  const limits = findLimits(steps);
  console.log(`limits`);
  console.log(JSON.stringify(limits, null, 2));
  const estRegions = numberWithCommas(estimateRegionSize(limits, 500));

  let i = 0, sum = 0;
  for (const region of genNextRegion(limits, 500)) {    
    let start = new Date().getTime();
    const numOn = rebootOnRegion(steps, region);
    let end = new Date().getTime();
    sum += numOn;
    i++;
    if (numOn !== 0 || i % 10000 === 0) {
      console.log(`${numberWithCommas(i)}/${estRegions}\tcount=${numOn}\tx=${region.xRange[0]}..${region.xRange[1]}\ty=${region.yRange[0]}..${region.yRange[1]}\tz=${region.zRange[0]}..${region.zRange[1]}\tsum=${sum}\ttime:${end - start}`);
    }
  }
  
  return sum;
}

(function run() {
  try {
    const { file } = getArgvs();
    const content = readFileSync(file, { encoding:'utf8' }).trim();
    const steps = parseInput(content);
    
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
