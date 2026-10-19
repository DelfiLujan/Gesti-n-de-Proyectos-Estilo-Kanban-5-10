import React from 'react';
import './Spinner.css';

/**
 * Componente presentacional Spinner.
 * @param {Object} props
 * @param {'sm' | 'md' | 'lg'} [props.size='md']
 * @param {string} [props.className]
 */
export const Spinner = ({ size = 'md', className = '' }) => {
  return (
    <span
      className={`spinner spinner--${size} ${className}`.trim()}
      role="status"
      aria-label="Cargando..."
    />
  );
};

export default Spinner;
