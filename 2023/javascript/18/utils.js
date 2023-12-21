export function expandGround(ground, dir, length) {
  if (!ground || !ground[0]) {
    throw `invalid ground, must contain at least one meter cube`;
  }

  switch (dir) {
    case 'R': {
      ground = ground.map(row => [...row, ...Array.from({ length }, () => '.')]);
    }
    break;

    case 'L': {
      ground = ground.map(row => [...Array.from({ length }, () => '.'), ...row]);
    }
    break;

    case 'U': {
      const rowLength = ground[0].length;
      ground = [
        ...Array.from(
          { length },
          () => Array.from({ length:rowLength }, () => '.')
        ),
        ...ground
      ];
    }
    break;

    case 'D': {
      const rowLength = ground[0].length;
      ground = [
        ...ground,
        ...Array.from(
          { length },
          () => Array.from({ length:rowLength }, () => '.')
        )
      ];
    }
    break;

    default:
      throw `unexpected error while expanding ground`;
  }

  return ground;
}

export function digGround(fromPos, digIns, ground) {
  const { dir, length, color } = digIns;
  const [x, y] = fromPos;
  let endPos;

  switch (dir) {
    case 'R': {
      endPos = [x, y + length];
      const expandLength = endPos[1] - ground[x].length + 1;
      if (expandLength > 0) {
        // need to expand
        ground = expandGround(ground, dir, expandLength);
      }
      // digging
      for(let i = y + 1; i <= endPos[1]; i++) {
        ground[x][i] = '#';
      }
    }
    break;

    case 'L': {
      endPos = [x, y - length];
      const expandLength = 0 - endPos[1];
      if (expandLength > 0) {
        // need to expand
        ground = expandGround(ground, dir, expandLength);
        fromPos = [x, y + expandLength];
        endPos = [x, y - length + expandLength];
      }

      // digging
      for(let i = fromPos[1] - 1; i >= endPos[1]; i--) {
        ground[x][i] = '#';
      }
    }
    break;

    case 'D': {
      endPos = [x + length, y];
      const expandLength = endPos[0] - ground.length + 1;
      if (expandLength > 0) {
        // need to expand
        ground = expandGround(ground, dir, expandLength);
      }
      // digging
      for(let i = x + 1; i <= endPos[0]; i++) {
        ground[i][y] = '#';
      }
    }
    break;

    case 'U': {
      endPos = [x - length, y];
      const expandLength = 0 - endPos[0];
      if (expandLength > 0) {
        // need to expand
        ground = expandGround(ground, dir, expandLength);
        fromPos = [x + expandLength, y];
        endPos = [x  - length + expandLength, y];
      }
      // digging
      for(let i = fromPos[0] - 1; i >= endPos[0]; i--) {
        ground[i][y] = '#';
      }
    }
    break;

    default:
      throw `expected dig direction: ${dir}`;
  }

  return { ground, endPos };
}

export function isInside(ground, p) {
  const [x, y] = p;
  if (ground[x][y] === '#') {
    return true;
  }

  let wallCount = 0;
  let i = y + 1;
  while(i < ground[x].length) {
    let tile = ground[x][i];
    if (tile === '.') {
      i++;
      continue;
    }
    const digCounts = { up: 0, down: 0 };
    while(tile === '#') {
      if (x - 1 >= 0 && ground[x-1][i] === '#') {
        digCounts.up += 1;
      }
      if (x + 1 < ground.length && ground[x+1][i] === '#') {
        digCounts.down += 1;
      }

      i++;
      if (i === ground[x].length) {
        break;
      }
      tile = ground[x][i];
    }

    if (digCounts.up + digCounts.down !== 2) {
      throw `unexpected digCounts: ${JSON.stringify(digCounts)}`;
    }

    if (digCounts.up === 1 && digCounts.down === 1) {
      wallCount += 1;
    }
    else {
      wallCount += 2;
    }
  }

  return wallCount % 2 !== 0;
}

export function digGroundSegments(fromPos, digIns, segments) {
  const { dir, length, color } = digIns;
  const [x, y] = fromPos;
  let start, end;

  switch (dir) {
    case 'R':
      start = [x, y + 1];
      end = [x, y + length];
      break;

    case 'L':
      start = [x, y - 1];
      end = [x, y - length];
      break;

    case 'D':
      start = [x + 1, y];
      end = [x + length, y];
      break;

    case 'U':
      start = [x - 1, y];
      end = [x - length, y];
      break;
  }

  return [...segments, { start, end }];
}

export function normalize(segments) {
  let minX = Number.MAX_SAFE_INTEGER, minY = Number.MAX_SAFE_INTEGER;
  for(let segment of segments) {
    const { start, end } = segment;
    minX = Math.min(...[minX, start[0], end[0]]);
    minY = Math.min(...[minX, start[1], end[1]]);
  }
  const offsetX = 0 - minX;
  const offsetY = 0 - minY;

  return segments.map(segment => {
    const { start, end } = segment;
    return {
      start: [start[0] + offsetX, start[1] + offsetY],
      end: [end[0] + offsetX, end[1] + offsetY],
    };
  });
}

