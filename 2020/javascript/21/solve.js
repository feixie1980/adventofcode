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

  if (!file) {
    console.error(`Missing file`);
    printUsage();
    process.exit(1);
  }

  return { file };
}

function parseInput(content) {
  let foods = [];
  const lines = content.split('\n');
  for (const line of lines) {
    const parts = line.split('(');
    const ingredients = parts[0].trim().split(' ');
    let allergens = null;
    parts[1].replace(/(contains)(.*)(\))/,
      (replace, p1, s, p2) => {
        allergens = s.trim().split(', ');
      });
    foods.push( {ingredients, allergens} );
  }
  return foods;
}

function genAllergenMap(foods) {
  let allergenMap = new Map();
  for (const food of foods) {
    const { ingredients, allergens } = food;
    for (const allergen of allergens) {
      if (!allergenMap.has(allergen)) {
        allergenMap.set(allergen, [...ingredients]);
      }
      let candidates = allergenMap.get(allergen);
      candidates = candidates.filter(c => ingredients.includes(c));
      allergenMap.set(allergen, candidates);
    }
  }
  return allergenMap;
}

function solution1a(foods) {
  const allergenMap = genAllergenMap(foods);
  let matchPairs = [];

  while(allergenMap.size !== 0) {
    for (const allergen of allergenMap.keys()) {
      const candidates = allergenMap.get(allergen);
      if (candidates.length === 1) {
        const matchIngredient = candidates[0];
        matchPairs.push({ allergen, matchIngredient });

        // a match is found, remove the matchIngredient from all candidates for all other allergens
        for (const otherAllergen of allergenMap.keys()) {
          if (allergen === otherAllergen) {
            continue;
          }
          const newCandidates = allergenMap.get(otherAllergen).filter(ingredient => ingredient !== matchIngredient);
          allergenMap.set(otherAllergen, newCandidates);
        }

        // remove this allergen from the map
        allergenMap.delete(allergen);
      }
    }
  }
  console.log(matchPairs);
  let cnt = 0;
  const allergedIngrs = matchPairs.map(pair => pair.matchIngredient);
  for(const food of foods) {
    cnt += food.ingredients.filter(i => !allergedIngrs.includes(i)).length;
  }
  return { cnt, matchPairs };
}

function solution2a(matchPairs) {
  const result = matchPairs
    .sort((a, b) => a.allergen.localeCompare(b.allergen))
    .map(pair => pair.matchIngredient)
    .join(',');
  return result;
}

(function run() {
  try {
    const { file, dimension, cycles } = getArgvs();
    const content = fs.readFileSync(file, { encoding:'utf8' }).trim();
    const foods = parseInput(content, dimension);

    let startTime = new Date().getTime();
    let { cnt, matchPairs } = solution1a(foods);
    let endTime = new Date().getTime();
    console.log(`Solution 1.a: ${endTime - startTime} ms`);
    console.log(cnt);

    startTime = new Date().getTime();
    result = solution2a(matchPairs);
    endTime = new Date().getTime();
    console.log(`Solution 2.a: ${endTime - startTime} ms`);
    console.log(result);

  } catch (error) {
    console.error(error);
    process.exit(1);
  }

  process.exit(0);

})();
