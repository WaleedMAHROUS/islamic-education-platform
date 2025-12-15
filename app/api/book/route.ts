import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateMeetingLink } from '@/lib/meeting';
import { sendEmail } from '@/lib/email';
import { formatInTimeZone } from 'date-fns-tz';
import { generateGoogleCalendarLink, generateOutlookCalendarLink } from '@/lib/calendar';

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

            // 2. To Student
            await sendEmail({
                to: studentEmail,
                subject: `Booking Confirmed: ${serviceType}`,
                body: `Dear ${studentName},\nYour session is confirmed.\nTime: ${studentDate}\nSubject: ${serviceType}\nJoin here: ${meetingLink}`,
                html: `
                    <div style="font-family: sans-serif; padding: 20px;">
                        <h2>Booking Confirmed! ✅</h2>
                        <p>Dear ${studentName},</p>
                        <p>Your session for <strong>${serviceType}</strong> has been confirmed.</p>
                        <p><strong>Time:</strong> ${studentDate}</p>
                        <br/>
                        <a href="${meetingLink}" style="${buttonStyle}">Join Google Meet</a>
                        <br/><br/>
                        <div style="background: #f3f4f6; padding: 15px; border-radius: 8px;">
                            <p style="margin-top:0;"><strong>📅 Add to your calendar:</strong></p>
                            <a href="${googleCalLink}" style="${linkStyle}">Google Calendar</a> &nbsp;&bull;&nbsp; 
                            <a href="${outlookCalLink}" style="${linkStyle}">Outlook</a>
                        </div>
                        <br/>
                        <p>See you soon!</p>
                        <hr style="border:0; border-top:1px solid #eee; margin: 20px 0;" />
                        <p style="font-size: 12px; color: #6b7280; text-align: center;">
                            Need to reschedule? <a href="https://islamic-education-platform.vercel.app/cancel/${booking.id}" style="color: #ef4444; text-decoration: underline;">Cancel this session</a>
                            <br/>(Allowed up to 1 hour before start time)
                        </p>
                    </div>
                `
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
