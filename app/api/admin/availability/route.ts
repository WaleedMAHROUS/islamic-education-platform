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

// POST: Add slots (Open them) - Bulk supported
export async function POST(request: NextRequest) {
    const body = await request.json();
    const { startTimes, token } = body; // Expects array of ISO strings

    if (token !== 'admin123') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!startTimes || !Array.isArray(startTimes)) return NextResponse.json({ error: 'Invalid data' }, { status: 400 });

    try {
        // Use Promise.all for SQLite compatibility (createMany is limited in some providers, standard loop is safe)
        // Or simpler: just loop.
        const results = await Promise.all(
            startTimes.map(async (time: string) => {
                // Upsert logic: If exists, do nothing. If not, create.
                // Prisma doesn't have "insert ignore" easily for all DBs, so findUnique -> create is safe,
                // or just try/catch unique constraint.
                try {
                    return await db.availability.create({
                        data: { startTime: new Date(time) }
                    });
                } catch (e) {
                    return null; // Ignore duplicates
                }
            })
        );
        return NextResponse.json({ success: true, count: results.filter(Boolean).length });
    } catch (e) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

// DELETE: Remove slots (Close them) - Bulk supported
export async function DELETE(request: NextRequest) {
    // For DELETE with body, we must be careful. Next.js App Router handlers might expect params in URL.
    // Standard practice for bulk delete is complex with params.
    // Let's allow passing IDs or times in body if method allows, OR use a wrapper.
    // Actually, let's use a POST to a different endpoint or just use POST with action?
    // Or parse body in DELETE (Next.js supports it).

    // Changing to parse body for bulk delete
    const body = await request.json().catch(() => null); // Handle if no body

    // Fallback to query param for single delete (backward compatibility)
    if (!body) {
        const { searchParams } = new URL(request.url);
        const startTime = searchParams.get('startTime');
        const token = searchParams.get('token');
        if (token !== 'admin123') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        if (!startTime) return NextResponse.json({ error: 'Missing time' }, { status: 400 });
        try {
            await db.availability.delete({ where: { startTime: new Date(startTime) } });
            return NextResponse.json({ success: true });
        } catch (e) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }
    }

    const { startTimes, token } = body;
    if (token !== 'admin123') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        await db.availability.deleteMany({
            where: {
                startTime: {
                    in: startTimes.map((t: string) => new Date(t))
                }
            }
        });
        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
