'use client';

import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LanguageSwitcher({ currentLocale }: { currentLocale: string }) {
    const router = useRouter();
    const pathname = usePathname();
    const t = useTranslations('languageSelector');

    const switchLanguage = () => {
        const newLocale = currentLocale === 'en' ? 'ar' : 'en';
        // Replace locale in pathname
        const newPath = pathname.replace(`/${currentLocale}`, `/${newLocale}`);
        router.push(newPath);
    };

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={switchLanguage}
            className="gap-2"
        >
            <Languages className="w-4 h-4" />
            {currentLocale === 'en' ? 'العربية' : 'English'}
        </Button>
    );
}
