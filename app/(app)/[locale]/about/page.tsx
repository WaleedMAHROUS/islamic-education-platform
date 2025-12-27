'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, Globe, Award, BookOpen, Clock, Heart } from "lucide-react";
import LanguageSwitcher from '@/components/language-switcher';
import { use } from 'react';

export default function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = use(params);
    const t = useTranslations('about');

    return (
        <div className="min-h-screen bg-slate-50 font-sans p-8">
            <main className="max-w-4xl mx-auto space-y-12">
                {/* Language Switcher */}
                <div className="flex justify-start">
                    <LanguageSwitcher currentLocale={locale} />
                </div>

                {/* Header Section */}
                <div className="text-center space-y-4">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">{t('title')}</h1>
                    <p className="text-xl text-slate-600 font-medium">{t('name')}</p>
                    <div className="flex justify-center gap-2">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800 gap-1">
                            <Globe className="w-3 h-3" /> {t('nativeSpeaker')}
                        </span>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 gap-1">
                            <Clock className="w-3 h-3" /> {t('fluentEnglish')}
                        </span>
                    </div>
                </div>

                {/* Main Content Card */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
                    <div className="h-24 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-90"></div>

                    <div className="p-8 md:p-12 space-y-10 -mt-12">
                        {/* Profile Intro */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 relative">
                            <p className="text-lg leading-relaxed text-slate-700">
                                {t('intro')}
                            </p>
                        </div>

                        {/* Education Grid */}
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <GraduationCap className="w-6 h-6 text-indigo-500" /> {t('education.title')}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card className="bg-slate-50 border-0 hover:bg-slate-100 transition-colors">
                                    <CardContent className="p-6">
                                        <h3 className="font-semibold text-slate-900 mb-1">{t('education.environmental.title')}</h3>
                                        <p className="text-sm text-slate-600 mb-2">{t('education.environmental.degree')}</p>
                                        <p className="text-xs text-slate-500">{t('education.environmental.institution')}</p>
                                    </CardContent>
                                </Card>
                                <Card className="bg-slate-50 border-0 hover:bg-slate-100 transition-colors">
                                    <CardContent className="p-6">
                                        <h3 className="font-semibold text-slate-900 mb-1">{t('education.veterinary.title')}</h3>
                                        <p className="text-sm text-slate-600 mb-2">{t('education.veterinary.degree')}</p>
                                        <p className="text-xs text-slate-500">{t('education.veterinary.institution')}</p>
                                    </CardContent>
                                </Card>
                                <Card className="bg-slate-50 border-0 hover:bg-slate-100 transition-colors">
                                    <CardContent className="p-6">
                                        <h3 className="font-semibold text-slate-900 mb-1">{t('education.sharia.title')}</h3>
                                        <p className="text-sm text-slate-600 mb-2">{t('education.sharia.degree')}</p>
                                        <p className="text-xs text-slate-500">{t('education.sharia.institution')}</p>
                                    </CardContent>
                                </Card>
                                <Card className="bg-slate-50 border-0 hover:bg-slate-100 transition-colors">
                                    <CardContent className="p-6">
                                        <h3 className="font-semibold text-slate-900 mb-1">{t('education.zad.title')}</h3>
                                        <p className="text-sm text-slate-600 mb-2">{t('education.zad.degree')}</p>
                                        <p className="text-xs text-slate-500">{t('education.zad.institution')}</p>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        {/* Experience & Current Work */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <Award className="w-6 h-6 text-amber-500" /> {t('career.title')}
                                </h2>
                                <p className="text-slate-700 leading-relaxed">
                                    {t('career.description')}
                                </p>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <BookOpen className="w-6 h-6 text-emerald-500" /> {t('teaching.title')}
                                </h2>
                                <p className="text-slate-700 leading-relaxed">
                                    {t('teaching.description')}
                                </p>
                            </div>
                        </div>

                        {/* Community Work */}
                        <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100">
                            <h2 className="text-xl font-bold text-indigo-900 mb-3 flex items-center gap-2">
                                <Heart className="w-5 h-5 text-indigo-600" /> {t('community.title')}
                            </h2>
                            <p className="text-indigo-800 leading-relaxed">
                                {t('community.description')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Back Button */}
                <div className="text-center">
                    <Link href={`/${locale}`} className="text-indigo-600 hover:text-indigo-800 font-semibold hover:underline">
                        &larr; {t('backToHome')}
                    </Link>
                </div>
            </main>
        </div>
    );
}
