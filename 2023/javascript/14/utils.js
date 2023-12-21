export const ROUND = 'O';
export const CUBE = '#';
export const FLOOR = '.';

export function hTilt(row, step) {
  const newRow = [...row];
  const start = step > 0 ? row.length - 1 : 0;
  const end = step > 0 ? -1 : row.length;
  for(let i = start; i !== end ; i -= step) {
    const tile = row[i];
    if (tile !== ROUND) continue;

    let p = i + step;
    while (newRow[p] !== ROUND && newRow[p] !== CUBE && p !== start + step) {
      p = p + step;
    }

    newRow[i] = FLOOR;
    newRow[p - step] = ROUND;
  }
  return newRow;
}

/*
direction: 0 north, 1 south, 2 west, 3 east
 */
export function tilt(platform, direction) {

  switch (direction) {
    case 0: case 1: {
      const dir = direction === 0 ? -1 : 1;
      const newPlatform = platform.map(row => [...row]);
      platform[0].map((_, i) => {
        const column = platform.map(row => row[i]);
        const newColumn = hTilt(column, dir);
        newColumn.forEach((tile, j) => newPlatform[j][i] = tile);
      });
      return newPlatform;
    }


    case 2: case 3: {
      const dir = direction === 2 ? -1 : 1;
      return platform.map(row => hTilt(row, dir));
    }
  }

  throw `unexpected tile state`;
}
