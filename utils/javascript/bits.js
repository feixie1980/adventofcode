export function mask(input, position) {
  return (input & (1 << position)) >> position;
}

export function flip(input, digits) {
  return ~input & (Math.pow(2, digits) - 1)
}