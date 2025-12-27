'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Globe, BookOpen } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function LanguageSelector() {
  const router = useRouter();

  const selectLanguage = (locale: 'en' | 'ar') => {
    // Set cookie preference
    document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000`;
    // Navigate to locale
    router.push(`/${locale}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23059669' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      <main className="max-w-4xl w-full z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 rounded-full mb-6">
            <BookOpen className="w-10 h-10 text-emerald-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">
            Islamic Education Platform (v2)
          </h1>
          <p className="text-xl text-slate-600 mb-2">منصة التعليم الإسلامي</p>
          <p className="text-lg text-slate-500">Choose Your Language / اختر لغتك</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* English */}
          <Card
            className="cursor-pointer hover:shadow-xl transition-all duration-300 border-2 hover:border-emerald-500 group"
            onClick={() => selectLanguage('en')}
          >
            <CardContent className="p-8 text-center">
              <div className="text-6xl mb-4">🇬🇧</div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors">
                English
              </h2>
              <p className="text-slate-600 mb-6">
                Continue in English
              </p>
              <div className="inline-flex items-center gap-2 text-emerald-600 font-semibold">
                <Globe className="w-5 h-5" />
                <span>Get Started</span>
              </div>
            </CardContent>
          </Card>

          {/* Arabic */}
          <Card
            className="cursor-pointer hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-500 group"
            onClick={() => selectLanguage('ar')}
          >
            <CardContent className="p-8 text-center">
              <div className="text-6xl mb-4">🇸🇦</div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                العربية
              </h2>
              <p className="text-slate-600 mb-6">
                المتابعة بالعربية
              </p>
              <div className="inline-flex items-center gap-2 text-blue-600 font-semibold">
                <Globe className="w-5 h-5" />
                <span>ابدأ الآن</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <p className="text-center text-sm text-slate-400 mt-8">
          You can change the language anytime / يمكنك تغيير اللغة في أي وقت
        </p>
      </main>
    </div>
  );
}
