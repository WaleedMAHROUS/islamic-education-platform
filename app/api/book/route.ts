import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateMeetingLink } from '@/lib/meeting';
import { sendEmail } from '@/lib/email';
import { formatInTimeZone } from 'date-fns-tz';
import { generateGoogleCalendarLink, generateOutlookCalendarLink } from '@/lib/calendar';
import { getBookingConfirmationEmail } from '@/lib/email-templates';

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

        // Generate Calendar Links
        // Student Link (using their booked time)
        const googleCalLink = generateGoogleCalendarLink(
            `Session: ${serviceType}`,
            startDateTime,
            30,
            `Instructor: Waleed Mahrous\nMeeting Link: ${meetingLink}`,
            meetingLink
        );
        const outlookCalLink = generateOutlookCalendarLink(
            `Session: ${serviceType}`,
            startDateTime,
            30,
            `Instructor: Waleed Mahrous\nMeeting Link: ${meetingLink}`,
            meetingLink
        );

        // Create booking
        const booking = await db.booking.create({
            data: {
                serviceType,
                studentName,
                studentEmail,
                message,
                startTime: startDateTime,
                studentTimezone: userTz,
                preferredLanguage: body.locale || 'en',
                meetingLink,
            },
        });

        // Format dates for emails
        const teacherDate = formatInTimeZone(startDateTime, 'Asia/Tokyo', 'yyyy-MM-dd HH:mm (z)');
        const studentDate = formatInTimeZone(startDateTime, userTz, 'yyyy-MM-dd HH:mm (z)');

        // Email Styles
        const buttonStyle = 'display: inline-block; padding: 10px 20px; color: white; background-color: #4F46E5; text-decoration: none; border-radius: 5px; margin-right: 10px; font-weight: bold;';
        const linkStyle = 'color: #4F46E5; text-decoration: underline;';


        // Send Emails
        try {
            // 1. To Teacher
            await sendEmail({
                to: process.env.GMAIL_USER!,
                subject: `New Booking: ${serviceType} with ${studentName}`,
                body: `You have a new session for ${serviceType} with ${studentName}.\nTime: ${teacherDate}\nGoogle Meet Link: ${meetingLink}\nMessage: ${message || 'N/A'}`,
                html: `
                    <div style="font-family: sans-serif; padding: 20px;">
                        <h2>New Booking Request</h2>
                        <p><strong>Student:</strong> ${studentName} (${studentEmail})</p>
                        <p><strong>Service:</strong> ${serviceType}</p>
                        <p><strong>Time:</strong> ${teacherDate}</p>
                        <p><strong>Message:</strong> ${message || 'N/A'}</p>
                        <br/>
                        <a href="${meetingLink}" style="${buttonStyle}">Join Google Meet</a>
                        <br/><br/>
                        <p><strong>Add to Calendar:</strong></p>
                        <a href="${googleCalLink}" style="${linkStyle}">Google Calendar</a> | 
                        <a href="${outlookCalLink}" style="${linkStyle}">Outlook</a>
                    </div>
                `
            });

            // 2. To Student (Localized)
            // Extract locale from request body or default to English
            const locale = body.locale || 'en';

            const studentEmailHtml = getBookingConfirmationEmail({
                studentName,
                serviceType,
                startTime: startDateTime.toISOString(),
                meetingLink,
                timeZone: userTz,
                bookingId: booking.id,
                locale
            });

            await sendEmail({
                to: studentEmail,
                subject: locale === 'ar' ? `تم تأكيد الحجز: ${serviceType} ✅` : `Booking Confirmed: ${serviceType} ✅`,
                body: locale === 'ar'
                    ? `تم تأكيد حجزك لـ ${serviceType}. الوقت: ${studentDate}. رابط اللقاء: ${meetingLink}`
                    : `Your booking for ${serviceType} is confirmed. Time: ${studentDate}. Join: ${meetingLink}`,
                html: studentEmailHtml
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
