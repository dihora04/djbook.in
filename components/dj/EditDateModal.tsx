
import React, { useState } from 'react';
import { DJCalendarEntry, CalendarStatus } from '../../types';

interface EditDateModalProps {
    date: Date;
    existingEntry: DJCalendarEntry | null;
    onClose: () => void;
    onSave: (entry: Omit<DJCalendarEntry, 'id' | 'djProfileId'>) => void;
}

export const EditDateModal: React.FC<EditDateModalProps> = ({ date, existingEntry, onClose, onSave }) => {
    const [status, setStatus] = useState<CalendarStatus>(existingEntry?.status || CalendarStatus.AVAILABLE);
    const [title, setTitle] = useState(existingEntry?.title || '');
    const [note, setNote] = useState(existingEntry?.note || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            date,
            status,
            title: status !== CalendarStatus.AVAILABLE ? title : undefined, // Only save title if not available
            note: status !== CalendarStatus.AVAILABLE ? note : undefined, // Only save note if not available
            bookingId: existingEntry?.bookingId // Preserve existing booking ID if present
        });
    };

    const isPlatformBooking = !!existingEntry?.bookingId;

    return (
        <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center"
            onClick={onClose}
        >
            <div 
                className="bg-brand-surface rounded-xl shadow-2xl shadow-brand-violet/20 p-8 w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-2xl font-bold mb-2">Edit Date</h2>
                <p className="text-brand-cyan font-semibold mb-6">{date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                
                {isPlatformBooking && (
                     <div className="bg-blue-900/50 border border-blue-700 text-blue-300 text-sm p-3 rounded-lg mb-4">
                        This date is linked to a platform booking. You can add notes, but the "Booked" status cannot be changed here. Manage this from the "Leads" tab.
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-1">Status</label>
                        <select
                            id="status"
                            value={status}
                            onChange={(e) => setStatus(e.target.value as CalendarStatus)}
                            disabled={isPlatformBooking}
                            className="w-full bg-brand-dark text-white border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-cyan focus:outline-none appearance-none disabled:opacity-50"
                        >
                            <option value={CalendarStatus.AVAILABLE}>Available</option>
                            <option value={CalendarStatus.BOOKED}>Booked</option>
                            <option value={CalendarStatus.HOLD}>On Hold</option>
                            <option value={CalendarStatus.UNAVAILABLE}>Unavailable</option>
                        </select>
                    </div>

                     {(status === CalendarStatus.BOOKED || status === CalendarStatus.UNAVAILABLE || status === CalendarStatus.HOLD) && (
                        <>
                            <div>
                                <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">
                                    Title (Optional)
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder={status === CalendarStatus.BOOKED ? "e.g., Private Wedding Gig" : "e.g., Day Off"}
                                    className="w-full bg-brand-dark text-white border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-cyan focus:outline-none"
                                />
                            </div>
                            <div>
                                <label htmlFor="note" className="block text-sm font-medium text-gray-300 mb-1">
                                    Private Note (Optional)
                                </label>
                                <textarea
                                    id="note"
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    rows={3}
                                    placeholder="e.g., Client contact info, reminders..."
                                    className="w-full bg-brand-dark text-white border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-cyan focus:outline-none"
                                />
                            </div>
                        </>
                    )}
                    
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded-full transition-colors">
                            Cancel
                        </button>
                        <button type="submit" className="bg-gradient-to-r from-brand-violet to-brand-cyan text-white font-bold py-2 px-6 rounded-full hover:scale-105 transition-transform">
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
