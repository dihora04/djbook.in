
import React, { useState, useEffect, useCallback } from 'react';
import { View, DJProfile, Booking, BookingStatus, SubscriptionTier } from '../../types';
import { getDjById, getBookingsByDjId, acceptBooking, rejectBooking, upgradeSubscription, deleteDjAccount } from '../../services/mockApiService';
import { LoaderIcon, UserIcon, CalendarIcon, LeadsIcon, AnalyticsIcon, StarIcon, CheckCircleIcon, ClockIcon } from '../icons';
import ProfileEditSection from './ProfileEditSection';
import CalendarSection from './CalendarSection';
import SubscriptionSection from './SubscriptionSection';

interface DjDashboardPageProps {
  djId: string;
  setView: (view: View) => void;
  showToast: (message: string, type?: 'success' | 'error') => void;
  onLogout: () => void;
}

type Tab = 'profile' | 'calendar' | 'leads' | 'analytics' | 'subscription';

const DjDashboardPage: React.FC<DjDashboardPageProps> = ({ djId, setView, showToast, onLogout }) => {
    const [dj, setDj] = useState<DJProfile | null>(null);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<Tab>('leads');

    const fetchData = useCallback(async () => {
        try {
            const [djData, bookingsData] = await Promise.all([
                getDjById(djId),
                getBookingsByDjId(djId)
            ]);
            
            if (djData) {
                setDj(djData);
                setBookings(bookingsData);
            } else {
                showToast("DJ Profile data not found.", "error");
            }
        } catch (e) {
            console.error(e);
            showToast("Error fetching dashboard data.", "error");
        }
    }, [djId, showToast]); 

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            await fetchData();
            setLoading(false);
        }
        init();
    }, [fetchData]);

    // Handle new user onboarding redirection
    useEffect(() => {
        if (dj && (!dj.city || !dj.genres || dj.genres.length === 0) && activeTab !== 'profile') {
            setActiveTab('profile');
            showToast("Welcome! Please complete your profile to get started.", "success");
        }
    }, [dj]);

    // Handler for updates from sub-components to avoid full refetching
    const handleBookingUpdate = (updatedBooking: Booking) => {
        setBookings(prev => prev.map(b => b.id === updatedBooking.id ? updatedBooking : b));
    };

    const handleDeleteProfile = async () => {
        if (!window.confirm("Are you sure you want to permanently delete your DJ profile? This action cannot be undone.")) {
            return;
        }
        try {
            await deleteDjAccount(djId);
            showToast("Profile deleted successfully. Goodbye!", "success");
            onLogout();
        } catch (e) {
            showToast("Failed to delete profile.", "error");
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

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-brand-dark"><LoaderIcon className="w-16 h-16 text-brand-cyan" /></div>;
    }

    if (!dj) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-brand-dark text-white">
                <h2 className="text-2xl font-bold mb-4">Unable to load DJ Profile</h2>
                <button onClick={() => window.location.reload()} className="bg-brand-cyan text-brand-dark px-6 py-2 rounded-full font-bold">Reload Page</button>
            </div>
        );
    }

    return (
        <div className="pt-24 bg-brand-dark min-h-screen text-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                 {dj.approvalStatus === 'PENDING' && (
                    <div className="bg-yellow-500/20 border border-yellow-500 text-yellow-300 p-4 rounded-lg mb-8 flex items-center gap-3">
                        <ClockIcon className="w-6 h-6 flex-shrink-0" />
                        <div>
                            <h3 className="font-bold">Your Profile is Pending Approval</h3>
                            <p className="text-sm">Please complete your profile details. Approvals typically take 24 hours.</p>
                        </div>
                    </div>
                )}
                <header className="mb-8">
                    <h1 className="text-4xl font-bold">Welcome back, {dj.name}!</h1>
                    <p className="text-gray-400">Dashboard</p>
                </header>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <aside className="lg:col-span-1">
                        <div className="bg-brand-surface p-4 rounded-xl space-y-2">
                            <TabButton tab="leads" icon={<LeadsIcon className="w-5 h-5" />} label="Leads" />
                            <TabButton tab="calendar" icon={<CalendarIcon className="w-5 h-5" />} label="Calendar" />
                            <TabButton tab="analytics" icon={<AnalyticsIcon className="w-5 h-5" />} label="Analytics" />
                            <TabButton tab="profile" icon={<UserIcon className="w-5 h-5" />} label="Edit Profile" />
                             <TabButton tab="subscription" icon={<StarIcon className="w-5 h-5" />} label="Subscription" />
                        </div>
                    </aside>
                    <main className="lg:col-span-3 bg-brand-surface p-6 rounded-xl min-h-[60vh]">
                        {activeTab === 'leads' && (
                            <LeadsSection 
                                djId={djId} 
                                bookings={bookings} 
                                onBookingUpdate={handleBookingUpdate} 
                                showToast={showToast} 
                            />
                        )}
                        {activeTab === 'calendar' && <CalendarSection djId={djId} />}
                        {activeTab === 'analytics' && <AnalyticsSection />}
                        {activeTab === 'profile' && (
                            <ProfileEditSection 
                                dj={dj} 
                                setDj={setDj} 
                                showToast={showToast} 
                                onDelete={handleDeleteProfile} 
                            />
                        )}
                        {activeTab === 'subscription' && <SubscriptionSection dj={dj} onPlanChange={setDj} showToast={showToast} />}
                    </main>
                </div>
            </div>
        </div>
    );
};


interface LeadsSectionProps {
    djId: string;
    bookings: Booking[];
    onBookingUpdate: (booking: Booking) => void;
    showToast: (message: string, type?: 'success' | 'error') => void;
}

const LeadsSection: React.FC<LeadsSectionProps> = ({ djId, bookings, onBookingUpdate, showToast }) => {
    const [loadingAction, setLoadingAction] = useState<string | null>(null);

    const handleAction = async (bookingId: string, type: 'accept' | 'reject') => {
        setLoadingAction(bookingId);
        try {
            const action = type === 'accept' ? acceptBooking : rejectBooking;
            const updatedBooking = await action(bookingId, djId);
            onBookingUpdate(updatedBooking);
            showToast(type === 'accept' ? 'Booking accepted!' : 'Booking rejected.', 'success');
        } catch (error) {
            showToast('Action failed.', 'error');
        } finally {
            setLoadingAction(null);
        }
    };

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
                                            onClick={() => handleAction(booking.id, 'accept')} 
                                            disabled={!!loadingAction}
                                            className="bg-green-500 hover:bg-green-600 text-white text-xs font-bold py-1 px-3 rounded-full transition-colors w-20 flex justify-center disabled:opacity-50"
                                        >
                                           {loadingAction === booking.id ? <LoaderIcon className="w-4 h-4"/> : 'Accept'}
                                        </button>
                                        <button 
                                            onClick={() => handleAction(booking.id, 'reject')}
                                            disabled={!!loadingAction}
                                            className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold py-1 px-3 rounded-full transition-colors w-20 flex justify-center disabled:opacity-50"
                                        >
                                            {loadingAction === booking.id ? <LoaderIcon className="w-4 h-4"/> : 'Reject'}
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
                 <StatCard value="1,204" label="Profile Views" icon={<UserIcon className="w-8 h-8"/>} />
                 <StatCard value="12" label="Inquiries" icon={<LeadsIcon className="w-8 h-8"/>} />
                 <StatCard value="4.9" label="Rating" icon={<StarIcon className="w-8 h-8"/>} />
            </div>
        </div>
    );
}

export default DjDashboardPage;
