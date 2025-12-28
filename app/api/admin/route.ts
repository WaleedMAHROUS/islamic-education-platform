import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendEmail } from '@/lib/email';

export async function DELETE(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const bookingId = searchParams.get('id');
    const token = searchParams.get('token'); // Simple "password" query param

    // Simple security
    if (token !== 'admin123') { // Hardcoded for prototype
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!bookingId) {
        return NextResponse.json({ error: 'Missing booking ID' }, { status: 400 });
    }

    try {
        const booking = await db.booking.findUnique({
            where: { id: bookingId }
        });

        if (!booking) {
            return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
        }

        // Send Cancellation Email to Student BEFORE deleting
        const userTz = booking.studentTimezone || 'UTC';
        await sendEmail({
            to: booking.studentEmail,
            subject: `Session Cancelled: ${booking.serviceType}`,
            body: `Dear ${booking.studentName},\n\nYour session scheduled for ${new Date(booking.startTime).toLocaleString('en-US', { timeZone: userTz })} (${userTz}) has been cancelled by the teacher.\n\nPlease visit the website to reschedule:\nhttps://islamic-education-platform.vercel.app/${booking.preferredLanguage || 'en'}`
        });

        // Delete from DB
        await db.booking.delete({
            where: { id: bookingId }
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Cancellation Error:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

// Optional: GET to list all bookings for the dashboard
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');

    if (token !== 'admin123') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bookings = await db.booking.findMany({
        orderBy: { startTime: 'desc' }
    });

    return NextResponse.json(bookings);
}
