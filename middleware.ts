import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n/config';

const handleI18nRouting = createMiddleware({
    // A list of all locales that are supported
    locales,

    // Used when no locale matches
    defaultLocale,

    // Always show locale in URL
    localePrefix: 'always'
});

export default function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Explicitly bypass middleware for the root path '/' to allow the Language Selector page to render
    if (pathname === '/') {
        return NextResponse.next();
    }

    return handleI18nRouting(request);
}

export const config = {
    // Match all pathnames except for
    // - API routes
    // - _next (Next.js internals)
    // - Dashboard pages (keep English-only)
    // - static files
    // - The root path '/' (so language selector works)
    matcher: [
        '/(ar|en)/:path*',
        '/((?!api|_next|_vercel|dashboard|.*\\..*).*)'
    ]
};
