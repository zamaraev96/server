const express = require('express');
const router = express.Router();
const db = require('../models/db');
const authenticateToken = require('../middleware/auth'); // Импортируем middleware для аутентификации
const logger = require('../logger'); // Импортируем логгер
const { body, validationResult } = require('express-validator'); // Импортируем функции для валидации

// Получение всех товаров
router.get('/', authenticateToken, (req, res) => {
  db.query('SELECT * FROM items', (err, results) => {
    if (err) {
      logger.error('Error fetching items: %s', err.message);
      return res.status(500).json({ error: 'An error occurred while fetching items' });
    }
    res.json(results);
  });
});

// Добавление нового товара
router.post(
  '/',
  authenticateToken,
  [
    body('id').isString().notEmpty().withMessage('ID is required and should be a string'),
    body('name').isString().notEmpty().withMessage('Name is required and should be a string'),
    body('barcode').isString().optional(),
    body('locations').isArray().withMessage('Locations should be an array')
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { id, name, barcode, locations } = req.body;
    db.query('INSERT INTO items (id, name, barcode, locations) VALUES (?, ?, ?, ?)', 
    [id, name, barcode, JSON.stringify(locations)], (err) => {
      if (err) {
        logger.error('Error adding item: %s', err.message);
        return res.status(500).json({ error: 'An error occurred while adding the item' });
      }
      res.status(201).json({ message: 'Item added successfully' });
    });
  }
);

// Обновление товара
router.put(
  '/:id',
  authenticateToken,
  [
    body('name').isString().notEmpty().withMessage('Name is required and should be a string'),
    body('barcode').isString().optional(),
    body('locations').isArray().withMessage('Locations should be an array')
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { id } = req.params;
    const { name, barcode, locations } = req.body;
    db.query('UPDATE items SET name = ?, barcode = ?, locations = ? WHERE id = ?', 
    [name, barcode, JSON.stringify(locations), id], (err) => {
      if (err) {
        logger.error('Error updating item with id %s: %s', id, err.message);
        return res.status(500).json({ error: 'An error occurred while updating the item' });
      }
      res.json({ message: 'Item updated successfully' });
    });
  }
);

// Удаление товара
router.delete('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM items WHERE id = ?', [id], (err) => {
    if (err) {
      logger.error('Error deleting item with id %s: %s', id, err.message);
      return res.status(500).json({ error: 'An error occurred while deleting the item' });
    }
    res.json({ message: 'Item deleted successfully' });
  });
});

module.exports = router;