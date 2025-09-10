import React from "react";
import styles from "./Card.module.css";

type Elevation = 0 | 1 | 2 | 3;

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  elevation?: Elevation;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  elevation = 1,
  header,
  footer,
  className,
  children,
  ...props
}) => {
  const classes = [styles.card, styles[`elevation-${elevation}`], className]
    .filter(Boolean)
    .join(" ");

  return (
    <section className={classes} {...props}>
      {header && <header className={styles.header}>{header}</header>}
      <div className={styles.body}>{children}</div>
      {footer && <footer className={styles.footer}>{footer}</footer>}
    </section>
  );
};

export default Card;

