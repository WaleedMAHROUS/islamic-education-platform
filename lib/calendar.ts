export const generateGoogleCalendarLink = (title: string, startTime: Date, durationMinutes: number = 30, description: string = '', location: string = '') => {
    const start = startTime.toISOString().replace(/-|:|\.\d\d\d/g, "");
    const endTime = new Date(startTime.getTime() + durationMinutes * 60000);
    const end = endTime.toISOString().replace(/-|:|\.\d\d\d/g, "");

    const params = new URLSearchParams({
        action: 'TEMPLATE',
        text: title,
        dates: `${start}/${end}`,
        details: description,
        location: location,
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

export const generateOutlookCalendarLink = (title: string, startTime: Date, durationMinutes: number = 30, description: string = '', location: string = '') => {
    const start = startTime.toISOString();
    const endTime = new Date(startTime.getTime() + durationMinutes * 60000);
    const end = endTime.toISOString();

    // Outlook OWA format
    const params = new URLSearchParams({
        path: '/calendar/action/compose',
        rru: 'addevent',
        startdt: start,
        enddt: end,
        subject: title,
        body: description,
        location: location,
    });

    return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
};

export const generateICSLink = (title: string, startTime: Date, durationMinutes: number = 30, description: string = '', location: string = '') => {
    const start = startTime.toISOString().replace(/-|:|\.\d\d\d/g, "");
    const endTime = new Date(startTime.getTime() + durationMinutes * 60000);
    const end = endTime.toISOString().replace(/-|:|\.\d\d\d/g, "");

    const icsContent =
        `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:${start}
DTEND:${end}
SUMMARY:${title}
DESCRIPTION:${description}
LOCATION:${location}
END:VEVENT
END:VCALENDAR`;

    return `data:text/calendar;charset=utf8,${encodeURIComponent(icsContent)}`;
};
