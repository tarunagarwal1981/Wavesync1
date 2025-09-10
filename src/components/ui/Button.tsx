import React from "react";
import styles from "./Button.module.css";

type ButtonVariant = "primary" | "secondary" | "success" | "warning" | "danger" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  leftIcon,
  rightIcon,
  className,
  children,
  ...props
}) => {
  const classes = [styles.btn, styles[variant], size !== "md" ? styles[size] : undefined, className]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={classes} {...props}>
      {leftIcon}
      <span>{children}</span>
      {rightIcon}
    </button>
  );
};

export default Button;

