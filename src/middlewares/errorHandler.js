const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Error interno del servidor';

  // Error de ID inválido de MongoDB
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'ID inválido';
  }

  // Errores de validación de Mongoose
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const messages = Object.values(err.errors).map((val) => val.message);
    message = messages.join(', ');
  }

  // Error de concurrencia de versión de Mongoose (optimistic concurrency)
  if (err.name === 'VersionError') {
    statusCode = 409;
    message = 'Conflicto de concurrencia, reintenta';
  }

  // Error de JSON malformado (express.json)
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = 400;
    message = 'JSON inválido';
  }

  // Ocultar detalles internos en producción
  if (statusCode === 500 && process.env.NODE_ENV === 'production') {
    message = 'Error interno del servidor';
  }

  // Respuesta global estructurada
  res.status(statusCode).json({
    error: message
  });
};

module.exports = errorHandler;
