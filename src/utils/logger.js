/**
 * Logger utility for development debugging
 * Only logs in development mode
 */

// eslint-disable-next-line no-unused-vars
const logger = {
  log: (...args) => {
    if (import.meta.env.DEV) {
      console.log(...args);
    }
  },

  warn: (...args) => {
    if (import.meta.env.DEV) {
      console.warn(...args);
    }
  },

  error: (...args) => {
    // Always log errors, even in production
    console.error(...args);
  },

  info: (...args) => {
    if (import.meta.env.DEV) {
      console.info(...args);
    }
  },

  debug: (...args) => {
    if (import.meta.env.DEV) {
      console.debug(...args);
    }
  }
};

export default logger;
