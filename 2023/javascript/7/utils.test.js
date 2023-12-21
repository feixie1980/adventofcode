import { compareHands, HandType, typeOfHand, toJHand, compareJHands } from "./utils.js";
import { describe, expect, test } from '@jest/globals'

describe('test five of a kind', () => {
  test('wrong hand size', () => {
    expect(() => typeOfHand('aaa')).toThrow('hand needs to have exactly five cards');
    expect(() => typeOfHand('aaaaaa')).toThrow('hand needs to have exactly five cards');
  });

  test('expected hands', () => {
    expect(typeOfHand('aaaaa')).toBe(HandType.FiveOfAKind);
    expect(typeOfHand('11111')).toBe(HandType.FiveOfAKind);

    expect(typeOfHand('aaaba')).toBe(HandType.FourOfAKind);
    expect(typeOfHand('aaaab')).toBe(HandType.FourOfAKind);

    expect(typeOfHand('aaabb')).toBe(HandType.FullHose);
    expect(typeOfHand('aabab')).toBe(HandType.FullHose);

    expect(typeOfHand('aaabc')).toBe(HandType.ThreeOfAKind);
    expect(typeOfHand('baaca')).toBe(HandType.ThreeOfAKind);

    expect(typeOfHand('aabbc')).toBe(HandType.TwoPair);
    expect(typeOfHand('acbab')).toBe(HandType.TwoPair);

    expect(typeOfHand('aabcd')).toBe(HandType.OnePair);
    expect(typeOfHand('bcada')).toBe(HandType.OnePair);

    expect(typeOfHand('abcde')).toBe(HandType.HighCard);
  });
});

describe('test compareHands', () => {
  test('compare', () => {
    expect(compareHands('AAAAA', 'AAAA2')).toBeGreaterThan(0);
    expect(compareHands('AAAAA', 'JJJJJ')).toBeGreaterThan(0);

    expect(compareHands('2AJ2A', 'A2J2A')).toBeLessThan(0);
    expect(compareHands('2AJ2A', 'AKQJT')).toBeGreaterThan(0);
  });
});

describe('test typeOfHandWithWildcard', () => {
  test('no J', () => {
    expect(toJHand('12AKQ')).toBe('12AKQ');
    expect(toJHand('KKK33')).toBe('KKK33');
  });

  test('all J', () => {
    expect(toJHand('JJJJJ')).toBe('22222');
  });

  test ('some J', () => {
    expect(toJHand('T55J5')).toBe('T5555');
    expect(toJHand('KTJJT')).toBe('KTTTT');
    expect(toJHand('QQQJA')).toBe('QQQQA');
    expect(toJHand('123J5')).toBe('12315');
  });
})

describe('test compareJHands', () => {
  test('compare', () => {
    expect(compareJHands('AAAAA', 'AAAA2')).toBeGreaterThan(0);
    expect(compareJHands('AAAAA', 'JJJJJ')).toBeGreaterThan(0);

    expect(compareJHands('2AJ2A', 'A2J2A')).toBeLessThan(0);
    expect(compareJHands('2AJ2A', 'AKQJT')).toBeGreaterThan(0);

    expect(compareJHands('KTJJT', 'QQQJA')).toBeGreaterThan(0);
  });
});
