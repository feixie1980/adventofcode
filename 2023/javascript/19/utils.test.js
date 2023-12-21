import { mergeRanges } from "./utils.js";
import {describe, expect, test} from '@jest/globals'

describe('mergeRanges function', () => {
  test('merges non-overlapping ranges correctly', () => {
    const ranges1 = { x: [0, 100] };
    const ranges2 = { y: [101, 200] };
    const expected = { x: [0, 100], y: [101, 200] };
    expect(mergeRanges(ranges1, ranges2)).toEqual(expected);
  });

  test('merges overlapping ranges correctly', () => {
    const ranges1 = { x: [50, 150] };
    const ranges2 = { x: [100, 200] };
    const expected = { x: [100, 150] };
    expect(mergeRanges(ranges1, ranges2)).toEqual(expected);
  });

  test('returns "NA" for non-overlapping parts in the same range', () => {
    const ranges1 = { x: [0, 50] };
    const ranges2 = { x: [51, 100] };
    const expected = { x: 'NA' };
    expect(mergeRanges(ranges1, ranges2)).toEqual(expected);
  });

  test('handles multiple range keys', () => {
    const ranges1 = { x: [0, 100], y: [200, 300] };
    const ranges2 = { x: [50, 150], z: [400, 500] };
    const expected = { x: [50, 100], y: [200, 300], z: [400, 500] };
    expect(mergeRanges(ranges1, ranges2)).toEqual(expected);
  });

  test('handles empty range objects', () => {
    const ranges1 = {};
    const ranges2 = { x: [100, 200] };
    const expected = { x: [100, 200] };
    expect(mergeRanges(ranges1, ranges2)).toEqual(expected);
  });

  test('handles both range objects being empty', () => {
    const ranges1 = {};
    const ranges2 = {};
    const expected = {};
    expect(mergeRanges(ranges1, ranges2)).toEqual(expected);
  });
});
