import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const start = searchParams.get('start');
    const end = searchParams.get('end');

    if (!start || !end) {
        return NextResponse.json({ error: 'Missing start or end date' }, { status: 400 });
    }

    try {
        const bookings = await db.booking.findMany({
            where: {
                startTime: {
                    gte: new Date(start),
                    lte: new Date(end),
                },
            },
            select: {
                startTime: true,
            },
        });

        return NextResponse.json(bookings.map(b => b.startTime));
    } catch (error) {
        console.error('Availability API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch availability' }, { status: 500 });
    }
}
