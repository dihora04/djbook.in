
import React, { createContext, useContext, useRef, useState, useEffect, useCallback } from 'react';

interface SoundContextType {
  isEnabled: boolean;
  toggleSound: () => void;
  playHoverChord: (type: 'starter' | 'professional' | 'elite') => void;
  playSuccessSound: () => void;
  playClickSound: () => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export const useSound = () => {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error('useSound must be used within a SoundProvider');
  }
  return context;
};

export const SoundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isEnabled, setIsEnabled] = useState(false);
  
  // Audio Graph References
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const compressorRef = useRef<DynamicsCompressorNode | null>(null);
  
  // Scheduling References
  const timerIDRef = useRef<number | undefined>(undefined);
  const nextNoteTimeRef = useRef<number>(0.0);
  const current16thNoteRef = useRef<number>(0);
  const beatCountRef = useRef<number>(0); // Total beats elapsed for long patterns

  // Configuration
  const TEMPO = 80;
  const SECONDS_PER_BEAT = 60.0 / TEMPO;
  const SCHEDULE_AHEAD_TIME = 0.1; // How far ahead to schedule audio (seconds)
  const LOOKAHEAD = 25.0; // How frequently to call scheduling function (ms)

  // --- INITIALIZATION ---
  const initAudio = () => {
    if (audioCtxRef.current) return;

    const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
    const ctx = new AudioContextClass();
    audioCtxRef.current = ctx;

    // Master Bus Chain: Source -> Compressor -> MasterGain -> Destination
    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.value = -24;
    compressor.knee.value = 30;
    compressor.ratio.value = 12;
    compressor.attack.value = 0.003;
    compressor.release.value = 0.25;
    compressorRef.current = compressor;

    const masterGain = ctx.createGain();
    masterGain.gain.value = 0.4; // Default volume
    masterGainRef.current = masterGain;

    compressor.connect(masterGain);
    masterGain.connect(ctx.destination);
  };

  // --- INSTRUMENT SYNTHESIZERS ---

  const playKick = (time: number) => {
    const ctx = audioCtxRef.current;
    if (!ctx || !compressorRef.current) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    // Pitch Envelope (Drop from 150Hz to 50Hz)
    osc.frequency.setValueAtTime(150, time);
    osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.5);

    // Amplitude Envelope
    gain.gain.setValueAtTime(0.8, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.5);

    osc.connect(gain);
    gain.connect(compressorRef.current);

    osc.start(time);
    osc.stop(time + 0.5);
  };

  const playSnare = (time: number) => {
    const ctx = audioCtxRef.current;
    if (!ctx || !compressorRef.current) return;

    // Noise Burst
    const bufferSize = ctx.sampleRate * 0.1; // 0.1s noise
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1);
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    // Filter for "Rimshot/Snare" tone
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1800;
    filter.Q.value = 1;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.4, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(compressorRef.current);

    noise.start(time);
  };

  const playHiHat = (time: number, velocity: number = 1) => {
    const ctx = audioCtxRef.current;
    if (!ctx || !compressorRef.current) return;

    const bufferSize = ctx.sampleRate * 0.05;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1);
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 7000;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.08 * velocity, time); // Lower volume for background
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.04);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(compressorRef.current);

    noise.start(time);
  };

  const playPadChord = (time: number, freqs: number[]) => {
    const ctx = audioCtxRef.current;
    if (!ctx || !compressorRef.current) return;

    const masterPadGain = ctx.createGain();
    masterPadGain.gain.value = 0.05; // Very quiet ambient layer
    masterPadGain.connect(compressorRef.current);

    freqs.forEach((f, i) => {
        const osc = ctx.createOscillator();
        osc.type = i === 0 ? 'triangle' : 'sine';
        osc.frequency.value = f;

        // Detune for warmth
        osc.detune.value = Math.random() * 10 - 5;

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(0.1, time + 1); // Slow attack
        gain.gain.linearRampToValueAtTime(0, time + 7); // Slow release (2 bars approx)

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(300, time);
        filter.frequency.linearRampToValueAtTime(800, time + 3); // Filter sweep

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(masterPadGain);

        osc.start(time);
        osc.stop(time + 8);
    });
  };
  
  const playMelodyPluck = (time: number, freq: number) => {
      const ctx = audioCtxRef.current;
      if (!ctx || !compressorRef.current) return;
      
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(0.03, time + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.5);
      
      // Simple delay effect
      const delay = ctx.createDelay();
      delay.delayTime.value = 0.3;
      const delayGain = ctx.createGain();
      delayGain.gain.value = 0.3;
      
      osc.connect(gain);
      gain.connect(compressorRef.current);
      gain.connect(delay);
      delay.connect(delayGain);
      delayGain.connect(compressorRef.current);
      
      osc.start(time);
      osc.stop(time + 1);
  };

  // --- SCHEDULER ---

  const scheduleNote = (beatIndex: number, time: number) => {
    // Lo-Fi Drum Pattern (16 steps)
    // Kick: 1, ... 8?, 11? (Syncopated)
    if (beatIndex === 0 || beatIndex === 10) {
        playKick(time);
    }
    
    // Snare: 4, 12 (Backbeat)
    if (beatIndex === 4 || beatIndex === 12) {
        playSnare(time);
    }
    
    // Hats: Every other, with some shuffle
    if (beatIndex % 2 === 0) {
        // Randomize velocity for human feel
        playHiHat(time, Math.random() * 0.3 + 0.7); 
    } else if (Math.random() > 0.8) {
        // Occasional ghost note
        playHiHat(time, 0.2); 
    }

    // Pad Chords: Change every 32 beats (2 bars)
    const totalBeats = beatCountRef.current + (beatIndex / 16); // rough approximation
    if (beatIndex === 0 && beatCountRef.current % 32 === 0) {
         // Cm9 (C, Eb, G, Bb, D)
         playPadChord(time, [130.81, 155.56, 196.00, 233.08]);
    } else if (beatIndex === 0 && beatCountRef.current % 32 === 16) {
         // Fm9 (F, Ab, C, Eb, G)
         playPadChord(time, [174.61, 207.65, 261.63, 311.13]);
    }
    
    // Minimal Melody: Sparse notes
    // E.g. on beat 2 and 14 of the first bar
    if (beatCountRef.current % 16 === 0) {
        if (beatIndex === 2) playMelodyPluck(time, 523.25); // C5
        if (beatIndex === 14) playMelodyPluck(time, 587.33); // D5
    }
  };

  const nextNote = () => {
    const secondsPer16th = SECONDS_PER_BEAT / 4;
    nextNoteTimeRef.current += secondsPer16th;
    
    current16thNoteRef.current++;
    if (current16thNoteRef.current === 16) {
      current16thNoteRef.current = 0;
      beatCountRef.current += 16; 
    }
  };

  const scheduler = () => {
    if (!audioCtxRef.current) return;

    // while there are notes that will need to play before the next interval, schedule them and advance the pointer.
    while (nextNoteTimeRef.current < audioCtxRef.current.currentTime + SCHEDULE_AHEAD_TIME) {
      scheduleNote(current16thNoteRef.current, nextNoteTimeRef.current);
      nextNote();
    }
    timerIDRef.current = window.setTimeout(scheduler, LOOKAHEAD);
  };

  // --- PUBLIC CONTROLS ---

  const toggleSound = () => {
    if (isEnabled) {
      // Stop
      setIsEnabled(false);
      if (timerIDRef.current) clearTimeout(timerIDRef.current);
      
      // Graceful fade out
      if (masterGainRef.current && audioCtxRef.current) {
          masterGainRef.current.gain.setTargetAtTime(0, audioCtxRef.current.currentTime, 0.5);
      }
    } else {
      // Start
      initAudio();
      if (audioCtxRef.current?.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      
      if (masterGainRef.current && audioCtxRef.current) {
          masterGainRef.current.gain.setValueAtTime(0.4, audioCtxRef.current.currentTime);
          // Reset scheduler
          nextNoteTimeRef.current = audioCtxRef.current.currentTime + 0.1;
          current16thNoteRef.current = 0;
          beatCountRef.current = 0;
          scheduler();
      }
      setIsEnabled(true);
    }
  };

  // --- UI FX ---
  const playHoverChord = (type: 'starter' | 'professional' | 'elite') => {
      if (!isEnabled || !audioCtxRef.current || !compressorRef.current) return;
      const ctx = audioCtxRef.current;
      const now = ctx.currentTime;

      const freqs = type === 'starter' ? [261.63, 329.63, 392.00] // C Maj
                  : type === 'professional' ? [261.63, 311.13, 392.00, 466.16] // C Min 7
                  : [261.63, 329.63, 392.00, 493.88, 587.33]; // C Maj 9

      freqs.forEach((f) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.frequency.value = f;
          osc.type = 'sine';
          
          gain.gain.setValueAtTime(0, now);
          gain.gain.linearRampToValueAtTime(0.05, now + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
          
          osc.connect(gain);
          gain.connect(compressorRef.current!);
          osc.start(now);
          osc.stop(now + 0.7);
      });
  };

  const playSuccessSound = () => {
      if (!isEnabled || !audioCtxRef.current || !compressorRef.current) return;
      const ctx = audioCtxRef.current;
      const now = ctx.currentTime;
      // Ascending Chime
      [523.25, 659.25, 783.99, 1046.50].forEach((f, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.value = f;
          
          const t = now + i * 0.1;
          gain.gain.setValueAtTime(0, t);
          gain.gain.linearRampToValueAtTime(0.05, t + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
          
          osc.connect(gain);
          gain.connect(compressorRef.current!);
          osc.start(t);
          osc.stop(t + 0.6);
      });
  };

  const playClickSound = () => {
       if (!isEnabled || !audioCtxRef.current || !compressorRef.current) return;
       const ctx = audioCtxRef.current;
       const osc = ctx.createOscillator();
       const gain = ctx.createGain();
       osc.frequency.setValueAtTime(800, ctx.currentTime);
       gain.gain.setValueAtTime(0.02, ctx.currentTime);
       gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
       osc.connect(gain);
       gain.connect(compressorRef.current);
       osc.start();
       osc.stop(ctx.currentTime + 0.06);
  };

  return (
    <SoundContext.Provider value={{ isEnabled, toggleSound, playHoverChord, playSuccessSound, playClickSound }}>
      {children}
    </SoundContext.Provider>
  );
};
