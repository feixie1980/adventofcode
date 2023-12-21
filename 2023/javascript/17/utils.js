const range = (start, stop, step = 1) =>
  Array.from({ length: (stop - start) / step + 1 }, (_, i) => start + i * step);

function inBound(p, map) {
  const [a, b] = p;
  return a >= 0 && a < map.length && b >= 0 && b < map[0].length;
}
export function getNeighbours(p, map) {
  const [x, y] = p;
  return [[x, y-1], [x, y+1], [x+1, y], [x-1, y]]
    .filter(a => inBound(a, map));
}

export function isSamePoint(p1, p2) {
  if (!p1 || !p2)
    return false;

  return p1[0] === p2[0] && p1[1] === p2[1];
}

export function printPath(map, path) {
  const newMap = map.map(row => [...row]);
  path.forEach(p => newMap[p[0]][p[1]] = '*');
  const str = newMap.map(row => row.join('')).join('\n');
  console.log(str + '\n');
}

export function forwardAndTurn(original, start, steps, map) {
  if (steps > 3 || steps < 0) {
    throw `illegal steps`;
  }

  const targetP = [map.length - 1, map[0].length - 1];

  let forwardPoints, turnPoints;
  const [oriX, oriY] = original, [startX, startY] = start;
  const horizontal = oriX === startX;

  if (horizontal) {
    const dir = startY - oriY;
    forwardPoints = range(startY, startY + (steps - 1) * dir, dir)
      .map(y => [startX, y]);
    const l = forwardPoints[forwardPoints.length - 1];
    if (!isSamePoint(l, targetP)) {
      turnPoints = [ [oriX + 1, l[1]], [oriX - 1, l[1]] ];
    }
  } else {
    const dir = startX - oriX;
    forwardPoints = range(startX, startX + (steps - 1) * dir, dir)
      .map(x => [x, startY]);
    const l = forwardPoints[forwardPoints.length - 1];
    if (!isSamePoint(l, targetP)) {
      turnPoints = [ [l[0], oriY + 1], [l[0], oriY - 1] ];
    }
  }

  if (turnPoints) {
    return turnPoints
      .map(turnPoint => [...forwardPoints, turnPoint])
      .filter(path => !path.some(p => !inBound(p, map)));
  }
  return [forwardPoints];
}

function isPointInPath(p, path) {
  return path.findIndex(q => isSamePoint(p, q)) !== -1;
}

function computeCost(path, map) {
  return path.reduce((sum, p) => sum + map[p[0]][p[1]], 0);
}


export function findLowestPath(p, map, minCostMap) {
  if (minCostMap[p[0][p[1]]]) {
    return minCostMap[p[0][p[1]]];
  }

  const pathSet = new Set();
  let paths = [[p]];
  let minCost = Number.MAX_SAFE_INTEGER;
  const targetP = [map.length - 1, map[0].length - 1];

  while(paths.length !== 0) {
    const path = paths.shift();
    const lastP = path[path.length  - 1];

    // console.log(path.map(p => `[${p[0]},${p[1]}]`).join(' '));

    if (isSamePoint(lastP, targetP)) {
      const cost = computeCost(path, map);
      minCost = cost < minCost ? cost : minCost;
      printPath(map, path);
      continue;
    }

    const neighbours = getNeighbours(lastP, map)
      .filter(p => !isPointInPath(p, path));

    for(let i = 1; i <= 3; i++) {
      for(let neighbour of neighbours) {
        let newRoutes = forwardAndTurn(lastP, neighbour, i, map);
        newRoutes = newRoutes.filter(newRoute => !newRoute.some(p => isPointInPath(p, path)));
        const newPaths = newRoutes.map(newRoute => [...path, ...newRoute]);


        paths = [...newPaths, ...paths];
      }
    }

    paths = paths.filter(newPath => computeCost(newPath, map) < minCost);
    console.log(paths.length);
  }
}

export function findLowestPath2(inputMap) {
  const map = inputMap.map(row => [...row]);
  const targetP = [map.length - 1, map[0].length - 1];
  const minCostMap = inputMap.map(row => Array.from({length: row.length}, () => null));

  minCostMap[targetP[0]][targetP[1]] = 0;
  const queue = [targetP];
  while(minCostMap.some(row => row.some(n => !n))) {
    const curP = queue.pop();
    const neighbours = getNeighbours(curP, map);
    findLowestPath(neighbours[0], map);
  }
}
