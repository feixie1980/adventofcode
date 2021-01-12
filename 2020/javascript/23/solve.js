const argv = require('yargs').argv;
const fs = require('fs');

function replacer(key, value) {
  const originalObject = this[key];
  if(originalObject instanceof Map) {
    return {
      dataType: 'Map',
      value: Array.from(originalObject.entries()), // or with spread: value: [...originalObject]
    };
  } else {
    return value;
  }
}

function printUsage() {
  console.log("\nUsage: node solve.js --file=input.txt");
}

function getArgvs() {
  let file = argv.file;
  let moves = argv.moves ? argv.moves : 10;
  let total = argv.total ? argv.total : 9;

  if (!file) {
    console.error(`Missing file`);
    printUsage();
    process.exit(1);
  }

  return { file, moves, total };
}

function parseInput(content) {
  return content.split('').map(s => parseInt(s));
}


function solution1a(numbers, moves) {
  const printPlays = true;
  let currentCupIndex = 0;

  for (let i = 0; i < moves; i++) {
    const currentCup = numbers[currentCupIndex];
    if (printPlays) {
      console.log(`-- move ${i + 1} --`);
      console.log(`cpus: ${ numbers.map(n => n === currentCup ? `(${n})` : `${n}`).join(' ') }`);
    }

    const { newCupIndex, pickups, desValue } = playRound(numbers, currentCupIndex);
    currentCupIndex = newCupIndex;
    if (printPlays) {
      console.log(`pickups: ${ pickups.join(' ') }`);
      console.log(`destination: ${desValue}`);
      console.log('');
    }
  }

  const indexOfOne = numbers.indexOf(1);
  return [...numbers.slice(indexOfOne + 1), ...numbers.slice(0, indexOfOne)].join('');
}

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function playRound(numbers, currentCupIndex) {
  const currentCup = numbers[currentCupIndex];

  // select pickups
  let pickups = numbers.splice(currentCupIndex + 1, 3);
  pickups.push(...numbers.splice(0, 3 - pickups.length));

  // get the destination cup
  let desIndex, desValue;
  if (currentCup === Math.min(...numbers)) {
    desValue = Math.max(...numbers);
    desIndex = numbers.indexOf(desValue);
  }
  else {
    desValue = Math.max(...numbers.filter(n => n < currentCup));
    desIndex = numbers.indexOf(desValue);
  }

  // perform swaps to put pickups back to numbers
  numbers.splice(desIndex + 1, 0, ...pickups);

  // pick next cup
  let newCupIndex = numbers.indexOf(currentCup);
  newCupIndex = newCupIndex === numbers.length - 1 ? 0 : newCupIndex + 1;

  return { newCupIndex, pickups, desValue };
}

function isMin(number, pickups) {
  if (number >= 5)
    return false;

  if (number === 1)
    return true;

  return pickups.filter(p => p < number).length === number - 1;
}

function findMax(pickups, total) {
  let max = total;
  for(let i = 0; i < pickups.length; i++) {
    if(pickups.indexOf(max) === -1) {
      return max;
    }
    max--;
  }
  return max;
}

function findLesser(number, pickups) {
  let r = number - 1;
  for(let i = 0; i < pickups.length; i++) {
    if(pickups.indexOf(r) === -1) {
      return r;
    }
    r--;
  }
  return r;
}

class LinkedList {
  constructor() {
    this.head = null;
    this.tail = null;
    this.numMap = new Map();
  }

  push(array) {
    if (!array || array.length === 0) {
      return;
    }

    for(const value of array) {
      this.insert(value);
    }
  }

  insert(value) {
    if (this.head == null) {
      this.head = { value, prev:null, next: null };
      this.tail = this.head;
    }
    else {
      this.tail.next = { value, prev: this.tail, next: null };
      this.tail = this.tail.next;
    }
    this.numMap.set(value, this.tail);
    return this.tail;
  }

  insertAt(atNode, value) {
    if (!atNode) {
      return this.insert(value);
    }

    const newNode = { value, next: null, prev: null };
    if(atNode !== this.head) {
      newNode.prev = atNode.prev;
      newNode.next = atNode;
      atNode.prev.next = newNode;
      atNode.prev = newNode;
    }
    else {
      atNode.prev = newNode;
      newNode.next = atNode;
      this.head = newNode;
    }

    this.numMap.set(value, newNode);
    return newNode;
  }

  remove(value) {
    const node = this.numMap.get(value);
    if (!node) {
      return null;
    }

    if (node.prev) {
      node.prev.next = node.next;
    }
    else {
      this.head = node.next;
    }

    if (node.next) {
      node.next.prev = node.prev;
    } else {
      this.tail = node.prev;
    }

    this.numMap.delete(value);

    return node;
  }

