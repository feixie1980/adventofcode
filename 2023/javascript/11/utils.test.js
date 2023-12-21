import { genDistanceMap, shortestPath } from "./utils.js";
import {describe, expect, test} from '@jest/globals'

const input = `...#......
.......#..
#.........
..........
......#...
.#........
.........#
..........
.......#..
#...#.....`;

const universe = input.split('\n').map(line => line.split(''));

describe('test genDistanceMap', () => {
  test('test default', () => {
    const distMap = genDistanceMap(universe);
    expect(distMap.length).toBe(universe.length);
    expect(distMap[0].length).toBe(universe[0].length);
    distMap.forEach(row => row.forEach(s => expect(s).toBe(1)));
  });

  test('test expand ratio 2', () => {
    const distMap = genDistanceMap(universe, 2);
    expect(distMap.length).toBe(universe.length);
    expect(distMap[0].length).toBe(universe[0].length);

    // test expanded rows
    distMap[3].forEach(s => expect(s).toBe(2));
    distMap[7].forEach(s => expect(s).toBe(2));

    // test expanded columns
    distMap.forEach(row => expect(row[2]).toBe(2));
    distMap.forEach(row => expect(row[5]).toBe(2));
    distMap.forEach(row => expect(row[8]).toBe(2));

    // normal spaces
    universe.forEach((row, i) => row.forEach((s, j) => {
      if (s === '#') {
        expect(distMap[i][j]).toBe(1);
      }
    } ));
  });
})

describe('test shortest path', () => {
  const distMap = genDistanceMap(universe, 2);

  test('test samples', () => {
    expect(shortestPath(distMap,[[0, 3], [1, 7]])).toBe(6);
    expect(shortestPath(distMap,[[1, 7], [0, 3]])).toBe(6);

    expect(shortestPath(distMap,[[5, 1], [9, 4]])).toBe(9);
    expect(shortestPath(distMap,[[9, 4], [5, 1]])).toBe(9);

    expect(shortestPath(distMap,[[0, 3], [8, 7]])).toBe(15);
    expect(shortestPath(distMap,[[8, 7], [0, 3]])).toBe(15);

    expect(shortestPath(distMap,[[2, 0], [8, 7]])).toBe(17);
    expect(shortestPath(distMap,[[8, 7], [2, 0]])).toBe(17);
  })

  test('test same row', () => {
    expect(shortestPath(distMap,[[9, 0], [9, 4]])).toBe(5);
    expect(shortestPath(distMap,[[9, 4], [9, 0]])).toBe(5);
  })

  test('test same column', () => {
    const inputLocal = `...#......
.........#
#.........
..........
......#...
.#........
.........#
..........
.......#..
#...#.....`;

    const universeLocal = inputLocal.split('\n').map(line => line.split(''));
    expect(shortestPath(distMap,[[1, 9], [6, 9]])).toBe(6);
    expect(shortestPath(distMap,[[6, 9], [1, 9]])).toBe(6);
  })
});
