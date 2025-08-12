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
    li.appendChild(label);
    li.appendChild(canvas);
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
