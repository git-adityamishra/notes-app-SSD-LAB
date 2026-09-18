const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/notes_db';

const connectDB = () => {
  return mongoose
    .connect(MONGO_URI)
    .then((conn) => {
      console.log(`[MongoDB] Connected successfully: ${conn.connection.host}`);
    })
    .catch((err) => {
      console.error(`[MongoDB] Connection error: ${err.message}`);
    });
};

module.exports = connectDB;