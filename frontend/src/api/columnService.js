import apiClient from './apiClient';

/**
 * Servicio de Columnas (Columns)
 * Contrato: POST /api/boards/:boardId/columns y DELETE /api/boards/:boardId/columns/:columnId
 */
export const columnService = {
  /**
   * Crea una nueva columna dentro de un tablero específico.
   * @param {string} boardId - ObjectId (24 hex) del tablero padre.
   * @param {Object} data
   * @param {string} data.name - Nombre de la columna.
   * @param {number} [data.order=0] - Orden visual opcional de la columna.
   * @returns {Promise<Object>} Columna creada.
   */
  async createColumn(boardId, data) {
    const payload = {
      name: data.name?.trim(),
    };
    if (data.order !== undefined) {
      payload.order = Number(data.order);
    }
    return apiClient.post(`/api/boards/${boardId}/columns`, payload);
  },

  /**
   * Elimina una columna y sus tickets asociados en cascada.
   * @param {string} boardId - ObjectId (24 hex) del tablero.
   * @param {string} columnId - ObjectId (24 hex) de la columna a eliminar.
   * @returns {Promise<void>} 204 No Content.
   */
  async deleteColumn(boardId, columnId) {
    return apiClient.delete(`/api/boards/${boardId}/columns/${columnId}`);
  },
};

export default columnService;
