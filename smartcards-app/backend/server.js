const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const port = 3001;

// Middleware
app.use(express.json());
app.use(cors());

// Create a connection to the database
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', // Add password if necessary
    database: 'flashcards_db', // Make sure the DB is created in MySQL or H2
});

// Check connection
db.connect(err => {
    if (err) throw err;
    console.log('Connected to the database!');
});

// Create Flashcard API endpoint
app.post('/api/flashcards', (req, res) => {
    const { term, definition } = req.body;

    const query = 'INSERT INTO flashcards (term, definition) VALUES (?, ?)';

    db.query(query, [term, definition], (err, result) => {
        if (err) {
            console.error('Error inserting flashcard:', err);
            res.status(500).send('Error saving flashcard');
        } else {
            res.status(200).json({ id: result.insertId, term, definition });
        }
    });
});

// Get all Flashcards API endpoint
app.get('/api/flashcards', (req, res) => {
    db.query('SELECT * FROM flashcards', (err, results) => {
        if (err) {
            console.error('Error fetching flashcards:', err);
            res.status(500).send('Error fetching flashcards');
        } else {
            res.json(results);
        }
    });
});

// Delete Flashcard API endpoint
app.delete('/api/flashcards/:id', (req, res) => {
    const { id } = req.params;

    db.query('DELETE FROM flashcards WHERE id = ?', [id], (err, result) => {
        if (err) {
            console.error('Error deleting flashcard:', err);
            res.status(500).send('Error deleting flashcard');
        } else {
            res.status(200).send('Flashcard deleted successfully');
        }
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
