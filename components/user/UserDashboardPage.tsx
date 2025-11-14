
import React, { useState, useEffect } from 'react';
import { View, User, Booking, BookingStatus } from '../../types';
import { getBookingsByCustomerId } from '../../services/mockApiService';
import { LoaderIcon, CalendarIcon } from '../icons';
import DjDashboardPage from '../dj/DjDashboardPage';

interface UserDashboardPageProps {
    currentUser: User;
    setView: (view: View) => void;
}

const UserDashboardPage: React.FC<UserDashboardPageProps> = ({ currentUser, setView }) => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBookings = async () => {
            setLoading(true);
            const userBookings = await getBookingsByCustomerId(currentUser.id);
            setBookings(userBookings);
            setLoading(false);
        };
        fetchBookings();
    }, [currentUser.id]);

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
        <div className="pt-24 bg-brand-dark min-h-screen text-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <header className="mb-8">
                    <h1 className="text-4xl font-bold">Welcome, {currentUser.name}!</h1>
                    <p className="text-gray-400">View and manage your DJ bookings here.</p>
                </header>

                <div className="bg-brand-surface p-6 rounded-xl">
                    <h2 className="text-2xl font-bold mb-6">My Bookings</h2>
                    {loading ? (
                        <div className="flex justify-center py-10">
                            <LoaderIcon className="w-12 h-12 text-brand-cyan" />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {bookings.length === 0 ? (
                                <div className="text-center py-10">
                                    <p className="text-gray-400 mb-4">You haven't booked any DJs yet.</p>
                                    <button 
                                        onClick={() => setView({ page: 'search'})}
                                        className="bg-gradient-to-r from-brand-violet to-brand-cyan text-white font-bold py-2 px-6 rounded-full hover:scale-105 transition-transform"
                                    >
                                        Find a DJ
                                    </button>
                                </div>
                            ) : (
                                bookings.map(booking => (
                                    <div key={booking.id} className="bg-brand-dark p-4 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                        <div className="flex items-center gap-4">
                                            <img src={booking.djProfileImage} alt={booking.djName} className="w-16 h-16 rounded-lg object-cover" />
                                            <div>
                                                <p className="font-bold text-lg text-white">{booking.eventType} with {booking.djName}</p>
                                                <p className="text-sm text-gray-400 flex items-center gap-2 mt-1">
                                                    <CalendarIcon className="w-4 h-4" />
                                                    {booking.eventDate.toLocaleDateString()} at {booking.location}
                                                </p>
                                            </div>
                                        </div>
                                        <div>
                                             <span className={`text-xs font-bold px-3 py-1 rounded-full text-center ${statusStyles[booking.status]}`}>
                                                {booking.status}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserDashboardPage;
