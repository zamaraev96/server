const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('../models/db');
const router = express.Router();
const { body, validationResult } = require('express-validator'); // Импортируем функции для валидации

const secretKey = '123'; // Замените на ваш секретный ключ

// Регистрация пользователя
router.post(
  '/register',
  [
    body('username').isString().notEmpty().withMessage('Username is required and should be a string'),
    body('password').isString().notEmpty().withMessage('Password is required and should be a string')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ message: 'User registered successfully' });
    });
  }
);

// Вход пользователя
router.post(
  '/login',
  [
    body('username').isString().notEmpty().withMessage('Username is required and should be a string'),
    body('password').isString().notEmpty().withMessage('Password is required and should be a string')
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { username, password } = req.body;
    db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
      if (err || results.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      const user = results[0];
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      const token = jwt.sign({ userId: user.id }, secretKey, { expiresIn: '1h' });
      res.json({ token });
    });
  }
);

module.exports = router;