import React from 'react';
import { useMusic } from './MusicProvider';

const MusicControls: React.FC = () => {
    const { volume, setVolume, scale, setScale, isInitialized } = useMusic();

    if (!isInitialized) return null;

    return (
        <div className="fixed top-24 left-4 z-50 bg-brand-surface/80 backdrop-blur-md p-4 rounded-xl border border-gray-700 shadow-lg text-white space-y-3">
            <div className="flex items-center gap-2">
                <span className="text-sm">🎹</span>
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                    className="w-24"
                    aria-label="Volume"
                />
            </div>
            <div className="flex items-center gap-2">
                <span className="text-sm">🎵</span>
                <select
                    value={scale}
                    onChange={(e) => setScale(e.target.value as any)}
                    className="bg-brand-dark border border-gray-600 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-brand-cyan focus:outline-none"
                    aria-label="Musical Mood"
                >
                    <option value="major">Happy</option>
                    <option value="pentatonic">Chill</option>
                    <option value="minor">Moody</option>
                </select>
            </div>
        </div>
    );
};

export default MusicControls;
