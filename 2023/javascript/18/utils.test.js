import { digGround, expandGround, getDigCounts, isInside, toSegments } from "./utils.js";
import {describe, expect, test} from '@jest/globals'

const content = `R 6 (#70c710)
D 5 (#0dc571)
L 2 (#5713f0)
D 2 (#d2c081)
R 2 (#59c680)
D 2 (#411b91)
L 5 (#8ceee2)
U 2 (#caa173)
L 1 (#1b58a2)
U 2 (#caa171)
R 2 (#7807d2)
U 3 (#a77fa3)
L 2 (#015232)
U 2 (#7a21e3)`;

describe('expandGround function', () => {
  test('throws error if ground is null', () => {
    expect(() => expandGround(null, 'R', 2)).toThrow('invalid ground, must contain at least one meter cube');
  });

  test('throws error if ground is empty', () => {
    expect(() => expandGround([], 'R', 2)).toThrow('invalid ground, must contain at least one meter cube');
  });

  test('throws error for invalid direction', () => {
    expect(() => expandGround([['.']], 'X', 2)).toThrow('unexpected error while expanding ground');
  });

  test('expands ground to the right', () => {
    const initialGround = [['.']];
    const expandedGround = expandGround(initialGround, 'R', 2);
    expect(expandedGround).toEqual([['.', '.', '.']]);
  });

  test('expands ground to the left', () => {
    const initialGround = [['.']];
    const expandedGround = expandGround(initialGround, 'L', 2);
    expect(expandedGround).toEqual([['.', '.', '.']]);
  });

  test('expands ground upwards', () => {
    const initialGround = [['.']];
    const expandedGround = expandGround(initialGround, 'U', 2);
    expect(expandedGround).toEqual([['.'], ['.'], ['.']]);
  });

  test('expands ground downwards', () => {
    const initialGround = [['.']];
    const expandedGround = expandGround(initialGround, 'D', 2);
    expect(expandedGround).toEqual([['.'], ['.'], ['.']]);
  });

  test('handles multiple rows ground expanding to the right', () => {
    const initialGround = [['.', '.'], ['.', '.']];
    const expandedGround = expandGround(initialGround, 'R', 2);
    expect(expandedGround).toEqual([['.', '.', '.', '.'], ['.', '.', '.', '.']]);
  });

  test('handles multiple rows ground expanding to the left', () => {
    const initialGround = [['.', '.'], ['.', '.']];
    const expandedGround = expandGround(initialGround, 'L', 2);
    expect(expandedGround).toEqual([['.', '.', '.', '.'], ['.', '.', '.', '.']]);
  });

  test('handles multiple rows ground expanding upwards', () => {
    const initialGround = [['.', '.'], ['.', '.']];
    const expandedGround = expandGround(initialGround, 'U', 2);
    expect(expandedGround).toEqual([['.', '.'], ['.', '.'], ['.', '.'], ['.', '.']]);
  });

  test('handles multiple rows ground expanding downwards', () => {
    const initialGround = [['.', '.'], ['.', '.']];
    const expandedGround = expandGround(initialGround, 'D', 2);
    expect(expandedGround).toEqual([['.', '.'], ['.', '.'], ['.', '.'], ['.', '.']]);
  });
});