export function countDigs(segments, x) {
  const posList = getDigCounts(segments, x);
  const lastIndex = row.lastIndexOf('#');
  let i = 0;
  while (i <= lastIndex) {

  }
}

export function toSegments(digPlan) {
  let segments = [];
  let start = [0, 0];
  for (let digIns of digPlan) {
    segments = digGroundSegments(start, digIns, segments);
    start = segments[segments.length - 1].end;
  }
  segments = normalize(segments);
  return segments;
}

function getMinYofSegment(segment, x) {
  const {start, end} = segment;

  if (start[1] === end[1]) {
    // vertical segment
    return start[1];
  }

  // horizontal segment
  return start[1] < end[1] ? start[1] : end[1];
}

function getHitSegmentsObjs(segments, x) {
  let hitSegmentsObjs = segments
    .map((segment, i) => {
      return {
        prevSegment: i === 0 ? segments[segments.length - 1] : segments[i - 1],
        nextSegment: i === segments.length - 1 ? segments[0] : segments[i + 1],
        segment
      }
    });

  hitSegmentsObjs = hitSegmentsObjs
    .filter(segmentObj => {
      const {start, end} = segmentObj.segment;
      return x >= start[0] && x <= end[0] || x >= end[0] && x <= start[0];
    });

  // order by starting y values
  hitSegmentsObjs.sort((obj1, obj2) => getMinYofSegment(obj1.segment, x) - getMinYofSegment(obj2.segment, x));
  return hitSegmentsObjs;
}

function isVertical(segmentObj) {
  return segmentObj.segment.start[1] === segmentObj.segment.end[1];
}

/**
 *     #
 *  x  #
 *     #
 */
function hitThrough(segmentObj, x) {
  const { start, end } = segmentObj.segment;
  return isVertical(segmentObj) && start[0] !== x && end[0] !== x;
}

/**
 *     #
 *     #
 *  x  #
 */
function hitEnds(segmentObj, x) {
  const { start, end } = segmentObj.segment;
  return isVertical(segmentObj) && (start[0] === x || end[0] === x);
}


function turnAround(segmentObj) {
  /**
   *     #        #
   *     #        #
   *     # ########
   */
  const { prevSegment, nextSegment, segment } = segmentObj;
  return prevSegment.start[0] < prevSegment.end[0] && nextSegment.start[0] > nextSegment.end[0]
    || prevSegment.start[0] > prevSegment.end[0] && nextSegment.start[0] < nextSegment.end[0];
}

export function getDigCounts(segments, x) {
  const segmentObjs = getHitSegmentsObjs(segments, x);
  let count = 0;

  let isInside = false;
  let i = 0;
  let l = 0; // y of last #

  while(i < segmentObjs.length) {
    const segObj = segmentObjs[i];
    const { start, end } = segObj.segment;

    if(hitThrough(segObj, x)) {
      count++;
      /**
       *     #
       *  x  #
       *     #
       */
      const y = start[1];
      if (isInside) {
        count += y - l - 1;
      }

      l = y;
      isInside = !isInside;
      i++;
      continue;
    }

    if(hitEnds(segObj, x)) {
      const y = start[1];
      count++;
      /**
       *     #
       *     #
       *     # ########
       */
      if (isInside) {
        count += y - l - 1;
      }

      // may be followed by a horizontal segment
      const horSegmentObj = segmentObjs[i + 1];

      if (horSegmentObj?.segment.start[1] === y + 1 || horSegmentObj?.segment.end[1] === y + 1) {
        // is followed by a horizontal segment
        const horLength = Math.abs(horSegmentObj.segment.start[1] - horSegmentObj.segment.end[1]) + 1;
        count += horLength;
        l = y + horLength;

        // determine if we go from inside <--> outside
        if (!turnAround(horSegmentObj)) {
          /**
           *     #
           *     #
           *     # ########
           *              #
           *              #
           */
          isInside = !isInside;
        }
        i += 2;
      } else {
        // is NOT followed by a horizontal segment
        l = y;
        isInside = !isInside;
        i++;
      }
      continue;
    }

    // hitting horizontal
    /**
     *            #
     *            #
     *    ####### #
     */
    const y = start[1] < end[1] ? start[1] : end[1];
    if (isInside) {
      count += y - l - 1;
    }
    const horLength = Math.abs(start[1] - end[1]) + 1;

    // must be followed by a vertical segment
    count += horLength + 1;
    l = y + horLength;

    // determine if we go from inside <--> outside
    if (!turnAround(segObj)) {
      /**
       *     #
       *     #
       *     # ########
       *              #
       *              #
       */
      isInside = !isInside;
    }
    i += 2;
  }

  return count;
}
