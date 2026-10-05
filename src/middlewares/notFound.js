const AppError = require('../utils/AppError');

const notFound = (req, res, next) => {
  next(new AppError(404, `Ruta no encontrada - ${req.originalUrl}`));
};

module.exports = notFound;
