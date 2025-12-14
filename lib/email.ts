import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailPayload {
    to: string;
    subject: string;
    body: string;
}

export async function sendEmail({ to, subject, body }: EmailPayload): Promise<void> {
    if (!process.env.RESEND_API_KEY) {
        console.warn("RESEND_API_KEY is missing. Falling back to mock email.");
        console.log(`[MOCK EMAIL] To: ${to}, Subject: ${subject}`);
        return;
    }

    try {
        const data = await resend.emails.send({
            from: 'onboarding@resend.dev', // Default sender for Resend free tier (Testing)
            to: to,
            subject: subject,
            text: body,
            // html: body.replace(/\n/g, '<br>') // Optional: simple text-to-html conversion if needed
        });

        if (data.error) {
            console.error('Resend API Error:', data.error);
            throw new Error(data.error.message);
        }

        console.log(`[EMAIL SENT] ID: ${data.data?.id} To: ${to}`);
    } catch (error) {
        console.error('Failed to send email:', error);
        // Don't crash the request for email failure, but log it.
    }
}
