'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function CancelBookingPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

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
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Booking Cancelled</h1>
                    <p className="text-slate-600 mb-6">Your session has been successfully cancelled. The teacher has been notified.</p>
                    <Button onClick={() => router.push('/')} variant="outline" className="w-full">
                        Return to Home
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center border border-red-50">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>

                <h1 className="text-2xl font-bold text-slate-900 mb-4">Cancel Session?</h1>
                <p className="text-slate-600 mb-8">
                    Are you sure you want to cancel this booking? This action cannot be undone.
                    <br /><span className="text-xs text-slate-400 mt-2 block">(Cancellations allowed up to 1 hour before start time)</span>
                </p>

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
                        {isCancelling ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Cancelling...</> : 'Yes, Cancel Session'}
                    </Button>
                    <Button
                        onClick={() => router.push('/')}
                        variant="ghost"
                        className="w-full"
                    >
                        Go Back
                    </Button>
                </div>
            </div>
        </div>
    );
}
