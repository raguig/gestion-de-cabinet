import app from '../src/server.js';

// ensure OPTIONS is handled at this layer too (optional, safe)
app.options('*', (req, res) => res.sendStatus(204));

// Error handler (keep existing)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

export default app;
