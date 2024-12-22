const express = require('express');
const helmet = require('helmet'); // Импортируем helmet для установки безопасных заголовков
const xssClean = require('xss-clean'); // Импортируем xss-clean для защиты от XSS
const app = express();
const port = 3000;

const itemsRouter = require('./routes/items');
const locationsRouter = require('./routes/locations');
const authRouter = require('./routes/auth');
const logger = require('./logger');
const errorHandler = require('./middleware/errorHandler');
const compression = require('compression');

// Используйте helmet для установки безопасных заголовков
app.use(helmet());

// Используйте xss-clean для защиты от XSS
app.use(xssClean());

app.use(express.json());

app.use('/api/items', itemsRouter);
app.use('/api/locations', locationsRouter);
app.use('/api/auth', authRouter);

app.get('/', (req, res) => {
  res.send('Warehouse API is running');
});

// Middleware для обработки ошибок
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

app.use(compression());