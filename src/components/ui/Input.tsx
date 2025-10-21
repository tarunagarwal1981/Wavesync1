import React, { InputHTMLAttributes, ReactNode, useState } from 'react';
import styles from './Input.module.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps> (({
  label,
  error,
  helperText,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  className = '',
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(!!props.value || !!props.defaultValue);

  const handleFocus = () => setIsFocused(true);
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    setHasValue(!!e.target.value);
    props.onBlur?.(e);
  };

  const containerClasses = [
    styles.container,
    fullWidth ? styles.fullWidth : '',
    className
  ].filter(Boolean).join(' ');

  const inputWrapperClasses = [
    styles.inputWrapper,
    isFocused ? styles.focused : '',
    error ? styles.error : '',
    icon ? styles.withIcon : '',
    icon && iconPosition === 'right' ? styles.iconRight : ''
  ].filter(Boolean).join(' ');

  const labelClasses = [
    styles.label,
    (isFocused || hasValue) ? styles.labelFloating : ''
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      <div className={inputWrapperClasses}>
        {icon && iconPosition === 'left' && (
          <span className={styles.icon}>{icon}</span>
        )}
        
        <div className={styles.inputContainer}>
          {label && (
            <label className={labelClasses}>
              {label}
            </label>
          )}
          <input
            className={styles.input}
            onFocus={handleFocus}
            onBlur={handleBlur}
            ref={ref}
            {...props}
          />
        </div>

        {icon && iconPosition === 'right' && (
          <span className={styles.icon}>{icon}</span>
        )}
      </div>

      {error && (
        <span className={styles.errorText}>{error}</span>
      )}

      {helperText && !error && (
        <span className={styles.helperText}>{helperText}</span>
      )}
    </div>
  );
});

export default Input;

