
import React from 'react';
import { useSound } from '../../contexts/SoundContext';

const SoundToggle: React.FC = () => {
  const { isEnabled, toggleSound } = useSound();

  return (
    <button
      onClick={toggleSound}
      className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-5 py-3 rounded-full border transition-all duration-500 font-mono text-xs uppercase tracking-widest backdrop-blur-xl shadow-2xl ${
        isEnabled 
          ? 'bg-brand-cyan/10 border-brand-cyan text-brand-cyan shadow-[0_0_30px_rgba(0,242,234,0.3)]' 
          : 'bg-black/60 border-white/10 text-gray-400 hover:border-white/30 hover:text-white hover:bg-black/80'
      }`}
    >
      {isEnabled ? (
        <>
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-cyan opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-cyan"></span>
          </div>
          <div className="flex flex-col items-start leading-none">
            <span className="font-bold">Lo-Fi Beat: ON</span>
            <span className="text-[10px] opacity-70 mt-1">Vibe Active</span>
          </div>
          {/* Animated Audio Bars */}
          <div className="flex gap-1 h-4 items-end ml-2">
              <div className="w-1 bg-brand-cyan animate-[music-bar_0.8s_ease-in-out_infinite] h-[60%] rounded-t-sm"></div>
              <div className="w-1 bg-brand-cyan animate-[music-bar_1.2s_ease-in-out_infinite] h-[100%] rounded-t-sm"></div>
              <div className="w-1 bg-brand-cyan animate-[music-bar_0.6s_ease-in-out_infinite] h-[40%] rounded-t-sm"></div>
              <div className="w-1 bg-brand-cyan animate-[music-bar_1.0s_ease-in-out_infinite] h-[80%] rounded-t-sm"></div>
          </div>
        </>
      ) : (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
          </svg>
          <div className="flex flex-col items-start leading-none">
             <span className="font-bold">Sound Off</span>
             <span className="text-[10px] opacity-70 mt-1">Click to Enable Vibe</span>
          </div>
        </>
      )}
    </button>
  );
};

export default SoundToggle;
