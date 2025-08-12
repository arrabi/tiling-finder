# tiling-finder
finds tiling based on certain constraints

The search algorithm builds contiguous patterns of squares and avoids
saving duplicate layouts by enforcing adjacency and similarity
constraints. Patterns that leave gaps inside their bounding box are
discarded and recorded so they are not generated again.

## Development

```bash
npm install
npm start
```

Visit `http://localhost:3000` to use the app.
