
import React, { useMemo } from 'react';
import { DJProfile, Booking, BookingStatus } from '../../types';
import { UserIcon, DashboardIcon, CheckCircleIcon } from '../icons';

interface AdminReportsSectionProps {
    djs: DJProfile[];
    bookings: Booking[];
}

const AdminReportsSection: React.FC<AdminReportsSectionProps> = ({ djs, bookings }) => {

    const stats = useMemo(() => {
        const totalDjs = djs.length;
        const approvedDjs = djs.filter(d => d.approvalStatus === 'APPROVED').length;
        const pendingDjs = djs.filter(d => d.approvalStatus === 'PENDING').length;
        const totalBookings = bookings.length;
        const completedBookings = bookings.filter(b => b.status === BookingStatus.COMPLETED).length;

        return { totalDjs, approvedDjs, pendingDjs, totalBookings, completedBookings };
    }, [djs, bookings]);

    const StatCard = ({ value, label, icon }: { value: string | number, label: string, icon: React.ReactNode }) => (
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
            <h2 className="text-2xl font-bold mb-6">Platform Reports</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard value={stats.totalDjs} label="Total Registered DJs" icon={<UserIcon className="w-8 h-8"/>} />
                <StatCard value={stats.approvedDjs} label="Active & Approved DJs" icon={<CheckCircleIcon className="w-8 h-8"/>} />
                <StatCard value={stats.pendingDjs} label="Pending Approvals" icon={<UserIcon className="w-8 h-8"/>} />
                <StatCard value={stats.totalBookings} label="Total Bookings Made" icon={<DashboardIcon className="w-8 h-8"/>} />
                <StatCard value={stats.completedBookings} label="Completed Gigs" icon={<DashboardIcon className="w-8 h-8"/>} />
                 <StatCard value="₹1,50,000" label="Simulated Monthly Revenue" icon={<DashboardIcon className="w-8 h-8"/>} />
            </div>
             <div className="mt-8 bg-brand-dark p-6 rounded-lg">
                <h3 className="font-semibold mb-4">Revenue & Growth Charts</h3>
                <p className="text-gray-400">Advanced charts showing revenue, user growth, and booking trends would appear here in a real application.</p>
            </div>
        </div>
    );
};

export default AdminReportsSection;
