import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PRIMARY_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/notes';
const FALLBACK_API_URL = 'http://localhost:8000/api/notes';

function App() {
  // State variables
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [activeApiUrl, setActiveApiUrl] = useState(PRIMARY_API_URL);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // 1. Lifecycle Data Ingestion: Runs once when the page loads
  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    setIsLoading(true);
    setErrorMessage('');
    let fetchedData = null;

    try {
      const response = await axios.get(activeApiUrl, { timeout: 1200 });
      fetchedData = response.data;
    } catch (err) {
      // Fallback check if port 5000 was busy and server used 8000
      try {
        const altUrl = activeApiUrl.includes('5000') ? FALLBACK_API_URL : PRIMARY_API_URL;
        const fallbackResponse = await axios.get(altUrl, { timeout: 1200 });
        fetchedData = fallbackResponse.data;
        setActiveApiUrl(altUrl);
      } catch (fallbackErr) {
        console.error('Error fetching notes:', fallbackErr);
        setErrorMessage('Failed to connect to backend server. Make sure MongoDB and Express are running.');
      }
    }

    if (fetchedData) {
      setNotes(fetchedData);
    }
    setIsLoading(false);
  };

  // 2. Controlled Submission Form: Handles form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevents page reload
    if (!title.trim() || !content.trim()) return;

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const response = await axios.post(activeApiUrl, {
        title: title.trim(),
        content: content.trim(),
      });

      // Synchronize local state: place the newly created note at top of list
      setNotes((prevNotes) => [response.data, ...prevNotes]);

      // Clear input fields
      setTitle('');
      setContent('');
    } catch (error) {
      console.error('Error creating note:', error);
      setErrorMessage('Failed to create note. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Interactive Deletion: Deletes note and updates state immediately
  const handleDelete = async (id) => {
    setDeletingId(id);
    setErrorMessage('');

    try {
      await axios.delete(`${activeApiUrl}/${id}`);
      // Remove the deleted note from local state without reloading the browser
      setNotes((prevNotes) => prevNotes.filter((note) => note._id !== id));
    } catch (error) {
      console.error('Error deleting note:', error);
      setErrorMessage('Failed to delete note. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  // Format date cleanly to readable local string
  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="app-container">
      <header className="app-header">
        
        <h1> Notes App </h1>
        
      </header>

      <main className="main-content">
        {/* Controlled Form Card */}
        <section className="card form-card">
          <h2>Create New Note</h2>
          {errorMessage && <div className="error-banner">{errorMessage}</div>}
          <form onSubmit={handleSubmit} className="note-form">
            <div className="form-group">
              <label htmlFor="note-title">Title</label>
              <input
                id="note-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Cloud Architecture Lab Notes"
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="form-group">
              <label htmlFor="note-content">Content</label>
              <textarea
                id="note-content"
                rows="4"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter detailed note content here..."
                required
                disabled={isSubmitting}
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting || !title.trim() || !content.trim()}
            >
              {isSubmitting ? 'Saving Note...' : 'Add Note'}
            </button>
          </form>
        </section>

        {/* Notes List Section */}
        <section className="notes-section">
          <div className="section-header">
            <h2>Your Notes</h2>
            {!isLoading && notes.length > 0 && (
              <span className="count-badge">
                {notes.length} {notes.length === 1 ? 'note' : 'notes'}
              </span>
            )}
          </div>

          {/* Defensive State 1: Loading Indicator */}
          {isLoading ? (
            <div className="state-card loading-state">
              <div className="spinner"></div>
              <p>Loading notes from MongoDB persistence layer...</p>
            </div>
          ) : notes.length === 0 ? (
            /* Defensive State 2: Empty State Fallback */
            <div className="state-card empty-state">
              <div className="empty-icon">📝</div>
              <p className="empty-message">No notes yet — add one above!</p>
            </div>
          ) : (
            /* Render Note Cards */
            <div className="notes-grid">
              {notes.map((note) => (
                <article key={note._id} className="note-card">
                  <div className="note-card-header">
                    <h3 className="note-title">{note.title}</h3>
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => handleDelete(note._id)}
                      disabled={deletingId === note._id}
                    >
                      {deletingId === note._id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                  <p className="note-body">{note.content}</p>
                  <div className="note-footer">
                    <time dateTime={note.createdAt} className="note-date">
                      {formatDateTime(note.createdAt)}
                    </time>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;