export function combSprings(n, damanged) {
  if (n < 0) {
    throw 'negative n encountered';
  }

  if (damanged > n || damanged < 0) {
    return [];
  }

  if (damanged === n) {
    return ['#'.repeat(n)];
  }

  if (damanged === 0) {
    return ['.'.repeat(n)];
  }

  let newArray1 = combSprings(n - 1, damanged);
  newArray1 = newArray1.map(s => '.' + s);

  let newArray2 = combSprings(n - 1, damanged - 1);
  newArray2 = newArray2.map(s => '#' + s);

  return [...newArray1, ...newArray2];
}

export function permuSprings(n, maxDamaged) {
  if (n === 0) {
    return [''];
  }

  const subPerms = permuSprings(n - 1, maxDamaged);
  const newArray1 = subPerms.map(s => '.' + s);
  const newArray2 = subPerms.map(s => '#' + s).filter(s => s.match(/#/g).length <= maxDamaged);
  return [...newArray1, ...newArray2];
}

export function replaceSprings(springs, replaceString) {
  let newSprings = [...springs];
  const replacements = replaceString.split('');

  springs.forEach((spring, i) => {
    if (spring === '?') {
      newSprings[i] = replacements.shift();
    }
  });
  return newSprings;
}

export function genReplacedSprings(springs, config) {
  if (springs.length === 0) {
    return [springs];
  }

  const nUnknowns = springs.filter(s => s === '?').length;
  const nDamaged = springs.filter(s => s === '#').length;
  // const replacements = permuSprings(nUnknowns, config);
  const replacements2 = combSprings(nUnknowns, config - nDamaged);
  return replacements2.map(replacement =>  replaceSprings(springs, replacement));
}

function createRegexFromConfiguration(record) {
  // Escape function for special characters in regular expressions
  const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // Building the regex pattern
  let regexPattern = record.map(num => {
    return '#'.repeat(num).split('').map(escapeRegExp).join('');
  }).join('\\.+');

  // Return the RegExp object
  return new RegExp('^\\.*' + regexPattern + '\\.*$');
}

export function matchConfiguration(springs, configuration) {
  const regEx = createRegexFromConfiguration(configuration);
  return regEx.test(springs.join(''));
}

export function firstMatchingIndex(springs, configuration) {
  let matchCount = 0;
  for(let i = 0; i < springs.length; i++) {
    if (springs[i] === '#') {
      matchCount++;
    }
    if (springs[i] === '.') {
      if (matchCount === 0) {
        continue;
      }

      if (matchCount === configuration) {
        return i - configuration;
      }
      else {
        return -1;
      }
    }
  }

  if (matchCount === configuration) {
    return springs.length - configuration;
  }
  return -1;
}

export function trimCharFromString(string, char) {
  return string.replaceAll(char, ' ').trim().replaceAll(' ', char);
}

export function simpleCutoffSpring(spring, restOfConfiguration) {
  const restOfConfigLength = restOfConfiguration.reduce((sum, n) => sum + n + 1, 0);
  const restOfConfigCutoffIndex = spring.length - restOfConfigLength;
  const cutoffIndex = restOfConfigCutoffIndex;
  if (cutoffIndex <= 0) {
    throw `negative cutoff index\nspring:'${spring.join('')}'\nrest of configs:${restOfConfiguration}`;
  }
  return spring.slice(0, cutoffIndex);
}

export function getCutoffSpring(spring, restOfConfiguration) {
  const restOfConfigLength = restOfConfiguration.reduce((sum, n) => sum + n + 1, 0);
  const restOfConfigCutoffIndex = spring.length - restOfConfigLength;
  const firstDmgIndex = spring.indexOf('#');
  let unDmgIndex = spring.slice(firstDmgIndex).findIndex(c => c !== '#');
  unDmgIndex = unDmgIndex === -1 ? spring.slice(firstDmgIndex).length : unDmgIndex;
  unDmgIndex += firstDmgIndex;

  const isSolidBlock = unDmgIndex === spring.length || spring[unDmgIndex] === '.';
  const overlap = isSolidBlock && restOfConfigCutoffIndex >= firstDmgIndex && restOfConfigCutoffIndex < unDmgIndex;

  let cutoffIndex = restOfConfigCutoffIndex;
  if (overlap) {
    cutoffIndex = unDmgIndex;
  }

  if (cutoffIndex <= 0) {
    throw `negative cutoff index\nspring:'${spring.join('')}'\nrest of configs:${restOfConfiguration}`;
  }
  return spring.slice(0, cutoffIndex);
}

export function findConfigArrangements(springs, topConfig, restOfConfiguration) {
  const cutoffSpring = simpleCutoffSpring(springs, restOfConfiguration);
  const replacedSprings = genReplacedSprings(cutoffSpring, topConfig);
  let matchedReplacements = replacedSprings
    .map(replacement => {
      const index = firstMatchingIndex(replacement, topConfig)
      if (index === -1) {
        return null;
      }
      return replacement.slice(0, index + topConfig);
    })
    .filter(a => !!a);

  // deduplication
  matchedReplacements = matchedReplacements.map(subArr => JSON.stringify(subArr))
    .filter((subArr, index, self) => self.indexOf(subArr) === index)
    .map(subArr => JSON.parse(subArr))

  return matchedReplacements;
}

export function findConfigArrangements_Comb(springs, topConfig, restOfConfiguration) {
  const cutoffSpring = simpleCutoffSpring(springs, restOfConfiguration);
  const replacedSprings = genReplacedSprings(cutoffSpring, topConfig);
  let matchedReplacements = replacedSprings
    .map(replacement => {
      const index = firstMatchingIndex(replacement, topConfig)
      if (index === -1) {
        return null;
      }
      return replacement.slice(0, index + topConfig);
    })
    .filter(a => !!a);

  // deduplication
  matchedReplacements = matchedReplacements.map(subArr => JSON.stringify(subArr))
    .filter((subArr, index, self) => self.indexOf(subArr) === index)
    .map(subArr => JSON.parse(subArr))

  return matchedReplacements;
}

const cacheMap = new Map();

function toKey(spring, configs) {
  return `${spring.join('')}-${configs.join(',')}`;
}

export function findArrangements(springs, configuration) {
  let total = [];

  if (configuration.length === 0) {
    return genReplacedSprings(springs, configuration.reduce((sum, n) => sum + n, 0));
  }

  const topConfig = configuration[0];
  const restOfConfigs = configuration.slice(1);
  const topArrs = findConfigArrangements(springs, topConfig, restOfConfigs);
  for(let topArr of topArrs) {
    const leftSprings = topArr.slice(0, topArr.lastIndexOf('#') + 1);
    const rightSprings = springs.slice(topArr.lastIndexOf('#') + 1);

    const key = toKey(rightSprings, restOfConfigs);
    if (!cacheMap.has(key)) {
      const subArrangements = findArrangements(rightSprings, restOfConfigs);
      cacheMap.set(key, subArrangements);
    }
    const subArrangements = cacheMap.get(key);

    let a = subArrangements.map(subArrangement => {
      if (subArrangement.length !== rightSprings.length)
        `throw size error`;
      return [...leftSprings, ...subArrangement]});
    a = a.filter(arr => {
      return matchConfiguration(arr, configuration);
    });
    total.push(...a);
  }

  return total;
}

function findLeastFitIndex(springs, conf, cacheMap, stopLength) {
  const minLength = conf.reduce((sum, n) => sum + n, 0);
  for(let i = minLength; i <= stopLength; i++) {
    let arr = retrieveArrangements(springs.slice(0, i), conf, cacheMap);
    if (arr.length !== 0) {
      return i;
    }
  }
  return -1;
}

function retrieveArrangements(springs, configuration, cacheMap) {
  const key = toKey(springs, configuration);
  if (!cacheMap.has(key)) {
    try {
      const arr = findArrangementsBrute(springs, configuration);
      cacheMap.set(key, arr);
    } catch (e) {
      if (e.includes('negative cutoff index')) {
        cacheMap.set(key, []);
      }
    }
  }

  return cacheMap.get(key);

  /*


  try {
    return findArrangementsBrute(springs, configuration);
  } catch (e) {
    if (e.includes('negative cutoff index')) {
      return [];
    }
  }

   */

}

export function solveUnfolded(springs, configurations, stopLength, cacheMap, level1 = false) {
  // console.log(`${'  '.repeat(5 - configurations.length + 1)}conf l:${configurations.length}`);
  const curConfig = configurations[0];

  if (configurations.length === 1) {
    return retrieveArrangements(springs, curConfig, cacheMap);
  }

  if (springs.length === 0) {
    return 0;
  }

  // console.log(curConfig);

  let allArrangements = [];
  let i = findLeastFitIndex(springs, curConfig, cacheMap, stopLength);
  if (i === -1) {
    return allArrangements;
  }

  while(true) {
    const subSpring = springs.slice(0, i);
    const arrangements = retrieveArrangements(subSpring, curConfig, cacheMap);

    if(arrangements.length === 0) {
      break;
    }
    const subArrangements = solveUnfolded(springs.slice(i), configurations.slice(1), stopLength, cacheMap);
    let combined = arrangements.flatMap(arr => subArrangements.map(subArr => [...arr, ...subArr]));
    combined = combined.filter(arr => matchConfiguration(arr, configurations.flatMap(c => c)));
    // dedupe
    combined = [...new Set(combined.map(arr => arr.join('')))].map(s => s.split(''));

    let newAllArrangements = [...allArrangements, ...combined];
    // dedupe
    newAllArrangements = [...new Set(newAllArrangements.map(arr => arr.join('')))].map(s => s.split(''));
    if (newAllArrangements.length === allArrangements.length && allArrangements.length !== 0) {
      return allArrangements;
    }
    allArrangements = newAllArrangements;

    // console.log(`s:${i}\tcount:${count}\t${springs.slice(0, i)}`);
    if (level1) {
      console.log(`\tl:${i - 1}\tc:${allArrangements.length}`);
    }

    i++;
    if (i > springs.length) {
      break;
    }
  }

  return allArrangements;
}

export function solveUnfolded_mem(springs, configurations, stopLength, cacheMap, level1 = false) {
  // console.log(`${'  '.repeat(5 - configurations.length + 1)}conf l:${configurations.length}`);
  const curConfig = configurations[0];

  if (configurations.length === 1) {
    return retrieveArrangements(springs, curConfig, cacheMap);
  }

  if (springs.length === 0) {
    return 0;
  }

  // console.log(curConfig);

  let allArrangements = [];
  let i = findLeastFitIndex(springs, curConfig, cacheMap, stopLength);
  if (i === -1) {
    return allArrangements;
  }

  while(true) {
    const subSpring = springs.slice(0, i);
    let arrangements = retrieveArrangements(subSpring, curConfig, cacheMap);

    if(arrangements.length === 0) {
      break;
    }
    const subArrangements = solveUnfolded(springs.slice(i), configurations.slice(1), stopLength, cacheMap);
    let combined = arrangements.flatMap(arr => subArrangements.map(subArr => [...arr, ...subArr]));
    arrangements = null;
    combined = combined.filter(arr => matchConfiguration(arr, configurations.flatMap(c => c)));
    // dedupe
    combined = [...new Set(combined.map(arr => arr.join('')))].map(s => s.split(''));

    let newAllArrangements = [...allArrangements, ...combined];
    combined = null;

    // dedupe
    newAllArrangements = [...new Set(newAllArrangements.map(arr => arr.join('')))].map(s => s.split(''));
    if (newAllArrangements.length === allArrangements.length && allArrangements.length !== 0) {
      return allArrangements;
    }
    allArrangements = newAllArrangements;

    // console.log(`s:${i}\tcount:${count}\t${springs.slice(0, i)}`);
    if (level1) {
      console.log(`\tl:${i - 1}\tc:${allArrangements.length}`);
    }

    i++;
    if (i > springs.length) {
      break;
    }
  }

  return allArrangements;
}

export function findArrangementsBrute(springs, configuration) {
  const sumConfigs = configuration.reduce((sum, n) => sum + n, 0);
  const replacedSprings = genReplacedSprings(springs, sumConfigs);
  return replacedSprings.filter(springs => matchConfiguration(springs, configuration));
}
