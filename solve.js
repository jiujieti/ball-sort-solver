function findOptimal(input, names) {
  const f = freq(input);
  const cap = Math.max(...input.map((x) => x.length));
  let bad = false;
  for (const c in f) {
    if (f[c] != cap) {
      console.log('missing', c, cap - f[c]);
      bad = true;
    }
  }
  if (bad) {
    return;
  }

  const steps = search(input, names, Number.MAX_VALUE);
  // const steps = search(input, names, 1000);
  console.log(steps.join('\n'));
  console.log(steps.length);

  let low = 1;
  let high = steps.length;
  while (low < high) {
    const mid = Math.floor((low + high) / 2);
    const steps = search(input, names, mid);
    if (steps) {
      high = mid;
      console.log(steps.join('\n'));
      console.log(steps.length);
    } else {
      low = mid + 1;
      console.log(`No solution with ${mid} steps`);
    }
  }
}

function freq(input) {
  const f = {};
  for (const row of input) {
    for (const x of row) {
      if (f[x] === undefined) {
        f[x] = 0;
      }
      f[x]++;
    }
  }
  return f;
}

function search(input, names, maxStep) {
  const state = input.map((x) => [...x]);
  const visited = new Set();
  const cap = Math.max(...input.map((x) => x.length));
  const num = input.length;
  const steps = [];

  return f();

  function f() {
    if (steps.length > maxStep) {
      return;
    }
    if (isValid(state, cap)) {
      return steps;
    }
    const stateStr = convertToString(state);
    if (visited.has(stateStr)) {
      return;
    }
    visited.add(stateStr);
    for (let i = 0; i < num; i++) {
      if (state[i].length === 0) {
        continue;
      }
      for (let j = 0; j < num; j++) {
        if (i === j || state[j].length === cap || !canMove(state, i, j, cap)) {
          continue;
        }
        move(state, i, j);
        steps.push(`${names[i]}->${names[j]}`);
        if (f()) {
          return steps;
        };
        steps.pop();
        move(state, j, i);
      }
    }
    return;
  }
}

function isValid(array, cap) {
  for (const arr of array) {
    if (arr.length != 0 && arr.length != cap) {
      return false;
    }
    for (let i = 1; i < arr.length; i++) {
      if (arr[i] !== arr[i-1]) {
        return false;
      }
    }
  }
  return true;
}

function convertToString(input) {
  return input.map(arr => `[${arr.join(",")}]`).join();
}

function canMove(input, i1, i2, cap) {
  return (input[i2].length === 0 || input[i1][0] === input[i2][0]) &&
    !(allSame(input[i1]) && (input[i1].length === cap || input[i2].length === 0));
}

function allSame(arr) {
  return arr.every(ele => ele === arr[0]);
}

function move(input, i1, i2) {
  input[i2].unshift(input[i1].shift());
}

findOptimal([
  '橙草绿蓝',
  '粉帽橙紫',
  '红蓝帽黄',
  '黄粉紫黄',
  '水草黄橙', // ?
  '绿棕红灰',
  '蓝灰棕粉',

  '橙帽蓝粉',
  '棕绿棕灰',
  '帽红紫水',
  '灰草紫水', // ?
  '草红水绿',
  '',
  '',
], [
  'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7',
  'B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7']);