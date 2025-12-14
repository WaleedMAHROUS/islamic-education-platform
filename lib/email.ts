import nodemailer from 'nodemailer';

interface EmailPayload {
    to: string;
    subject: string;
    body: string;
}

export async function sendEmail({ to, subject, body }: EmailPayload): Promise<void> {
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
            pass: pass,
        },
    });

    try {
        const info = await transporter.sendMail({
            from: `"Islamic Education Platform" <${user}>`,
            to: to,
            subject: subject,
            text: body,
            // html: body.replace(/\n/g, '<br>'), // Optional
        });

        console.log(`[EMAIL SENT] MessageId: ${info.messageId} To: ${to}`);
    } catch (error) {
        console.error('Failed to send email:', error);
        // Don't crash the request
    }
}
