function gcd(a, b) {
  // Function to find the Greatest Common Divisor using Euclidean algorithm
  if (b === 0) {
    return a;
  }
  return gcd(b, a % b);
}

function lcm(a, b) {
  // Function to find the Least Common Multiple of two numbers
  return Math.abs(a * b) / gcd(a, b);
}

export function findLCM(numbers) {
  // Function to find the LCM of a list of integers
  return numbers.reduce((acc, curr) => lcm(acc, curr), 1);
}
