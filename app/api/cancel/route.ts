import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendEmail } from '@/lib/email';
import { differenceInHours } from 'date-fns';

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
        // We use UTC or generic time for Teacher notification, or formatting.
        await sendEmail({
            to: process.env.GMAIL_USER!,
            subject: `Session CANCELED by Student: ${booking.serviceType}`,
            body: `The student ${booking.studentName} has canceled their session scheduled for ${startTime.toUTCString()}.`
        });

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
