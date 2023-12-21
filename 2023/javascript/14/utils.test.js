import { hTilt, tilt } from "./utils.js";
import {describe, expect, test} from '@jest/globals'

describe('hTilt function tests', () => {
  test('should correctly tilt ROUND to the right', () => {
    const row = ['O', '.', '#', 'O', '.'];
    const step = 1;
    expect(hTilt(row, step)).toEqual(['.', 'O', '#', '.', 'O']);
  });

  test('should correctly tilt ROUND to the left', () => {
    const row = ['.', 'O', '#', 'O', '.'];
    const step = -1;
    expect(hTilt(row, step)).toEqual(['O', '.', '#', 'O', '.']);
  });

  test('should handle empty row', () => {
    const row = [];
    const step = 1;
    expect(hTilt(row, step)).toEqual([]);
  });

  test('should not move ROUND if blocked by CUBE', () => {
    const row = ['O', '#', 'O'];
    const step = 1;
    expect(hTilt(row, step)).toEqual(['O', '#', 'O']);
  });

  test('should move ROUND if it is at the edge', () => {
    const row = ['O', '.', '.'];
    const step = 1;
    expect(hTilt(row, step)).toEqual(['.', '.', 'O']);
  });

  test('should move ROUND if blocked by ROUND', () => {
    const row = ['O', '.', '.', 'O', '.', 'O'];
    const step = -1;
    expect(hTilt(row, step)).toEqual(['O', 'O', 'O', '.', '.', '.']);
  });

  // Add more test cases as needed to cover all scenarios
});

describe('tilt function tests', () => {
  const platform = `O....#....
O.OO#....#
.....##...
OO.#O....O`.split('\n').map(line => line.split(''));

  test ('tile north', () => {
    const newPlatform = tilt(platform, 0);
    expect(newPlatform.length).toBe(platform.length);
    expect(newPlatform[0].join('')).toBe('OOOO.#....');
    expect(newPlatform[3].join('')).toBe('...#......');
  });

  test ('tile right', () => {
    const newPlatform = tilt(platform, 3);
    expect(newPlatform.length).toBe(platform.length);
    expect(newPlatform[0].join('')).toBe('....O#....');
    expect(newPlatform[3].join('')).toBe('.OO#....OO');
  });
});

