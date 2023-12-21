import { findLCM } from "./utils.js";
import {describe, expect, test} from '@jest/globals'

test('test LCM', () => {
  expect(findLCM([2412, 25, 2292, 355])).toBe(817728300);
});
