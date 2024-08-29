const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { body, validationResult } = require('express-validator');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Sample data
let users = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
];

const MONGODB_URL = process.env.MONGODB_URL
mongoose.connect(MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true });

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    dob: String,
    fanType: String,
    geoInfo: {
      ip: String,
      lat: Number,
      long: Number
    },
    createdAt: Date,
    expiredAt: Date
});
const User = mongoose.model('User', userSchema);

const validateUserInput = [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Invalid email'),
    body('dob').notEmpty().withMessage('Date of birth is required'),
    body('fanType').notEmpty().withMessage('Fan type is required'),
    body('geoInfo.ip').isIP().withMessage('Invalid IP address'),
    body('geoInfo.lat').isFloat().withMessage('Invalid latitude'),
    body('geoInfo.long').isFloat().withMessage('Invalid longitude')
  ];

// Routes
app.post('/api/v1/user', validateUserInput, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  
    try {
      const { name, email, dob, fanType, geoInfo } = req.body;
  
      // 创建新用户对象，添加 createdAt 和 expiredAt
      const newUser = new User({
        name,
        email,
        dob,
        fanType,
        geoInfo,
        createdAt: new Date(),
        expiredAt: new Date(Date.now() + 2 * 60 * 60 * 1000) // 一年后过期
      });
  
      // 保存到数据库
      const savedUser = await newUser.save();
  
      // 返回新创建记录的 ObjectId
      res.status(201).json({ userId: savedUser._id });
    } catch (error) {
      console.error('Error saving user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
})

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