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
  let tiles = [];
  for(const tileInput of content.split('\n\n')) {
    let lines = tileInput.split('\n');

    // get id
    let id = 0;
    lines.shift().trim().replace(/(Tile\s)([0-9]+)(:)/,
      (match, p1, idStr) => {
        id = parseInt(idStr)
      });
    const grid = lines.map(line => line.split('').map(c => c === '#' ? 1 : 0));
    tiles.push({ id, grid });
  }
  return tiles;
}

function genBorderNum(grid) {
  let borderNums = [];
  // top
  borderNums.push(parseInt(grid[0].join(''), 2));
  // right
  borderNums.push(parseInt(grid.map(row => row[row.length - 1]).join(''), 2));
  // bottom
  borderNums.push(parseInt(grid[grid.length - 1].join(''), 2));
  // left
  borderNums.push(parseInt(grid.map(row => row[0]).join(''), 2));

  return borderNums;
}

function rotateRightOnce(grid) {
  let newGrid = [...grid.map(row => [...row])];
  const n = grid.length;
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[i].length; j++) {
      newGrid[i][j] = grid[n - j - 1][i];
    }
  }
  return newGrid;
}

function flip(grid) {
  let newGrid = [...grid.map(row => [...row])];
  const n = grid.length;
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[i].length; j++) {
      newGrid[i][j] = grid[i][n - j - 1];
    }
  }
  return newGrid;
}

function genOrientations(tile) {
  let orientations = [], oriGrids = [], grid = tile.grid;
  oriGrids.push(grid);
  orientations.push(genBorderNum(grid));
  for (let i = 0; i < 3; i++) {
    grid = rotateRightOnce(grid);
    oriGrids.push(grid);
    orientations.push(genBorderNum(grid));
  }

  // flip and do it again
  grid = flip(tile.grid);
  oriGrids.push(grid);
  orientations.push(genBorderNum(grid));
  for (let i = 0; i < 3; i++) {
    grid = rotateRightOnce(grid);
    oriGrids.push(grid);
    orientations.push(genBorderNum(grid));
  }

  return { orientations, oriGrids };
}

function printGrid(grid) {
  grid.forEach(t => {
    console.log(t.map(c => !c ? '.' : '#').join(''));
  })
}

function matchingIndex(borderIndex) {
  switch (borderIndex) {
    case 0:
      return 2;

    case 1:
      return 3;

    case 2:
      return 0;

    case 3:
      return 1;

    default:
      throw `unexpected border index: ${borderIndex}`;
  }
}

function matchMaking(tiles) {
  let numMap = new Map();
  for (const tile of tiles) {
    for (let oriIndex = 0; oriIndex < tile.orientations.length; oriIndex++) {
      const orientation = tile.orientations[oriIndex];
      for (let borderIndex = 0; borderIndex < 4; borderIndex++) {
        const borderNum = orientation[borderIndex];
        if (!numMap.has(borderNum)) {
          numMap.set(borderNum, {
            orientArray: [[], [], [], []],
            matchPairList: []
          });
        }
        const { id } = tile, numMapItem = numMap.get(borderNum);
        numMapItem.orientArray[borderIndex].push({id, oriIndex});
        const matchingBorderIndex = matchingIndex(borderIndex);
        const matchingOrientations = numMapItem.orientArray[matchingBorderIndex];
        for (const ori of matchingOrientations) {
          if (id !== ori.id) {
            // Found a match !
            const curMatchItem = {
              id, oriIndex, borderIndex
            };
            const oriMatchItem = {
                id: ori.id,
                oriIndex: ori.oriIndex,
                borderIndex: matchingBorderIndex
              };
            numMapItem.matchPairList.push([curMatchItem, oriMatchItem]);

            tile.oriMachCnts[oriIndex] += 1;
            tile.oriConnects[oriIndex].push(oriMatchItem);

            getTile(tiles, ori.id).oriMachCnts[ori.oriIndex] += 1;
            getTile(tiles, ori.id).oriConnects[ori.oriIndex].push(curMatchItem)
          }
        }
      }
    }
  }
  return numMap;
}

function printOrientations(tiles) {
  tiles.forEach(tile => {
    console.log(tile.id);
    console.log(tile.orientations);
    console.log(tile.oriMachCnts);
    console.log(tile.oriConnects);
    console.log('');
  });
}