describe('digGround function', () => {
  test('dig to the right', () => {
    let ground = [
      ['.']
    ];
    ground = digGround([0,0], { dir:'R', length:6 }, ground).ground;
    expect(ground).toStrictEqual([['.', '#', '#', '#', '#', '#', '#']]);

    ground = [
      ['.', '.', '.', '.', '.']
    ];
    ground = digGround([0,0], { dir:'R', length:2 }, ground).ground;
    expect(ground).toStrictEqual([['.', '#', '#', '.', '.']]);

    ground = [
      ['.', '.', '.', '.', '.'],
      ['.', '.', '.', '.', '.'],
    ];
    ground = digGround([1,3], { dir:'R', length:3 }, ground).ground
    expect(ground).toStrictEqual([
      ['.', '.', '.', '.', '.', '.', '.'],
      ['.', '.', '.', '.', '#', '#', '#'],
    ]);
  });

  test('dig to the Left', () => {
    let ground = [
      ['.']
    ];
    ground = digGround([0,0], { dir:'L', length:6 }, ground).ground;
    expect(ground).toStrictEqual([['#', '#', '#', '#', '#', '#', '.']]);

    ground = [
      ['.', '.', '.', '.', '.']
    ];
    ground = digGround([0,2], { dir:'L', length:4 }, ground).ground;
    expect(ground).toStrictEqual([['#', '#', '#', '#', '.', '.', '.']]);

    ground = [
      ['.', '.', '.', '.', '.'],
      ['.', '.', '.', '.', '.'],
    ];
    ground = digGround([1,1], { dir:'L', length:3 }, ground).ground;
    expect(ground).toStrictEqual([
      ['.', '.', '.', '.', '.', '.', '.'],
      ['#', '#', '#', '.', '.', '.', '.'],
    ]);
  })

  test('dig down', () => {
    let ground = [
      ['.'],
    ];
    ground = digGround([0,0], { dir:'D', length:6 }, ground).ground;
    expect(ground).toStrictEqual([
      ['.'],
      ['#'],
      ['#'],
      ['#'],
      ['#'],
      ['#'],
      ['#'],
    ]);

    ground = [
      ['.', '.', '.', '.', '.']
    ];
    ground = digGround([0,0], { dir:'D', length:2 }, ground).ground;
    expect(ground).toStrictEqual([
      ['.', '.', '.', '.', '.'],
      ['#', '.', '.', '.', '.'],
      ['#', '.', '.', '.', '.']
    ]);

    ground = [
      ['.', '.', '.', '.', '.'],
      ['.', '.', '.', '.', '.'],
    ];
    ground = digGround([1,3], { dir:'D', length:3 }, ground).ground;
    expect(ground).toStrictEqual([
      ['.', '.', '.', '.', '.'],
      ['.', '.', '.', '.', '.'],
      ['.', '.', '.', '#', '.'],
      ['.', '.', '.', '#', '.'],
      ['.', '.', '.', '#', '.'],
    ]);

    ground = [
      ['.', '.', '.', '.', '.'],
      ['.', '.', '.', '.', '.'],
      ['.', '.', '.', '.', '.'],
      ['.', '.', '.', '.', '.'],
    ];
    ground = digGround([1,3], { dir:'D', length:2 }, ground).ground;
    expect(ground).toStrictEqual([
      ['.', '.', '.', '.', '.'],
      ['.', '.', '.', '.', '.'],
      ['.', '.', '.', '#', '.'],
      ['.', '.', '.', '#', '.'],
    ]);
  });

  test('dig up', () => {
    let ground = [
      ['.'],
    ];
    ground = digGround([0,0], { dir:'U', length:6 }, ground).ground;
    expect(ground).toStrictEqual([
      ['#'],
      ['#'],
      ['#'],
      ['#'],
      ['#'],
      ['#'],
      ['.'],
    ]);

    ground = [
      ['.', '.', '.', '.', '.']
    ];
    ground = digGround([0,0], { dir:'U', length:2 }, ground).ground;
    expect(ground).toStrictEqual([
      ['#', '.', '.', '.', '.'],
      ['#', '.', '.', '.', '.'],
      ['.', '.', '.', '.', '.'],
    ]);

    ground = [
      ['.', '.', '.', '.', '.'],
      ['.', '.', '.', '.', '.'],
    ];
    ground = digGround([1,3], { dir:'U', length:3 }, ground).ground;
    expect(ground).toStrictEqual([
      ['.', '.', '.', '#', '.'],
      ['.', '.', '.', '#', '.'],
      ['.', '.', '.', '#', '.'],
      ['.', '.', '.', '.', '.'],
    ]);

    ground = [
      ['.', '.', '.', '.', '.'],
      ['.', '.', '.', '.', '.'],
      ['.', '.', '.', '.', '.'],
      ['.', '.', '.', '.', '.'],
    ];
    ground = digGround([2,3], { dir:'U', length:2 }, ground).ground;
    expect(ground).toStrictEqual([
      ['.', '.', '.', '#', '.'],
      ['.', '.', '.', '#', '.'],
      ['.', '.', '.', '.', '.'],
      ['.', '.', '.', '.', '.'],
    ]);
  });

  describe('isInside', () => {
    test('test 1', () => {
      let grid = [
        '..#.......#..',
        '..#.......#..',
        '..#.......#..'
      ].map(str => str.split(''));
      expect(isInside(grid, [1,0])).toBe(false);
      expect(isInside(grid, [1,4])).toBe(true);
      expect(isInside(grid, [1,12])).toBe(false);
    });

    test('test 2', () => {
      let grid = [
        '.....#....#..',
        '..####....#..',
        '..#.......#..'
      ].map(str => str.split(''));
      expect(isInside(grid, [1,0])).toBe(false);
      expect(isInside(grid, [1,7])).toBe(true);
      expect(isInside(grid, [1,12])).toBe(false);
    });

    test('test 3', () => {
      let grid = [
        '..........#.#',
        '..####....#.#',
        '..#..#....#.#'
      ].map(str => str.split(''));
      expect(isInside(grid, [1,0])).toBe(false);
      expect(isInside(grid, [1,7])).toBe(false);
      expect(isInside(grid, [1,11])).toBe(true);
    });

    test('test 3', () => {
      let grid = [
        '.#......................#.................#.....#',
        '.#####....#######.......#.........#########.....#',
        '.....#....#.....#.......####......#.............#',
      ].map(str => str.split(''));
      expect(isInside(grid, [1,0])).toBe(false);
      expect(isInside(grid, [1,8])).toBe(true);
      expect(isInside(grid, [1,22])).toBe(true);
      expect(isInside(grid, [1,29])).toBe(false);
      expect(isInside(grid, [1,45])).toBe(true);
    });




  });
});

describe('getDigIndexes', () => {
  const digPlan = content.split('\n').map(line => {
    const parts = line.split(' ');
    return {
      dir: parts[0],
      length: parseInt(parts[1]),
      color: parts[2],
    }
  });
  const segments = toSegments(digPlan);

  test('test example', () => {
    expect(getDigCounts(segments, 0)).toBe(7);
    expect(getDigCounts(segments, 1)).toBe(7);
    expect(getDigCounts(segments, 2)).toBe(7);
    expect(getDigCounts(segments, 3)).toBe(5);
    expect(getDigCounts(segments, 4)).toBe(5);
    expect(getDigCounts(segments, 5)).toBe(7);
    expect(getDigCounts(segments, 6)).toBe(5);
    expect(getDigCounts(segments, 7)).toBe(7);
    expect(getDigCounts(segments, 8)).toBe(6);
    expect(getDigCounts(segments, 9)).toBe(6);
  });
})
