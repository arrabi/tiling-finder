const fs = require('fs');
const path = require('path');

const STATE_FILE = path.join(__dirname, 'data', 'state.json');
const PATTERN_FILE = path.join(__dirname, 'data', 'patterns.json');

function loadJSON(file) {
  try {
    return JSON.parse(fs.readFileSync(file));
  } catch (e) {
    return null;
  }
}

function saveJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function randomSquare(maxSize) {
  const size = Math.floor(Math.random() * 3) + 1; // 1,2,3
  const x = Math.floor(Math.random() * (maxSize - size + 1));
  const y = Math.floor(Math.random() * (maxSize - size + 1));
  return { x, y, size };
}

function adjacent(a, b) {
  const horizontallyTouching =
    a.y === b.y &&
    (a.x + a.size === b.x || b.x + b.size === a.x);
  const verticallyTouching =
    a.x === b.x &&
    (a.y + a.size === b.y || b.y + b.size === a.y);
  return horizontallyTouching || verticallyTouching;
}

function generatePattern(gridSize = 6, count = 5) {
  const squares = [];
  for (let i = 0; i < count; i++) {
    let sq;
    let attempts = 0;
    do {
      sq = randomSquare(gridSize);
      attempts++;
    } while (
      attempts < 50 &&
      (squares.some(s => overlaps(s, sq)) ||
        (squares.length > 0 && !squares.some(s => adjacent(s, sq))))
    );

    if (attempts < 50) {
      squares.push(sq);
    }
  }
  return { gridSize, squares };
}

function overlaps(a, b) {
  return !(b.x + b.size <= a.x ||
           b.y + b.size <= a.y ||
           b.x >= a.x + a.size ||
           b.y >= a.y + a.size);
}

function normalizeSquares(squares) {
  return squares
    .map(s => ({ ...s }))
    .sort((a, b) =>
      a.x - b.x || a.y - b.y || a.size - b.size
    );
}

function patternsEqual(a, b) {
  if (a.gridSize !== b.gridSize || a.squares.length !== b.squares.length) {
    return false;
  }
  const sqA = normalizeSquares(a.squares);
  const sqB = normalizeSquares(b.squares);
  return sqA.every((sq, i) =>
    sq.x === sqB[i].x && sq.y === sqB[i].y && sq.size === sqB[i].size
  );
}

function step(iterations = 1) {
  const state = loadJSON(STATE_FILE) || { iterations: 0 };
  const patterns = loadJSON(PATTERN_FILE) || [];

  for (let i = 0; i < iterations; i++) {
    let pattern;
    let attempts = 0;
    do {
      pattern = generatePattern();
      attempts++;
    } while (attempts < 5 && patterns.some(p => patternsEqual(p, pattern)));

    if (!patterns.some(p => patternsEqual(p, pattern))) {
      patterns.push(pattern);
      state.iterations++;
    }
  }

  saveJSON(STATE_FILE, state);
  saveJSON(PATTERN_FILE, patterns);
  return { iterations: state.iterations };
}

module.exports = { step };