function getOrientationSet(tiles) {
  let tile = tiles[0], oriIndex = 0;
  let results = [{ tile, oriIndex }], stack = [{ tile, oriIndex }];
  while(stack.length !== 0) {
    let newStack = [];
    for (const item of stack) {
      const { tile, oriIndex } = item;
      for(const connect of tile.oriConnects[oriIndex]) {
        if (results.findIndex(r => r.tile.id === connect.id) === -1) {
          const newItem = {
            tile: getTile(tiles, connect.id),
            oriIndex: connect.oriIndex
          };
          results.push(newItem);
          newStack.push(newItem);
        }
      }
    }
    stack = newStack;
  }
  return results;
}

function postprocessTiles(tiles) {
  tiles.forEach(tile => {
    const { orientations, oriGrids } = genOrientations(tile);
    tile.orientations = orientations;
    tile.oriGrids = oriGrids;
    tile.oriConnects = new Array(tile.orientations.length);
    for(let i = 0; i < tile.oriConnects.length; i++) {
      tile.oriConnects[i] = [];
    }
    tile.oriMachCnts = new Array(tile.orientations.length).fill(0);
  });
}

function solution1a(tiles) {
  postprocessTiles(tiles);
  const numMap = matchMaking(tiles);

  let product = 1;
  for(const tile of tiles) {
    if( tile.oriMachCnts[0] === 2) {
      product *= tile.id;
    }
  }

  return { result: product, numMap };
}

function getTile(tiles, id) {
  return tiles.find(tile => tile.id === id);
}

function getTopLeftItem(orientationList) {
  const topLeftItems = orientationList
    .filter(item => {
      let noTopLeftMatch = true;
      for(const matchItem of item.tile.oriConnects[item.oriIndex]) {
        if (matchItem.borderIndex === 1 || matchItem.borderIndex === 2) {
          noTopLeftMatch = false;
          break;
        }
      }
      return noTopLeftMatch;
    });

  if (topLeftItems.length !== 1) {
    throw `Something is not right, there are ${topLeftItems.length} top left items`;
  }
  return topLeftItems[0];
}

function getItemToTheRight(inputItem, orientationList) {
  for (const oriItem of orientationList) {
    const found = !!oriItem.tile.oriConnects[oriItem.oriIndex].find(matchItem => {
      return matchItem.borderIndex === 1 && matchItem.id === inputItem.tile.id && matchItem.oriIndex === inputItem.oriIndex;
    });
    if (found) {
      return oriItem;
    }
  }
  return null;
}

function getItemAtBottom(inputItem, orientationList) {
  for (const oriItem of orientationList) {
    const found = !!oriItem.tile.oriConnects[oriItem.oriIndex].find(matchItem => {
      return matchItem.borderIndex === 2 && matchItem.id === inputItem.tile.id && matchItem.oriIndex === inputItem.oriIndex;
    });
    if (found) {
      return oriItem;
    }
  }
  return null;
}

function getImageGrid(tiles, orientationList) {
  let tileArray = [];
  const topLeftItem = getTopLeftItem(orientationList);
  let x = 0, y = 0;
  let n = Math.floor(Math.sqrt(tiles.length));

  let rowStartItem = topLeftItem;
  while (x < n) {
    tileArray[x] = [];
    let curColItm = rowStartItem;
    while (!!curColItm) {
      tileArray[x].push(curColItm);
      curColItm = getItemToTheRight(curColItm, orientationList);
    }
    rowStartItem = getItemAtBottom(rowStartItem, orientationList);
    x++;
  }

  return tileArray.map(row => row.map(item => item.tile.oriGrids[item.oriIndex]));
}

function printImageGrid(imageGrid, showGraphic) {
  let printStr = '';
  for (const row of imageGrid) {
    const height = row[0].length;
    const width = height * row.length;
    for (let x = 0; x < height; x++) {
      for (let y = 0; y < width; y++) {
        const index = Math.floor(y / height);
        const val = row[index][x][y % height];
        if (y % height === 0) {
          printStr += ' ';
        }
        if (showGraphic) {
          printStr += !val ? '.' : '#';
        }
        else {
          printStr += `${val}`;
        }
      }
      printStr += '\n';
    }
    printStr += '\n';
  }
  console.log(printStr);
}

