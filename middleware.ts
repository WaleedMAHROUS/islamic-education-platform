import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n/config';

export default createMiddleware({
    // A list of all locales that are supported
    locales,

    // Used when no locale matches
    defaultLocale,

    // Always show locale in URL
    localePrefix: 'always'
});

export const config = {
    // Match all pathnames except for
    // - API routes
    // - _next (Next.js internals)
    // - Dashboard pages (keep English-only)
    // - static files
    // - The root path '/' (so language selector works)
    matcher: [
        '/',
        '/(ar|en)/:path*',
        '/((?!api|_next|_vercel|dashboard|.*\\..*|^/$).*)'
    ]
};
