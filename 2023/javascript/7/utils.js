export const CardValue = {
  '2': 0,
  '3': 1,
  '4': 2,
  '5': 3,
  '6': 4,
  '7': 5,
  '8': 6,
  '9': 7,
  'T': 8,
  'J': 9,
  'Q': 10,
  'K': 11,
  'A': 12
}

export const JCardValue = {
  'J': 0,
  '2': 1,
  '3': 2,
  '4': 3,
  '5': 4,
  '6': 5,
  '7': 6,
  '8': 7,
  '9': 8,
  'T': 9,
  'Q': 10,
  'K': 11,
  'A': 12
}

export const HandType = {
  HighCard: 0,
  OnePair: 1,
  TwoPair: 2,
  ThreeOfAKind: 3,
  FullHose: 4,
  FourOfAKind: 5,
  FiveOfAKind: 6
}

export function typeOfHand(hand) {
  if (hand.length !== 5) {
    throw 'hand needs to have exactly five cards';
  }

  const map = new Map();
  [...hand].forEach(c => {
    if (!map.has(c))
      map.set(c, 0);
    map.set(c, map.get(c) + 1);
  });

  const list = [...map];
  list.sort((a, b) => b[1] - a[1]);

  switch (list.length) {
    case 1:
      return HandType.FiveOfAKind;

    case 2:
      if (list[0][1] === 4)
        return HandType.FourOfAKind;
      if (list[0][1] === 3)
        return HandType.FullHose;
      break;

    case 3:
      if (list[0][1] === 3)
        return HandType.ThreeOfAKind;
      if (list[0][1] === 2)
        return HandType.TwoPair;
      break;

    case 4:
      return HandType.OnePair;

    case 5:
      return HandType.HighCard;

    default:
      throw `unexpected hand: ${hand}, not matching any type`;
  }
}

export function compareHands(hand1, hand2) {
  const type1 = typeOfHand(hand1);
  const type2 = typeOfHand(hand2);

  if (type1 !== type2) {
    return type1 - type2;
  }

  for(let i = 0; i < hand1.length; i++) {
    const v1 = CardValue[hand1[i]], v2 = CardValue[hand2[i]];
    if ( v1 !== v2) {
      return v1 - v2;
    }
  }

  return 0;
}

export function toJHand(hand) {
  const cardSet = new Set(hand);
  if (!cardSet.has('J')) {
    return hand;
  }

  cardSet.delete('J');
  if (cardSet.size === 0) {
    // JJJJJ
    return '22222';
  }

  let jHand = null, maxHandType = -1;
  for(const c of cardSet) {
    const newHand = hand.replaceAll('J', c);
    const newType = typeOfHand(newHand);
    if (newType > maxHandType) {
      jHand = newHand;
      maxHandType = newType;
    }
  }

  return jHand;
}

export function compareJHands(hand1, hand2) {
  const jHand1 = toJHand(hand1), jHand2 = toJHand(hand2);

  const type1 = typeOfHand(jHand1);
  const type2 = typeOfHand(jHand2);

  // compare type using jhand
  if (type1 !== type2) {
    return type1 - type2;
  }

  // compare card values using original hand
  for(let i = 0; i < hand1.length; i++) {
    const v1 = JCardValue[hand1[i]], v2 = JCardValue[hand2[i]];
    if ( v1 !== v2) {
      return v1 - v2;
    }
  }

  return 0;
}
