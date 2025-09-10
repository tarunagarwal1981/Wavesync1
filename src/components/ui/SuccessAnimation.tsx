import React from "react";
import styles from "./SuccessAnimation.module.css";

export interface SuccessAnimationProps {
  isVisible: boolean;
  onComplete?: () => void;
  children?: React.ReactNode;
}

export const SuccessAnimation: React.FC<SuccessAnimationProps> = ({ 
  isVisible, 
  onComplete, 
  children 
}) => {
  React.useEffect(() => {
    if (isVisible && onComplete) {
      const timer = setTimeout(onComplete, 2000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <div className={styles.container}>
      <div className={styles.checkmark}>
        <div className={styles.checkmarkCircle}>
          <div className={styles.checkmarkCheck}></div>
        </div>
      </div>
      {children && <div className={styles.message}>{children}</div>}
    </div>
  );
};

export default SuccessAnimation;
