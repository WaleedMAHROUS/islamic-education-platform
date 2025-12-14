export async function generateTeamsLink(topic: string, startTime: Date, durationMinutes: number = 30): Promise<string> {
    console.log(`[MOCK] Generating Teams Link for: ${topic} at ${startTime.toISOString()} (${durationMinutes} min)`);

    // In a real application, you would use Microsoft Graph API here.
    // We return a mock URL for demonstration.
    return `https://teams.microsoft.com/l/meetup-join/MOCK_MEETING_${Date.now()}?context=${encodeURIComponent(JSON.stringify({ topic, startTime }))}`;
}
