const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// Sample data
let users = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
];

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the sample API!' });
});

// GET all users
app.get('/api/users', (req, res) => {
  res.json(users);
});

// GET a specific user
app.get('/api/users/:id', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
});

// POST a new user
app.post('/api/users', (req, res) => {
  const newUser = {
    id: users.length + 1,
    name: req.body.name
  };
  users.push(newUser);
  res.status(201).json(newUser);
});

// PUT (update) a user
app.put('/api/users/:id', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).json({ message: 'User not found' });
  
  user.name = req.body.name;
  res.json(user);
});

// DELETE a user
app.delete('/api/users/:id', (req, res) => {
  const index = users.findIndex(u => u.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ message: 'User not found' });
  
  users.splice(index, 1);
  res.json({ message: 'User deleted' });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});