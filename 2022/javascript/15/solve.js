import { readFileSync } from 'fs';
import Yargs from "yargs";

function printUsage() {
  console.log("\nUsage: node solve.js --file=input.txt --y=10  --max=20");
}

const args = Yargs(process.argv.slice(2)).argv;
function getArgvs() {
  let file = args.file;
  let y = args.y;
  let max = args.max;

  if (!file) {
    console.error(`Missing file`);
    printUsage();
    process.exit(1);
  }

  if (!y) {
    console.error(`Missing y`);
    printUsage();
    process.exit(1);
  }

  if (!max) {
    console.error(`Missing max`);
    printUsage();
    process.exit(1);
  }

  return { file, y: parseInt(y), max: parseInt(max) };
}

function parseInput(content) {
  return content.split('\n').map(line => {
    let pair;
    line.replace(/(Sensor\sat\sx=)(-*[0-9]+)(,\sy=)(-*[0-9]+)(:\sclosest\sbeacon\sis\sat\sx=)(-*[0-9]+)(,\sy=)(-*[0-9]+)/,
      (whole, l1, sx, l2, sy, l3, bx, l4, by) => {
        pair = {
          sensor: { x: parseInt(sx), y:parseInt(sy) },
          beacon: { x: parseInt(bx), y:parseInt(by) },
        }
      });
    return pair;
  });
}

function coordToKey(coord) {
  return `${coord.x}-${coord.y}`;
}

function getDistant(coord1, coord2) {
  return Math.abs(coord1.x - coord2.x) + Math.abs(coord1.y - coord2.y);
}

function fillImpSet({sensor, beacon}, yTarget, impSet) {
  const maxDist = getDistant(sensor, beacon);
  const minDistToTarget = getDistant(sensor, {x: sensor.x, y: yTarget});
  for(let i = 0; i <= maxDist - minDistToTarget; i++) {
    impSet.add(coordToKey({
      x: sensor.x + i,
      y: yTarget
    }));
    impSet.add(coordToKey({
      x: sensor.x - i,
      y: yTarget
    }));
  }
  impSet.delete(coordToKey(beacon));
}

/**
 * Merge the newSegment to segments in place.
 *
 * The segments is assumed to contain a list of non-overlaping segments ordered in increasing order
 *
 * @param segments
 * @param newSegments
 */
function mergeIntoSegments(segments, newSegment) {
  let mergedSegment = Object.assign({}, newSegment);
  if (segments.length === 0) {
    return [newSegment];
  }

  const indexToRemove = [];

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    if( mergedSegment.s >= seg.s && mergedSegment.s <= seg.e ) {
      if (mergedSegment.e <= seg.e) {
        /*
            new    s-----e
            seg  s----------e
            mer  s----------e
        */
        return segments;
      } else {
        /*
            new    s------------...
            seg  s----------e
            mer  s--------------...
        */
        mergedSegment.s = seg.s;
        indexToRemove.push(i);
        continue;
      }
    }

    if ( mergedSegment.s < seg.s && mergedSegment.e > seg.e ) {
      /*
        new  s------------------------e
        seg      s----------e
        mer  s------------------------e
      */
      indexToRemove.push(i);
      continue;
    }

    if ( mergedSegment.s < seg.s && mergedSegment.e >= seg.s && mergedSegment.e <= seg.e ) {
      /*
        new  s--------e
        seg      s---------e
        mer  s-------------e
      */
      mergedSegment.e = seg.e;
      indexToRemove.push(i);
    }
  }

  const newSegments = segments.filter((_, i) => !indexToRemove.includes(i));
  const indexToInsertBefore = newSegments.findIndex(seg => mergedSegment.s < seg.s);
  if (indexToInsertBefore === -1) {
    newSegments.push(mergedSegment);
  } else {
    newSegments.splice(indexToInsertBefore, 0, mergedSegment);
  }
  return newSegments;
}

function computeImpSegments({sensor, beacon}, yTarget, segments) {
  const maxDist = getDistant(sensor, beacon);
  const minDistToTarget = getDistant(sensor, {x: sensor.x, y: yTarget});
  const diff = maxDist - minDistToTarget;

  if (diff <= 0) {
    return segments;
  }

  let newSegments = [];
  if (beacon.y === yTarget) {
    if (beacon.x > sensor.x - diff) {
      newSegments.push({ s: sensor.x - diff, e: beacon.x - 1 });
    }
    if (beacon.x < sensor.x + diff) {
      newSegments.push({ s: beacon.x + 1, e: sensor.x + diff });
    }
  }
  else {
    newSegments.push({ s: sensor.x - diff, e: sensor.x + diff });
  }

  for(const newSegment of newSegments) {
    segments = mergeIntoSegments(segments, newSegment);
  }

  return segments;
}

function countPoints(segments) {
  return segments.reduce((sum, segment) => sum + segment.e - segment.s + 1, 0);
}

function solution1(pairs, yTarget) {
  let segments = [];
  // segments = computeImpSegments({sensor:{x:8,y:7}, beacon:{x:2,y:10}}, yTarget, segments);
  for(const pair of pairs) {
    segments = computeImpSegments(pair, yTarget, segments);
  }
  return countPoints(segments);
}

function solution1_bruteforce(pairs, yTarget) {
  let impSet = new Set();
  for(const pair of pairs) {
    fillImpSet(pair, yTarget, impSet);
  }
  return impSet.size;
}

function possiblePoints(segments, y, max) {
  const points = [];
  let i = 0;
  for(const segment of segments) {
    if (segment.s > i) {
      for (let x = i; x < segment.s; x++) {
        points.push({x, y});
      }
    }
    i = segment.e + 1;
    if (i > max) {
      break;
    }
  }

  if (i < max) {
    for (let x = i; x <= max; x++) {
      points.push({x, y});
    }
  }
  return points;
}

function solution2(pairs, max) {
  const beaconSet = pairs.reduce((bSet, pair) => {
    bSet.add(coordToKey(pair.beacon));
    return bSet;
  }, new Set());

  for(let y = 0; y <= max; y++) {
    let segments = [];
    for(const pair of pairs) {
      segments = computeImpSegments(pair, y, segments);
    }

    const points = possiblePoints(segments, y, max);
    for(const point of points) {
      if (!beaconSet.has(coordToKey(point))) {
        // we find the winner
        return point.x * 4000000 + point.y;
      }
    }
  }
  return false;
}

(function run() {
  try {
    const { file, y, max } = getArgvs();
    const content = readFileSync(file, { encoding:'utf8' }).trim();
    const pairs = parseInput(content);

    let startTime = new Date().getTime();
    let answer = solution1(pairs, y);
    let endTime = new Date().getTime();
    console.log(`Solution 1: ${endTime - startTime} ms`);
    console.log(answer);

    startTime = new Date().getTime();
    answer = solution2(pairs, max);
    endTime = new Date().getTime();
    console.log(`Solution 2: ${endTime - startTime} ms`);
    console.log(answer);

  } catch (error) {
    console.error(error);
    process.exit(1);
  }

  process.exit(0);

})();
