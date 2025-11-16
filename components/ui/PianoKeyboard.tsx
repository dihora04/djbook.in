import React, { useState } from 'react';
import { useMusic } from './MusicProvider';

const midiToFreq = (midi: number) => 440 * Math.pow(2, (midi - 69) / 12);
const ROOT_MIDI = 60; // C4

// FIX: Define props with an interface and use React.FC to correctly handle the 'key' prop.
interface PianoKeyProps {
    note: number;
    isBlack: boolean;
    onPlay: (note: number) => void;
}

const PianoKey: React.FC<PianoKeyProps> = ({ note, isBlack, onPlay }) => {
    const [isActive, setIsActive] = useState(false);
    
    const handlePress = () => {
        onPlay(note);
        setIsActive(true);
        setTimeout(() => setIsActive(false), 200);
    };
    
    const baseWhiteStyle = "w-[calc(100%/14)] h-40 border border-t-0 border-gray-700 rounded-b-lg transition-all duration-100 ease-in-out cursor-pointer relative overflow-hidden";
    const baseBlackStyle = "w-[calc(100%/14*0.6)] h-24 bg-brand-dark border border-gray-600 rounded-b-md absolute -ml-[calc(100%/14*0.3)] z-10 transition-all duration-100 ease-in-out cursor-pointer";
    
    const activeWhiteStyle = "bg-brand-cyan/50 transform translate-y-1";
    const activeBlackStyle = "bg-brand-cyan/80 h-[92px]";

    const keyStyle = isBlack
        ? `${baseBlackStyle} ${isActive ? activeBlackStyle : 'hover:bg-gray-800'}`
        : `${baseWhiteStyle} ${isActive ? activeWhiteStyle : 'bg-white/10 hover:bg-white/20'}`;

    // FIX: The original black key positioning logic was incorrect and would not render keys properly.
    // This new logic calculates the position based on the number of white keys before it.
    const getBlackKeyPosition = () => {
        if (!isBlack) return {};
        
        const whiteKeyMidiOffsetsInOctave = [0, 2, 4, 5, 7, 9, 11];
        
        const octave = Math.floor((note - ROOT_MIDI) / 12);
        const noteInOctave = note % 12;
        
        const whiteKeysInPreviousOctaves = octave * 7;
        const whiteKeysInCurrentOctave = whiteKeyMidiOffsetsInOctave.filter(offset => offset < noteInOctave).length;
        
        const totalWhiteKeysBefore = whiteKeysInPreviousOctaves + whiteKeysInCurrentOctave;
        const whiteKeyWidthPercent = 100 / 14;
        
        return { left: `${totalWhiteKeysBefore * whiteKeyWidthPercent}%` };
    };

    const keyPositionStyle = getBlackKeyPosition();
    
    return <div style={keyPositionStyle} className={keyStyle} onMouseDown={handlePress}></div>;
};

const PianoKeyboard: React.FC = () => {
    const { playNote, isInitialized } = useMusic();
    const keyPattern = ['w', 'b', 'w', 'b', 'w', 'w', 'b', 'w', 'b', 'w', 'b', 'w'];
    const numOctaves = 2;
    const notes: { note: number; isBlack: boolean }[] = [];

    for (let oct = 0; oct < numOctaves; oct++) {
        for (let i = 0; i < 12; i++) {
            if (keyPattern[i] === 'w') {
                notes.push({ note: ROOT_MIDI + oct * 12 + i, isBlack: false });
            }
        }
    }
    const blackNotes = Array.from({ length: numOctaves * 12 }, (_, i) => ROOT_MIDI + i)
        .filter(note => keyPattern[note % 12] === 'b');
    
    const handlePlayNote = (midiNote: number) => {
        playNote(midiToFreq(midiNote), 1.0, 1.0);
    };

    if (!isInitialized) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 h-44 z-40 flex justify-center items-end pointer-events-none opacity-80 hover:opacity-100 transition-opacity">
            <div className="w-full max-w-2xl relative flex pointer-events-auto">
                {notes.map(({ note }) => (
                     <PianoKey key={note} note={note} isBlack={false} onPlay={handlePlayNote} />
                ))}
                 {blackNotes.map((note) => (
                    <PianoKey key={note} note={note} isBlack={true} onPlay={handlePlayNote} />
                ))}
            </div>
        </div>
    );
};

export default PianoKeyboard;