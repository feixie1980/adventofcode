import { readFileSync } from 'fs';
import Yargs from "yargs";

const EMPTY = '.';

const AMPHIPOD_ROOM_IDX = {
  'A': 0, 'B': 1, 'C': 2, 'D': 3
};

const AMPHIPOD_STEP_ENERGY = {
  'A': 1, 'B': 10, 'C': 100, 'D': 1000
};

function printUsage() {
  console.log("\nUsage: node solve.js --file=input.txt");
}

const args = Yargs(process.argv.slice(2)).argv;
function getArgvs() {
  let file = args.file;

  if (!file) {
    console.error(`Missing file`);
    printUsage();
    process.exit(1);
  }

  return { file };
}

function parseInput(content) {
  const lines = content.split('\n');

  // parse hallway
  let hallway;
  lines[1].replace(/(#)(\.+)(#)/g, (match, p1, hallwayDots, p2) => {
    hallway = hallwayDots.split('').map(() => EMPTY);
  });

  // parse room and first occupant
  let rooms = [];
  for (let i = 0; i < lines[2].length; i++) {
    const c = lines[2][i];
    if (c === '#') {
      continue;
    }
    rooms.push({
      hallwayIndex: i - 1,
      destAmphipod: Object.entries(AMPHIPOD_ROOM_IDX).find(([amphipod, roomIdx]) => roomIdx === rooms.length)[0],
      occupants: [c, EMPTY]
    });
  }

  let ln = 3;
  while ([...(lines[ln].trim())].filter(c => c !== '#').length !== 0) {
    for (let i = 0; i < lines[3].length; i++) {
      const c = lines[ln][i];
      if (c === '#' || c === ' ') {
        continue;
      }
      const room = rooms.find(room => room.hallwayIndex === i - 1);
      room.occupants[ln - 2] = c;
    }
    ln++;
  }
  

  return { hallway, rooms };
}

function isEmptyRoom(room) {
  return room.occupants.filter(a => a !== EMPTY).length === 0;
}

function isOptimalRoom(room) {
  return room.occupants.filter(a => a !== room.destAmphipod).length === 0;
}

function isMixedRoom(room) {
  return room.occupants.filter((a => a !== EMPTY && a !== room.destAmphipod)).length !== 0;
}

function isFinalState(rooms) {
  return rooms.filter(room => !isOptimalRoom(room)).length === 0;
}

function hasOptimalOccupant(room, occupantIndex) {
  const amphipod = room.occupants[occupantIndex];
  return amphipod && amphipod === room.destAmphipod;
}

function genMovesForHallway(hallway, rooms) {
  const moves = [];
  hallway.forEach((c, idx) => {
    if (c !== EMPTY) { // check if c can move to its destination room
      const roomIndex = AMPHIPOD_ROOM_IDX[c];
      const destRoom = rooms[roomIndex];        
      const hallwaySeg = idx < destRoom.hallwayIndex ?
        hallway.slice(idx + 1, destRoom.hallwayIndex + 1) :
        hallway.slice(destRoom.hallwayIndex, idx) ;
      const canPassHallway = hallwaySeg.filter(s => s !== EMPTY).length === 0;                
      if (canPassHallway) {
        let move = {
          amphipod: c,
          from: { idx }, // hallway
          cost: AMPHIPOD_STEP_ENERGY[c] * hallwaySeg.length,
          to: null
        };
        updateMoveToDestRoom(rooms, destRoom, move);    
        if (move.to) {
          moves.push(move);
        }
      }      
    }
  });
  return moves;
}

// Get the start and end of possible destination hallway indexes starting from idx
function getHallwayDests(hallway, idx) {
  let p = idx - 1, start = idx, end = idx;

  // going left
  while (p >= 0 && hallway[p] === EMPTY ) {
    start = p;
    p--;
  }
  
  //going right
  p = idx + 1;
  while (p < hallway.length && hallway[p] === EMPTY) {
    end = p;
    p++;
  }

  return { start, end };
}

function updateMoveToDestRoom(rooms, destRoom, move) {
  // see if we can move to the amphipod's destination room
  const lastEmptyIdx = destRoom.occupants.reduce((l, a, idx) => a === EMPTY ? idx : l, -1);
  if (lastEmptyIdx !== -1 && !isMixedRoom(destRoom)) {
    move.to = { roomIdx: rooms.indexOf(destRoom), idx: lastEmptyIdx };
    move.cost += (lastEmptyIdx + 1) * AMPHIPOD_STEP_ENERGY[move.amphipod];
  }  
}

function genMovesForRooms(hallway, rooms) {
  let moves = [];
  const roomIdxList = rooms.map(room => room.hallwayIndex);

  for (const startRoom of rooms.filter(r => !isOptimalRoom(r))) {
    let idxToMove = startRoom.occupants.findIndex(a => a !== EMPTY);

    // If the 1st non-empty occupant is also a destAmphipod, then only move it if it is not all followed by destAmphipods
    if (idxToMove !== -1 && startRoom.occupants[idxToMove] === startRoom.destAmphipod) {
      if (startRoom.occupants.slice(idxToMove + 1).filter(a => a !== startRoom.destAmphipod).length === 0) {
        idxToMove = -1;
      }
    }

    if (idxToMove !== -1) {
      const amphipod = startRoom.occupants[idxToMove];
      const destRoom = rooms[AMPHIPOD_ROOM_IDX[amphipod]];
      let cost = AMPHIPOD_STEP_ENERGY[amphipod] * (idxToMove + 1); // cost of moving to the hallway space outside of the startRoom

      // Generate moves to some hallway spaces
      const { start, end } = getHallwayDests(hallway, startRoom.hallwayIndex);
      for (let i = start; i <= end; i++) {
        let move = {
          amphipod, 
          from: { roomIdx: rooms.indexOf(startRoom), idx: idxToMove },
          cost: cost + Math.abs(i - startRoom.hallwayIndex) * AMPHIPOD_STEP_ENERGY[amphipod], // cost of moving from space outside of startRoom to i
          to: null
        };

        if (i === destRoom.hallwayIndex && i !== startRoom.hallwayIndex) {
          updateMoveToDestRoom(rooms, destRoom, move);
        } 
        else if (!roomIdxList.includes(i)) {
          move.to = { idx: i };
        }

        if (move.to) {
          moves.push(move);
        }
      }
    }
  }
  return moves;
}

