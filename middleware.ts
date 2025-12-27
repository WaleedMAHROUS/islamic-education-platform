import createMiddleware from 'next-intl/middleware';
import { locales } from './i18n';

export default createMiddleware({
    // A list of all locales that are supported
    locales,

    // Used when no locale matches
    defaultLocale: 'en',

    // Don't redirect if locale is in pathname
    localePrefix: 'always',

    // Exclude paths that should not be localized
    pathnames: {
        // Keep dashboard in English only
        '/dashboard': '/dashboard',
        '/dashboard/availability': '/dashboard/availability',
        '/api/*': '/api/*'
    }
});

export const config = {
    // Match all pathnames except for
    // - API routes
    // - _next (Next.js internals)
    // - static files
    matcher: ['/', '/(ar|en)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)']
};
