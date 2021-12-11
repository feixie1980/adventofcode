/*
  Puzzle: https://www.quantamagazine.org/the-puzzling-power-of-simple-arithmetic-20210420/
 */


function getRearrangement(number) {
  const sequence = `${number}`.split('');
  const desc = parseInt([...sequence].sort((a, b) => b - a).join(''));
  const asc = parseInt([...sequence].sort().join(''));
  return { desc, asc };
}

function reachRepeating(number, printSteps) {
  let answers = [];
  let iteration = 0;
  while (true) {
    const { desc, asc } = getRearrangement(number);
    const newNumber = desc - asc;
    iteration++;
    printSteps && console.log(`${iteration}: ${newNumber}`);
    const prevIndex = answers.indexOf(newNumber);
    if ( prevIndex !== -1) {
      return {
        steps: iteration - 1,
        loop: answers.slice(prevIndex)
      };
    }
    number = newNumber;
    answers.push(number);
  }
}

function reachRepeatDecimal(x, k, printSteps= false) {
  let answers = [];
  let iteration = 0;
  while(true) {
    let new_x = k * x * (1 - x);
    new_x = new_x.toFixed(10);
    iteration++;
    printSteps && console.log(`${iteration}: ${new_x}`);
    const prevIndex = answers.indexOf(new_x);
    if ( prevIndex !== -1) {
      return {
        steps: iteration - 1,
        loop: answers.slice(prevIndex)
      };
    }
    x = new_x;
    answers.push(x);
  }
}

function loop4Digits() {
  let max = { index: -1, value: -1 };
  for(let i = 1000; i <= 9999; i ++) {
    const { steps } = reachRepeating(i);
    if (max.value < steps) {
      max = { index: i, value: steps };
    }
  }
  console.log(`max: ${JSON.stringify(max)}`);
}

function loop5Digits() {
  for (let i = 23145; i <= 24145; i++) {
    const {steps, loop} = reachRepeating(i);
    console.log(`number: ${i}, steps:${steps}, loop size:${loop.length}, loop start:${loop[0]}, loop size:${loop.length}, loop:${loop}`);
  }
}

function tryNumber(number) {
  const { steps, loop } = reachRepeating(number, true);
  console.log(`number: ${number}, steps:${steps}, loop start:${loop[0]}, loop:${loop}`);
}

function tryDecimal(x, k) {
  const { steps, loop } = reachRepeatDecimal(x, k,false);
  console.log(`x: ${x}, k:${k}, steps:${steps}, loop size:${loop.length}, loop start:${loop[0]}`);
}

(function run() {
  tryDecimal(0.5, 3);
})();
