'use client';

import { useTranslations } from 'next-intl';
import { useState, use } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";
import LanguageSwitcher from '@/components/language-switcher';

export default function CancelBookingPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = use(params);
    const t = useTranslations('cancellation');
    const router = useRouter();
    const urlParams = useParams(); // Renamed to avoid conflict with prop 'params'
    const id = urlParams.id as string;

    const [isCancelling, setIsCancelling] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleCancel = async () => {
        setIsCancelling(true);
        setError('');

        try {
            const res = await fetch('/api/cancel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bookingId: id })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to cancel booking');
            }

            setIsSuccess(true);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsCancelling(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center border border-green-100">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-8 h-8 text-green-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">{t('success.title')}</h1>
                    <p className="text-slate-600 mb-6">{t('success.message')}</p>
                    <Button onClick={() => router.push(`/${locale}`)} variant="outline" className="w-full">
                        {t('success.returnHome')}
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center border border-red-50">
                {/* Language Switcher */}
                <div className="flex justify-start mb-6">
                    <LanguageSwitcher currentLocale={locale} />
                </div>

                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>

                <h1 className="text-2xl font-bold text-slate-900 mb-4">{t('title')}</h1>
                <p className="text-slate-600 mb-2">
                    {t('subtitle')}
                </p>
                <p className="text-xs text-slate-400 mb-8">{t('timeLimit')}</p>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 border border-red-100">
                        {error}
                    </div>
                )}

                <div className="space-y-3">
                    <Button
                        onClick={handleCancel}
                        disabled={isCancelling}
                        className="w-full bg-red-600 hover:bg-red-700 text-white"
                    >
                        {isCancelling ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('cancelling')}</> : t('confirmButton')}
                    </Button>
                    <Button
                        onClick={() => router.push(`/${locale}`)}
                        variant="ghost"
                        className="w-full"
                    >
                        {t('goBack')}
                    </Button>
                </div>
            </div>
        </div>
    );
}
