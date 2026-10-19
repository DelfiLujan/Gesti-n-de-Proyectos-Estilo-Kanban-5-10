import React from 'react';
import Spinner from './Spinner';
import './Button.css';

/**
 * Componente presentacional Button.
 * @param {Object} props
 * @param {'primary' | 'secondary' | 'outline' | 'danger' | 'ghost'} [props.variant='primary']
 * @param {'sm' | 'md' | 'lg'} [props.size='md']
 * @param {boolean} [props.isLoading=false]
 * @param {boolean} [props.disabled=false]
 * @param {React.ReactNode} [props.leftIcon]
 * @param {React.ReactNode} [props.rightIcon]
 * @param {'button' | 'submit' | 'reset'} [props.type='button']
 * @param {string} [props.className]
 * @param {React.ReactNode} props.children
 */
export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  type = 'button',
  className = '',
  onClick,
  ...rest
}) => {
  const isDisabled = disabled || isLoading;

  return (
    <button
      type={type}
      className={`btn btn--${variant} btn--${size} ${className}`.trim()}
      disabled={isDisabled}
      onClick={onClick}
      {...rest}
    >
      {isLoading ? (
        <Spinner size={size === 'lg' ? 'md' : 'sm'} />
      ) : (
        leftIcon && <span className="btn__icon">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="btn__icon">{rightIcon}</span>}
    </button>
  );
};

export default Button;
