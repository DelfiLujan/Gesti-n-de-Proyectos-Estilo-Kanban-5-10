/**
 * Envoltorio para controladores asíncronos que captura cualquier promesa rechazada
 * y la redirige al middleware de error centralizado (next(err)).
 * @param {Function} fn Función controladora asíncrona (req, res, next)
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
