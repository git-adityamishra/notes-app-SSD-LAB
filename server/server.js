const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const noteRoutes = require('./routes/noteRoutes');

const app = express();
const INITIAL_PORT = parseInt(process.env.PORT, 10) || 5000;

// Connect to MongoDB
connectDB();

// Mount CORS and JSON body parser BEFORE route handlers
app.use(cors());
app.use(express.json());

// Mount API routes
app.use('/api/notes', noteRoutes);

// Healthcheck root endpoint
app.get('/', (req, res) => {
  res.send('Notes API server is running');
});

// Start server with automatic fallback if port 5000 is occupied (e.g., macOS AirPlay)
const startServer = (port) => {
  const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE' && port === 5000) {
      console.warn(`Port 5000 is occupied. Falling back to port 8000...`);
      startServer(8000);
    } else {
      console.error(`Failed to start server:`, err);
    }
  });
};

startServer(INITIAL_PORT);