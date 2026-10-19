import apiClient from './apiClient';

/**
 * Servicio de Tableros (Boards)
 * Contrato: POST /api/boards y GET /api/boards/:boardId
 */
export const boardService = {
  /**
   * Crea un nuevo tablero en el backend.
   * @param {Object} data
   * @param {string} data.name - Nombre del tablero (1-100 caracteres).
   * @returns {Promise<Object>} Tablero creado con _id, name, createdAt, updatedAt.
   */
  async createBoard(data) {
    return apiClient.post('/api/boards', {
      name: data.name?.trim(),
    });
  },

  /**
   * Obtiene un tablero por ID con sus columnas y tickets anidados y ordenados.
   * @param {string} boardId - ObjectId (24 hex) del tablero.
   * @returns {Promise<Object>} Tablero completo con array de columns poblado.
   */
  async getBoardById(boardId) {
    return apiClient.get(`/api/boards/${boardId}`);
  },
};

export default boardService;
