const express = require('express');
const router = express.Router();
const db = require('../models/db');
const authenticateToken = require('../middleware/auth'); // Импортируем middleware для аутентификации
const logger = require('../logger'); // Импортируем логгер
const { body, validationResult } = require('express-validator'); // Импортируем функции для валидации

// Получение всех ячеек
router.get('/', authenticateToken, (req, res) => {
  db.query('SELECT * FROM locations', (err, results) => {
    if (err) {
      logger.error('Error fetching locations: %s', err.message);
      return res.status(500).json({ error: 'An error occurred while fetching locations' });
    }
    res.json(results);
  });
});

// Добавление новой ячейки
router.post(
  '/',
  authenticateToken,
  [
    body('id').isString().notEmpty().withMessage('ID is required and should be a string'),
    body('name').isString().notEmpty().withMessage('Name is required and should be a string'),
    body('barcode').isString().optional()
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { id, name, barcode } = req.body;
    db.query('INSERT INTO locations (id, name, barcode) VALUES (?, ?, ?)', 
    [id, name, barcode], (err) => {
      if (err) {
        logger.error('Error adding location: %s', err.message);
        return res.status(500).json({ error: 'An error occurred while adding the location' });
      }
      res.status(201).json({ message: 'Location added successfully' });
    });
  }
);

// Обновление ячейки
router.put(
  '/:id',
  authenticateToken,
  [
    body('name').isString().notEmpty().withMessage('Name is required and should be a string'),
    body('barcode').isString().optional()
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { id } = req.params;
    const { name, barcode } = req.body;
    db.query('UPDATE locations SET name = ?, barcode = ? WHERE id = ?', 
    [name, barcode, id], (err) => {
      if (err) {
        logger.error('Error updating location with id %s: %s', id, err.message);
        return res.status(500).json({ error: 'An error occurred while updating the location' });
      }
      res.json({ message: 'Location updated successfully' });
    });
  }
);

// Удаление ячейки
router.delete('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM locations WHERE id = ?', [id], (err) => {
    if (err) {
      logger.error('Error deleting location with id %s: %s', id, err.message);
      return res.status(500).json({ error: 'An error occurred while deleting the location' });
    }
    res.json({ message: 'Location deleted successfully' });
  });
});

module.exports = router;