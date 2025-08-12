const express = require('express');
const fs = require('fs');
const path = require('path');
const search = require('./search');

const app = express();
const PORT = 3000;

app.use(express.static('public'));

app.get('/patterns', (req, res) => {
  const file = path.join(__dirname, 'data', 'patterns.json');
  fs.readFile(file, (err, data) => {
    if (err) return res.status(500).json({ error: 'Unable to read patterns.' });
    res.json(JSON.parse(data));
  });
});

app.get('/state', (req, res) => {
  const file = path.join(__dirname, 'data', 'state.json');
  fs.readFile(file, (err, data) => {
    if (err) return res.status(500).json({ error: 'Unable to read state.' });
    res.json(JSON.parse(data));
  });
});

app.post('/search/start', (req, res) => {
  const result = search.step(10);
  res.json(result);
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
