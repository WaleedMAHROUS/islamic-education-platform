'use client';

import { useState, useEffect } from 'react';
import { addDays, startOfDay, format, setHours, isSameHour } from 'date-fns';
import { toast } from 'sonner';

export default function AvailabilityPage() {
    const [dates, setDates] = useState<Date[]>([]);
    const [availabilities, setAvailabilities] = useState<any[]>([]);
    const [bookings, setBookings] = useState<any[]>([]); // To show red if booked
    const [loading, setLoading] = useState(true);
    const token = 'admin123'; // Hardcoded for prototype

    useEffect(() => {
        // Generate next 14 days
        const list = [];
        const today = startOfDay(new Date());
        for (let i = 0; i < 14; i++) {
            list.push(addDays(today, i));
        }
        setDates(list);
        fetchData(list[0], list[list.length - 1]);
    }, []);

    const fetchData = async (start: Date, end: Date) => {
        try {
            const startStr = start.toISOString();
            const endStr = addDays(end, 1).toISOString(); // Include last day fully
            const res = await fetch(`/api/admin/availability?token=${token}&start=${startStr}&end=${endStr}`);
            if (res.ok) {
                const data = await res.json();
                setAvailabilities(data.availabilities);
                setBookings(data.bookings);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const toggleSlot = async (date: Date, hour: number) => {
        // Construct the specific time
        // Note: Using local browser time logic here assumes browser is same as teacher expectation (Tokyo) for now
        // Ideally should iterate in UTC, but prototype simplification:
        const slotTime = setHours(date, hour);

        // Check if exists
        const exists = availabilities.find(a => isSameHour(new Date(a.startTime), slotTime));

        if (exists) {
            // Check if actually booked (prevent closing booked slots easily)
            const isBooked = bookings.find(b => isSameHour(new Date(b.startTime), slotTime));
            if (isBooked) {
                toast.error("Cannot close a slot that has a booking!");
                return;
            }

            // Remove
            const res = await fetch(`/api/admin/availability?token=${token}&startTime=${slotTime.toISOString()}`, { method: 'DELETE' });
            if (res.ok) {
                setAvailabilities(prev => prev.filter(a => !isSameHour(new Date(a.startTime), slotTime)));
            }
        } else {
            // Add
            const res = await fetch(`/api/admin/availability`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, startTime: slotTime.toISOString() })
            });
            if (res.ok) {
                const newSlot = await res.json();
                setAvailabilities(prev => [...prev, newSlot]);
            }
        }
    };

    const hours = Array.from({ length: 24 }, (_, i) => i);

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="container mx-auto p-4 max-w-6xl">
            <h1 className="text-3xl font-bold mb-2 text-slate-800">Manage Availability</h1>
            <p className="text-gray-600 mb-6">Click slots to Open (Green) or Close (Gray). Red slots are booked by students.</p>

            <div className="overflow-x-auto">
                <div className="min-w-[800px]">
                    {/* Header Row */}
                    <div className="flex mb-2">
                        <div className="w-32 font-bold p-2">Date</div>
                        <div className="flex-1 grid grid-cols-24 gap-px bg-gray-200 border">
                            {hours.map(h => (
                                <div key={h} className="text-[10px] text-center bg-white p-1">{h}</div>
                            ))}
                        </div>
                    </div>

                    {/* Date Rows */}
                    <div className="space-y-1">
                        {dates.map(date => (
                            <div key={date.toISOString()} className="flex items-center">
                                <div className="w-32 text-sm font-medium p-2 bg-slate-50 border-b">
                                    {format(date, 'MMM dd (EEE)')}
                                </div>
                                <div className="flex-1 grid grid-cols-24 gap-px bg-gray-200 border-l border-r border-b">
                                    {hours.map(h => {
                                        const slotTime = setHours(date, h);
                                        const isOpen = availabilities.find(a => isSameHour(new Date(a.startTime), slotTime));
                                        const isBooked = bookings.find(b => isSameHour(new Date(b.startTime), slotTime));

                                        let bgClass = "bg-white hover:bg-gray-50"; // Default Closed
                                        if (isBooked) bgClass = "bg-red-500 cursor-not-allowed";
                                        else if (isOpen) bgClass = "bg-green-500 hover:bg-green-600";

                                        return (
                                            <button
                                                key={h}
                                                onClick={() => toggleSlot(date, h)}
                                                className={`h-10 w-full transition-colors ${bgClass}`}
                                                title={`${format(slotTime, 'HH:mm')} - ${isOpen ? 'Open' : 'Closed'}`}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mt-4 text-sm flex gap-4">
                <div className="flex items-center gap-2"><div className="w-4 h-4 bg-white border"></div> Closed</div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 bg-green-500"></div> Open (Available)</div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 bg-red-500"></div> Booked</div>
            </div>

            <style jsx global>{`
                .grid-cols-24 { grid-template-columns: repeat(24, minmax(0, 1fr)); }
            `}</style>
        </div>
    );
}
