import { toSourceSegments, findLowestWithSeed } from "./utils.js";
import {describe, expect, test} from '@jest/globals'

describe('test toSourceSegments', () => {
  const ranges = [
    [0, 11, 42],
    [42, 0, 7],
    [49, 53, 8],
    [57, 7, 4],
    [64, 64, Number.MAX_SAFE_INTEGER - 64]
  ];

  test('cover multiple', () => {
    const segment = [13, 45];
    const srcSegments = toSourceSegments(segment, ranges);
    expect(srcSegments.length).toBe(4);
    expect(srcSegments[0][0]).toBe(0);
    expect(srcSegments[0][1]).toBe(7);
    expect(srcSegments[1][0]).toBe(7);
    expect(srcSegments[1][1]).toBe(1);
    expect(srcSegments[2][0]).toBe(24);
    expect(srcSegments[2][1]).toBe(29);
    expect(srcSegments[3][0]).toBe(53);
    expect(srcSegments[3][1]).toBe(8);
  });

  test('overlapped by one', () => {
    const segment = [43, 3];
    const sourceSegments = toSourceSegments(segment, ranges);
    expect(sourceSegments.length).toBe(1);
    expect(sourceSegments[0][0]).toBe(1);
    expect(sourceSegments[0][1]).toBe(3);
  });

  test('out of range', () => {
    const segment = [80, 10];
    const sourceSegments = toSourceSegments(segment, ranges);
    expect(sourceSegments.length).toBe(1);
    expect(sourceSegments[0][0]).toBe(80);
    expect(sourceSegments[0][1]).toBe(10);
  });

  test('specific', () => {
    const segment = [77, 10];
    const ranges = [
      [0, 0, 18],
      [18, 25, 70],
      [88, 18, 7]
    ];
    const srcSegments = toSourceSegments(segment, ranges);
    expect(srcSegments.length).toBe(1);
    expect(srcSegments[0][0]).toBe(84);
    expect(srcSegments[0][1]).toBe(10);
  })
});

describe('test findLowestWithSeed', () => {
  const seedSegments = [[ 55, 13 ], [ 79, 14 ]];

  test('no category, no matching seed', () => {
    let segment = [3, 10];
    let lowest = findLowestWithSeed(segment, [], seedSegments);
    expect(lowest).toBeNull();

    segment = [70, 2];
    lowest = findLowestWithSeed(segment, [], seedSegments);
    expect(lowest).toBeNull();

    segment = [100, 80];
    lowest = findLowestWithSeed(segment, [], seedSegments);
    expect(lowest).toBeNull();
  });

  test('no category, has matching seed', () => {
    let segment = [3, 80];
    let lowest = findLowestWithSeed(segment, [], seedSegments);
    expect(lowest).toBe(55);

    segment = [59, 80];
    lowest = findLowestWithSeed(segment, [], seedSegments);
    expect(lowest).toBe(59);

    segment = [70, 80];
    lowest = findLowestWithSeed(segment, [], seedSegments);
    expect(lowest).toBe(79);

    segment = [81, 80];
    lowest = findLowestWithSeed(segment, [], seedSegments);
    expect(lowest).toBe(81);
  });
});


