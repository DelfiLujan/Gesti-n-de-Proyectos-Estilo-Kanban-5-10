const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// Middlewares globales
app.use(helmet());
app.use(cors());
app.use(express.json());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rutas base (se agregarán en Fase 3)
// app.use('/api/boards', ...);

// Manejo de rutas inexistentes (404)
app.use(notFound);

// Manejo global de errores centralizado
app.use(errorHandler);

module.exports = app;
