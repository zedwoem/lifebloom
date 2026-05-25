import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['en', 'id', 'es', 'fr', 'de'],
  defaultLocale: 'en',
  localePrefix: 'as-needed',
  localeDetection: false
});

export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);
