import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Public API: Get available slots
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const start = searchParams.get('start');
    const end = searchParams.get('end');

    if (!start || !end) {
        return NextResponse.json({ error: 'Missing start or end date' }, { status: 400 });
    }

    try {
        // 1. Get Teacher's Open Slots
        const openSlots = await db.availability.findMany({
            where: {
                startTime: {
                    gte: new Date(start),
                    lte: new Date(end),
                },
            },
            select: { startTime: true },
        });

        // 2. Get Bookings
        const bookings = await db.booking.findMany({
            where: {
                startTime: {
                    gte: new Date(start),
                    lte: new Date(end),
                },
            },
            select: { startTime: true },
        });

        // 3. Filter: Open - Booked = Available
        // Compare using ISO strings for safety
        const bookedTimes = new Set(bookings.map(b => b.startTime.toISOString()));

        // 24-hour buffer logic
        const now = new Date();
        const bufferTime = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Now + 24 hours

        const availableSlots = openSlots
            .filter(slot => {
                const isNotBooked = !bookedTimes.has(slot.startTime.toISOString());
                const isAfterBuffer = slot.startTime > bufferTime;
                return isNotBooked && isAfterBuffer;
            })
            .map(slot => slot.startTime);

        return NextResponse.json(availableSlots);
    } catch (error) {
        console.error('Availability API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch availability' }, { status: 500 });
    }
}
