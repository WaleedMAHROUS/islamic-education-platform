'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export default function AdminDashboard() {
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState('admin123'); // Default for demo

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const res = await fetch(`/api/admin?token=${token}`);
            if (res.ok) {
                const data = await res.json();
                setBookings(data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (id: string) => {
        if (!confirm('Are you sure you want to cancel this session? An email will be sent to the student.')) return;

        const res = await fetch(`/api/admin?id=${id}&token=${token}`, {
            method: 'DELETE'
        });

        if (res.ok) {
            toast.success('Booking cancelled and student notified.');
            fetchBookings(); // Refresh
        } else {
            toast.error('Failed to cancel.');
        }
    };

    return (
        <div className="container mx-auto p-4 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6 text-emerald-900">Teacher Dashboard</h1>

            <div className="bg-white p-6 rounded-xl shadow-md border border-emerald-100">
                <h2 className="text-xl font-semibold mb-4">Upcoming Bookings</h2>
                {loading ? (
                    <p>Loading...</p>
                ) : bookings.length === 0 ? (
                    <p className="text-gray-500">No bookings found.</p>
                ) : (
                    <div className="space-y-4">
                        {bookings.map((booking) => (
                            <div key={booking.id} className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50">
                                <div>
                                    <h3 className="font-bold text-lg">{booking.serviceType}</h3>
                                    <p className="text-sm text-gray-600">Student: {booking.studentName} ({booking.studentEmail})</p>
                                    <p className="text-sm text-emerald-700 font-medium">
                                        Time: {new Date(booking.startTime).toLocaleString('en-US', {
                                            timeZone: 'Asia/Tokyo', dateStyle: 'full', timeStyle: 'short'
                                        })} (Tokyo Time)
                                    </p>
                                    {booking.message && <p className="text-xs text-gray-400 mt-1">Note: {booking.message}</p>}
                                </div>
                                <button
                                    onClick={() => handleCancel(booking.id)}
                                    className="px-4 py-2 text-sm bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors"
                                >
                                    Cancel Session
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
