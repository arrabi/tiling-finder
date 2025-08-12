function drawPattern(canvas, pattern) {
  const cellSize = 20;
  canvas.width = canvas.height = pattern.gridSize * cellSize;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = '#eee';
  for (let i = 0; i <= pattern.gridSize; i++) {
    ctx.beginPath();
    ctx.moveTo(i * cellSize, 0);
    ctx.lineTo(i * cellSize, canvas.height);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i * cellSize);
    ctx.lineTo(canvas.width, i * cellSize);
    ctx.stroke();
  }

  ctx.fillStyle = 'rgba(0, 150, 255, 0.5)';
  ctx.strokeStyle = '#000';
  pattern.squares.forEach(sq => {
    const x = sq.x * cellSize;
    const y = sq.y * cellSize;
    const size = sq.size * cellSize;
    ctx.fillRect(x, y, size, size);
    ctx.strokeRect(x, y, size, size);
  });
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

function drawTiledPattern(canvas, pattern, tilesX = 3, tilesY = 3) {
  const cellSize = 20;
  const box = getBoundingBox(pattern.squares);
  canvas.width = box.width * tilesX * cellSize;
  canvas.height = box.height * tilesY * cellSize;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = 'rgba(0, 150, 255, 0.5)';
  ctx.strokeStyle = '#000';

  for (let ty = 0; ty < tilesY; ty++) {
    for (let tx = 0; tx < tilesX; tx++) {
      pattern.squares.forEach(sq => {
        const x = (sq.x - box.minX + tx * box.width) * cellSize;
        const y = (sq.y - box.minY + ty * box.height) * cellSize;
        const size = sq.size * cellSize;
        ctx.fillRect(x, y, size, size);
        ctx.strokeRect(x, y, size, size);
      });
    }
  }
}

async function fetchPatterns() {
  const res = await fetch('/patterns');
  const data = await res.json();
  const list = document.getElementById('patternList');
  list.innerHTML = '';
  data.forEach((p, idx) => {
    const li = document.createElement('li');
    li.className = 'pattern';
    const label = document.createElement('div');
    label.textContent = `Pattern ${idx + 1}: ${p.squares.length} squares`;
    const canvas = document.createElement('canvas');
    drawPattern(canvas, p);
    const tiledCanvas = document.createElement('canvas');
    drawTiledPattern(tiledCanvas, p);
    li.appendChild(label);
    li.appendChild(canvas);
    li.appendChild(tiledCanvas);
    list.appendChild(li);
  });
}

async function startSearch() {
  const res = await fetch('/search/start', { method: 'POST' });
  const data = await res.json();
  document.getElementById('status').textContent = `Iterations: ${data.iterations}`;
  await fetchPatterns();
}

document.getElementById('startBtn').addEventListener('click', startSearch);
fetchPatterns();
