export function hash(string) {
  return [...string].reduce((v, c) => (v + c.charCodeAt(0)) * 17 % 256, 0);
}
