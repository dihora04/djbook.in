import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

type ScaleName = 'major' | 'pentatonic' | 'minor';

interface MusicContextType {
    playNote: (freq: number, vel?: number, duration?: number) => void;
    playFocusSound: () => void;
    playClickSound: () => void;
    playHoverSound: () => void;
    setVolume: (vol: number) => void;
    setScale: (scale: ScaleName) => void;
    toggleAmbientMusic: () => void;
    volume: number;
    scale: ScaleName;
    isAmbientPlaying: boolean;
    isInitialized: boolean;
}

const MusicContext = createContext<MusicContextType | null>(null);

export const useMusic = () => {
    const context = useContext(MusicContext);
    if (!context) {
        throw new Error('useMusic must be used within a MusicProvider');
    }
    return context;
};

// --- Web Audio Synth Engine ---
const SCALES: Record<ScaleName, number[]> = {
  major: [0, 2, 4, 5, 7, 9, 11],      // Happy
  pentatonic: [0, 2, 4, 7, 9],      // Chill
  minor: [0, 2, 3, 5, 7, 8, 10]       // Moody
};
const ROOT_MIDI = 72; // C5, ~523.25Hz, close to the requested 528Hz

const midiToFreq = (midi: number) => 440 * Math.pow(2, (midi - 69) / 12);

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isInitialized, setIsInitialized] = useState(false);
    const [volume, setVolumeState] = useState(0.5);
    const [scale, setScale] = useState<ScaleName>('major');
    const [isAmbientPlaying, setIsAmbientPlaying] = useState(false);
    
    const audioCtxRef = useRef<AudioContext>();
    const masterGainRef = useRef<GainNode>();
    const reverbRef = useRef<{ node: ConvolverNode, level: GainNode }>();
    const ambientIntervalRef = useRef<number>();

    const initAudio = useCallback(() => {
        if (isInitialized) return;

        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        const masterGain = audioCtx.createGain();
        masterGain.gain.setValueAtTime(volume, audioCtx.currentTime);
        masterGain.connect(audioCtx.destination);
        
        // Create a simple reverb effect
        const reverbLevel = audioCtx.createGain();
        reverbLevel.gain.value = 1.5; // Wet level for reverb
        const convolver = audioCtx.createConvolver();
        
        // Generate an impulse response for reverb
        const impulseTime = 1.5;
        const impulseSampleRate = audioCtx.sampleRate;
        const impulseBuffer = audioCtx.createBuffer(2, impulseSampleRate * impulseTime, impulseSampleRate);
        for (let channel = 0; channel < 2; channel++) {
            const channelData = impulseBuffer.getChannelData(channel);
            for (let i = 0; i < channelData.length; i++) {
                channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / channelData.length, 2);
            }
        }
        convolver.buffer = impulseBuffer;
        reverbLevel.connect(convolver);
        convolver.connect(masterGain);

        audioCtxRef.current = audioCtx;
        masterGainRef.current = masterGain;
        reverbRef.current = { node: convolver, level: reverbLevel };
        
        setIsInitialized(true);
    }, [isInitialized, volume]);

    useEffect(() => {
        document.body.addEventListener('click', initAudio, { once: true });
        return () => document.body.removeEventListener('click', initAudio);
    }, [initAudio]);
    
    const setVolume = (vol: number) => {
        setVolumeState(vol);
        if (masterGainRef.current && audioCtxRef.current) {
            masterGainRef.current.gain.setValueAtTime(vol, audioCtxRef.current.currentTime);
        }
    };

    const playNote = useCallback((freq: number, vel = 0.7, duration = 0.8) => {
        if (!audioCtxRef.current || !masterGainRef.current || !reverbRef.current) return;
        
        const audioCtx = audioCtxRef.current;
        const masterGain = masterGainRef.current;
        const reverbLevel = reverbRef.current.level;
        const now = audioCtx.currentTime;

        const osc = audioCtx.createOscillator();
        const osc2 = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = 'sine';
        osc2.type = 'triangle';
        osc.frequency.value = freq;
        osc2.frequency.value = freq * 0.5;

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.3 * vel, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.1 * vel, now + 0.2);
        gain.gain.setValueAtTime(0.1 * vel, now + duration - 0.3);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        osc.connect(gain);
        osc2.connect(gain);
        gain.connect(masterGain);
        gain.connect(reverbLevel);

        osc.start(now);
        osc2.start(now);
        osc.stop(now + duration);
        osc2.stop(now + duration);
    }, []);
    
    const playArpeggio = (notes: number[], duration: number, delay: number) => {
        notes.forEach((midi, i) => {
            setTimeout(() => {
                playNote(midiToFreq(midi), 0.4, duration);
            }, i * delay);
        });
    };
    
    const playChord = (notes: number[], duration: number) => {
        notes.forEach((midi) => {
            playNote(midiToFreq(midi), 0.8, duration);
        });
    };
    
    const playFocusSound = useCallback(() => {
        if (!isInitialized) return;
        const s = SCALES[scale];
        playArpeggio([ROOT_MIDI, ROOT_MIDI + s[2], ROOT_MIDI + s[4], ROOT_MIDI + 12], 0.4, 60);
    }, [isInitialized, playNote, scale]);
    
    const playClickSound = useCallback(() => {
        if (!isInitialized) return;
        const s = SCALES[scale];
        playChord([ROOT_MIDI, ROOT_MIDI + s[2], ROOT_MIDI + s[4], ROOT_MIDI + 12], 1.0);
    }, [isInitialized, playNote, scale]);

    const playHoverSound = useCallback(() => {
        if (!isInitialized) return;
        playNote(midiToFreq(ROOT_MIDI + SCALES[scale][2]), 0.3, 0.4);
    }, [isInitialized, playNote, scale]);


    const toggleAmbientMusic = () => {
        setIsAmbientPlaying(prev => !prev);
    };
    
    useEffect(() => {
        if (isAmbientPlaying) {
            const chords = [
                [ROOT_MIDI, ROOT_MIDI + 4, ROOT_MIDI + 7],
                [ROOT_MIDI + 5, ROOT_MIDI + 9, ROOT_MIDI + 12],
                [ROOT_MIDI - 2, ROOT_MIDI + 2, ROOT_MIDI + 5],
                [ROOT_MIDI - 5, ROOT_MIDI - 1, ROOT_MIDI + 2]
            ];
            let chordIndex = 0;
            const playAmbientChord = () => {
                const chord = chords[chordIndex];
                chord.forEach((midi, i) => {
                    setTimeout(() => playNote(midiToFreq(midi - 12), 0.2, 2.5), i * 120);
                });
                chordIndex = (chordIndex + 1) % chords.length;
            };
            playAmbientChord();
            ambientIntervalRef.current = window.setInterval(playAmbientChord, 3000);
        } else {
            if (ambientIntervalRef.current) {
                clearInterval(ambientIntervalRef.current);
            }
        }
        return () => {
            if (ambientIntervalRef.current) clearInterval(ambientIntervalRef.current);
        };
    }, [isAmbientPlaying, playNote]);

    const value = {
        playNote,
        playFocusSound,
        playClickSound,
        playHoverSound,
        setVolume,
        setScale,
        toggleAmbientMusic,
        volume,
        scale,
        isAmbientPlaying,
        isInitialized
    };

    return <MusicContext.Provider value={value}>{children}</MusicContext.Provider>;
};
