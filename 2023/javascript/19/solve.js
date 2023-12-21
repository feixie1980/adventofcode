import { readFileSync } from 'fs';
import Yargs from "yargs";
import { mergeRanges, processRating } from "./utils.js";

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

function parseWorkflows(s) {
  let workflowMap = new Map();

  s.split('\n').map(line => {
    const [name, body] = line.split('{');
    const rules = body.split(',').map(s => {
      if (s.endsWith('}')) {
        return {
          target: s.slice(0, s.length - 1)
        }
      }

      const [ruleStr, target] = s.split(':');
      let rule = {};

      ruleStr.replaceAll(/([xmas])([<>])([0-9]+)/g, (match, part, op, value) => {
        rule.part = part;
        rule.op = op;
        rule.value = parseInt(value);
        rule.target = target;

        if (op === '<') {
          rule.vRange = [0, rule.value];
        } else if (op === '>') {
          rule.vRange = [rule.value, 4001];
        }
      })
      return rule;
    });

    // compute accumulated ranges
    rules.forEach((rule, i) => {
      const ranges = { };
      ranges[rule.part] = rule.vRange;

      if (i === 0) {
        rule.accRanges = ranges;
        return;
      }

      const prevRule = rules[i - 1];
      const prefAccRanges = prevRule.accRanges;
      rule.accRanges = mergeRanges(ranges, prefAccRanges);
    })

    workflowMap.set(name, rules);
  });

  return workflowMap;
}

function parseRatings(s) {
  return s.split('\n').map(line => {
    const rating = {};
    line.replaceAll(/{x=([0-9]+),m=([0-9]+),a=([0-9]+),s=([0-9]+)}/g, (match, s1, s2, s3, s4) => {
      rating.x = parseInt(s1);
      rating.m = parseInt(s2);
      rating.a = parseInt(s3);
      rating.s = parseInt(s4);
    });
    return rating;
  })
}

function parseInput(content) {
  const [s1, s2] = content.split('\n\n');

  const workflowMap = parseWorkflows(s1);
  const ratings = parseRatings(s2);
  return { workflowMap, ratings };
}

function solution1(workflowMap, ratings) {
  let total = 0;
  for(const rating of ratings) {
    const result = processRating(rating, workflowMap);
    if (result === 'A') {
      total += Object.values(rating).reduce((sum, n) => sum + n, 0);
    }
  }
  return total;
}

function solution2() {
  return false;
}

(function run() {
  try {
    const { file } = getArgvs();
    const content = readFileSync(file, { encoding:'utf8' }).trim();
    const { workflowMap, ratings } = parseInput(content);

    let startTime = new Date().getTime();
    let answer = solution1(workflowMap, ratings);
    let endTime = new Date().getTime();
    console.log(`Solution 1: ${endTime - startTime} ms`);
    console.log(answer);

    startTime = new Date().getTime();
    answer = solution2();
    endTime = new Date().getTime();
    console.log(`Solution 2: ${endTime - startTime} ms`);
    console.log(answer);

  } catch (error) {
    console.error(error);
    process.exit(1);
  }

  process.exit(0);

})();
