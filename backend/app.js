const express = require('express');
const studentRoutes = require('./routes/studentRoutes');
const dotenv = require('dotenv');
const cors = require('cors');

// Load environment variables if not in test environment
if (process.env.NODE_ENV !== 'test') {
  dotenv.config();
}

const app = express();

// Body parser and CORS middleware
app.use(cors());
app.use(express.json());

// Mount routers
app.use('/api/students', studentRoutes);

// Error handler for unhandled routes
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
});

module.exports = app;
