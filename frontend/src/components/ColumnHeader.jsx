import React from 'react';
import './ColumnHeader.css';

/**
 * Componente presentacional ColumnHeader.
 * Estrictamente tonto: solo recibe props y renderiza UI.
 *
 * @param {Object} props
 * @param {string} props.name - Nombre de la columna.
 * @param {number} [props.count=0] - Cantidad de tickets dentro de la columna.
 * @param {Function} [props.onAddTicket] - Callback para abrir formulario/modal de nuevo ticket.
 * @param {Function} [props.onDelete] - Callback para solicitar eliminación de la columna.
 * @param {string} [props.className]
 */
export const ColumnHeader = ({
  name,
  count = 0,
  onAddTicket,
  onDelete,
  className = '',
}) => {
  return (
    <header className={`column-header ${className}`.trim()}>
      <div className="column-header__info">
        <h3 className="column-header__title">{name}</h3>
        <span
          className="column-header__counter"
          aria-label={`${count} tickets`}
          title={`${count} tickets en esta columna`}
        >
          {count}
        </span>
      </div>

      <div className="column-header__actions">
        {onAddTicket && (
          <button
            type="button"
            className="column-header__btn"
            onClick={onAddTicket}
            aria-label={`Agregar ticket a ${name}`}
            title="Agregar ticket"
          >
            + Añadir
          </button>
        )}
        {onDelete && (
          <button
            type="button"
            className="column-header__btn column-header__btn--danger"
            onClick={onDelete}
            aria-label={`Eliminar columna ${name}`}
            title="Eliminar columna"
          >
            🗑
          </button>
        )}
      </div>
    </header>
  );
};

export default ColumnHeader;
