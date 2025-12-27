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
    return handleI18nRouting(request);
}

export const config = {
    // Only run middleware on pages starting with a locale
    matcher: [
        '/(ar|en)/:path*',
        '/(ar|en)'
    ]
};
