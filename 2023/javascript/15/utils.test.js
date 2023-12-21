import { hash } from "./utils.js";
import {describe, expect, test} from '@jest/globals'

describe('test hash', () => {
  test('H', () => {
    expect(hash('H')).toBe(200);
  });

  test('HASH', () => {
    expect(hash('HASH')).toBe(52);
  });

  test('rn=1', () => {
    expect(hash('rn=1')).toBe(30);
  });

  test('test', () => {
    console.log(hash('rn'));
    console.log(hash('cm'));
  })
});
