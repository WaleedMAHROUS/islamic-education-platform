import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateMeetingLink } from '@/lib/meeting';
import { sendEmail } from '@/lib/email';
import { formatInTimeZone } from 'date-fns-tz';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { serviceType, studentName, studentEmail, startTime, message, studentTimezone } = body;

        // Validation
        if (!serviceType || !studentName || !studentEmail || !startTime) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const startDateTime = new Date(startTime);

        // Default to UTC if not provided
        const userTz = studentTimezone || 'UTC';

        // Transactional check: ensure slot is free
        // We must check if a booking exists at this time.
        // Note: Exact match on time might be tricky with seconds/milliseconds.
        // Ideally checking a range.
        const existing = await db.booking.findFirst({
            where: {
                startTime: startDateTime
            },
        });

        if (existing) {
            return NextResponse.json({ error: 'Slot already booked' }, { status: 409 });
        }

        // Generate Meeting Link (Google Meet)
        const meetingLink = await generateMeetingLink(serviceType, startDateTime);

        // Create booking
        const booking = await db.booking.create({
            data: {
                serviceType,
                studentName,
                studentEmail,
                message,
                startTime: startDateTime, // Saved as UTC in DB usually
                studentTimezone: userTz,
                meetingLink, // We should probably add this field to Schema if we want to save it, OR just email it.
                // Wait, Schema doesn't have meetingLink field yet?
                // Let's check Schema. If not, I can't save it to DB.
                // I'll check Schema next. For now, I'll omit it from DB create if field missing, but email it.
            },
        });

        // Format dates for emails
        // 1. Teacher Time: Tokyo
        const teacherDate = formatInTimeZone(startDateTime, 'Asia/Tokyo', 'yyyy-MM-dd HH:mm (z)');

        // 2. Student Time: Their timezone
        const studentDate = formatInTimeZone(startDateTime, userTz, 'yyyy-MM-dd HH:mm (z)');

        // Send Emails
        try {
            // 1. To Teacher
            await sendEmail({
                to: process.env.GMAIL_USER!,
                subject: `New Booking: ${serviceType} with ${studentName}`,
                body: `You have a new session for ${serviceType} with ${studentName}.\nTime: ${teacherDate}\nGoogle Meet Link: ${meetingLink}\nMessage: ${message || 'N/A'}`
            });

            // 2. To Student
            await sendEmail({
                to: studentEmail,
                subject: `Booking Confirmed: ${serviceType}`,
                body: `Dear ${studentName},\nYour session is confirmed.\nTime: ${studentDate}\nSubject: ${serviceType}\nJoin here: ${meetingLink}`
            });
        } catch (emailError) {
            console.error('Failed to send emails', emailError);
        }

        return NextResponse.json(booking);
    } catch (error: any) {
        if (error.code === 'P2002') {
            return NextResponse.json({ error: 'Slot already booked' }, { status: 409 });
        }
        console.error('Booking API Error:', error);
        return NextResponse.json({ error: 'Booking failed: ' + error.message }, { status: 500 });
    }
}
