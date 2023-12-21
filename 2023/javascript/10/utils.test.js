import {
  findConnectedPositions,
  findLoopRoute,
  findStartPos,
  getNeighbours,
  printMap,
  wallsHit
} from "./utils.js";
import {describe, expect, test} from '@jest/globals'
import { readFileSync } from 'fs';


describe.skip('findConnectedPositions', () => {

  const content = `.....
.F-7.
.|.|.
.L-J.
.....`;

  const map = content.split('\n').map(line => line.trim().split(''));

  test('|', () => {
    let posList = findConnectedPositions(map, [2, 1]);
    expect(posList.length).toBe(2);
    expect(posList[0].toString()).toBe([1, 1].toString());
    expect(posList[1].toString()).toBe([3, 1].toString());

    posList = findConnectedPositions(map, [2, 3]);
    expect(posList.length).toBe(2);
  })

  test('-', () => {
    let posList = findConnectedPositions(map, [1, 2]);
    expect(posList.length).toBe(2);

    posList = findConnectedPositions(map, [3, 2]);
    expect(posList.length).toBe(2);
  })

  test('L', () => {
    let posList = findConnectedPositions(map, [3, 1]);
    expect(posList.length).toBe(2);
  })
})

describe.skip('test printMap', () => {
  test('test pring', () => {
    const content = `.....
.F-7.
.|.|.
.L-J.
.....`;
    const map = content.split('\n').map(line => line.trim().split(''));
    console.log(printMap(map));
  });
});

describe.skip('test getNeighbours', () => {
  test('getNeighbours', () => {
    const p = [4, 4];
    const neighbours = getNeighbours(p)
    expect(neighbours.length).toBe(8);
  });
});

describe('test isInside', () => {
  test('test 1', () => {
    const input = `..........
.S------7.
.|F----7|.
.||....||.
.||....||.
.|L-7F-J|.
.|..||..|.
.L--JL--J.
..........
`;
    const map = input.split('\n').map(line => line.split(''));
    const start = findStartPos(map);
    const route = findLoopRoute(map, start);

    expect(wallsHit(map, route, [3, 3])).toBe(2);
    expect(wallsHit(map, route, [4, 7])).toBe(2);
    expect(wallsHit(map, route, [6, 3])).toBe(1);
    expect(wallsHit(map, route, [6, 6])).toBe(3);
    expect(wallsHit(map, route, [0, 3])).toBe(0);
    expect(wallsHit(map, route, [4, 9])).toBe(4);
    expect(wallsHit(map, route, [5, 9])).toBe(4);
  });

  test('test 1', () => {
    const input = `.F----7F7F7F7F-7....
.|F--7||||||||FJ....
.||.FJ||||||||L7....
FJL7L7LJLJ||LJ.L-7..
L--J.L7...LJS7F-7L7.
....F-J..F7FJ|L7L7L7
....L7.F7||L7|.L7L7|
.....|FJLJ|FJ|F7|.LJ
....FJL-7.||.||||...
....L---J.LJ.LJLJ...
`;
    const map = input.split('\n').map(line => line.split(''));
    const start = findStartPos(map);
    const route = findLoopRoute(map, start);

    expect(wallsHit(map, route, [2, 3])).toBe(2);
    expect(wallsHit(map, route, [6, 6])).toBe(1);
    expect(wallsHit(map, route, [3, 14])).toBe(11);
  });
});
