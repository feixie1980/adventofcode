export function genDistanceMap(universe, expandRatio = 1) {
  const disMap = universe.map(row => row.map(d => 1));

  // expand empty rows
  universe.forEach((row, rowIndex) => {
    if(!row.some(s => s === '#')) {
      for (let i = 0; i < disMap[rowIndex].length; i++) {
        disMap[rowIndex][i] = expandRatio;
      }
    }
  });

  // expand empty columns
  for(let j = 0; j < universe[0].length; j++) {
    let isEmpty = true;
    for(let i = 0; i < universe.length; i++) {
      if (universe[i][j] === '#') {
        isEmpty = false;
        break;
      }
    }

    if (isEmpty) {
      for(let i = 0; i < universe.length; i++) {
        disMap[i][j] = expandRatio;
      }
    }
  }

  return disMap;
}

export function shortestPath(distanceMap, [p1, p2]) {
  const xStep = p2[0] - p1[0] >= 0 ? 1 : -1;
  const yStep = p2[1] - p1[1] >= 0 ? 1 : -1;
  let steps = 0;

  // count x dist covered
  const y = p1[1];
  for(let i = p1[0]; i !== p2[0]; i = i + xStep) {
    steps += distanceMap[i][y];
  }
  steps -= distanceMap[p1[0]][p1[1]];

  // count y dist covered
  let x = p2[0], j;
  for(j = p1[1]; j !== p2[1]; j = j + yStep) {
    steps += distanceMap[x][j];
  }

  steps += distanceMap[x][j];
  return steps;
}
