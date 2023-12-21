import { forwardAndTurn } from "./utils.js";
import {describe, expect, test} from '@jest/globals'

function isEqualPaths(paths1, paths2) {
 return !paths1.some(path => {
   return !paths2
     .map(p => JSON.stringify(p))
     .includes(JSON.stringify(path));
 })
}

describe('test forward and turn', () => {
  const map = [...Array(10).keys()].map(row => [...Array(10).keys()]);

  test('horizontal forward 1 and turn', () => {
    let paths = forwardAndTurn([1,0], [1,1], 1, map);
    let expectedPaths = [
      [ [1,1], [0,1] ],
      [ [1,1], [2,1] ],
    ]
    expect(paths.length).toBe(2);
    expect(isEqualPaths(paths, expectedPaths)).toBe(true);

    paths = forwardAndTurn([1,5], [1,4], 1, map);
    expectedPaths = [
      [ [1,4], [0,4] ],
      [ [1,4], [2,4] ],
    ]
    expect(paths.length).toBe(2);
    expect(isEqualPaths(paths, expectedPaths)).toBe(true);
  });

  test('vertical forward 1 and turn', () => {
    let paths = forwardAndTurn([0,1], [1,1], 1, map);
    let expectedPaths = [
      [ [1,1], [1,0] ],
      [ [1,1], [1,2] ],
    ]
    expect(paths.length).toBe(2);
    expect(isEqualPaths(paths, expectedPaths)).toBe(true);

    paths = forwardAndTurn([5,1], [4,1], 1, map);
    expectedPaths = [
      [ [4,1], [4,0] ],
      [ [4,1], [4,2] ],
    ]
    expect(paths.length).toBe(2);
    expect(isEqualPaths(paths, expectedPaths)).toBe(true);
  });

  test('horizontal forward 2 and turn', () => {
    let paths = forwardAndTurn([1,0], [1,1], 2, map);
    let expectedPaths = [
      [ [1,1], [1,2], [0,2] ],
      [ [1,1], [1,2], [2,2] ],
    ]
    expect(paths.length).toBe(2);
    expect(isEqualPaths(paths, expectedPaths)).toBe(true);

    paths = forwardAndTurn([1,5], [1,4], 2, map);
    expectedPaths = [
      [ [1,4], [1,3], [0,3] ],
      [ [1,4], [1,3], [2,3] ],
    ]
    expect(paths.length).toBe(2);
    expect(isEqualPaths(paths, expectedPaths)).toBe(true);
  });

  test('vertical forward 2 and turn', () => {
    let paths = forwardAndTurn([0,1], [1,1], 2, map);
    let expectedPaths = [
      [ [1,1], [2,1], [2,0] ],
      [ [1,1], [2,1], [2,2] ],
    ]
    expect(paths.length).toBe(2);
    expect(isEqualPaths(paths, expectedPaths)).toBe(true);

    paths = forwardAndTurn([5,1], [4,1], 2, map);
    expectedPaths = [
      [ [4,1], [3,1], [3,0] ],
      [ [4,1], [3,1], [3,2] ],
    ]
    expect(paths.length).toBe(2);
    expect(isEqualPaths(paths, expectedPaths)).toBe(true);
  });

  test('horizontal forward 3 and turn', () => {
    let paths = forwardAndTurn([1,0], [1,1], 3, map);
    let expectedPaths = [
      [ [1,1], [1,2], [1,3], [0,3] ],
      [ [1,1], [1,2], [1,3], [2,3] ],
    ]
    expect(paths.length).toBe(2);
    expect(isEqualPaths(paths, expectedPaths)).toBe(true);

    paths = forwardAndTurn([1,5], [1,4], 3, map);
    expectedPaths = [
      [ [1,4], [1,3], [1,2], [0,2] ],
      [ [1,4], [1,3], [1,2], [2,2] ],
    ]
    expect(paths.length).toBe(2);
    expect(isEqualPaths(paths, expectedPaths)).toBe(true);
  });

  test('vertical forward 3 and turn', () => {
    let paths = forwardAndTurn([0,1], [1,1], 3, map);
    let expectedPaths = [
      [ [1,1], [2,1], [3,1], [3,0] ],
      [ [1,1], [2,1], [3,1], [3,2] ],
    ]
    expect(paths.length).toBe(2);
    expect(isEqualPaths(paths, expectedPaths)).toBe(true);

    paths = forwardAndTurn([5,1], [4,1], 3, map);
    expectedPaths = [
      [ [4,1], [3,1], [2,1], [2,0] ],
      [ [4,1], [3,1], [2,1], [2,2] ],
    ]
    expect(paths.length).toBe(2);
    expect(isEqualPaths(paths, expectedPaths)).toBe(true);
  });

  test('3 and and of bound', () => {
    // horizontal
    let paths = forwardAndTurn([4,7], [4,8], 3, map);
    expect(paths.length).toBe(0);

    paths = forwardAndTurn([4,1], [4,0], 2, map);
    expect(paths.length).toBe(0);

    // vertical
    paths = forwardAndTurn([8,7], [9,7], 3, map);
    expect(paths.length).toBe(0);

    paths = forwardAndTurn([1,1], [0,1], 2, map);
    expect(paths.length).toBe(0);
  });

  test('3 and reaching target', () => {
    // horizontal
    let paths = forwardAndTurn([9,7], [9,8], 2, map);
    let expectedPaths = [
      [[9,8], [9,9]],
    ]
    expect(paths.length).toBe(1);
    expect(isEqualPaths(paths, expectedPaths)).toBe(true);


    paths = forwardAndTurn([7,9], [8,9], 2, map);
    expectedPaths = [
      [[8,9], [9,9]],
    ]
    expect(paths.length).toBe(1);
    expect(isEqualPaths(paths, expectedPaths)).toBe(true);

  });
})
