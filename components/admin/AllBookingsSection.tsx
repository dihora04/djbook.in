
import React, { useState, useMemo } from 'react';
import { Booking, BookingStatus } from '../../types';

interface AllBookingsSectionProps {
    bookings: Booking[];
}

const AllBookingsSection: React.FC<AllBookingsSectionProps> = ({ bookings }) => {
    const [statusFilter, setStatusFilter] = useState<BookingStatus | 'ALL'>('ALL');

    const filteredBookings = useMemo(() => {
        if (statusFilter === 'ALL') {
            return bookings;
        }
        return bookings.filter(b => b.status === statusFilter);
    }, [bookings, statusFilter]);
    
    const statusStyles: { [key in BookingStatus]: string } = {
        [BookingStatus.PENDING]: 'bg-yellow-500/20 text-yellow-400',
        [BookingStatus.ACCEPTED]: 'bg-green-500/20 text-green-400',
        [BookingStatus.COMPLETED]: 'bg-blue-500/20 text-blue-400',
        [BookingStatus.REJECTED]: 'bg-red-500/20 text-red-500',
        [BookingStatus.CANCELLED]: 'bg-red-500/20 text-red-500',
        [BookingStatus.PAID]: 'bg-purple-500/20 text-purple-400',
        [BookingStatus.REFUNDED]: 'bg-gray-500/20 text-gray-400',
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                 <h2 className="text-2xl font-bold">All Platform Bookings</h2>
                 <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="bg-brand-dark text-white border border-gray-600 rounded-full px-4 py-2 focus:ring-2 focus:ring-brand-cyan focus:outline-none appearance-none"
                >
                    <option value="ALL">All Statuses</option>
                    {Object.values(BookingStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="border-b border-gray-700">
                        <tr>
                            <th className="p-3">DJ</th>
                            <th className="p-3">Customer</th>
                            <th className="p-3">Event Date</th>
                            <th className="p-3">Event Type</th>
                            <th className="p-3">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredBookings.map(booking => (
                            <tr key={booking.id} className="border-b border-gray-800 hover:bg-brand-dark">
                                <td className="p-3 flex items-center gap-3">
                                    <img src={booking.djProfileImage} alt={booking.djName} className="w-10 h-10 rounded-full object-cover" />
                                    <span className="font-semibold">{booking.djName}</span>
                                </td>
                                <td className="p-3 text-gray-400">{booking.customerName}</td>
                                <td className="p-3 text-gray-400">{booking.eventDate.toLocaleDateString()}</td>
                                <td className="p-3 text-gray-400">{booking.eventType}</td>
                                <td className="p-3">
                                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${statusStyles[booking.status]}`}>
                                        {booking.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

        </div>
    );
};

export default AllBookingsSection;
