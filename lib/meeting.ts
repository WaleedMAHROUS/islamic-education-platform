
export async function generateMeetingLink(topic: string, startTime: Date): Promise<string> {
    // Return the static Google Meet link from environment variables.
    // If not set, return a placeholder that alerts the user.
    const link = process.env.GOOGLE_MEET_LINK;

    if (!link) {
        console.warn("GOOGLE_MEET_LINK env var is not set. Using placeholder.");
        return "https://meet.google.com/YOUR-LINK-HERE";
    }

    return link;
}
