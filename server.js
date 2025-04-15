const express = require('express');
const session = require('express-session');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const cors = require('cors');
const app = express();
const PORT = 3000;

// Middleware
app.use(cors({
  origin: 'http://127.0.0.1:5500',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());

app.use(session({
  secret: 'notes_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }  // Change to true in production with HTTPS
}));

// MySQL Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'sam1769',  // Use .env file in production
  database: 'notes_app'
});

db.connect(err => {
  if (err) {
    console.error('MySQL connection error: ', err);
    throw err;
  }
  console.log('MySQL connected');
});

// Middleware to check if user is logged in
function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ message: 'Unauthorized, please log in' });
  }
  next();
}

// Routes
// Signup
app.post('/signup', async (req, res) => {
  const { username, password } = req.body;
  db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
    if (err) return res.status(500).json({ message: 'Internal server error' });
    if (results.length > 0) return res.status(400).json({ message: 'User already exists' });

    const hashed = await bcrypt.hash(password, 10);
    db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashed], (err) => {
      if (err) return res.status(500).json({ message: 'Internal server error' });
      res.json({ message: 'User registered successfully' });
    });
  });
});

// Login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
    if (err) return res.status(500).json({ message: 'Internal server error' });
    if (results.length === 0) return res.status(401).json({ message: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, results[0].password);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

    req.session.user = { id: results[0].id, username };
    res.json({ message: 'Login successful' });
  });
});

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ message: 'Logout failed' });
    res.json({ message: 'Logged out successfully' });
  });
});

// Get current user info
app.get('/me', requireLogin, (req, res) => {
  res.json({ username: req.session.user.username });
});

// Get notes
app.get('/notes', requireLogin, (req, res) => {
  db.query('SELECT * FROM notes WHERE user_id = ?', [req.session.user.id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Internal server error' });
    res.json(results);
  });
});

// Add note
app.post('/notes', requireLogin, (req, res) => {
  const { content } = req.body;
  db.query('INSERT INTO notes (user_id, content) VALUES (?, ?)', [req.session.user.id, content], (err) => {
    if (err) return res.status(500).json({ message: 'Internal server error' });
    res.json({ message: 'Note added successfully' });
  });
});

// Update note
app.put('/notes/:id', requireLogin, (req, res) => {
  const { content } = req.body;
  db.query(
    'UPDATE notes SET content = ? WHERE id = ? AND user_id = ?',
    [content, req.params.id, req.session.user.id],
    (err) => {
      if (err) return res.status(500).json({ message: 'Internal server error' });
      res.json({ message: 'Note updated successfully' });
    }
  );
});

// Delete note
app.delete('/notes/:id', requireLogin, (req, res) => {
  db.query(
    'DELETE FROM notes WHERE id = ? AND user_id = ?',
    [req.params.id, req.session.user.id],
    (err) => {
      if (err) return res.status(500).json({ message: 'Internal server error' });
      res.json({ message: 'Note deleted successfully' });
    }
  );
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
