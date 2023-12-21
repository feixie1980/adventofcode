import {
  combSprings,
  findArrangements,
  findConfigArrangements, firstMatchingIndex,
  getCutoffSpring,
  matchConfiguration,
  permuSprings,
  replaceSprings,
  trimCharFromString
} from "./utils.js";
import {describe, expect, test} from '@jest/globals'

describe('test findArrangements', () => {
  test('????.######..#####. 1,6,5', () => {
    const springs = '????.######..#####.'.split('');
    const configuration = [1, 6, 5];
    const results = findArrangements(springs, configuration);
    expect(results.length).toBe(4);
  });

  test('?###???????? 3,2,1', () => {
    const springs = '?###????????'.split('');
    const configuration = [3, 2, 1];
    const results = findArrangements(springs, configuration);
    expect(results.length).toBe(10);
  });

  test('?#?#?#?#?#?#?#? 1,3,1,6', () => {
    const springs = '?#?#?#?#?#?#?#?'.split('');
    const configuration = [1, 3, 1, 6];
    const results = findArrangements(springs, configuration);
    expect(results.length).toBe(1);
  });

  test('.??..??...?##. 1,1,3', () => {
    const springs = '.??..??...?##.'.split('');
    const configuration = [1, 1, 3];
    const results = findArrangements(springs, configuration);
    expect(results.length).toBe(4);
  });

  test('???.### 1,1,3', () => {
    const springs = '???.###'.split('');
    const configuration = [1, 1, 3];
    const results = findArrangements(springs, configuration);
    expect(results.length).toBe(1);
    expect(results[0].join('')).toBe('#.#.###');
  });
});

describe('test firstMatchingIndex', () => {
  test("test", () => {
    expect(firstMatchingIndex('###.#.###..#', 3)).toBe(0);
    expect(firstMatchingIndex('...###.#.###..#', 3)).toBe(3);
    expect(firstMatchingIndex('##.#.###..#', 3)).toBe(-1);
    expect(firstMatchingIndex('....#.##..#', 3)).toBe(-1);
    expect(firstMatchingIndex('.#.##..###', 3)).toBe(-1);
    expect(firstMatchingIndex('###', 3)).toBe(0);
    expect(firstMatchingIndex('##', 3)).toBe(-1);
    expect(firstMatchingIndex('###.###..##', 1)).toBe(-1);
  });
})

describe.skip('test getCutoffSpring', () => {
  test ('#?#?#?#?#?#? [1, 6]', () => {
    expect(getCutoffSpring('#?#?#?#?#?#?'.split(''), [1, 6]).join(''))
      .toBe('#?#');
  });

  test ('no more configs', () => {
    const string = '###';
    const restOfConfig = [];
    expect(getCutoffSpring(string.split(''), restOfConfig).join('')).toBe('###');
  });

  test ('no more configs2', () => {
    const string = '.?..';
    const restOfConfig = [];
    expect(getCutoffSpring(string.split(''), restOfConfig).join('')).toBe('.?..');
  });

  test(`use first #'s to cut off`, () => {
    const string = '..####...??...##..##.';
    const restOfConfig = [1, 1];
    expect(getCutoffSpring(string.split(''), restOfConfig).join('')).toBe('..####');
  });

  test(`first #'s overlap with rest of config length`, () => {
    const string = '..#####.?#..??.';
    const restOfConfig  =[3, 4];
    expect(getCutoffSpring(string.split(''), restOfConfig).join('')).toBe('..#####');
  })

  test(`use rest of config length to cut off`, () => {
    const string = '..####.?#..??.';
    const restOfConfig = [4, 4];
    expect(getCutoffSpring(string.split(''), restOfConfig).join('')).toBe('..####');
  })

  test(`no #'s, use rest of config length to cut off`, () => {
    const string = '...?...??..??.';
    const restOfConfig = [4, 4];
    expect(getCutoffSpring(string.split(''), restOfConfig).join('')).toBe('...?');
  })
})

describe.skip('test permuSprings', () => {
  test('test one spring', () => {
    const perms = permuSprings(1);
    expect(perms.length).toBe(2);
  })

  test('test two spring', () => {
    const perms = permuSprings(2);
    expect(perms.length).toBe(4);
  })

  test('test 6 spring', () => {
    const perms = permuSprings(6);
    expect(perms.length).toBe(Math.pow(2, 6));
  })
});

