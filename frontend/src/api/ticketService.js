import apiClient from './apiClient';

/**
 * Servicio de Tickets (Tarjetas Kanban)
 * Contrato: POST .../tickets y PATCH .../tickets/:ticketId
 */
export const ticketService = {
  /**
   * Crea un nuevo ticket dentro de una columna específica.
   * @param {string} boardId - ObjectId del tablero.
   * @param {string} columnId - ObjectId de la columna contenedora.
   * @param {Object} data
   * @param {string} data.title - Título obligatorio del ticket.
   * @param {string} [data.description] - Descripción opcional.
   * @param {number} [data.position=0] - Posición ordinal dentro de la columna.
   * @returns {Promise<Object>} Ticket creado.
   */
  async createTicket(boardId, columnId, data) {
    const payload = {
      title: data.title?.trim(),
    };
    if (data.description !== undefined) {
      payload.description = data.description.trim();
    }
    if (data.position !== undefined) {
      payload.position = Number(data.position);
    }
    return apiClient.post(
      `/api/boards/${boardId}/columns/${columnId}/tickets`,
      payload
    );
  },

  /**
   * Mueve o actualiza un ticket (operación atómica e idempotente).
   * @param {string} boardId - ObjectId del tablero.
   * @param {string} columnId - ObjectId de la columna ORIGEN actual del ticket.
   * @param {string} ticketId - ObjectId del ticket a modificar.
   * @param {Object} updateData
   * @param {string} [updateData.title] - Nuevo título.
   * @param {string} [updateData.description] - Nueva descripción.
   * @param {number} [updateData.position] - Nueva posición.
   * @param {string} [updateData.columnId] - Columna DESTINO para mover el ticket.
   * @returns {Promise<Object>} Ticket actualizado.
   */
  async updateTicket(boardId, columnId, ticketId, updateData) {
    const payload = {};
    if (updateData.title !== undefined) payload.title = updateData.title.trim();
    if (updateData.description !== undefined) payload.description = updateData.description.trim();
    if (updateData.position !== undefined) payload.position = Number(updateData.position);
    if (updateData.columnId !== undefined) payload.columnId = updateData.columnId;

    return apiClient.patch(
      `/api/boards/${boardId}/columns/${columnId}/tickets/${ticketId}`,
      payload
    );
  },
};

export default ticketService;
