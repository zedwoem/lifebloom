import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  debug: false,
  attachStacktrace: true,
  integrations: [
    Sentry.breadcrumbsIntegration({ console: true }),
  ],
});

// Required by Sentry SDK to instrument client-side navigations in Next.js 15
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
