import React from "react";
import styles from "./Input.module.css";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  isRequired?: boolean;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, isRequired, error, helperText, className, id, ...props }, ref) => {
    const inputId = id || React.useId();
    const helperId = `${inputId}-help`;
    const errorId = `${inputId}-err`;
    const describedBy = [error ? errorId : undefined, helperText ? helperId : undefined]
      .filter(Boolean)
      .join(" ");

    return (
      <div className={styles.wrapper}>
        {label && (
          <label htmlFor={inputId} className={styles.label}>
            {label}
            {isRequired && <span aria-hidden="true" className={styles.required}>*</span>}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          aria-invalid={!!error}
          aria-describedby={describedBy || undefined}
          className={[styles.input, error ? styles.error : undefined, className]
            .filter(Boolean)
            .join(" ")}
          {...props}
        />
        {helperText && !error && (
          <div id={helperId} className={styles.helper}>{helperText}</div>
        )}
        {error && (
          <div id={errorId} role="alert" className={styles.errorText}>{error}</div>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;

