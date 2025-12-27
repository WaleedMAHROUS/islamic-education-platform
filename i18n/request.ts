import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

// Can be imported from a shared config
export const locales = ['en', 'ar'] as const;
export type Locale = (typeof locales)[number];

export default getRequestConfig(async ({ locale }) => {
    // Validate that the incoming `locale` parameter is valid
    if (!locales.includes(locale as Locale)) notFound();

    const messages = await import(`../messages/${locale}.json`);

    return {
        locale: locale as Locale,
        messages: messages.default,
        timeZone: 'Asia/Tokyo',
        now: new Date()
    };
});

export function getLocaleDirection(locale: string): 'ltr' | 'rtl' {
    return locale === 'ar' ? 'rtl' : 'ltr';
}

export function getLocaleName(locale: string): string {
    return locale === 'ar' ? 'العربية' : 'English';
}
