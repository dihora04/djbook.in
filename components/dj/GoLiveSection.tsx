
import React, { useState, useEffect } from 'react';
import { DJProfile } from '../../types';
import { setDjLiveStatus, stopDjLiveStatus } from '../../services/mockApiService';
import { LoaderIcon, RadioIcon } from '../icons';

interface GoLiveSectionProps {
    dj: DJProfile;
    onUpdateProfile: (dj: DJProfile) => void;
    showToast: (message: string, type?: 'success' | 'error') => void;
}

const GoLiveSection: React.FC<GoLiveSectionProps> = ({ dj, onUpdateProfile, showToast }) => {
    const [isLive, setIsLive] = useState(false);
    const [venueName, setVenueName] = useState('');
    const [duration, setDuration] = useState(2); // Default duration 2 hours
    const [isLoading, setIsLoading] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        const liveStatus = dj.liveStatus;
        if (liveStatus && new Date(liveStatus.activeUntil) > new Date()) {
            setIsLive(true);
            setVenueName(liveStatus.venueName);
            const remaining = new Date(liveStatus.activeUntil).getTime() - new Date().getTime();
            setTimeLeft(remaining);
        } else {
            setIsLive(false);
            setVenueName('');
            setTimeLeft(0);
        }
    }, [dj.liveStatus]);

    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft(prev => prev - 1000);
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [timeLeft]);

    const handleGoLive = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!venueName || duration <= 0) {
            showToast("Please enter a valid venue and duration.", 'error');
            return;
        }

        setIsLoading(true);

        // In a real app, you would get the precise coordinates.
        // For this demo, we'll use mock coordinates.
        const mockCoords = { lat: 19.0760, lng: 72.8777 }; // Mumbai coordinates

        const activeUntil = new Date(Date.now() + duration * 60 * 60 * 1000);

        try {
            const updatedDj = await setDjLiveStatus(dj.id, {
                venueName,
                lat: mockCoords.lat,
                lng: mockCoords.lng,
                activeUntil,
            });
            onUpdateProfile(updatedDj);
            showToast("You are now live!", 'success');
        } catch (error) {
            console.error(error);
            showToast("Failed to start live session.", 'error');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleStopLive = async () => {
        setIsLoading(true);
        try {
            const updatedDj = await stopDjLiveStatus(dj.id);
            onUpdateProfile(updatedDj);
            showToast("Live session ended.", 'success');
        } catch(error) {
            console.error(error);
            showToast("Failed to stop live session.", 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const formatTimeLeft = (ms: number) => {
        if (ms <= 0) return "00:00:00";
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };


    if (isLive) {
        return (
             <div className="text-center">
                <RadioIcon className="w-16 h-16 text-red-500 mx-auto mb-4 animate-pulse" />
                <h2 className="text-3xl font-bold text-white">You Are Live!</h2>
                <p className="text-gray-300 mt-2">Currently performing at <span className="font-bold text-brand-cyan">{venueName}</span></p>

                <div className="my-8">
                    <p className="text-gray-400 text-sm">Time Remaining</p>
                    <p className="text-5xl font-bold tracking-tighter">{formatTimeLeft(timeLeft)}</p>
                </div>
                
                <button
                    onClick={handleStopLive}
                    disabled={isLoading}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-full transition-colors duration-300 disabled:opacity-50"
                >
                    {isLoading ? <LoaderIcon className="w-6 h-6" /> : 'End Live Session'}
                </button>
            </div>
        )
    }

    return (
        <div>
            <h2 className="text-2xl font-bold mb-2">Go Live Now</h2>
            <p className="text-gray-400 mb-6">Let users know where you're performing right now to attract a local crowd.</p>
            <form onSubmit={handleGoLive} className="bg-brand-dark p-6 rounded-lg space-y-4 max-w-lg mx-auto">
                <div>
                    <label htmlFor="venue" className="block text-sm font-medium text-gray-300 mb-1">
                        Venue Name
                    </label>
                    <input
                        type="text"
                        id="venue"
                        value={venueName}
                        onChange={(e) => setVenueName(e.target.value)}
                        placeholder="e.g., AER Lounge, Four Seasons"
                        required
                        className="w-full bg-brand-surface text-white border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-cyan focus:outline-none"
                    />
                </div>
                <div>
                    <label htmlFor="duration" className="block text-sm font-medium text-gray-300 mb-1">
                        Set Duration (in hours)
                    </label>
                    <input
                        type="number"
                        id="duration"
                        value={duration}
                        min="1"
                        max="8"
                        onChange={(e) => setDuration(Number(e.target.value))}
                        required
                        className="w-full bg-brand-surface text-white border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-cyan focus:outline-none"
                    />
                </div>
                <div className="text-right pt-2">
                     <button 
                        type="submit"
                        disabled={isLoading}
                        className="bg-gradient-to-r from-brand-violet to-brand-cyan text-white font-bold py-2 px-6 rounded-full hover:scale-105 transition-transform duration-300 disabled:opacity-50 flex items-center justify-center min-w-[180px]"
                     >
                        {isLoading ? (
                            <>
                                <LoaderIcon className="w-5 h-5 mr-2" />
                                Starting...
                            </>
                        ) : (
                            'Start Live Session'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default GoLiveSection;