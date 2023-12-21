export function evaluate_old(rating, rule) {
  const { part, op, value, target } = rule;
  if (!part) {
    return target;
  }
  const partRating = rating[part];
  const satisfyRule = op === '>' && partRating > value || op === '<' && partRating < value;
  if (satisfyRule) {
    return target;
  }

  return undefined;
}

export function evaluate(rating, rule) {
  const { part, vRange, target } = rule;
  if (!part) {
    return target;
  }
  const partRating = rating[part];
  const satisfyRule = partRating > vRange[0] && partRating < vRange[1];
  if (satisfyRule) {
    return target;
  }

  return undefined;
}

export function processRating(rating, workflowMap) {
  let workflowRules = workflowMap.get('in');
  while(true) {
    let target;

    for(const rule of workflowRules) {
      target = evaluate(rating, rule);
      if (!target) {
        continue;
      }

      if (target === 'A' || target === 'R') {
        return target;
      }

      workflowRules = workflowMap.get(target);
      break;
    }
  }
}

/**
 * Ranges:
 * {
 *   x: [0, 1000],
 *   m: [23, 2324],
 *   a: [1123, 4001],
 *   s: [23, 55]
 * }
 *
 * Merge two range maps, overlapping part value ranges
 * @param rangeMap1
 * @param rangeMap2
 */
export function mergeRanges(ranges1, ranges2) {
  const merged = { };

  // deep clone ranges 2
  for(const [part, vRange] of Object.entries(ranges2)) {
    merged[part] = [...vRange];
  }

  // merge with 1
  for(const [part, vRange] of Object.entries(ranges1)) {
    if (!merged[part]) {
      merged[part] = vRange;
      continue;
    }
    const mergedVRange = merged[part];

    const min = Math.max(vRange[0], mergedVRange[0]);
    const max = Math.min(vRange[1], mergedVRange[1]);
    if (min >= max) {
      merged[part] = 'NA';
    } else {
      merged[part] = [min, max];
    }
  }

  return merged;
}

export function findAcceptPaths(workflowMap, workflow, path) {
  let acceptedPaths = [];
  const { name, rules } = workflow;


  const lastRule = rules[rules.length - 1]; // lastRule should only have a target
  if (lastRule.target === 'A') {
    acceptedPaths = [...acceptedPaths, [...path, workflow]];
  } else if (lastRule.target !== 'R') {
    const subPaths = findAcceptPaths(workflowMap, workflowMap.get(lastRule.target), [...path, workflow]);
    acceptedPaths = [...acceptedPaths, subPaths];
  }

  return acceptedPaths;
}
