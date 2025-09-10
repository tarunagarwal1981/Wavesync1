import React from "react";
import styles from "./EntranceAnimation.module.css";

export interface EntranceAnimationProps {
  children: React.ReactNode;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "fade";
  duration?: number;
  className?: string;
}

export const EntranceAnimation: React.FC<EntranceAnimationProps> = ({ 
  children, 
  delay = 0, 
  direction = "up", 
  duration = 0.6,
  className 
}) => {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const animationStyle = {
    "--animation-duration": `${duration}s`,
  } as React.CSSProperties;

  return (
    <div
      className={[
        styles.container,
        styles[direction],
        isVisible ? styles.visible : "",
        className
      ].filter(Boolean).join(" ")}
      style={animationStyle}
    >
      {children}
    </div>
  );
};

export default EntranceAnimation;
