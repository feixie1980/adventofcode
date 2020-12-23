const argv = require('yargs').argv;
const fs = require('fs');

function printUsage() {
  console.log("\nUsage: node solve.js --file=input.txt");
}

function getArgvs() {
  let file = argv.file;

  if (!file) {
    console.error(`Missing file`);
    printUsage();
    process.exit(1);
  }

  return { file };
}

function parseInput(content) {
  return content.split('\n');
}

function isOp(c) {
  return c === '+' || c === '*';
}

function isNum(c) {
  return !isNaN(parseInt(c));
}

function compute(n1, op, n2) {
  n1 = parseInt(n1);
  n2 = parseInt(n2);
  switch (op) {
    case '+':
      return n1 + n2;

    case '*':
      return n1 * n2;
  }
  throw `unexpected arguments ${n1} ${op} ${n2}`;
}

function eval1(line) {
  let stack = [[]];
  let queue = stack[0];
  for(const c of line) {
    if (isNum(c)) {
      queue.push(parseInt(c));
    } else if (isOp(c)) {
      queue.push(c);
    } else if (c === '(') {
      queue = [];
      stack.push(queue);
    } else if (c === ')') {
      const r = stack.pop()[0];
      queue = stack[stack.length - 1];
      queue.push(r);
    }
    if (queue.length === 3) {
      const r = compute(queue.shift(), queue.shift(), queue.shift());
      queue.push(r);
    }
  }
  return queue[0];
}

function popComputableContexts(stack) {
  let queue = stack[stack.length - 1];
  while(queue.length === 3) {
    const r = compute(queue.shift(), queue.shift(), queue.shift());
    if (queue.isOpenP) {
      queue.push(r);
      break;
    }
    else {
      stack.pop();
      if (stack.length === 0) {
        stack.push([]);
      }
      queue = stack[stack.length - 1];
      queue.push(r);
    }
  }
  return queue;
}

function compareOps(op1, op2) {
  if (op1 === '*' && op2 === '+') {
    return -1;
  }

  if (op1 === '+' && op2 === '*') {
    return 1;
  }

  return 0;
}

function eval2(line) {
  line = line.split('').filter(c => c !== ' ');
  let stack = [[]], context = stack[0];

  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    const nextC = i === line.length - 1 ? null : line[i + 1];

    if (isOp(c)) {
      context.push(c);
    } else if (c === '(') {
      // open parenthesis calls for a new computation context in the stack
      context = [];
      context.isOpenP = true;
      stack.push(context);
    } else {
      let v = c;
      if ( c === ')') {
        // since we compute from left to right, seeing closing parenthesis means the current context should already contain
        // the result for this closing parenthesis
        v = stack.pop()[0];
        context = stack[stack.length - 1];
      }

      if (context.length === 2 && isOp(nextC) && compareOps(nextC, context[1]) > 0) {
        // when we already have v1 op, and ready to push v2, it is time to check if we need to create a new context,
        // because if the next operator has higher precedence than op, then we need to create a new context
        context = [];
        stack.push(context);
        context.push(v);
      }
      else {
        context.push(v);
      }
    }

    if (context.length === 3) {
      // the context has two values and one op, it is time to compute
      const [v1, op, v2] = context;
      if (isOp(nextC) && compareOps(nextC, op) < 0 || nextC === null || nextC === ')') {
        // here we are reaching a "wall", meaning that we should clean up the pending contexts up to the last seen
        // open parenthesis if existed
        context = popComputableContexts(stack);
      }
      else {
        // here we can just compute the context
        const r = compute(v1, op, v2);
        context.splice(0, 3);
        context.push(r);
      }
    }
  }
  return context[0];
}

function solution1a(lines) {
  let sum = 0;
  for (const line of lines) {
    const r = eval1(line);
    sum += r;
  }
  return sum;
}

function solution2a(lines) {
  let sum = 0;
  for (const line of lines) {
    const r = eval2(line);
    sum += r;
    console.log(`${line} = ${r}`);
  }
  return sum;
}

(function run() {
  try {
    const { file, dimension, cycles } = getArgvs();
    const content = fs.readFileSync(file, { encoding:'utf8' }).trim();
    const lines = parseInput(content, dimension);

    let startTime = new Date().getTime();
    let result = solution1a(lines);
    let endTime = new Date().getTime();
    console.log(`Solution 1.a: ${endTime - startTime} ms`);
    console.log(result);

    startTime = new Date().getTime();
    result = solution2a(lines);
    endTime = new Date().getTime();
    console.log(`Solution 2.a: ${endTime - startTime} ms`);
    console.log(result);

  } catch (error) {
    console.error(error);
    process.exit(1);
  }

  process.exit(0);

})();
