import React from 'react';
import styles from './Loading.module.css';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullScreen?: boolean;
}

const Loading: React.FC<LoadingProps> = ({
  size = 'md',
  text,
  fullScreen = false
}) => {
  const content = (
    <div className={styles.loadingContent}>
      <div className={`${styles.spinner} ${styles[size]}`}>
        <div className={styles.circle}></div>
        <div className={styles.circle}></div>
        <div className={styles.circle}></div>
      </div>
      {text && <p className={styles.text}>{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className={styles.fullScreen}>
        {content}
      </div>
    );
  }

  return content;
};

export default Loading;