describe('test combSprings', () => {
  test('should return empty array if damanged > n', () => {
    expect(combSprings(3, 4)).toEqual([]);
  });

  test('should return array with n # characters if damanged === n', () => {
    expect(combSprings(3, 3)).toEqual(['###']);
  });

  test('should return array with n . characters if damanged === 0', () => {
    expect(combSprings(3, 0)).toEqual(['...']);
  });

  test('check return counts', () => {
    expect(combSprings(7, 3).length).toEqual(35);
    expect(combSprings(20, 6).length).toEqual(38760);
  });

  test('check return array item length', () => {
    expect(combSprings(3, 2)[0].length).toEqual(3);
    expect(combSprings(20, 6)[0].length).toEqual(20);
  });

  test('check results', () => {
    expect(combSprings(7, 3).includes('..#.#.#')).toBe(true);
    expect(combSprings(7, 3).includes('###....')).toBe(true);
    expect(combSprings(7, 3).includes('###..##')).toBe(false);
  })

  test('check no repeats', () => {
    const result = combSprings(20, 6);
    const set = new Set(result);
    expect(set.size).toBe(result.length);
  })

  test('should handle negative values for n and damanged', () => {
    expect(() => combSprings(-1, -2)).toThrow('negative n or damanged encountered'); // Expected behavior might change based on function update
  });
})

describe('test replaceSprings', () => {
  test('test', () => {
    const springs = '??..#.?.?##???.'.split('');
    const replaceString = '#.##..#.';
    expect(replaceSprings(springs, replaceString).join('')).toBe('#...#.#.###..#.');
  })
})

describe('test matchConfiguration', () => {
  test('test', () => {
    expect(matchConfiguration('.#'.split(''), [1])).toBe(true);
    expect(matchConfiguration('.##...#...###.'.split(''), [1,1,3])).toBe(false);
    expect(matchConfiguration('###.###'.split(''), [1,1,3])).toBe(false);
    expect(matchConfiguration('.##.###'.split(''), [1,1,3])).toBe(false);
    expect(matchConfiguration('..##.###.#.'.split(''), [2,3,1])).toBe(true);
    expect(matchConfiguration('##.###.#.'.split(''), [2,3,1])).toBe(true);
    expect(matchConfiguration('.##.###.#'.split(''), [2,3,1])).toBe(true);
    expect(matchConfiguration('##.###.#'.split(''), [2,3,1])).toBe(true);
    expect(matchConfiguration('..#.###.#.'.split(''), [2,3,1])).toBe(false);
    expect(matchConfiguration('....###'.split(''), [1,1,3])).toBe(false);
  })
})

describe('test trimCharFromString', () => {
  test('test', () => {
    expect(trimCharFromString('..###...###...', '.')).toBe('###...###');
    expect(trimCharFromString('..###...###..#', '.')).toBe('###...###..#');
  })
});

describe('test findConfigArrangements', () => {
  test (`#?#?#?#?#?#? 3, [1,6]`, () => {
    let matches = findConfigArrangements('#?#?#?#?#?#?'.split(''), 3, [1, 6]);
    expect(matches.length).toBe(1);
  })

  test(`no match tests`, () => {
    let matches = findConfigArrangements('?.###'.split(''), 2, [3]);
    expect(matches.length).toBe(0);
  })

  test(`some tests`, () => {
    let matches = findConfigArrangements('????????'.split(''), 2, [1]);
    expect(matches.length).toBe(5);
  })

  test.skip(`some tests`, () => {
    let matches = findConfigArrangements('?###????????'.split(''), 3, [2, 1]);
    expect(matches.length).toBe(1);
    expect(matches[0].join('')).toBe('.###.');
  })

  test.skip(`some tests`, () => {
    let matches = findConfigArrangements('??.###'.split(''), 1, [3]);
    expect(matches.length).toBe(2);
    matches.forEach(match => {
      const expectedMatches = ['.#.', '#.'];
      expect(expectedMatches.includes(match.join(''))).toBe(true);
    })

    matches = findConfigArrangements('?.###'.split(''), 1, [3]);
    expect(matches.length).toBe(1);
  })

  test.skip(`some tests`, () => {
    let matches = findConfigArrangements('???.###'.split(''), 1, [1, 3]);
    expect(matches.length).toBe(1);
  })

  test.skip(`springs start with #'s without ?'s`, () => {
    let matches = findConfigArrangements('..####...??...##..##.'.split(''), 4, []);
    expect(matches.length).toBe(1);
    expect(matches[0].join('')).toBe('..####.');

    matches = findConfigArrangements('..##...??...##..##.'.split(''), 4, []);
    expect(matches.length).toBe(0);

    matches = findConfigArrangements('..#######...??...##..##.'.split(''), 4, []);
    expect(matches.length).toBe(0);

    matches = findConfigArrangements('####...??...##..##.'.split(''), 4, []);
    expect(matches.length).toBe(1);
    expect(matches[0].join('')).toBe('####.');
  })
})
