/**
 * Logger utility to handle console logs based on environment.
 * Logs are displayed if NODE_ENV is 'development' OR if NEXT_PUBLIC_DEBUG is 'true'.
 */

const isDebug = process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_DEBUG === 'true';

const logger = {
    log: (...args: any[]) => {
        if (isDebug) {
            console.log(...args);
        }
    },
    warn: (...args: any[]) => {
        if (isDebug) {
            console.warn(...args);
        }
    },
    error: (...args: any[]) => {
        if (isDebug) {
            console.error(...args);
        }
    },
    info: (...args: any[]) => {
        if (isDebug) {
            console.info(...args);
        }
    },
};

export default logger;
