import React, { forwardRef } from 'react';
import './Input.css';

/**
 * Componente presentacional Input con soporte de React Hook Form (forwardRef).
 * @param {Object} props
 * @param {string} [props.label]
 * @param {string} [props.error] - Mensaje de error visual debajo del input.
 * @param {string} [props.helperText]
 * @param {boolean} [props.required=false]
 * @param {boolean} [props.multiline=false] - Renderiza textarea si es true.
 * @param {string} [props.className]
 * @param {string} [props.id]
 */
export const Input = forwardRef(
  (
    {
      label,
      error,
      helperText,
      required = false,
      multiline = false,
      className = '',
      id,
      ...rest
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    const Component = multiline ? 'textarea' : 'input';

    return (
      <div className={`input-field ${className}`.trim()}>
        {label && (
          <label htmlFor={inputId} className="input-field__label">
            {label}
            {required && <span className="input-field__required">*</span>}
          </label>
        )}
        <Component
          id={inputId}
          ref={ref}
          className={`input-field__control ${error ? 'input-field__control--error' : ''}`.trim()}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...rest}
        />
        {error && (
          <span id={`${inputId}-error`} className="input-field__error" role="alert">
            {error}
          </span>
        )}
        {!error && helperText && (
          <span className="input-field__helper">{helperText}</span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
