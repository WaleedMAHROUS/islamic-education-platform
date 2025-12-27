import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendEmail } from '@/lib/email';
import { differenceInHours } from 'date-fns';
import { getCancellationNotificationEmail } from '@/lib/email-templates';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { bookingId } = body;

        if (!bookingId) {
            return NextResponse.json({ error: 'Missing booking ID' }, { status: 400 });
        }

        const booking = await db.booking.findUnique({
            where: { id: bookingId }
        });

        if (!booking) {
            return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
        }

        // Check if cancellation is allowed (at least 1 hour before start time)
        const now = new Date();
        const startTime = new Date(booking.startTime);
        const hoursDiff = differenceInHours(startTime, now);

        if (hoursDiff < 1) {
            return NextResponse.json({ error: 'Cancellations are only allowed up to 1 hour before the session.' }, { status: 403 });
        }

        // Send Email to Teacher
        await sendEmail({
            to: process.env.GMAIL_USER!,
            subject: `Session CANCELED by Student: ${booking.serviceType}`,
            body: `The student ${booking.studentName} has canceled their session scheduled for ${startTime.toUTCString()}.`
        });

        // Send Email to Student (Confirmation of Cancellation)
        // Check if we have language preference (we'll implement this storage next)
        // For now default to English or check cookie if possible (not possible in API easily without passing it)
        // We will just send bilingual or default English for now until schema update.

        // Actually, we can't easily know the locale here without database storage.
        // Once we add 'preferredLanguage' to DB, we can use it here.

        // Delete Booking
        await db.booking.delete({
            where: { id: bookingId }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Cancellation Error:', error);
        return NextResponse.json({ error: 'Failed to process cancellation' }, { status: 500 });
    }
}