function mergeGrid(imageGrid) {
  let mergedGrid = [];
  for (const row of imageGrid) {
    const height = row[0].length;
    const width = height * row.length;
    for (let x = 0; x < height; x++) {
      let newRow = [];
      for (let y = 0; y < width; y++) {
        const index = Math.floor(y / height);
        const val = row[index][x][y % height];
        newRow.push(val);
      }
      mergedGrid.push(newRow);
    }
  }
  return mergedGrid;
}

function removeBorders(imageGrid) {
  let newImageGrid = [];
  for (const row of imageGrid) {
    let newRow = [];
    for (const grid of row) {
      let newGrid = grid.slice(1, grid.length - 1)
        .map(r => r.slice(1, r.length - 1));
      newRow.push(newGrid);
    }
    newImageGrid.push(newRow);
  }
  return newImageGrid;
}

function matchDragon(grid, x, y, dragonGrid) {
  let i, j;
  for (i = x; i < grid.length && i < dragonGrid.length + x; i++) {
    for (j = y; j < grid[x].length && j < dragonGrid[i - x].length + y; j++) {
      if (dragonGrid[i - x][j - y] === 1 && grid[i][j] !== 1) {
        return false;
      }
    }
  }

  return !(i - x !== dragonGrid.length || j - y !== dragonGrid[0].length);
}

function getDragonCnt(imageGrid, dragonGrid) {
  let dragonCnt = 0;
  for (let x = 0; x < imageGrid.length; x++) {
    for (let y = 0; y < imageGrid[x].length; y++) {
      if (matchDragon(imageGrid, x, y, dragonGrid)) {
        dragonCnt++;
      }
    }
  }
  return dragonCnt;
}

function solution2a(tiles, dragonGrid) {
  const items = getOrientationSet(tiles);
  let imageGrid = getImageGrid(tiles, items);
  printImageGrid(imageGrid, true);
  console.log('');
  imageGrid = removeBorders(imageGrid);
  printImageGrid(imageGrid, true);
  imageGrid = mergeGrid(imageGrid);

  let dragonCnt = 0;
  for(let i = 0; i < 4; i++) {
    printImageGrid([[imageGrid]], true);
    console.log(' ');
    dragonCnt = getDragonCnt(imageGrid, dragonGrid);
    if (dragonCnt !== 0) {
      break;
    }
    imageGrid = rotateRightOnce(imageGrid);

  }

  if (dragonCnt === 0) {
    imageGrid = flip(imageGrid);
    for(let i = 0; i < 4; i++) {
      printImageGrid([[imageGrid]], true);
      console.log(' ');
      dragonCnt = getDragonCnt(imageGrid, dragonGrid);
      if (dragonCnt !== 0) {
        break;
      }
      imageGrid = rotateRightOnce(imageGrid);
    }
  }

  console.log(`dragon count: ${dragonCnt}`);

  let totalCnt = imageGrid.reduce((sum, row) => {
    return sum + row.reduce((s, a) => s + a, 0);
  }, 0);

  return totalCnt - dragonCnt * 15;
}

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

function parseDragon(dragonStr) {
  return dragonStr.split('\n')
    .map(line => line.split('')
      .map(c => c === '.' ? 0 : 1));
}

(function run() {
  try {
    const { file, dimension, cycles } = getArgvs();
    const content = fs.readFileSync(file, { encoding:'utf8' }).trim();
    const dragonStr = fs.readFileSync("dragon.txt", { encoding:'utf8' }).trim();
    const tiles = parseInput(content, dimension);
    const dragonGrid = parseDragon(dragonStr);

    let startTime = new Date().getTime();
    let { result, numMap } = solution1a(tiles);
    let endTime = new Date().getTime();
    console.log(`Solution 1.a: ${endTime - startTime} ms`);
    console.log(result);

    startTime = new Date().getTime();
    result = solution2a(tiles, dragonGrid);
    endTime = new Date().getTime();
    console.log(`Solution 2.a: ${endTime - startTime} ms`);
    console.log(result);

  } catch (error) {
    console.error(error);
    process.exit(1);
  }

  process.exit(0);

})();
