import * as Sentry from '@sentry/nextjs';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      tracesSampleRate: 1.0,
      debug: false,
      attachStacktrace: true,
    });
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      tracesSampleRate: 1.0,
      debug: false,
    });
  }
}

// Capture errors from nested React Server Components
export const onRequestError = Sentry.captureRequestError;
