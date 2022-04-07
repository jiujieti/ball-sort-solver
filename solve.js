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
  console.log(steps.join('\n'));
  console.log(steps.length);

  let low = 0;
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

  // color - 1~n
  // cap - capacity in each tube
  // num - how many tubes
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
        if (i === j || state[j].length === cap || !canMove(state, i, j)) {
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

// [[0, 0, 0, 0, 0]]
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

function canMove(input, i1, i2) {
  if (input[i2].length === 0) {
    return true;
  }
  return input[i1][0] === input[i2][0];
}

function move(input, i1, i2) {
  input[i2].unshift(input[i1].shift());
}

// orange 1
// dark blue 2
// lime 3
// dark green 4
// pink 5
// blue 6
// red 7
// grey 8
// purple 9
findOptimal([
  '橙绿紫灰',
  '粉粉粉红',
  '绿紫绿水',
  '灰橙水蓝',
  '蓝紫水', // ?
  '粉草水蓝',

  '绿紫红橙',
  '草灰草红',
  '草橙蓝', // ?
  '',
  '',
], [
  'A1', 'A2', 'A3', 'A4', 'A5', 'A6',
  'B1', 'B2', 'B3', 'B4', 'B5', 'B6']);