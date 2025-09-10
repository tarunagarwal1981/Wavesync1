import React from "react";
import styles from "./Spinner.module.css";

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ label = "Loading", className, ...props }) => {
  const id = React.useId();
  const classes = [styles.spinner, className].filter(Boolean).join(" ");
  return (
    <div role="status" aria-labelledby={id} className={classes} {...props}>
      <span id={id} className="visually-hidden">{label}</span>
    </div>
  );
};

export default Spinner;

