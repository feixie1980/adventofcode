import { readFileSync } from 'fs';
import Yargs from "yargs";

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
  return content.split('\n')
    .map(line => ({
      inputs: line.split(' | ')[0].split(' '),
      outputs: line.split(' | ')[1].split(' '),
    })
    );
}

function solution1(entries) {
  //console.log(JSON.stringify(entries, null, 2));
  return entries.reduce((cnt, entry) => {
    return cnt + entry.outputs.filter(s => s.length === 2 || s.length === 3 || s.length === 4 || s.length === 7).length
  }, 0);
}

function getFreqMap(inputs) {
  let freqMap = {};
  for (const input of inputs) {
    [...input].forEach(c => { 
      if (freqMap[c]) 
        freqMap[c] += 1 
      else 
        freqMap[c] = 1;
    });
  }
  return freqMap;
}

function initFromUniques(oriFreqMap, freqMap) {
  const uniqFrequencies = [4, 6, 9];
  return Object.entries(oriFreqMap)
    .filter(entry => uniqFrequencies.includes(entry[1]))
    .reduce((map, entry) => {
      const mapTo = Object.entries(freqMap).find(e => e[1] === entry[1]);
      map.set(entry[0], mapTo[0]);
      return map;
    }, new Map());
}

function findUniqueMapping(mapping, inputs, oriPatterns) {
  let newMapping = new Map([...mapping.entries()]);

  for (const input of inputs) {
    //console.log('=====================================');
    const unMappedInput = [...input].filter(c => ![...newMapping.values()].includes(c));
    //console.log(`\tunmapped: ${unMappedInput} from input: ${input}`);
    if (unMappedInput.length === 1) {
      //console.log(`\tsingle unmapped: ${unMappedInput} from input: ${input}`);
      // only one unmapped signal left, it is easy to figure out!
      const patterns = oriPatterns.filter(p => p.signal.length === input.length);
      //console.log(`\toriginal patterns with same length: ${patterns.map(p => p.signal).join(',')}`);
      let foundMatch = false;
      for (const pattern of patterns) {
        const unMappedOriginal = [...pattern.signal].filter(c => ![...newMapping.keys()].includes(c));
        if (unMappedOriginal.length === 1) {
          //console.log(`\tSingle unMappedOriginal left: ${unMappedOriginal}`);
          if (!foundMatch) {
            newMapping.set(unMappedOriginal[0], unMappedInput[0]);
            foundMatch = true;
            //console.log(`new mapping: ${[...newMapping.entries()].join(' | ')}`);
          } else {
            newMapping.delete(unMappedOriginal[0]);
            //console.log(`already found match, unsetting, new mapping: ${[...newMapping.entries()].join(' | ')}`);
          }          
        }
      }
    }
  }
  //console.log(newMapping);
  //console.log();
  return newMapping;
}

function getDisplayedValue(outputs, mapping, oriPatterns) {
  let digits = [];
  for (const output of outputs) {
    const mappedOriChars = [...output].map(c => {
      return [...mapping.entries()]
        .find(([oriChar, mappedChar]) => mappedChar === c)[0];
    });
    mappedOriChars.sort();
    const digit = oriPatterns.find(pattern => pattern.signal === mappedOriChars.join('')).value;
    digits.push(digit);
  }
  return parseInt(digits.join(''));
}

function solution2(entries) {
  const oriPatterns = [
    { signal: 'abcefg', value: 0 },
    { signal: 'cf', value: 1 },
    { signal: 'acdeg', value: 2 },
    { signal: 'acdfg', value: 3 },
    { signal: 'bcdf', value: 4 },
    { signal: 'abdfg', value: 5 },
    { signal: 'abdefg', value: 6 },
    { signal: 'acf', value: 7 },
    { signal: 'abcdefg', value: 8 },
    { signal: 'abcdfg', value: 9 }
  ];
  const oriFreqMap = ({ a: 8, b: 6, c: 8, d: 7, e: 4, f: 9, g: 7 });
  console.log(oriFreqMap);
  console.log();

  let sum = 0;
  for (const entry of entries) {
    const { inputs, outputs } = entry;
    const freqMap = getFreqMap(inputs);
    console.log(`===============================`);
    console.log(`processing entry: ${entry.inputs} | ${entry.outputs}`);

    // get mapping for b, e, f
    let mapping = initFromUniques(oriFreqMap, freqMap);
    console.log(`inital mapping: ${[...mapping.entries()].join(' | ')}`);
    
    // iterate until we find matches
    while (mapping.size !== 7) {
      mapping = findUniqueMapping(mapping, inputs, oriPatterns);
    }
    console.log(`final mapping: ${[...mapping.entries()].join(' | ')}`);

    // compute output
    sum += getDisplayedValue(outputs, mapping, oriPatterns);
  }

  return sum;
}

(function run() {
  try {
    const { file } = getArgvs();
    const content = readFileSync(file, { encoding:'utf8' }).trim();
    const entries = parseInput(content);

    let startTime = new Date().getTime();
    let answer = solution1(entries);
    let endTime = new Date().getTime();
    console.log(`Solution 1: ${endTime - startTime} ms`);
    console.log(answer);

    startTime = new Date().getTime();
    answer = solution2(entries);
    endTime = new Date().getTime();
    console.log(`Solution 2: ${endTime - startTime} ms`);
    console.log(answer);

  } catch (error) {
    console.error(error);
    process.exit(1);
  }

  process.exit(0);

})();