import React from 'react';
import './TicketCard.css';

/**
 * Componente presentacional TicketCard.
 * Estrictamente tonto: solo recibe props y renderiza UI.
 * Sin useEffect, fetch ni llamadas a API.
 *
 * @param {Object} props
 * @param {Object} props.ticket - Documento Ticket según contrato.
 * @param {string} props.ticket._id
 * @param {string} props.ticket.title
 * @param {string} [props.ticket.description]
 * @param {number} [props.ticket.position]
 * @param {string} [props.ticket.priority] - Manejado condicionalmente si está presente
 * @param {Function} [props.onDelete] - Callback al solicitar eliminar el ticket
 * @param {Function} [props.onClick] - Callback al hacer click en la tarjeta (ej. para editar)
 * @param {Function} [props.onDragStart] - Callback para drag and drop
 * @param {string} [props.className]
 */
export const TicketCard = ({
  ticket,
  onDelete,
  onClick,
  onDragStart,
  className = '',
}) => {
  if (!ticket) return null;

  const { title, description, position, priority } = ticket;

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete?.(ticket);
  };

  return (
    <article
      className={`ticket-card ${className}`.trim()}
      onClick={() => onClick?.(ticket)}
      draggable={Boolean(onDragStart)}
      onDragStart={(e) => onDragStart?.(e, ticket)}
      tabIndex={0}
      role="button"
      aria-label={`Ticket: ${title}`}
    >
      <header className="ticket-card__header">
        <h4 className="ticket-card__title">{title}</h4>
        {onDelete && (
          <button
            type="button"
            className="ticket-card__delete-btn"
            onClick={handleDelete}
            aria-label={`Eliminar ticket ${title}`}
            title="Eliminar ticket"
          >
            ✕
          </button>
        )}
      </header>

      {description && (
        <p className="ticket-card__description">{description}</p>
      )}

      <footer className="ticket-card__footer">
        <span className="ticket-card__badge">
          Pos: {position !== undefined ? position : 0}
        </span>
        {priority && (
          <span className="ticket-card__badge">
            {priority}
          </span>
        )}
      </footer>
    </article>
  );
};

export default TicketCard;
