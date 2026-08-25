// Lightweight logger that only emits in development builds.
// Keeps sensitive data (tokens, emails, referral codes, API responses)
// out of the browser console in production. `error` is always emitted
// so real failures remain diagnosable in prod.

const isDev = import.meta.env.DEV;

export const logger = {
    log: (...args: unknown[]) => {
        if (isDev) console.log(...args);
    },
    warn: (...args: unknown[]) => {
        if (isDev) console.warn(...args);
    },
    error: (...args: unknown[]) => {
        console.error(...args);
    },
};
