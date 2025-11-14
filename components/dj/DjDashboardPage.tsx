import React, { useState, useEffect } from 'react';
import { View, DJProfile, Booking, BookingStatus } from '../../types';
import { getDjById, getBookingsByDjId, acceptBooking, rejectBooking } from '../../services/mockApiService';
import { LoaderIcon, UserIcon, CalendarIcon, LeadsIcon, AnalyticsIcon, StarIcon } from '../icons';
import ProfileEditSection from './ProfileEditSection';
import CalendarSection from './CalendarSection';

interface DjDashboardPageProps {
  djId: string;
  setView: (view: View) => void;
  showToast: (message: string, type?: 'success' | 'error') => void;
}

type Tab = 'profile' | 'calendar' | 'leads' | 'analytics';

const DjDashboardPage: React.FC<DjDashboardPageProps> = ({ djId, setView, showToast }) => {
    const [dj, setDj] = useState<DJProfile | null>(null);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<Tab>('leads');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const [djData, bookingsData] = await Promise.all([
                getDjById(djId),
                getBookingsByDjId(djId)
            ]);
            setDj(djData || null);
            setBookings(bookingsData);
            setLoading(false);
        };
        fetchData();
    }, [djId]);

    const handleBookingUpdate = (updatedBooking: Booking) => {
        setBookings(currentBookings => 
            currentBookings.map(b => b.id === updatedBooking.id ? updatedBooking : b)
        );
    };


    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-brand-dark"><LoaderIcon className="w-16 h-16 text-brand-cyan" /></div>;
    }

    if (!dj) {
        return <div className="min-h-screen flex items-center justify-center bg-brand-dark text-white">DJ profile not found.</div>;
    }

    const renderTabContent = () => {
        switch (activeTab) {
            case 'leads':
                return <LeadsSection djId={djId} initialBookings={bookings} onBookingUpdate={handleBookingUpdate} showToast={showToast} />;
            case 'calendar':
                return <CalendarSection bookings={bookings} djId={djId} />;
            case 'analytics':
                 return <AnalyticsSection />;
            case 'profile':
                return <ProfileEditSection dj={dj} setDj={setDj} />;
            default:
                return null;
        }
    };

    const TabButton = ({ tab, icon, label }: { tab: Tab, icon: React.ReactNode, label: string }) => (
        <button
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors duration-200 w-full text-left ${activeTab === tab ? 'bg-brand-violet text-white' : 'hover:bg-brand-surface'}`}
        >
            {icon}
            <span className="font-semibold">{label}</span>
        </button>
    );

    return (
        <div className="pt-24 bg-brand-dark min-h-screen text-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <header className="mb-8">
                    <h1 className="text-4xl font-bold">Welcome back, {dj.name}!</h1>
                    <p className="text-gray-400">Here's what's happening with your profile today.</p>
                </header>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <aside className="lg:col-span-1">
                        <div className="bg-brand-surface p-4 rounded-xl space-y-2">
                            <TabButton tab="leads" icon={<LeadsIcon className="w-5 h-5" />} label="Leads" />
                            <TabButton tab="calendar" icon={<CalendarIcon className="w-5 h-5" />} label="Calendar" />
                            <TabButton tab="analytics" icon={<AnalyticsIcon className="w-5 h-5" />} label="Analytics" />
                            <TabButton tab="profile" icon={<UserIcon className="w-5 h-5" />} label="Edit Profile" />
                        </div>
                    </aside>
                    <main className="lg:col-span-3 bg-brand-surface p-6 rounded-xl min-h-[60vh]">
                        {renderTabContent()}
                    </main>
                </div>
            </div>
        </div>
    );
};


interface LeadsSectionProps {
    djId: string;
    initialBookings: Booking[];
    onBookingUpdate: (booking: Booking) => void;
    showToast: (message: string, type?: 'success' | 'error') => void;
}

const LeadsSection: React.FC<LeadsSectionProps> = ({ djId, initialBookings, onBookingUpdate, showToast }) => {
    const [bookings, setBookings] = useState(initialBookings);
    const [loadingAction, setLoadingAction] = useState<string | null>(null);

    useEffect(() => {
        setBookings(initialBookings);
    }, [initialBookings]);


    const handleAccept = async (bookingId: string) => {
        setLoadingAction(bookingId);
        try {
            const updatedBooking = await acceptBooking(bookingId, djId);
            setBookings(prev => prev.map(b => b.id === bookingId ? updatedBooking : b));
            showToast('Booking accepted and calendar updated!', 'success');
        } catch (error) {
            console.error('Failed to accept booking:', error);
            showToast('Failed to accept booking.', 'error');
        } finally {
            setLoadingAction(null);
        }
    };

    const handleReject = async (bookingId: string) => {
        setLoadingAction(bookingId);
        try {
            const updatedBooking = await rejectBooking(bookingId, djId);
            setBookings(prev => prev.map(b => b.id === bookingId ? updatedBooking : b));
            showToast('Booking rejected.', 'success');
        } catch (error) {
            console.error('Failed to reject booking:', error);
            showToast('Failed to reject booking.', 'error');
        } finally {
            setLoadingAction(null);
        }
    };

    const statusStyles = {
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
            <h2 className="text-2xl font-bold mb-6">Your Leads</h2>
            <div className="space-y-4">
                {bookings.length === 0 && <p className="text-gray-400">You have no booking inquiries yet.</p>}
                {bookings.map(booking => (
                    <div key={booking.id} className="bg-brand-dark p-4 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <p className="font-bold text-lg">{booking.eventType} at {booking.location}</p>
                            <p className="text-sm text-gray-400">With {booking.customerName} on {booking.eventDate.toLocaleDateString()}</p>
                            {booking.notes && <p className="text-sm text-gray-300 mt-2 italic">"{booking.notes}"</p>}
                        </div>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
                            <span className={`text-xs font-bold px-3 py-1 rounded-full text-center ${statusStyles[booking.status]}`}>{booking.status}</span>
                            <div className="flex gap-2">
                                {booking.status === 'PENDING' && (
                                    <>
                                        <button 
                                            onClick={() => handleAccept(booking.id)} 
                                            disabled={loadingAction === booking.id}
                                            className="bg-green-500 hover:bg-green-600 text-white text-xs font-bold py-1 px-3 rounded-full transition-colors w-full flex-1 justify-center disabled:opacity-50"
                                        >
                                           {loadingAction === booking.id ? <LoaderIcon className="w-4 h-4 mx-auto"/> : 'Accept'}
                                        </button>
                                        <button 
                                            onClick={() => handleReject(booking.id)}
                                            disabled={loadingAction === booking.id}
                                            className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold py-1 px-3 rounded-full transition-colors w-full flex-1 justify-center disabled:opacity-50"
                                        >
                                            {loadingAction === booking.id ? <LoaderIcon className="w-4 h-4 mx-auto"/> : 'Reject'}
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const AnalyticsSection = () => {
    const StatCard = ({ value, label, icon }: { value: string, label: string, icon: React.ReactNode }) => (
        <div className="bg-brand-dark p-6 rounded-lg">
            <div className="flex items-center gap-4">
                <div className="text-brand-cyan">{icon}</div>
                <div>
                    <p className="text-3xl font-bold">{value}</p>
                    <p className="text-sm text-gray-400">{label}</p>
                </div>
            </div>
        </div>
    );
    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Your Analytics</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                 <StatCard value="1,204" label="Profile Views (Last 30 Days)" icon={<UserIcon className="w-8 h-8"/>} />
                 <StatCard value="12" label="Booking Inquiries" icon={<LeadsIcon className="w-8 h-8"/>} />
                 <StatCard value="4.9" label="Average Rating" icon={<StarIcon className="w-8 h-8"/>} />
            </div>
            <div className="mt-8 bg-brand-dark p-6 rounded-lg">
                <h3 className="font-semibold mb-4">Performance Chart</h3>
                <p className="text-gray-400">A chart showing views and leads over time would appear here.</p>
            </div>
        </div>
    );
}

export default DjDashboardPage;
