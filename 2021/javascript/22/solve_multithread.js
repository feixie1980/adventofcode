import { readFileSync } from 'fs';
import Yargs from "yargs";
import { Worker, isMainThread, parentPort, workerData } from 'worker_threads';
import { fileURLToPath } from 'url';
import { exit } from 'process';
const __filename = fileURLToPath(import.meta.url);
const CORE_COUNT = 6;
const OPTIMIZATION_ON = true;
const REGION_SIDE = 100;
const TEST_LIMITS = {
  xRange: [-50, 50],
  yRange: [-50, 50],
  zRange: [-50, 50]
};

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
  let isTest = args.isTest === 'true';

  if (!file) {
    console.error(`Missing file`);
    printUsage();
    process.exit(1);
  }

  return { file, isTest };
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
            onCubesSet.add(cubeKey);
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

function isOverlapping(range1, range2) {
  return !(
    range1[0] < range2[0] && range1[1] < range2[0] || 
    range1[0] > range2[1] && range1[1] > range2[1]
  );
}

// filter out steps that do not affect the region
function findOverlapSteps(steps, region) {
  return steps.filter(step => 
    isOverlapping(step.xRange, region.xRange) &&
    isOverlapping(step.yRange, region.yRange) &&
    isOverlapping(step.zRange, region.zRange)
  );
}

function removeLeadingOffSteps(steps) {
  const firstOnIndex = steps.findIndex(step => step.operation === 'on');
  if (firstOnIndex == -1) {
    return [];
  }
  else {
    return steps.slice(firstOnIndex);
  }
}

function rebootOnRegion(steps, region) {
  let overlapSteps = findOverlapSteps(steps, region);
  overlapSteps = removeLeadingOffSteps(overlapSteps);

  if (overlapSteps.length === 0) {
    return { numOn: 0, executed: 0 };
  }
  else if (OPTIMIZATION_ON && overlapSteps.length === 1) {
    let { xRange, yRange, zRange } = overlapSteps[0];
    xRange = limitRange(xRange, region.xRange);
    yRange = limitRange(yRange, region.yRange);
    zRange = limitRange(zRange, region.zRange);
    let numOn = (xRange[1] - xRange[0] + 1) * (yRange[1] - yRange[0] + 1) * (zRange[1] - zRange[0] + 1);
    return { numOn, executed: 1 };
  }
  else {
    let onCubesSet = new BigSet();
    for (const step of overlapSteps) {
      //operate(onCubesSet, step, region);      
    }
    return { numOn: onCubesSet.size, executed: overlapSteps.length };
  }
  
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
        let xHigh = x + size;
        xHigh = xHigh > limits.xRange[1] ? limits.xRange[1] : xHigh;
        let yHigh = y + size;
        yHigh = yHigh > limits.yRange[1] ? limits.yRange[1] : yHigh;
        let zHigh = z + size;
        zHigh = zHigh > limits.zRange[1] ? limits.zRange[1] : zHigh;
        yield {
          xRange: [x, xHigh],
          yRange: [y, yHigh],
          zRange: [z, zHigh]
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

function rebootOnLimits(workerId, limits, steps) {
  const estRegions = numberWithCommas(estimateRegionSize(limits, REGION_SIDE));
  let i = 0, sum = 0;
  for (const region of genNextRegion(limits, REGION_SIDE)) {    
    let start = new Date().getTime();
    const { numOn, executed } = rebootOnRegion(steps, region);
    sum += numOn;
    i++;
    let end = new Date().getTime();
    if ( executed > 1 /*|| i % 1000000 === 0*/) {
      //console.log(`worker-${workerId} -- ${numberWithCommas(i)}/${estRegions}: x=${region.xRange[0]}..${region.xRange[1]}\ty=${region.yRange[0]}..${region.yRange[1]}\tz=${region.zRange[0]}..${region.zRange[1]}\tsum=${sum}`);
      parentPort.postMessage({
        type: 'log',
        data: `worker-${workerId} ${numberWithCommas(i)}/${estRegions}\texec:${executed}\tcount=${numOn}\tx=${region.xRange[0]}..${region.xRange[1]}\ty=${region.yRange[0]}..${region.yRange[1]}\tz=${region.zRange[0]}..${region.zRange[1]}\tsum=${sum}\ttime:${end - start}`
      });
    }
  }
  return sum;
}

function divideLimits(limits, count) {
  const { xRange, yRange, zRange } = limits;
  const step = Math.ceil((xRange[1] - xRange[0] + 1) / count);
  let limitsList = [];
  // divid base on xRange
  for (let i = 0; i < count; i++) {
    const xLow = xRange[0] + i * step;
    let xHigh = xRange[0] + (i+1) * step - 1;
    xHigh = xHigh > xRange[1] ? xRange[1] : xHigh;
    limitsList.push({
      xRange: [ xLow, xHigh ],
      yRange, zRange
    })
  }
  return limitsList;
}

function solution2(steps, isTest) {  
  return new Promise( (resolve, reject) => {
    let limits = isTest ? TEST_LIMITS : findLimits(steps);    
    
    const subLimits = divideLimits(limits, CORE_COUNT);
    let workers = new Set();
    for(let i = 0; i < subLimits.length; i++) {
      workers.add(new Worker(__filename, { workerData: { id: i, limits: subLimits[i], steps } }));
    }

    let sum = 0;
    for (const worker of workers) {
      worker.on('error', err => reject(err));
      worker.on('message', message => {
        const { id, type, data } = message;
        if (type === 'log') {
          console.log(data);
        }
        else {
          console.log(`worker ${id}: ${data}`);
          sum += data;
        }
        
      });
      worker.on('exit', () => {
        console.log(`All workers done!`);
        workers.delete(worker);
        if (workers.size === 0) {
          resolve(sum);
        }
      });
    }  
  });
  
}

if (isMainThread) {
  (async function run() {  
    try {
      const { file, isTest } = getArgvs();
      const content = readFileSync(file, { encoding:'utf8' }).trim();
      const steps = parseInput(content);
      
      let startTime = new Date().getTime();
      let answer = await solution2(steps, isTest);
      let endTime = new Date().getTime();
      console.log(`Solution 2: ${endTime - startTime} ms`);
      console.log(answer);    
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  
    process.exit(0);
  
  })();
}
else {
  const { id, limits, steps } = workerData;
  const result = rebootOnLimits(id, limits, steps);
  parentPort.postMessage( { type: "result", id, data: result });
}
