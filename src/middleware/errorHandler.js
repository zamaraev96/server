const logger = require('../logger');

function errorHandler(err, req, res, next) {
  logger.error('Error: %s', err.message);
  res.status(500).json({ error: 'An internal server error occurred' });
}

module.exports = errorHandler;