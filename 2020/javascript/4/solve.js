const argv = require('yargs').argv;
const fs = require('fs');

const target = 2020;

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

function solution1a(passports) {
  let validCount = 0;
  for (const passport of passports) {
    const fieldCount = Object.keys(passport).length;
    if (fieldCount === 8 || (fieldCount === 7 && !passport['cid'])) {
      validCount++;
    }
  }
  return validCount;
}

function validateYears(value, min, max) {
  try {
    const intValue = parseInt(value);
    if (intValue >= min && intValue <= max) {
      return true;
    }
  } catch (e) {}
  return false;
}

function validateValue(field, value) {
  let isValid = true;
  switch (field) {
    case 'byr':
      isValid = validateYears(value, 1920, 2020);
      break;

    case 'iyr':
      isValid = validateYears(value, 2010, 2020);
      break;

    case 'eyr':
      isValid = validateYears(value, 2020, 2030);
      break;

    case 'ecl':
      const validColors = ['amb', 'blu', 'brn', 'gry', 'grn', 'hzl', 'oth'];
      isValid = validColors.indexOf(value) !== -1;
      break;

    case 'hcl':
      isValid = !!value.match(/#[0-9a-f]{6}/);
      break;

    case 'pid':
      if (value.length !== 9) {
        isValid = false;
      }
      else {
        isValid = !!value.match(/^[0]*[0-9]+$/);
      }
      break;

    // 123cm or 214in
    case 'hgt':
      let isMatchingPattern = false;
      value.replace(/^([0-9]+)(cm|in)$/, (match, number, unit) => {
        isMatchingPattern = true;
        if(!match) {
          isValid = false;
        }
        else {
          try {
            const intValue = parseInt(number);
            if (unit === 'cm' && (intValue < 150 || intValue > 193)) {
              isValid = false;
            }
            else if (unit === 'in' && (intValue < 59 || intValue > 76)) {
              isValid = false;
            }
          } catch (e) {
            isValid = false;
          }
        }
      });
      if (!isMatchingPattern) {
        isValid = false;
      }
      break;

    default:
  }
  return isValid;
}

function solution2a(passports) {
  let validCount = 0;
  for (const passport of passports) {
    const fieldCount = Object.keys(passport).length;
    if (fieldCount < 7 || (fieldCount === 7 && passport['cid'])) {
      continue;
    }
    let isValid = true;
    for (const field in passport) {
      if (!validateValue(field, passport[field])) {
        isValid = false;
        break;
      }
    }
    if (isValid) {
      validCount++;
    }
  }
  return validCount;
}

/* File sample:
ecl:gry pid:860033327 eyr:2020 hcl:#fffffd
byr:1937 iyr:2017 cid:147 hgt:183cm

iyr:2013 ecl:amb cid:350 eyr:2023 pid:028048884
hcl:#cfa07d byr:1929

hcl:#ae17e1 iyr:2013
eyr:2024
ecl:brn pid:760753108 byr:1931
hgt:179cm

hcl:#cfa07d eyr:2025 pid:166559648
iyr:2011 ecl:brn hgt:59in
 */
function parseInput(content) {
  let passports = content.split('\n\n');
  passports = passports.map(string => {
    const entries = string.split(/[\s]+/).map(entry => entry.split(':'));
    let obj = {};
    entries.forEach(entry => {
      if (!!entry[0]) {
        obj[entry[0]] = entry[1]
      }
    });
    return obj;
  });
  return passports;
}

(function run() {
  try {
    const { file } = getArgvs();
    const content = fs.readFileSync(file, { encoding:'utf8' });
    const passports = parseInput(content);

    let startTime = new Date().getTime();
    let validCount = solution1a(passports);
    let endTime = new Date().getTime();
    console.log(`Solution 1.a: ${endTime - startTime} ms`);
    console.log(`  Total passports: ${passports.length}`);
    console.log(`  Answer is: ${validCount}.`);

    startTime = new Date().getTime();
    validCount = solution2a(passports);
    endTime = new Date().getTime();
    console.log(`Solution 1.a: ${endTime - startTime} ms`);
    console.log(`  Total passports: ${passports.length}`);
    console.log(`  Answer is: ${validCount}.`);

  } catch (error) {
    console.error(error);
    process.exit(1);
  }

  process.exit(0);

})();
