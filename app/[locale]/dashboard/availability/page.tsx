'use client';

import { useState, useEffect } from 'react';
import { addDays, startOfDay, format, setHours, setMinutes, isSameHour } from 'date-fns';
import { toast } from 'sonner';

export default function AvailabilityPage() {
    const [dates, setDates] = useState<Date[]>([]); // Typo fix: state name was dates
    const [availabilities, setAvailabilities] = useState<any[]>([]);
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState<{ date: string; index: number } | null>(null);
    const [dragEnd, setDragEnd] = useState<{ date: string; index: number } | null>(null);
    const [dragAction, setDragAction] = useState<'add' | 'remove' | null>(null);

    const token = 'admin123';

    useEffect(() => {
        const list = [];
        const today = startOfDay(new Date());
        for (let i = 0; i < 14; i++) {
            list.push(addDays(today, i));
        }
        setDates(list); // Corrected state setter
        fetchData(list[0], list[list.length - 1]);
    }, []);

    const fetchData = async (start: Date, end: Date) => {
        try {
            const startStr = start.toISOString();
            const endStr = addDays(end, 1).toISOString();
            // Use same endpoint but logic supports bulk update now, read is same
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

    // Helper: Generate 48 slots (0, 0.5, 1, 1.5...)
    // Index 0 = 00:00, 1 = 00:30, 2 = 01:00...
    const slots = Array.from({ length: 48 }, (_, i) => i);

    const getSlotTime = (date: Date, slotIndex: number) => {
        const hours = Math.floor(slotIndex / 2);
        const minutes = (slotIndex % 2) * 30;
        return setHours(setMinutes(date, minutes), hours);
    };



    const handleMouseDown = (date: Date, slotIndex: number) => {
        const slotTime = getSlotTime(date, slotIndex);
        const tolerance = 5 * 60 * 1000;
        const currentlyOpen = availabilities.some(a => Math.abs(new Date(a.startTime).getTime() - slotTime.getTime()) < tolerance);

        setIsDragging(true);
        setDragStart({ date: date.toISOString(), index: slotIndex });
        setDragEnd({ date: date.toISOString(), index: slotIndex });
        setDragAction(currentlyOpen ? 'remove' : 'add');
    };

    const handleMouseEnter = (date: Date, slotIndex: number) => {
        if (!isDragging) return;
        setDragEnd({ date: date.toISOString(), index: slotIndex });
    };

    const handleMouseUp = async () => {
        if (!isDragging || !dragStart || !dragEnd || !dragAction) {
            setIsDragging(false);
            setDragAction(null);
            setDragStart(null);
            setDragEnd(null);
            return;
        }

        // Calculate all slots in selection range
        // Logic: Should handle cross-day dragging? Usually simpler to restrict to single day or row.
        // But user said "drag from 1 time slot to the slots beside it".
        // Let's support row-based dragging for simplicity first (safer UI). 
        // If we want multi-row, we need date comparison.

        const slotsToUpdate: string[] = [];

        // Find indices of start/end dates in our dates array to loop
        // Or simplified: Just handle one single row drag first.
        // User request: "drag from 1 time slot to the slots beside it" -> implies row.

        if (dragStart.date !== dragEnd.date) {
            toast.error("Please drag within the same day.");
            resetDrag();
            return;
        }

        const dateStr = dragStart.date;
        const low = Math.min(dragStart.index, dragEnd.index);
        const high = Math.max(dragStart.index, dragEnd.index);
        const baseDate = new Date(dateStr);

        for (let i = low; i <= high; i++) {
            const time = getSlotTime(baseDate, i);
            // Check if booked before changing
            const isBooked = bookings.some(b => Math.abs(new Date(b.startTime).getTime() - time.getTime()) < 1000);
            if (isBooked && dragAction === 'remove') {
                // Skip booked slots when closing (don't error, just skip)
                continue;
            }
            slotsToUpdate.push(time.toISOString());
        }

        if (slotsToUpdate.length > 0) {
            // Optimistic Update
            const newAvail = [...availabilities];
            if (dragAction === 'add') {
                slotsToUpdate.forEach(t => {
                    if (!newAvail.find(a => a.startTime === t)) { // string compare for optimistic logic needs caution, but standard string is ISO
                        newAvail.push({ startTime: t }); // Mock obj
                    }
                });
            } else {
                // Remove
                // Filter out ones that match
                // Need better matching than string equality blindly if inconsistent, but ISO usually stable
            }

            // Actually let's just refetch after API call to be safe

            const endpoint = dragAction === 'add' ? 'POST' : 'DELETE';
            const body = { token, startTimes: slotsToUpdate };

            try {
                const res = await fetch('/api/admin/availability', {
                    method: endpoint,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });

                if (res.ok) {
                    toast.success(dragAction === 'add' ? 'Slots opened' : 'Slots closed');
                    // Refresh data
                    fetchData(dates[0], dates[dates.length - 1]);
                } else {
                    toast.error("Failed to update slots");
                }
            } catch (e) {
                toast.error("Error updating slots");
            }
        }

        resetDrag();
    };

    const resetDrag = () => {
        setIsDragging(false);
        setDragStart(null);
        setDragEnd(null);
        setDragAction(null);
    };

    // selection logic for visuals
    const isInSelection = (dateIso: string, idx: number) => {
        if (!isDragging || !dragStart || !dragEnd) return false;
        if (dateIso !== dragStart.date || dragStart.date !== dragEnd.date) return false; // Only highlight same row

        const low = Math.min(dragStart.index, dragEnd.index);
        const high = Math.max(dragStart.index, dragEnd.index);
        return idx >= low && idx <= high;
    };

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="container mx-auto p-4 max-w-[1400px]" onMouseUp={handleMouseUp} onMouseLeave={resetDrag}>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Manage Availability</h1>
                    <p className="text-gray-600">Click and drag across slots to Open (Green) or Close (Gray). <br />Now supports 30-minute intervals.</p>
                </div>
                <div className="text-sm flex gap-4 bg-white p-2 rounded shadow-sm border">
                    <div className="flex items-center gap-2"><div className="w-4 h-4 bg-white border"></div> Closed</div>
                    <div className="flex items-center gap-2"><div className="w-4 h-4 bg-green-500"></div> Open (Available)</div>
                    <div className="flex items-center gap-2"><div className="w-4 h-4 bg-red-500"></div> Booked</div>
                </div>
            </div>

            <div className="overflow-x-auto pb-8 select-none">
                <div className="min-w-[1200px]">
                    {/* Header Row */}
                    <div className="flex mb-2">
                        <div className="w-32 font-bold p-2 sticky left-0 bg-white z-10 shadow-sm">Date</div>
                        <div className="flex-1 grid grid-cols-48 gap-px bg-gray-200 border">
                            {Array.from({ length: 24 }).map((_, h) => (
                                <div key={h} className="col-span-2 text-[10px] text-center bg-white p-1 border-l border-gray-100 flex items-center justify-center font-bold text-slate-400">
                                    {h}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Date Rows */}
                    <div className="space-y-1">
                        {dates.map(d => { // Using 'date' state which is array of Dates
                            const dateIso = d.toISOString();
                            return (
                                <div key={dateIso} className="flex items-center group">
                                    <div className="w-32 text-sm font-medium p-2 bg-slate-50 border-b sticky left-0 z-10 shadow-[4px_0_5px_-3px_rgba(0,0,0,0.1)]">
                                        {format(d, 'MMM dd (EEE)')}
                                    </div>
                                    <div className="flex-1 grid grid-cols-48 gap-px bg-gray-200 border-l border-r border-b">
                                        {slots.map(idx => {
                                            const slotTime = getSlotTime(d, idx);
                                            // Relaxed matching for both availability and bookings to finding anything within the same minute or so
                                            const tolerance = 5 * 60 * 1000; // 5 minute tolerance
                                            const isOpen = availabilities.some(a => Math.abs(new Date(a.startTime).getTime() - slotTime.getTime()) < tolerance);
                                            const isBooked = bookings.some(b => Math.abs(new Date(b.startTime).getTime() - slotTime.getTime()) < tolerance);

                                            const isSelected = isInSelection(dateIso, idx);

                                            // Determine visual state
                                            let bgClass = "bg-white"; // default closed
                                            if (isBooked) bgClass = "bg-red-500 cursor-not-allowed";
                                            else if (isSelected) bgClass = dragAction === 'add' ? "bg-green-400" : "bg-gray-100"; // Preview
                                            else if (isOpen) bgClass = "bg-green-500";
                                            else bgClass = "bg-white hover:bg-gray-50";

                                            return (
                                                <div
                                                    key={idx}
                                                    onMouseDown={(e) => { e.preventDefault(); if (!isBooked) handleMouseDown(d, idx); }}
                                                    onMouseEnter={() => handleMouseEnter(d, idx)}
                                                    className={`h-12 w-full transition-colors ${bgClass} ${idx % 2 === 0 ? 'border-l border-gray-300' : ''}`}
                                                    title={`${format(slotTime, 'HH:mm')} - ${isOpen ? 'Open' : 'Closed'}`}
                                                />
                                            );
                                        })}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .grid-cols-48 { grid-template-columns: repeat(48, minmax(0, 1fr)); }
            `}</style>
        </div>
    );
}
