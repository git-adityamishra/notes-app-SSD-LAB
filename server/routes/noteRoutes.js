const express = require('express');
const router = express.Router();
const Note = require('../models/Note');

// 1. POST /api/notes - Create a new note
router.post('/', async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const newNote = new Note({ title, content });
    const savedNote = await newNote.save();
    return res.status(201).json(savedNote);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// 2. GET /api/notes - Query all notes ordered chronologically descending ({ createdAt: -1 })
router.get('/', async (req, res) => {
  try {
    const notes = await Note.find().sort({ createdAt: -1 });
    return res.status(200).json(notes);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// 3. DELETE /api/notes/:id - Locate note by _id, delete, and return 200 OK or 404 Not Found
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedNote = await Note.findByIdAndDelete(id);

    if (!deletedNote) {
      return res.status(404).json({ error: 'Note not found' });
    }

    return res.status(200).json({ message: 'Note deleted successfully', note: deletedNote });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ error: 'Note not found' });
    }
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;