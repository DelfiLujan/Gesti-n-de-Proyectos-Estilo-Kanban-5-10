const AppError = require('../utils/AppError');

const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;

/**
 * Valida que los parámetros de la URL sean ObjectIds de 24 caracteres hexadecimales.
 * @param  {...string} paramNames Nombres de los parámetros a validar (ej: 'boardId', 'columnId')
 */
const validateObjectId = (...paramNames) => {
  // Si se usa directamente como middleware: router.use(validateObjectId)
  if (paramNames.length === 3 && typeof paramNames[2] === 'function') {
    const [req, res, next] = paramNames;
    for (const key of Object.keys(req.params)) {
      if (key.endsWith('Id') || key === 'id') {
        if (!OBJECT_ID_REGEX.test(req.params[key])) {
          return next(new AppError(400, 'ID inválido'));
        }
      }
    }
    return next();
  }

  // Si se usa como factory: validateObjectId('boardId', 'columnId')
  return (req, res, next) => {
    const targets = paramNames.length > 0
      ? paramNames
      : Object.keys(req.params).filter((k) => k.endsWith('Id') || k === 'id');

    for (const param of targets) {
      const val = req.params[param];
      if (val !== undefined && !OBJECT_ID_REGEX.test(val)) {
        return next(new AppError(400, 'ID inválido'));
      }
    }
    next();
  };
};

module.exports = validateObjectId;
