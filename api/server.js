const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'votes.json');

app.use(cors());
app.use(express.json());

function readVotes() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    }
  } catch {}
  return [];
}

function writeVotes(votes) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(votes, null, 2));
}

// Get all votes
app.get('/votes', (req, res) => {
  res.json(readVotes());
});

// Submit a vote
app.post('/votes', (req, res) => {
  const { name, property, comment, committed } = req.body;

  if (!name || !property) {
    return res.status(400).json({ error: 'Name and property are required' });
  }

  const votes = readVotes();
  const vote = {
    name: name.trim(),
    property,
    comment: (comment || '').trim(),
    committed: !!committed,
    date: new Date().toISOString()
  };

  // Replace existing vote from same name
  const existing = votes.findIndex(v => v.name.toLowerCase() === vote.name.toLowerCase());
  if (existing >= 0) {
    votes[existing] = vote;
  } else {
    votes.push(vote);
  }

  writeVotes(votes);
  res.json({ success: true, votes });
});

// Delete a vote
app.delete('/votes/:name', (req, res) => {
  const votes = readVotes();
  const filtered = votes.filter(v => v.name.toLowerCase() !== req.params.name.toLowerCase());
  writeVotes(filtered);
  res.json({ success: true, votes: filtered });
});

app.get('/', (req, res) => {
  res.json({ status: 'Holiday votes API running', votes: readVotes().length });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Votes API running on port ${PORT}`);
});
