import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET: List all availability and bookings for a range
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const start = searchParams.get('start');
    const end = searchParams.get('end');
    const token = searchParams.get('token');

    if (token !== 'admin123') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!start || !end) return NextResponse.json({ error: 'Missing range' }, { status: 400 });

    try {
        const [availabilities, bookings] = await Promise.all([
            db.availability.findMany({
                where: { startTime: { gte: new Date(start), lte: new Date(end) } }
            }),
            db.booking.findMany({
                where: { startTime: { gte: new Date(start), lte: new Date(end) } }
            })
        ]);

        return NextResponse.json({ availabilities, bookings });
    } catch (e) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

// POST: Add a slot (Open it)
export async function POST(request: NextRequest) {
    const body = await request.json();
    const { startTime, token } = body;

    if (token !== 'admin123') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const created = await db.availability.create({
            data: { startTime: new Date(startTime) }
        });
        return NextResponse.json(created);
    } catch (e) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 }); // Likely unique constraint if double click
    }
}

// DELETE: Remove a slot (Close it)
export async function DELETE(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const startTime = searchParams.get('startTime');
    const token = searchParams.get('token');

    if (token !== 'admin123') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!startTime) return NextResponse.json({ error: 'Missing time' }, { status: 400 });

    try {
        await db.availability.delete({
            where: { startTime: new Date(startTime) }
        });
        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
}
