
import React, { useState, useEffect, useCallback } from 'react';
import { View, DJProfile, Booking } from '../../types';
import { getAllDjsForAdmin, approveDj, rejectDj, getAllBookings } from '../../services/mockApiService';
import { LoaderIcon, CheckCircleIcon, XCircleIcon, ClockIcon, VerifiedIcon, UserIcon, DashboardIcon, AnalyticsIcon } from '../icons';
import AllBookingsSection from './AllBookingsSection';
import AdminReportsSection from './AdminReportsSection';

interface AdminDashboardPageProps {
  setView: (view: View) => void;
  showToast: (message: string, type?: 'success' | 'error') => void;
}

type Tab = 'djs' | 'bookings' | 'reports';

// --- 2050 Style Components ---

const GlassCard = ({ children, className = "" }: { children?: React.ReactNode, className?: string }) => (
    <div className={`bg-black/40 backdrop-blur-xl border border-glass-border rounded-2xl shadow-xl ${className}`}>
        {children}
    </div>
);

const TabButton = ({ tab, activeTab, setActiveTab, icon, label }: { tab: Tab, activeTab: Tab, setActiveTab: (t: Tab) => void, icon: React.ReactNode, label: string }) => {
    const isActive = activeTab === tab;
    return (
        <button
            onClick={() => setActiveTab(tab)}
            className={`group flex items-center gap-3 px-5 py-4 rounded-xl transition-all duration-300 w-full text-left border ${isActive ? 'bg-brand-violet/20 border-brand-violet/50 text-white shadow-neon-violet' : 'border-transparent hover:bg-white/5 text-gray-400 hover:text-white'}`}
        >
            <div className={`${isActive ? 'text-brand-cyan' : 'text-gray-500 group-hover:text-white'}`}>
                {icon}
            </div>
            <span className="font-medium tracking-wide">{label}</span>
        </button>
    );
};

