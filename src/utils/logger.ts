/**
 * Conditional logger that respects production settings
 */

const isDevelopment = process.env.NODE_ENV === 'development';
const logsEnabled = process.env.REACT_APP_ENABLE_LOGS === 'true';

export const logger = {
  log: (...args: any[]) => {
    if (isDevelopment || logsEnabled) {
      console.log(...args);
    }
  },
  
  warn: (...args: any[]) => {
    if (isDevelopment || logsEnabled) {
      console.warn(...args);
    }
  },
  
  error: (...args: any[]) => {
    // Always log errors
    console.error(...args);
  },
  
  info: (...args: any[]) => {
    if (isDevelopment || logsEnabled) {
      console.info(...args);
    }
  }
};


