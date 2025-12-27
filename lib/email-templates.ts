import { format } from 'date-fns';
import { enUS, arEG } from 'date-fns/locale';
import { generateGoogleCalendarLink, generateOutlookCalendarLink, generateICSLink } from './calendar';

interface EmailTemplatePayload {
    studentName: string;
    serviceType: string;
    startTime: string;
    meetingLink: string;
    timeZone: string;
    bookingId?: string;
    locale?: string;
}

export function getBookingConfirmationEmail(payload: EmailTemplatePayload) {
    const isArabic = payload.locale === 'ar';
    const dateLang = isArabic ? arEG : enUS;

    const formattedDate = format(new Date(payload.startTime), 'EEEE, MMMM d, yyyy', { locale: dateLang });
    const formattedTime = format(new Date(payload.startTime), 'h:mm a', { locale: dateLang });

    const googleCalLink = generateGoogleCalendarLink(payload.serviceType, payload.startTime, payload.meetingLink);
    const outlookLink = generateOutlookCalendarLink(payload.serviceType, payload.startTime, payload.meetingLink);
    const icsLink = generateICSLink(payload.serviceType, payload.startTime, payload.meetingLink);

    const cancellationLink = `https://islamic-education-platform.vercel.app/${payload.locale || 'en'}/cancel/${payload.bookingId}`;

    if (isArabic) {
        return `
      <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; line-height: 1.6; text-align: right;">
        <h2 style="color: #059669;">تم تأكيد حجزك ✅</h2>
        <p>مرحباً ${payload.studentName}،</p>
        <p>يسعدنا إخبارك بأنه تم تأكيد حجز جلستك بنجاح.</p>
        
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>📚 نوع الجلسة:</strong> ${payload.serviceType}</p>
          <p style="margin: 5px 0;"><strong>📅 التاريخ:</strong> ${formattedDate}</p>
          <p style="margin: 5px 0;"><strong>⏰ الوقت:</strong> ${formattedTime} (${payload.timeZone})</p>
          <p style="margin: 5px 0;"><strong>📍 رابط اللقاء:</strong> <a href="${payload.meetingLink}" style="color: #2563eb;">انضم عبر Google Meet</a></p>
        </div>

        <p style="margin-bottom: 20px;">
          <strong>إضافة إلى التقويم:</strong><br>
          <a href="${googleCalLink}" style="text-decoration: none; color: #2563eb; margin-left: 10px;">Google Calendar</a> |
          <a href="${outlookLink}" style="text-decoration: none; color: #2563eb; margin-left: 10px;">Outlook</a> |
          <a href="${icsLink}" style="text-decoration: none; color: #2563eb;">ملف ICS</a>
        </p>

        <div style="border-top: 1px solid #e5e7eb; padding-top: 15px; margin-top: 20px;">
          <p style="font-size: 14px; color: #6b7280;">إذا كنت بحاجة إلى إلغاء الحجز، يمكنك القيام بذلك من خلال الرابط أدناه (متاح قبل الجلسة بساعة واحدة):</p>
          <a href="${cancellationLink}" style="color: #dc2626; font-size: 14px;">إلغاء هذا الحجز</a>
        </div>

        <p style="margin-top: 30px; border-top: 1px solid #eee; pt: 20px;">
          نتطلع لرؤيتك قريباً!<br>
          <em>منصة التعليم الإسلامي</em>
        </p>
      </div>
    `;
    }

    // English Template
    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; line-height: 1.6;">
      <h2 style="color: #059669;">Booking Confirmed! ✅</h2>
      <p>Hi ${payload.studentName},</p>
      <p>Your session has been successfully scheduled. We look forward to seeing you!</p>
      
      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 5px 0;"><strong>📚 Service:</strong> ${payload.serviceType}</p>
        <p style="margin: 5px 0;"><strong>📅 Date:</strong> ${formattedDate}</p>
        <p style="margin: 5px 0;"><strong>⏰ Time:</strong> ${formattedTime} (${payload.timeZone})</p>
        <p style="margin: 5px 0;"><strong>📍 Meeting Link:</strong> <a href="${payload.meetingLink}" style="color: #2563eb;">Join Google Meet</a></p>
      </div>

      <div style="margin-bottom: 20px;">
        <strong>Add to Calendar:</strong><br>
        <a href="${googleCalLink}" style="text-decoration: none; color: #2563eb; margin-right: 10px;">Google Calendar</a> |
        <a href="${outlookLink}" style="text-decoration: none; color: #2563eb; margin-right: 10px; margin-left: 10px;">Outlook</a> |
        <a href="${icsLink}" style="text-decoration: none; color: #2563eb; margin-left: 10px;">ICS File</a>
      </div>

      <div style="border-top: 1px solid #e5e7eb; padding-top: 15px; margin-top: 20px;">
        <p style="font-size: 14px; color: #6b7280;">Need to cancel? You can do so using the link below (up to 1 hour before start time):</p>
        <a href="${cancellationLink}" style="color: #dc2626; font-size: 14px;">Cancel this booking</a>
      </div>

      <p style="margin-top: 30px; border-top: 1px solid #eee; pt: 20px;">
        Best regards,<br>
        <em>Islamic Education Platform</em>
      </p>
    </div>
  `;
}

export function getCancellationNotificationEmail(payload: EmailTemplatePayload) {
    // Cancellation notification usually goes to the teacher (often English preferred), 
    // but if we want to confirm to student in their language we can add logic here.
    // For now, let's keep it simple or bilingual since this notifies the teacher mainly 
    // but we can also send one to the student.

    const isArabic = payload.locale === 'ar';

    if (isArabic) {
        return `
      <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px; text-align: right;">
        <h2 style="color: #dc2626;">تم إلغاء الحجز ❌</h2>
        <p>مرحباً ${payload.studentName}،</p>
        <p>تم إلغاء جلستك التالية بناءً على طلبك:</p>
        <ul style="list-style-position: inside;">
          <li><strong>نوع الجلسة:</strong> ${payload.serviceType}</li>
          <li><strong>الوقت:</strong> ${payload.startTime}</li>
        </ul>
        <p>نأمل أن نراك في وقت آخر.</p>
      </div>
    `;
    }

    return `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2 style="color: #dc2626;">Booking Cancelled ❌</h2>
      <p>Hi ${payload.studentName},</p>
      <p>Your session has been cancelled as requested:</p>
      <ul>
        <li><strong>Service:</strong> ${payload.serviceType}</li>
        <li><strong>Time:</strong> ${payload.startTime}</li>
      </ul>
      <p>You are welcome to book again at any time.</p>
    </div>
  `;
}