  splice(pointer, numberToDelete, ...arrayToInsert) {
    let p = pointer;
    let deleted = [];
    for(let i = 0; i < numberToDelete; i++) {
      if (!p)
        break;
      const v = p.value;
      p = p.next;
      deleted.push(v);
      this.remove(v);
    }

    // insert nodes
    if (arrayToInsert && arrayToInsert.length > 0) {
      for( const value of arrayToInsert ) {
        this.insertAt(p, value);
      }
    }

    return deleted;
  }

  getNode(value) {
    return this.numMap.get(value);
  }

  sliceValues(fromNode, toNode) {
    if (!fromNode) {
      return [];
    }

    let array = [];
    let p = fromNode;
    while( !!p && p !== toNode ) {
      array.push(p.value);
      p = p.next;
    }

    return array;
  }

  printAll(specialValue) {
    let p = this.head;
    let values = [];
    while (p) {
      values.push(p.value === specialValue ? `(${p.value})` : `${p.value}`);
      p = p.next;
    }
    return values.join(' ');
  }

  printAllReverse(specialValue) {
    let p = this.tail;
    let values = [];
    while (p) {
      values.push(p.value === specialValue ? `(${p.value})` : `${p.value}`);
      p = p.prev;
    }
    return values.join(' ');
  }
}

function playRoundE(linkedList, currentPointer, total) {
  const currentCup = currentPointer.value;

  // select pickups
  let pickups = linkedList.splice(currentPointer.next, 3);
  //console.log(`reverse: ${ linkedList.printAllReverse() }`);
  pickups.push(...linkedList.splice(linkedList.head, 3 - pickups.length));
  //console.log(`reverse: ${ linkedList.printAllReverse() }`);


  // get the destination cup
  let desPointer, desValue;
  if (isMin(currentCup, pickups)) {
    desValue = findMax(pickups, total);
  }
  else {
    desValue = findLesser(currentCup, pickups);
  }
  desPointer = linkedList.getNode(desValue);

  // perform swaps to put pickups back to numbers
  linkedList.splice(desPointer.next, 0, ...pickups);
  //console.log(`reverse: ${ linkedList.printAllReverse() }`);

  // pick next cup
  let newCurPointer = linkedList.getNode(currentCup);
  newCurPointer = newCurPointer.next ? newCurPointer.next : linkedList.head;

  return { newCurPointer, pickups, desValue };
}

function solution2a(numbers, moves, total) {
  // Add to numbers
  for (let i = Math.max(...numbers) + 1; i <= total; i++) {
    numbers.push(i);
  }

  const printPlays = false;
  let linkedList = new LinkedList();
  linkedList.push(numbers);
  let curPointer = linkedList.head;

  let start = new Date().getTime(), end;
  for (let i = 0; i < moves; i++) {
    const currentCup = curPointer.value;
    if (printPlays) {
      console.log(`-- move ${i + 1} --`);
      console.log(`cpus: ${ linkedList.printAll(currentCup) }`);
      console.log(`reverse: ${ linkedList.printAllReverse() }`);
    }

    const { newCurPointer, pickups, desValue } = playRoundE(linkedList, curPointer, total);
    curPointer = newCurPointer;
    if (printPlays) {
      console.log(`pickups: ${ pickups.join(' ') }`);
      console.log(`destination: ${desValue}`);
      console.log('');
    }

    if (i % 1000000 === 0 && !printPlays) {
      end = new Date().getTime();
      console.log(`processed ${numberWithCommas(i)} - ${end - start}ms`);
      start = new Date().getTime();
    }
  }

  const nodeOfOne = linkedList.getNode(1);
  return nodeOfOne.next.value * nodeOfOne.next.next.value;
}

(function run() {
  try {
    const { file, moves, total } = getArgvs();
    const content = fs.readFileSync(file, { encoding:'utf8' }).trim();
    const numbers = parseInput(content);

    let startTime = new Date().getTime();
    let result = solution2a(numbers, moves, total);
    let endTime = new Date().getTime();
    console.log(`Solution 1.a: ${endTime - startTime} ms`);
    console.log(result);

    /*
    startTime = new Date().getTime();
    result = solution2a([[...players[0]], [...players[1]]]);
    endTime = new Date().getTime();
    console.log(`Solution 2.a: ${endTime - startTime} ms`);
    console.log(result);

     */


  } catch (error) {
    console.error(error);
    process.exit(1);
  }

  process.exit(0);

})();
