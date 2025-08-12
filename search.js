const fs = require('fs');
const path = require('path');

const STATE_FILE = path.join(__dirname, 'data', 'state.json');
const PATTERN_FILE = path.join(__dirname, 'data', 'patterns.json');
const DISCARDED_FILE = path.join(__dirname, 'data', 'discarded.json');

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

function getBoundingBox(squares) {
  const xs = squares.map(s => [s.x, s.x + s.size]);
  const ys = squares.map(s => [s.y, s.y + s.size]);
  const minX = Math.min(...xs.map(v => v[0]));
  const maxX = Math.max(...xs.map(v => v[1]));
  const minY = Math.min(...ys.map(v => v[0]));
  const maxY = Math.max(...ys.map(v => v[1]));
  return { minX, minY, width: maxX - minX, height: maxY - minY };
}

function isFilled(pattern) {
  const { squares } = pattern;
  if (squares.length === 0) return false;
  const box = getBoundingBox(squares);
  const grid = Array.from({ length: box.height }, () => Array(box.width).fill(false));
  for (const sq of squares) {
    for (let y = sq.y - box.minY; y < sq.y - box.minY + sq.size; y++) {
      for (let x = sq.x - box.minX; x < sq.x - box.minX + sq.size; x++) {
        grid[y][x] = true;
      }
    }
  }
  return grid.every(row => row.every(cell => cell));
}

function isTileable(pattern) {
  return isFilled(pattern);
}

function step(iterations = 1) {
  const state = loadJSON(STATE_FILE) || { iterations: 0 };
  const patterns = loadJSON(PATTERN_FILE) || [];
  const discarded = loadJSON(DISCARDED_FILE) || [];

  for (let i = 0; i < iterations; i++) {
    let pattern;
    let attempts = 0;
    do {
      pattern = generatePattern();
      attempts++;
    } while (
      attempts < 5 &&
      (patterns.some(p => patternsEqual(p, pattern)) ||
        discarded.some(p => patternsEqual(p, pattern)))
    );

    if (
      !patterns.some(p => patternsEqual(p, pattern)) &&
      !discarded.some(p => patternsEqual(p, pattern))
    ) {
      if (isTileable(pattern)) {
        patterns.push(pattern);
      } else {
        discarded.push(pattern);
      }
      state.iterations++;
    }
  }

  saveJSON(STATE_FILE, state);
  saveJSON(PATTERN_FILE, patterns);
  saveJSON(DISCARDED_FILE, discarded);
  return { iterations: state.iterations };
}

module.exports = { step };
