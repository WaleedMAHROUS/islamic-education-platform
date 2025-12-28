"use client"

import { useState, useEffect, Suspense, use } from 'react';
import { useTranslations } from 'next-intl';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { setHours, setMinutes, isBefore, startOfDay, endOfDay } from 'date-fns';
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2, Loader2, Calendar as CalendarIcon, Clock, Video, AlertCircle } from "lucide-react";
import LanguageSwitcher from '@/components/language-switcher';

function BookingContent({ locale }: { locale: string }) {
    const t = useTranslations('booking');
    const router = useRouter();
    const searchParams = useSearchParams();
    const serviceType = searchParams.get('service') || 'General';

    const [date, setDate] = useState<Date | undefined>(new Date());
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [meetingLink, setMeetingLink] = useState('');
    const [availableSlots, setAvailableSlots] = useState<string[]>([]);
    const [eligibilityConfirmed, setEligibilityConfirmed] = useState(false);

    // Form Schema
    const formSchema = z.object({
        name: z.string().min(2, "Name must be at least 2 characters."),
        email: z.string().email("Invalid email address."),
        message: z.string().optional(),
    });

    // Fetch availability
    useEffect(() => {
        if (!date) return;

        const fetchAvailability = async () => {
            setIsLoadingAvailability(true);
            const dayStart = startOfDay(date).toISOString();
            const dayEnd = endOfDay(date).toISOString();

            try {
                const res = await fetch(`/api/availability?start=${dayStart}&end=${dayEnd}`);
                if (res.ok) {
                    const data = await res.json();
                    const slots = data.map((d: string) => {
                        const dateObj = new Date(d);
                        return dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
                    }).sort();
                    setAvailableSlots(slots);
                }
            } catch (error) {
                console.error(error);
                toast.error("Failed to load availability.");
            } finally {
                setIsLoadingAvailability(false);
            }
        };

        fetchAvailability();
    }, [date]);

    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            message: "",
        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        if (!date || !selectedTime) {
            toast.error(t('selectTimePrompt'));
            return;
        }

        if (!eligibilityConfirmed) {
            toast.error(t('eligibility.required'));
            return;
        }

        setIsSubmitting(true);

        const [hours, minutes] = selectedTime.split(':').map(Number);
        const bookingDate = setHours(setMinutes(date, minutes), hours);

        try {
            const res = await fetch('/api/book', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    serviceType,
                    studentName: values.name,
                    studentEmail: values.email,
                    message: values.message,
                    startTime: bookingDate.toISOString(),
                    studentTimezone: userTimezone,
                    locale, // Pass locale for email translation
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || t('bookingError'));
            }

            setMeetingLink(data.meetingLink);
            setIsSuccess(true);
            toast.success(t('bookingSuccess'));
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
                <Card className="max-w-md w-full text-center p-8 shadow-xl border-green-100">
                    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                        <CheckCircle2 className="w-10 h-10 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">{t('bookingSuccess')}</h2>
                    <p className="text-slate-600 mb-6 font-medium">
                        {t('bookingSuccessMessage')}
                    </p>
                    <div className="bg-slate-100 p-4 rounded-lg mb-6 text-left border border-slate-200">
                        <p className="text-xs text-slate-500 uppercase font-bold mb-2">{t('meetingInfo')}</p>
                        <a href={meetingLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all text-sm font-semibold flex items-center gap-2">
                            Google Meet Session
                        </a>
                    </div>
                    <Button onClick={() => router.push(`/${locale}`)} className="w-full">
                        {t('returnHome')}
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="flex justify-between items-center">
                    <Button variant="ghost" onClick={() => router.push(`/${locale}`)} className="hover:bg-slate-200 text-slate-600">
                        <ArrowLeft className="mr-2 h-4 w-4" /> {t('returnHome')}
                    </Button>
                    <LanguageSwitcher currentLocale={locale} />
                </div>

                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold text-slate-900">{t('title')}</h1>
                    <p className="text-slate-600 font-medium">{t('selectService')}: <span className="font-bold text-slate-900">{serviceType}</span></p>
                    <div className="inline-block bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold border border-blue-100 mt-2">
                        🌍 {t('timezoneBadge')}: {userTimezone}
                    </div>
                </div>

                {/* Eligibility Notice Banner */}
                <div className="max-w-4xl mx-auto">
                    <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 text-start">
                        <div className="flex gap-3">
                            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-amber-900 text-sm font-medium">
                                    {locale === 'ar'
                                        ? 'نقبل حاليًا الطلاب الذكور من سن 12 عامًا فما فوق فقط. الرجاء التأكيد أدناه.'
                                        : 'We currently accept male students aged 12 and above only. Please confirm below.'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    {/* Calendar & Slots */}
                    <Card className="border-0 shadow-lg overflow-hidden bg-white">
                        <CardHeader className="bg-white border-b border-slate-100 pb-4">
                            <CardTitle className="flex items-center gap-2 text-slate-800">
                                <CalendarIcon className="w-5 h-5 text-indigo-600" /> {t('selectDateTime')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 md:flex flex-col md:flex-row">
                            <div className="p-6 flex flex-col items-center border-b md:border-b-0 md:border-r border-slate-100">
                                <div className="flex items-center gap-3 text-slate-600 mb-6 bg-slate-50 p-3 rounded-lg border border-slate-100 w-full justify-center">
                                    <Video className="w-5 h-5 text-blue-500" />
                                    <span>{t('meetingInfo')}</span>
                                </div>
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={(d) => { setDate(d); setSelectedTime(null); }}
                                    disabled={(date) => isBefore(date, startOfDay(new Date()))}
                                    className="rounded-md border-0"
                                />
                            </div>
                            <div className="p-6 flex-1 bg-slate-50/50 max-h-[400px] overflow-y-auto">
                                <h3 className="text-sm font-semibold mb-4 text-slate-500 flex items-center gap-2">
                                    <Clock className="w-4 h-4" /> {t('selectDateTime')}
                                </h3>
                                {isLoadingAvailability ? (
                                    <div className="flex items-center justify-center p-4"><Loader2 className="animate-spin h-6 w-6 text-slate-400" /></div>
                                ) : availableSlots.length === 0 ? (
                                    <p className="text-sm text-slate-400 italic text-center py-4">{t('noSlotsAvailable')}</p>
                                ) : (
                                    <div className="grid grid-cols-2 gap-3">
                                        {availableSlots.map(time => (
                                            <Button
                                                key={time}
                                                variant={selectedTime === time ? "default" : "outline"}
                                                className={`w-full justify-center transition-all ${selectedTime === time ? 'bg-slate-900 shadow-md transform scale-105' : 'hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200'}`}
                                                onClick={() => setSelectedTime(time)}
                                            >
                                                {time}
                                            </Button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Form */}
                    <Card className="border-0 shadow-lg bg-white">
                        <CardHeader className="pb-4 border-b border-slate-100">
                            <CardTitle className="text-slate-800">{t('yourDetails')}</CardTitle>
                            <CardDescription>{locale === 'ar' ? 'يرجى ملء معلوماتك لتأكيد الحجز.' : 'Please fill in your information to confirm the booking.'}</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t('name')}</FormLabel>
                                                <FormControl>
                                                    <Input placeholder={t('namePlaceholder')} {...field} className="bg-slate-50" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t('email')}</FormLabel>
                                                <FormControl>
                                                    <Input placeholder={t('emailPlaceholder')} {...field} className="bg-slate-50" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="message"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t('message')}</FormLabel>
                                                <FormControl>
                                                    <Textarea placeholder={t('messagePlaceholder')} {...field} className="bg-slate-50 min-h-[100px]" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Eligibility Checkbox */}
                                    <div className="border-2 border-amber-100 bg-amber-50/50 rounded-lg p-4">
                                        <div className="flex items-start space-x-3 space-x-reverse rtl:flex-row-reverse">
                                            <Checkbox
                                                id="eligibility"
                                                checked={eligibilityConfirmed}
                                                onCheckedChange={(checked) => setEligibilityConfirmed(checked === true)}
                                                className="mt-1"
                                            />
                                            <label
                                                htmlFor="eligibility"
                                                className="text-sm font-medium leading-relaxed text-amber-900 cursor-pointer"
                                            >
                                                {t('eligibility.checkbox')}
                                            </label>
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <Button
                                            type="submit"
                                            className="w-full text-lg h-12 shadow-md hover:shadow-xl transition-all"
                                            disabled={isSubmitting || !date || !selectedTime || !eligibilityConfirmed}
                                        >
                                            {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('bookingInProgress')}</> : t('confirmBooking')}
                                        </Button>
                                        {(!date || !selectedTime) && (
                                            <p className="text-xs text-center text-amber-600 mt-3 font-medium flex items-center justify-center gap-1">
                                                {t('selectTimePrompt')}
                                            </p>
                                        )}
                                        {!eligibilityConfirmed && date && selectedTime && (
                                            <p className="text-xs text-center text-red-600 mt-3 font-medium">
                                                {t('eligibility.required')}
                                            </p>
                                        )}
                                    </div>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

export default async function BookingPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-indigo-200" /></div>}>
            <BookingContent locale={locale} />
        </Suspense>
    )
}
