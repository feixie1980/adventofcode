
// directions: [up, down, left, right]
export const connectMapping = {
  '|': [['|', 'F', '7'],  ['|', 'L', 'J'],  null,             null],
  '-': [null,             null,             ['-', 'F', 'L'],  ['-', '7', 'J']],
  'L': [['|', 'F', '7'],  null,             null,             ['-', '7', 'J']],
  'J': [['|', 'F', '7'],  null,             ['-', 'F', 'L'],  null],
  'F': [null,             ['|', 'L', 'J'],  null,             ['-', '7', 'J']],
  '7': [null,             ['|', 'L', 'J'],  ['-', 'F', 'L'],  null],

  'S': [
    ['|', 'F', '7'],
    ['|', 'L', 'J'],
    ['-', 'F', 'L'],
    ['-', '7', 'J']
  ]
}


export function findConnectedPositions(map, [i, j]) {
  const up = [i-1, j], down = [i+1, j], left = [i, j-1], right = [i, j+1];
  return [up, down, left, right].map((pos, dirIndex) => {
    if (pos[0] < 0 || pos[0] >= map.length || pos[1] < 0 || pos[1] >= map[pos[0]].length) {
      // out of bound
      return null;
    }
    const pipe = map[pos[0]][pos[1]];
    const mapping = connectMapping[map[i][j]][dirIndex];

    if (mapping && (mapping.includes(pipe) || pipe === 'S') ) {
      return pos;
    }
  }).filter(pos => !!pos);
}

export function printMap(map) {
  return map.map(row => row.join('')).join('\n');
}

export const range = (start, stop, step = 1) =>
  Array.from({ length: (stop - start) / step + 1 }, (_, i) => start + i * step);


export function getNeighbours(p) {
  const [x, y] = p;
  const xRanges = range(x-1, x+1);
  const yRanges = range(y-1, y+1);
  return xRanges
    .flatMap(x => yRanges.map(y => [x, y]))
    .filter(n => n[0] !== p[0] || n[1] !== p[1]);
}

export function findStartPos(map) {
  for (let i = 0; i < map.length; i++) {
    const row = map[i];
    for (let j = 0; j < row.length; j++) {
      if (row[j] === 'S') {
        return [i, j];
      }
    }
  }
}

export function findLoopRoute(map, start) {
  let curPos = start, route = [];
  while(true) {
    const connected = findConnectedPositions(map, curPos);
    if (connected.length !== 2)
      throw `unexpected number of connected`;
    const lastPos = route.length === 0 ? null : route[route.length - 1];
    const nextPos = connected.find(c => !isSamePos(c, lastPos));
    if (!nextPos)
      throw `cannot find next pipe`;

    route = [...route, curPos];
    if (map[nextPos[0]][nextPos[1]] === 'S') {
      break;
    }
    curPos = nextPos;
  }
  return route;
}

export function wallsHit(map, loopRoute, point) {
  const [x, y] = point;
  const walls = [];
  // shoot a ray to the left to see how many loop walls we hit
  for(let j = y - 1; j >= 0; j--) {
    let wall  = loopRoute.filter(loopP => isSamePos(loopP, [x, j]));
    wall = wall
      .map((borderP) => {
        const i = loopRoute.indexOf(borderP);
        const prev = i !== 0 ? loopRoute[i - 1] : loopRoute[loopRoute.length - 1];
        const next = i !== loopRoute.length - 1 ? loopRoute[i + 1] : loopRoute[0];
        if (prev[0] === x - 1) {
          return [prev, borderP];
        }
        if (next[0] === x - 1) {
          return [borderP, next];
        }
        return null;
      });
    wall = wall.filter(w => !!w);
    if (wall.length > 1) {
      throw `unexpected number of wall hit at ${[x, j]}`;
    }
    if (wall.length === 1) {
      walls.push(wall);
    }
  }

  return walls.length;
}

export function isInside(map, loopRoute, point) {
  return wallsHit(map, loopRoute, point) % 2 !== 0;
}

export function isSamePos(p1, p2) {
  if (!p1 || !p2)
    return false;

  return p1[0] === p2[0] && p1[1] === p2[1];
}
