async function fetchPatterns() {
  const res = await fetch('/patterns');
  const data = await res.json();
  const list = document.getElementById('patternList');
  list.innerHTML = '';
  data.forEach((p, idx) => {
    const li = document.createElement('li');
    li.className = 'pattern';
    li.textContent = `Pattern ${idx + 1}: ${p.squares.length} squares`;
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
