
import React, { useState, useEffect } from 'react';
import { View, DJProfile } from '../../types';
import { getAllDjsForAdmin } from '../../services/mockApiService';
import { LoaderIcon, CheckCircleIcon, XCircleIcon, ClockIcon, VerifiedIcon, UserIcon, DashboardIcon } from '../icons';

interface AdminDashboardPageProps {
  setView: (view: View) => void;
}

type Tab = 'djs' | 'bookings';


const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ setView }) => {
    const [allDjs, setAllDjs] = useState<DJProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<Tab>('djs');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const djs = await getAllDjsForAdmin();
            setAllDjs(djs);
            setLoading(false);
        };
        fetchData();
    }, []);

    const handleApproval = (djId: string, status: DJProfile['approvalStatus']) => {
        // In a real app, this would be an API call.
        // Here, we just update the local state to simulate the action.
        setAllDjs(prevDjs => prevDjs.map(dj => dj.id === djId ? { ...dj, approvalStatus: status } : dj));
    };
    
    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-brand-dark"><LoaderIcon className="w-16 h-16 text-brand-cyan" /></div>;
    }
    
    const renderTabContent = () => {
        switch (activeTab) {
            case 'djs':
                return <DjManagementSection djs={allDjs} onApproval={handleApproval} />;
            case 'bookings':
                return <p>A list of all bookings across the platform would be shown here.</p>;
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
                    <h1 className="text-4xl font-bold">Admin Panel</h1>
                    <p className="text-gray-400">Manage your platform DJs and bookings.</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <aside className="lg:col-span-1">
                        <div className="bg-brand-surface p-4 rounded-xl space-y-2">
                             <TabButton tab="djs" icon={<UserIcon className="w-5 h-5" />} label="DJ Management" />
                             <TabButton tab="bookings" icon={<DashboardIcon className="w-5 h-5" />} label="All Bookings" />
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

const DjManagementSection = ({ djs, onApproval }: { djs: DJProfile[], onApproval: (djId: string, status: DJProfile['approvalStatus']) => void }) => {
    const statusInfo = {
        APPROVED: { icon: <CheckCircleIcon className="w-6 h-6 text-green-400" />, text: 'Approved', color: 'text-green-400' },
        PENDING: { icon: <ClockIcon className="w-6 h-6 text-yellow-400" />, text: 'Pending', color: 'text-yellow-400' },
        REJECTED: { icon: <XCircleIcon className="w-6 h-6 text-red-500" />, text: 'Rejected', color: 'text-red-500' },
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">DJ Management</h2>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="border-b border-gray-700">
                        <tr>
                            <th className="p-3">DJ</th>
                            <th className="p-3">City</th>
                            <th className="p-3">Status</th>
                            <th className="p-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {djs.map(dj => (
                            <tr key={dj.id} className="border-b border-gray-800 hover:bg-brand-dark">
                                <td className="p-3 flex items-center gap-3">
                                    <img src={dj.profileImage} alt={dj.name} className="w-10 h-10 rounded-full object-cover" />
                                    <span className="font-semibold">{dj.name}</span>
                                    {dj.verified && <VerifiedIcon className="w-5 h-5 text-brand-cyan" />}
                                </td>
                                <td className="p-3 text-gray-400">{dj.city}</td>
                                <td className={`p-3 font-semibold ${statusInfo[dj.approvalStatus].color}`}>
                                    <div className="flex items-center gap-2">
                                        {statusInfo[dj.approvalStatus].icon}
                                        <span>{statusInfo[dj.approvalStatus].text}</span>
                                    </div>
                                </td>
                                <td className="p-3 text-right">
                                    {dj.approvalStatus === 'PENDING' && (
                                        <div className="flex gap-2 justify-end">
                                            <button onClick={() => onApproval(dj.id, 'APPROVED')} className="bg-green-500 hover:bg-green-600 text-white text-xs font-bold py-1 px-3 rounded-full transition-colors">Approve</button>
                                            <button onClick={() => onApproval(dj.id, 'REJECTED')} className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold py-1 px-3 rounded-full transition-colors">Reject</button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default AdminDashboardPage;