// --- ISOLATED DJ TABLE COMPONENT ---
const DjTable = ({ 
    djs, 
    onApproval 
}: { 
    djs: DJProfile[], 
    onApproval: (djId: string, status: 'APPROVED' | 'REJECTED') => void 
}) => {
    
    const statusInfo = {
        APPROVED: { icon: <CheckCircleIcon className="w-5 h-5" />, text: 'Active', color: 'text-green-400 bg-green-500/10 border-green-500/20' },
        PENDING: { icon: <ClockIcon className="w-5 h-5" />, text: 'Pending', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },
        REJECTED: { icon: <XCircleIcon className="w-5 h-5" />, text: 'Rejected', color: 'text-red-400 bg-red-500/10 border-red-500/20' },
    };
    
    const planColors: { [key: string]: string } = {
        FREE: 'bg-gray-800 text-gray-300 border-gray-700',
        PRO: 'bg-blue-900/30 text-blue-300 border-blue-500/30',
        ELITE: 'bg-brand-violet/20 text-brand-violet border-brand-violet/30 shadow-neon-violet'
    };

    return (
        <div className="overflow-hidden rounded-xl border border-glass-border">
            <table className="w-full text-left border-collapse">
                <thead className="bg-white/5 text-gray-400 text-sm uppercase tracking-wider">
                    <tr>
                        <th className="p-4 font-medium">Artist</th>
                        <th className="p-4 font-medium">City</th>
                        <th className="p-4 font-medium">Tier</th>
                        <th className="p-4 font-medium">Status</th>
                        <th className="p-4 font-medium text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {djs.map(dj => (
                        <tr key={dj.id} className="hover:bg-white/5 transition-colors">
                            <td className="p-4">
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <img src={dj.profileImage} alt={dj.name} className="w-12 h-12 rounded-full object-cover ring-2 ring-white/10" />
                                        {dj.approvalStatus === 'APPROVED' && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-black"></div>}
                                    </div>
                                    <div>
                                        <div className="font-bold text-white flex items-center gap-2">
                                            {dj.name}
                                            {dj.verified && <VerifiedIcon className="w-4 h-4 text-brand-cyan" />}
                                        </div>
                                        <div className="text-xs text-gray-500 font-mono mt-0.5">{dj.id.slice(0, 12)}...</div>
                                    </div>
                                </div>
                            </td>
                            <td className="p-4 text-gray-300">{dj.city || <span className="text-gray-600 italic">--</span>}</td>
                            <td className="p-4">
                                <span className={`px-3 py-1 text-xs font-bold rounded-full border ${planColors[dj.plan]}`}>
                                    {dj.plan}
                                </span>
                            </td>
                            <td className="p-4">
                                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${statusInfo[dj.approvalStatus].color}`}>
                                    {statusInfo[dj.approvalStatus].icon}
                                    <span className="text-sm font-medium">{statusInfo[dj.approvalStatus].text}</span>
                                </div>
                            </td>
                            <td className="p-4 text-right">
                                {dj.approvalStatus === 'PENDING' && (
                                    <div className="flex gap-2 justify-end">
                                        <button 
                                            onClick={() => onApproval(dj.id, 'APPROVED')} 
                                            className="bg-green-500 hover:bg-green-400 text-black font-bold py-1.5 px-4 rounded-lg transition-all shadow-[0_0_15px_rgba(34,197,94,0.4)] hover:shadow-[0_0_25px_rgba(34,197,94,0.6)]"
                                        >
                                            Approve
                                        </button>
                                        <button 
                                            onClick={() => onApproval(dj.id, 'REJECTED')} 
                                            className="bg-white/10 hover:bg-red-500/20 hover:text-red-400 border border-white/10 text-gray-300 font-semibold py-1.5 px-4 rounded-lg transition-all"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                )}
                            </td>
                        </tr>
                    ))}
                    {djs.length === 0 && (
                        <tr>
                            <td colSpan={5} className="p-12 text-center text-gray-500">
                                No data available in the system.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

// --- MAIN COMPONENT ---

const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ setView, showToast }) => {
    const [allDjs, setAllDjs] = useState<DJProfile[]>([]);
    const [allBookings, setAllBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<Tab>('djs');

    const fetchData = useCallback(async () => {
        try {
            const [djs, bookings] = await Promise.all([
                getAllDjsForAdmin(),
                getAllBookings()
            ]);
            setAllDjs(djs);
            setAllBookings(bookings);
        } catch (error) {
            showToast("Failed to synchronize data.", "error");
        }
    }, [showToast]);

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            await fetchData();
            setLoading(false);
        }
        init();
    }, [fetchData]);

    // --- OPTIMISTIC UI UPDATE FOR INSTANT FEEL ---
    const handleApproval = async (djId: string, status: 'APPROVED' | 'REJECTED') => {
        // 1. Capture original state for this specific item for rollback
        const originalDj = allDjs.find(d => d.id === djId);
        if (!originalDj) return;

        // 2. Optimistic Update: Immediately update local state
        setAllDjs(current => current.map(d => d.id === djId ? { ...d, approvalStatus: status } : d));
        
        showToast(status === 'APPROVED' ? 'DJ Approved instantly.' : 'DJ Rejected.', 'success');

        // 3. Perform API call in background
        try {
            const action = status === 'APPROVED' ? approveDj : rejectDj;
            await action(djId);
            // No need to re-fetch if API succeeds, local state is already correct
        } catch (error) {
            // 4. Rollback on failure: Revert only the specific item using functional update
            setAllDjs(current => current.map(d => d.id === djId ? originalDj : d));
            showToast("Sync failed. Reverting changes.", "error");
        }
    };
    
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-brand-dark">
                <div className="relative">
                    <div className="absolute inset-0 bg-brand-cyan blur-xl opacity-20 animate-pulse"></div>
                    <LoaderIcon className="w-16 h-16 text-brand-cyan relative z-10" />
                </div>
            </div>
        );
    }

    return (
        <div className="pt-24 pb-12 min-h-screen font-sans">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-5xl font-bold text-white font-display tracking-tight">Command Center</h1>
                        <p className="text-gray-400 mt-2 text-lg">System Status: <span className="text-brand-cyan">Operational</span></p>
                    </div>
                    <div className="flex gap-3">
                         <div className="bg-brand-surface border border-glass-border px-4 py-2 rounded-lg text-sm text-gray-300">
                            Server Time: {new Date().toLocaleTimeString()}
                         </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Sidebar Navigation */}
                    <aside className="lg:col-span-3">
                        <GlassCard className="p-4 sticky top-24 space-y-2">
                             <TabButton 
                                tab="djs" 
                                activeTab={activeTab} 
                                setActiveTab={setActiveTab} 
                                icon={<UserIcon className="w-5 h-5" />} 
                                label="DJ Management" 
                             />
                             <TabButton 
                                tab="bookings" 
                                activeTab={activeTab} 
                                setActiveTab={setActiveTab} 
                                icon={<DashboardIcon className="w-5 h-5" />} 
                                label="Global Bookings" 
                             />
                             <TabButton 
                                tab="reports" 
                                activeTab={activeTab} 
                                setActiveTab={setActiveTab} 
                                icon={<AnalyticsIcon className="w-5 h-5" />} 
                                label="System Analytics" 
                             />
                        </GlassCard>
                    </aside>

                    {/* Main Content Area */}
                    <main className="lg:col-span-9">
                        <GlassCard className="p-6 min-h-[600px]">
                            {activeTab === 'djs' && (
                                <div>
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-2xl font-bold text-white">Artist Database</h2>
                                        <div className="text-sm text-gray-400">{allDjs.length} records found</div>
                                    </div>
                                    <DjTable djs={allDjs} onApproval={handleApproval} />
                                </div>
                            )}
                            {activeTab === 'bookings' && <AllBookingsSection bookings={allBookings} />}
                            {activeTab === 'reports' && <AdminReportsSection djs={allDjs} bookings={allBookings} />}
                        </GlassCard>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboardPage;
