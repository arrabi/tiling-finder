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

// very naive pattern generator for demonstration
function generatePattern(gridSize = 6, count = 5) {
  const squares = [];
  for (let i = 0; i < count; i++) {
    let sq;
    let attempts = 0;
    do {
      sq = randomSquare(gridSize);
      attempts++;
    } while (attempts < 10 && squares.some(s => overlaps(s, sq)));
    squares.push(sq);
  }
  return { gridSize, squares };
}

function overlaps(a, b) {
  return !(b.x + b.size <= a.x ||
           b.y + b.size <= a.y ||
           b.x >= a.x + a.size ||
           b.y >= a.y + a.size);
}

function step(iterations = 1) {
  const state = loadJSON(STATE_FILE) || { iterations: 0 };
  const patterns = loadJSON(PATTERN_FILE) || [];

  for (let i = 0; i < iterations; i++) {
    const pattern = generatePattern();
    patterns.push(pattern);
    state.iterations++;
  }

  saveJSON(STATE_FILE, state);
  saveJSON(PATTERN_FILE, patterns);
  return { iterations: state.iterations };
}

module.exports = { step };
