import app from '../src/server.js';

// Add a health check route
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'API is running' });
});

// Add error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

export default app;