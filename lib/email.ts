import nodemailer from 'nodemailer';

interface EmailPayload {
    to: string;
    subject: string;
    body: string; // Plain text fallback
    html?: string; // HTML content
}

export async function sendEmail({ to, subject, body, html }: EmailPayload): Promise<void> {
    const user = process.env.GMAIL_USER;
    const pass = process.env.GMAIL_APP_PASSWORD;

    if (!user || !pass) {
        console.warn("GMAIL_USER or GMAIL_APP_PASSWORD missing. Logging email instead.");
        console.log(`[MOCK EMAIL via Nodemailer] To: ${to}, Subject: ${subject}`);
        return;
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: user,
            pass: pass.replace(/\s+/g, ''), // Remove spaces if user copied them directly
        },
    });

    try {
        const info = await transporter.sendMail({
            from: `"Islamic Education Platform" <${user}>`,
            to: to,
            subject: subject,
            text: body,
            html: html || body.replace(/\n/g, '<br>'),
        });

        console.log(`[EMAIL SENT] MessageId: ${info.messageId} To: ${to}`);
    } catch (error) {
        console.error('Failed to send email:', error);
        // Don't crash the request
    }
}
