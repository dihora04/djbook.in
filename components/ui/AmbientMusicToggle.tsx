import React from 'react';
import { useMusic } from './MusicProvider';

const AmbientMusicToggle: React.FC = () => {
    const { isAmbientPlaying, toggleAmbientMusic, isInitialized } = useMusic();

    if (!isInitialized) return null;

    return (
        <button
            onClick={toggleAmbientMusic}
            className={`fixed bottom-8 right-8 z-50 w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-lg transition-all duration-300 transform hover:scale-110
                ${isAmbientPlaying ? 'bg-gradient-to-r from-brand-violet to-brand-cyan animate-pulse' : 'bg-brand-surface'}`}
            aria-label={isAmbientPlaying ? "Stop ambient music" : "Play ambient music"}
        >
            <span className={`transition-transform duration-500 ${isAmbientPlaying ? 'rotate-180' : ''}`}>
                {isAmbientPlaying ? '🤫' : '🎵'}
            </span>
        </button>
    );
};

export default AmbientMusicToggle;
