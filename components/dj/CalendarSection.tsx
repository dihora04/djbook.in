
import React, { useState, useEffect } from 'react';
import { Booking, BookingStatus, GoogleCalendarEvent } from '../../types';
import { getGoogleCalendarEvents } from '../../services/mockApiService';
import { LoaderIcon, ChevronLeftIcon } from '../icons';

interface CalendarSectionProps {
    bookings: Booking[];
    djId: string;
}

type MergedEvent = {
    date: Date;
    title: string;
    status: 'Booked' | 'On Hold' | 'Personal';
    source: 'DJBook' | 'Google';
}

const CalendarSection: React.FC<CalendarSectionProps> = ({ bookings, djId }) => {
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [events, setEvents] = useState<MergedEvent[]>([]);
    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => {
        if (isConnected) {
            fetchEvents();
        } else {
            // Map only DJBook bookings when not connected to Google Calendar
            const djBookEvents: MergedEvent[] = bookings
                .filter(b => b.status === BookingStatus.ACCEPTED)
                .map(b => ({
                    date: b.eventDate,
                    title: b.eventType,
                    status: 'Booked',
                    source: 'DJBook'
                }));
            setEvents(djBookEvents);
        }
    }, [isConnected, bookings]);

    const fetchEvents = async () => {
        setIsLoading(true);
        // Fetch events from Google Calendar (simulated)
        const gcalEvents = await getGoogleCalendarEvents(djId);

        const googleEvents: MergedEvent[] = gcalEvents.map(event => ({
            date: new Date(event.start.date.replace(/-/g, '\/')), // Make date parsing more reliable
            title: event.summary,
            status: event.status === 'tentative' ? 'On Hold' : 'Personal',
            source: 'Google'
        }));
        
        // Map DJBook bookings
        const djBookEvents: MergedEvent[] = bookings
            .filter(b => b.status === BookingStatus.ACCEPTED)
            .map(b => ({
                date: b.eventDate,
                title: b.eventType,
                status: 'Booked',
                source: 'DJBook'
            }));

        // Merge and set events
        setEvents([...djBookEvents, ...googleEvents]);
        setIsLoading(false);
    };

    const handleConnect = () => {
        setIsLoading(true);
        // Simulate OAuth flow
        setTimeout(() => {
            setIsConnected(true);
            // fetchEvents is called by useEffect when isConnected changes
        }, 1500);
    };

    const handleDisconnect = () => {
        setIsConnected(false);
        setEvents([]); // Clear events on disconnect
    };

    const renderCalendar = () => {
        const month = currentDate.getMonth();
        const year = currentDate.getFullYear();
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);
        const daysInMonth = lastDayOfMonth.getDate();
        const startDayOfWeek = firstDayOfMonth.getDay(); // 0 for Sunday, 1 for Monday, etc.

        const days = [];
        // Add empty cells for days before the first of the month
        for (let i = 0; i < startDayOfWeek; i++) {
            days.push(<div key={`empty-${i}`} className="border-r border-b border-gray-700"></div>);
        }

        // Add cells for each day of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const todaysEvents = events.filter(e => 
                e.date.getDate() === date.getDate() &&
                e.date.getMonth() === date.getMonth() &&
                e.date.getFullYear() === date.getFullYear()
            );

            days.push(
                <div key={day} className="p-2 border-r border-b border-gray-700 min-h-[120px] flex flex-col">
                    <span className="font-bold">{day}</span>
                    <div className="flex-grow space-y-1 mt-1">
                        {todaysEvents.map((event, i) => (
                             <div key={i} className={`p-1 rounded-md text-xs font-semibold ${
                                event.status === 'Booked' ? 'bg-red-500/80' : 
                                event.status === 'On Hold' ? 'bg-yellow-500/80' : 
                                'bg-purple-500/80'
                            }`}>
                                {event.title}
                            </div>
                        ))}
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
                <div className="flex justify-end gap-4 mt-4 text-sm">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500"></div>Booked</div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-500"></div>On Hold</div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-purple-500"></div>Personal Event</div>
                </div>
            </div>
        );
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Booking Calendar</h2>
                {isConnected && (
                    <button onClick={handleDisconnect} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-full text-sm">
                        Disconnect Google
                    </button>
                )}
            </div>

            {!isConnected ? (
                <div className="text-center py-10 bg-brand-dark rounded-lg">
                    <h3 className="text-xl font-semibold">Sync Your Availability</h3>
                    <p className="text-gray-400 mt-2 mb-4 max-w-md mx-auto">Connect your Google Calendar to automatically block off dates and avoid double bookings.</p>
                    <button
                        onClick={handleConnect}
                        disabled={isLoading}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full inline-flex items-center gap-2 transition-colors disabled:opacity-50"
                    >
                         {isLoading ? <LoaderIcon className="w-5 h-5"/> : 
                            <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48px" height="48px" fill="white"><path fill="#fbc02d" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12	s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20	s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#e53935" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039	l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4caf50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36	c-5.222,0-9.641-3.657-11.303-8.411l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1565c0" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238	C42.022,35.283,44,30.036,44,24C44,22.659,43.862,21.35,43.611,20.083z"></pG>
                         {isLoading ? 'Connecting...' : 'Connect Google Calendar'}
                    </button>
                </div>
            ) : (
                isLoading ? <div className="flex justify-center items-center h-64"><LoaderIcon className="w-12 h-12 text-brand-cyan" /></div> : renderCalendar()
            )}
        </div>
    );
};

export default CalendarSection;