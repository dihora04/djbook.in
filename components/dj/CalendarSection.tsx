
import React, { useState, useEffect } from 'react';
import { DJCalendarEntry, CalendarStatus } from '../../types';
import { getDjCalendarEntries, updateDjCalendarEntry, getDjById, toggleGoogleCalendar } from '../../services/mockApiService';
import { LoaderIcon, ChevronLeftIcon, GoogleIcon, CheckCircleIcon } from '../icons';
import { EditDateModal } from './EditDateModal';

interface CalendarSectionProps {
    djId: string;
}

const CalendarSection: React.FC<CalendarSectionProps> = ({ djId }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [events, setEvents] = useState<DJCalendarEntry[]>([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    
    // Google Sync State
    const [isGoogleConnected, setIsGoogleConnected] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);

    const fetchEvents = async () => {
        setIsLoading(true);
        const [entries, djProfile] = await Promise.all([
            getDjCalendarEntries(djId),
            getDjById(djId)
        ]);
        setEvents(entries);
        if (djProfile) {
            setIsGoogleConnected(!!djProfile.googleCalendarConnected);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchEvents();
    }, [djId]);
    
    const handleDateClick = (date: Date) => {
        setSelectedDate(date);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedDate(null);
    };

    const handleSave = async (entry: Omit<DJCalendarEntry, 'id' | 'djProfileId'>) => {
        await updateDjCalendarEntry(djId, entry);
        fetchEvents(); // Re-fetch events to show the update
        handleCloseModal();
    };

    const handleToggleGoogleSync = async () => {
        setIsSyncing(true);
        try {
            const newStatus = await toggleGoogleCalendar(djId);
            setIsGoogleConnected(newStatus);
            await fetchEvents(); // Refresh calendar to show synced/removed events
        } catch (e) {
            alert("Failed to sync Google Calendar");
        } finally {
            setIsSyncing(false);
        }
    };

    const renderCalendar = () => {
        const month = currentDate.getMonth();
        const year = currentDate.getFullYear();
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);
        const daysInMonth = lastDayOfMonth.getDate();
        const startDayOfWeek = firstDayOfMonth.getDay(); // 0 for Sunday

        const eventsMap = new Map<string, DJCalendarEntry>();
        events.forEach(event => {
            const dateKey = event.date.toISOString().split('T')[0];
            eventsMap.set(dateKey, event);
        });

        const cellStatusStyles = {
            [CalendarStatus.BOOKED]: 'bg-red-900/30 hover:bg-red-900/50',
            [CalendarStatus.HOLD]: 'bg-yellow-900/30 hover:bg-yellow-900/50',
            [CalendarStatus.UNAVAILABLE]: 'bg-purple-900/30 hover:bg-purple-900/50',
            [CalendarStatus.AVAILABLE]: 'hover:bg-brand-dark',
        };

        const badgeStatusStyles = {
            [CalendarStatus.BOOKED]: 'bg-red-500 text-white',
            [CalendarStatus.HOLD]: 'bg-yellow-500 text-black',
            [CalendarStatus.UNAVAILABLE]: 'bg-purple-500 text-white',
            [CalendarStatus.AVAILABLE]: '',
        };

        const days = [];
        for (let i = 0; i < startDayOfWeek; i++) {
            days.push(<div key={`empty-${i}`} className="border-r border-b border-gray-700"></div>);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateKey = date.toISOString().split('T')[0];
            const event = eventsMap.get(dateKey);
            const cellStyle = event ? cellStatusStyles[event.status] : cellStatusStyles[CalendarStatus.AVAILABLE];

            days.push(
                <div 
                    key={day} 
                    className={`p-2 border-r border-b border-gray-700 min-h-[120px] flex flex-col cursor-pointer transition-colors ${cellStyle}`}
                    onClick={() => handleDateClick(date)}
                >
                    <span className="font-bold">{day}</span>
                    <div className="flex-grow space-y-1 mt-1">
                        {event && (
                             <div className={`p-1 rounded-md text-xs font-semibold truncate ${badgeStatusStyles[event.status]}`}>
                                {event.title || event.status}
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        return (
            <div>
                 <div className="flex justify-between items-center mb-4">
                    <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="p-2 rounded-full hover:bg-brand-dark">
                        <ChevronLeftIcon className="w-6 h-6"/>
                    </button>
                    <h3 className="text-xl font-bold">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
                     <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="p-2 rounded-full hover:bg-brand-dark rotate-180">
                        <ChevronLeftIcon className="w-6 h-6"/>
                    </button>
                </div>
                <div className="grid grid-cols-7 border-t border-l border-gray-700">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="p-2 text-center font-bold border-r border-b border-gray-700 bg-brand-dark">{day}</div>
                    ))}
                    {days}
                </div>
                <div className="flex flex-wrap justify-between items-center mt-4 gap-4">
                    <div className="flex gap-4 text-sm">
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500"></div>Booked</div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-500"></div>On Hold</div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-purple-500"></div>Unavailable</div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold">Booking Calendar</h2>
                    <p className="text-gray-400 text-sm">Manage your availability and view bookings.</p>
                </div>
                
                <button 
                    onClick={handleToggleGoogleSync}
                    disabled={isSyncing}
                    className={`flex items-center gap-3 px-4 py-2 rounded-full font-bold text-sm transition-all shadow-lg ${isGoogleConnected ? 'bg-white/10 text-white border border-green-500 hover:bg-red-500/20 hover:border-red-500' : 'bg-white text-black hover:bg-brand-cyan'}`}
                >
                    {isSyncing ? <LoaderIcon className="w-5 h-5" /> : <GoogleIcon className="w-5 h-5" />}
                    {isSyncing ? 'Syncing...' : isGoogleConnected ? 'Connected (Click to Disconnect)' : 'Sync Google Calendar'}
                    {isGoogleConnected && !isSyncing && <CheckCircleIcon className="w-4 h-4 text-green-400" />}
                </button>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center h-64"><LoaderIcon className="w-12 h-12 text-brand-cyan" /></div>
            ) : (
                renderCalendar()
            )}
             {isModalOpen && selectedDate && (
                <EditDateModal 
                    date={selectedDate}
                    existingEntry={events.find(e => e.date.toISOString().split('T')[0] === selectedDate.toISOString().split('T')[0]) || null}
                    onClose={handleCloseModal}
                    onSave={handleSave}
                />
            )}
        </div>
    );
};

export default CalendarSection;