function genStateKey(hallway, rooms) {
  return `${hallway.join('')}-${rooms.map(room => room.occupants.join(''))}`;
}

const glbMinMap = new Map();
let curMinCost = Number.MAX_VALUE, execCallCnt = 0;

function play(hallway, rooms, move, cumCost = 0) {
  let result = { minMoves: null, minCost: Number.MAX_VALUE };

  // stop this branch if the cost executing the move is already bigger than current known min solution
  const newCumCost = cumCost + move.cost;
  if (newCumCost >= curMinCost) {
    let a = 0;
    return result; 
  }

  const { newHallway, newRooms } = executeMove(hallway, rooms, move);
  
  // if the min cost and moves for the new state has been computed before, skip the computation
  const newStateKey = genStateKey(newHallway, newRooms);  
  if (glbMinMap.has(newStateKey)) {
    const { minMoves, minCost } = glbMinMap.get(newStateKey);
    if (minMoves) {
      result.minCost = move.cost + minCost;
      result.minMoves = [move, ...minMoves];
    }
    return result;    
  }  
  
  // base condition: last move to put all amphipods into their dest rooms
  if (isFinalState(newRooms)) { 
    return { minMoves: [move], minCost: move.cost };
  }

  // play out all possible moves given the new state after executing move
  let newMoves = [...genMovesForHallway(newHallway, newRooms), ...genMovesForRooms(newHallway, newRooms)];
  let minResult = { minMoves: null, minCost: Number.MAX_VALUE };
  for (const newMove of newMoves) {
    let { minMoves, minCost } = play(newHallway, newRooms, newMove, newCumCost);
    if (minMoves && minCost < minResult.minCost) {
      minResult = { minMoves, minCost };
    }
  }

  // keep track of the current results
  glbMinMap.set(newStateKey, minResult);
  if (minResult.minMoves) {
    result.minCost = move.cost + minResult.minCost;
    result.minMoves = [move, ...minResult.minMoves];
    if (cumCost === 0) {
      curMinCost = curMinCost > result.minCost ? result.minCost : curMinCost;
    }
  }

  return result;
}

function executeMove(hallway, rooms, move) {
  execCallCnt++;
  let newHallway = [...hallway]; // clone hallway
  let newRooms = JSON.parse(JSON.stringify(rooms)); // clone rooms

  const { amphipod, from, to } = move;
  
  if (typeof from.roomIdx !== 'undefined') {
    newRooms[from.roomIdx].occupants[from.idx] = EMPTY;
  } else {
    newHallway[from.idx] = EMPTY;
  }

  if (typeof to.roomIdx !== 'undefined') {
    newRooms[to.roomIdx].occupants[to.idx] = amphipod;
  } else {
    newHallway[to.idx] = amphipod;
  }

  return { newHallway, newRooms };
}

function solution1(hallway, rooms) {
  const sortedRooms = [...rooms].sort((room1, room2) => room1.occupants[0] - room2.occupants[0]);
  let moves = genMovesForRooms(hallway, sortedRooms);
  let movesList = [];
  
  let i = 0, lastExecCallCnt = 0;
  for (const move of moves) {
    console.log(`Playing ${++i}/${moves.length} branch...`);
    const { minMoves, minCost } = play(hallway, sortedRooms, move);
    if (minMoves) {
      movesList.push({ minCost, minMoves });    
    }
    console.log(`\texec calls: ${execCallCnt - lastExecCallCnt},  min cost: ${minCost}`);
    lastExecCallCnt = execCallCnt;
  }

  console.log(`total exec calls: ${execCallCnt}`);
  movesList.sort((a, b) => a.minCost - b.minCost);
  movesList.forEach(({minCost, minMoves}) => {
    //console.log(`${minCost}: ${minMoves.length}`);
  }
  );
  //console.log(`${JSON.stringify(movesList[0].minMoves, null, 2)}`);
  //console.log(`${JSON.stringify(movesList[1].minMoves, null, 2)}`);

  return movesList[0].minCost;
}

function solution2(input) {
    return false;
}

(function run() {
  try {
    const { file } = getArgvs();
    const content = readFileSync(file, { encoding:'utf8' }).trim();
    const { hallway, rooms } = parseInput(content);

    let startTime = new Date().getTime();
    let answer = solution1(hallway, rooms);
    let endTime = new Date().getTime();
    console.log(`Solution 1: ${endTime - startTime} ms`);
    console.log(answer);

    startTime = new Date().getTime();
    answer = solution2(hallway, rooms);
    endTime = new Date().getTime();
    console.log(`Solution 2: ${endTime - startTime} ms`);
    console.log(answer);

  } catch (error) {
    console.error(error);
    process.exit(1);
  }

  process.exit(0);

})();
