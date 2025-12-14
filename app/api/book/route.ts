import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateTeamsLink } from '@/lib/teams';
import { sendEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { serviceType, studentName, studentEmail, startTime, message, studentTimezone } = body;

        // Default to UTC if not provided (fallback)
        const userTz = studentTimezone || 'UTC';
        const teacherTz = 'Asia/Tokyo';

        if (!serviceType || !studentName || !studentEmail || !startTime) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const startDateTime = new Date(startTime);

        // Transactional check: ensure slot is free
        const existing = await db.booking.findUnique({
            where: { startTime: startDateTime },
        });

        if (existing) {
            return NextResponse.json({ error: 'Slot already booked' }, { status: 409 });
        }

        // Generate link
        const meetingLink = await generateTeamsLink(serviceType, startDateTime);

        // Create booking
        const booking = await db.booking.create({
            data: {
                serviceType,
                studentName,
                studentEmail,
                message,
                startTime: startDateTime,
                studentTimezone: userTz,
                meetingLink,
            },
        });

        // Format Date for Teacher (Tokyo)
        const teacherDate = new Date(startTime).toLocaleString('en-US', {
            timeZone: teacherTz,
            dateStyle: 'full',
            timeStyle: 'short',
        }) + ` (${teacherTz})`;

        // Format Date for Student (Local)
        const studentDate = new Date(startTime).toLocaleString('en-US', {
            timeZone: userTz,
            dateStyle: 'full',
            timeStyle: 'short',
        }) + ` (${userTz})`;

        // Send Emails (Non-blocking usually, but await for prototype)
        try {
            // 1. To Teacher
            await sendEmail({
                to: 'theislamicnewnormal@gmail.com',
                subject: `New Booking: ${serviceType}`,
                body: `You have a new session for ${serviceType} with ${studentName}.\nTime: ${teacherDate}\nTeams Link: ${meetingLink}\nMessage: ${message || 'N/A'}`
            });

            // 2. To Student
            await sendEmail({
                to: studentEmail,
                subject: `Booking Confirmed: ${serviceType}`,
                body: `Dear ${studentName},\nYour session is confirmed.\nTime: ${studentDate}\nSubject: ${serviceType}\nJoin here: ${meetingLink}`
            });
        } catch (emailError) {
            console.error('Failed to send emails', emailError);
            // Continue, don't fail booking? Or fail? Usually soft fail for mocked services.
        }

        return NextResponse.json(booking);
    } catch (error: any) {
        if (error.code === 'P2002') { // Unique constraint violation
            return NextResponse.json({ error: 'Slot already booked' }, { status: 409 });
        }
        console.error('Booking API Error:', error);
        return NextResponse.json({ error: 'Booking failed: ' + error.message }, { status: 500 });
    }
}
