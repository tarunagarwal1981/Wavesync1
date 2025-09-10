import React from "react";
import styles from "./Tooltip.module.css";

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
  const [show, setShow] = React.useState(false);
  const id = React.useId();

  const child = React.cloneElement(children, {
    onFocus: (e: React.FocusEvent) => { setShow(true); children.props.onFocus?.(e); },
    onBlur: (e: React.FocusEvent) => { setShow(false); children.props.onBlur?.(e); },
    onMouseEnter: (e: React.MouseEvent) => { setShow(true); children.props.onMouseEnter?.(e); },
    onMouseLeave: (e: React.MouseEvent) => { setShow(false); children.props.onMouseLeave?.(e); },
    'aria-describedby': id,
  });

  return (
    <span className={styles.tooltipWrapper}>
      {child}
      <span role="tooltip" id={id} className={styles.tooltipBubble} data-show={show}>
        {content}
        <span className={styles.arrow} aria-hidden="true" />
      </span>
    </span>
  );
};

export default Tooltip;

