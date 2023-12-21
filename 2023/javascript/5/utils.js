function getOverlap(segment, destSegment) {
  const [segStart, segLength] = segment;
  const [destStart, length] = destSegment;

  if (segStart + segLength <= destStart || segStart >= destStart + length) {
    return null;
  }

  let desSegStart, desSegLength;
  if (segStart <= destStart) {
    if (segStart + segLength <= destStart + length) {
      desSegStart = destStart;
      desSegLength = segStart + segLength - destStart;
    } else {
      desSegStart = destStart;
      desSegLength = length;
    }
  } else {
    if (segStart + segLength >= destStart + length) {
      desSegStart = segStart;
      desSegLength = destStart + length - segStart;
    } else {
      desSegStart = segStart;
      desSegLength = segLength;
    }
  }

  return [desSegStart, desSegLength];
}

export function toSourceSegments(segment, ranges) {
  const sourceSegments = [];
  ranges.forEach(range => {
    const overlap = getOverlap(segment, [range[0], range[2]]);
    if (!overlap) {
      return;
    }
    const [desSegStart, desSegLength] = overlap;
    const [destStart, srcStart, _] = range;
    const diff = destStart - srcStart;
    const srcSegStart = desSegStart - diff;
    sourceSegments.push([srcSegStart, desSegLength, diff]);
  })
  sourceSegments.sort((a, b) => a[0] - b[0]);
  return sourceSegments;
}

export function findLowestWithSeed(segment, categories, seedSegments) {
  if (categories.length === 0) {
    // we have reach seeds!
    for (const seedSegment of seedSegments) {
      const overlap = getOverlap(segment, seedSegment);
      if (overlap) {
        return overlap[0];
      }
    }
    return null;
  }

  const curCategory = categories[categories.length - 1];
  const srcSegments = toSourceSegments(segment, curCategory.ranges);
  for(const srcSegment of srcSegments) {
    const lowest = findLowestWithSeed(srcSegment, categories.slice(0, categories.length - 1), seedSegments);
    if (lowest) {
      const diff = srcSegment[2];
      return lowest + diff;
    }
  }
  return null;
}
