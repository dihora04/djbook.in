
import React, { useRef, useEffect } from 'react';

const CursorPianoEffect: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const notesRef = useRef<any[]>([]);
    const audioCtxRef = useRef<AudioContext | null>(null);
    const masterGainRef = useRef<GainNode | null>(null);
    const panNodeRef = useRef<StereoPannerNode | null>(null);
    const reverbLevelNodeRef = useRef<GainNode | null>(null);
    const lastMoveRef = useRef(0);
    const backingOscillatorsRef = useRef<any[]>([]);
    const isBackingPlayingRef = useRef(false);

    // --- Ambient Settings ---
    const settings = {
        pianoMode: true,
        scale: 'minor', // C Minor for a deep, futuristic, premium vibe
        reverb: 0.4,    // Lush cinematic reverb
        masterVol: 0.4, // Non-distracting background level
        throttleMs: 100, // Slower, more deliberate piano notes
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: true });
        if (!ctx) return;

        // --- Visual Animation Logic ---
        const CHARS = ['♪', '♫', '✨', '♩', '♬', '⭐', '💫'];
        let DPR = Math.max(1, window.devicePixelRatio || 1);

        const resize = () => {
            DPR = Math.max(1, window.devicePixelRatio || 1);
            canvas.width = window.innerWidth * DPR;
            canvas.height = window.innerHeight * DPR;
            ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
        };
        
        const spawnNote = (x: number, y: number) => {
            const size = 14 + Math.random() * 26;
            const vx = (Math.random() - 0.5) * 0.8; // Slower movement
            const vy = -0.4 - Math.random() * 0.8; // Gentler float up
            const life = 2500 + Math.random() * 2000; // Longer life for floaty feel
            const rotate = (Math.random() - 0.5) * 0.4;
            const char = CHARS[Math.floor(Math.random() * CHARS.length)];
            const hue = 180 + Math.random() * 60; // Cyan/Blue hues for Neon look
            notesRef.current.push({ x, y, vx, vy, size, life, born: performance.now(), rotate, char, hue, alpha: 1 });
        };

        const animate = () => {
            if(!ctx || !canvas) return;
            ctx.clearRect(0, 0, canvas.width / DPR, canvas.height / DPR);
            const now = performance.now();
            for (let i = notesRef.current.length - 1; i >= 0; i--) {
                const n = notesRef.current[i];
                const age = now - n.born;
                const t = age / n.life;
                if (t >= 1) {
                    notesRef.current.splice(i, 1);
                    continue;
                }
                n.vy += 0.001; // Very light gravity
                n.x += n.vx * 1.0;
                n.y += n.vy * 1.0;
                n.rotate += 0.001;
                n.alpha = 1 - (t * t * (3 - 2 * t));
                ctx.save();
                ctx.globalAlpha = n.alpha * 0.6; // Slightly more transparent
                ctx.font = `${n.size}px serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.translate(n.x, n.y);
                ctx.rotate(n.rotate);
                // Neon Glow Effect
                ctx.shadowBlur = 20 * (1 - t);
                ctx.shadowColor = `hsla(${n.hue},90%,60%,${0.8 * (1 - t)})`;
                ctx.fillStyle = `rgba(255,255,255,${0.95 * (1 - t)})`;
                ctx.fillText(n.char, 0, 0);
                ctx.restore();
            }
            animationFrameId = requestAnimationFrame(animate);
        };

        // --- Web Audio Logic ---
        const midiToFreq = (m: number) => 440 * Math.pow(2, (m - 69) / 12);
        const SCALES = {
            pentatonic: [0, 2, 4, 7, 9],
            major: [0, 2, 4, 5, 7, 9, 11],
            minor: [0, 2, 3, 5, 7, 8, 10], // C Minor Natural
        };
        const ROOT = 48; // C3 - Lower root for deeper ambience

        const ensureAudio = () => {
            if (audioCtxRef.current) return;
            const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
            const audioCtx = new AudioContextClass();
            audioCtxRef.current = audioCtx;
            
            // Master Chain
            masterGainRef.current = audioCtx.createGain();
            masterGainRef.current.gain.value = settings.masterVol;
            
            // Stereo Panner for movement
            panNodeRef.current = audioCtx.createStereoPanner();
            
            // Cinematic Reverb Chain
            reverbLevelNodeRef.current = audioCtx.createGain();
            const delay = audioCtx.createDelay(); delay.delayTime.value = 0.15; // Longer pre-delay
            const fb = audioCtx.createGain(); fb.gain.value = 0.45; // Higher feedback
            const lp = audioCtx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2000; // Darker trails
            
            // Connect Delay Network
            delay.connect(lp); lp.connect(fb); fb.connect(delay);
            reverbLevelNodeRef.current.connect(delay);
            delay.connect(masterGainRef.current); // Send wet signal to master
            
            // Connect Direct Signals
            masterGainRef.current.connect(panNodeRef.current);
            panNodeRef.current.connect(audioCtx.destination);
            reverbLevelNodeRef.current.gain.value = settings.reverb;
        };

        // --- Ambient Pad Generator ---
        const startAmbientPad = () => {
            if (isBackingPlayingRef.current || !audioCtxRef.current || !masterGainRef.current) return;
            
            const ctx = audioCtxRef.current;
            const dest = masterGainRef.current;
            const now = ctx.currentTime;
            isBackingPlayingRef.current = true;

            // A warm, suspended chord: C2, G2, Bb2, D3 (Cm9 feel)
            const frequencies = [
                midiToFreq(36), // C2
                midiToFreq(43), // G2
                midiToFreq(46), // Bb2
                midiToFreq(50)  // D3
            ];

            frequencies.forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                const filter = ctx.createBiquadFilter();
                const panner = ctx.createStereoPanner();

                osc.type = i === 0 ? 'sawtooth' : 'sine'; // Bass is saw, others sine
                osc.frequency.value = freq;

                // Filter movement (breathe effect)
                filter.type = 'lowpass';
                filter.frequency.value = 400;
                filter.Q.value = 1;
                
                // LFO for filter cutoff to make it "breathe"
                const lfo = ctx.createOscillator();
                const lfoGain = ctx.createGain();
                lfo.type = 'sine';
                lfo.frequency.value = 0.1 + (Math.random() * 0.1); // Very slow
                lfoGain.gain.value = 200; // Modulate filter by +/- 200Hz
                lfo.connect(lfoGain);
                lfoGain.connect(filter.frequency);
                lfo.start(now);

                // Initial Gain
                gain.gain.setValueAtTime(0, now);
                gain.gain.linearRampToValueAtTime(i === 0 ? 0.15 : 0.08, now + 4); // Slow fade in (4s)

                // Panning (spread out)
                panner.pan.value = (i % 2 === 0 ? -1 : 1) * 0.4;

                // Connections
                osc.connect(filter);
                filter.connect(gain);
                gain.connect(panner);
                panner.connect(dest); // Send to master

                osc.start(now);
                
                backingOscillatorsRef.current.push({ osc, gain, lfo, lfoGain });
            });
        };
        
        const playPiano = (freq: number, vel = 0.7, time = 0) => {
            if (!audioCtxRef.current || !masterGainRef.current || !reverbLevelNodeRef.current) ensureAudio();
            const audioCtx = audioCtxRef.current!;
            const masterGain = masterGainRef.current!;
            const reverbLevelNode = reverbLevelNodeRef.current!;

            const now = audioCtx.currentTime + time;
            
            // --- Ethereal Piano Synth ---
            const osc1 = audioCtx.createOscillator(); 
            const osc2 = audioCtx.createOscillator(); 
            const gainNode = audioCtx.createGain();
            const filter = audioCtx.createBiquadFilter();
            
            // Filter setup for "Felt Piano" sound
            filter.type = 'lowpass';
            filter.frequency.value = 800 + (vel * 2000); // Velocity sensitive brightness
            filter.Q.value = 1;

            osc1.type = 'triangle'; // Softer than saw
            osc2.type = 'sine';    

            osc1.frequency.value = freq;
            osc2.frequency.value = freq; // Unison for pure tone, or detune slightly
            osc2.detune.value = 5; // Slight chorus effect
            
            // ADSR Envelope
            const a = 0.05, d = 0.5, s = 0.1, r = 2.5; // Long release for "Dreamy" feel
            const peak = Math.max(0.001, vel * 0.6);
            
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(peak, now + a);
            gainNode.gain.exponentialRampToValueAtTime(peak * s, now + a + d);
            gainNode.gain.exponentialRampToValueAtTime(0.0001, now + a + d + r);

            // Connections
            osc1.connect(filter);
            osc2.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(masterGain); // Dry
            gainNode.connect(reverbLevelNode); // Wet
            
            osc1.start(now);
            osc2.start(now);
            const stopTime = now + a + d + r + 1;
            osc1.stop(stopTime);
            osc2.stop(stopTime);
            
            setTimeout(() => { try { osc1.disconnect(); osc2.disconnect(); filter.disconnect(); gainNode.disconnect(); } catch (e) {} }, (stopTime - now) * 1000);
        };

        const quantizeToScale = (x: number, scaleName: 'pentatonic' | 'major' | 'minor') => {
            const scale = SCALES[scaleName];
            const steps = scale.length * 2;
            const idx = Math.floor(Math.min(steps - 1, Math.max(0, x * steps)));
            const octave = Math.floor(idx / scale.length);
            const degree = idx % scale.length;
            const midi = ROOT + octave * 12 + scale[degree];
            return midiToFreq(midi);
        };
        
        // --- Interaction Handlers ---
        const handleMouseMove = (e: MouseEvent) => {
            const x = e.clientX / window.innerWidth;
            const y = e.clientY / window.innerHeight;
            
            // Spawn visual particle
            spawnNote(e.clientX, e.clientY);
            
            if (!settings.pianoMode) return;
            const now = performance.now();
            if (now - lastMoveRef.current < settings.throttleMs) return;
            lastMoveRef.current = now;

            // Init Audio Context on first user interaction (browser policy)
            if (!audioCtxRef.current) {
                try {
                    ensureAudio();
                    if (audioCtxRef.current?.state === 'suspended') audioCtxRef.current.resume();
                    // Start the ambient loop once user interacts
                    startAmbientPad();
                } catch (e) { console.warn('audio init error', e); }
            } else if (audioCtxRef.current.state === 'running' && !isBackingPlayingRef.current) {
                startAmbientPad();
            }
            
            // Calculate Pitch based on X axis
            const freq = quantizeToScale(Math.min(0.999, Math.max(0, x)), settings.scale as any);
            // Velocity based on Y axis (Higher = Softer/Airier, Lower = Louder)
            const vel = 0.3 + (1 - Math.min(1, Math.max(0, y))) * 0.5;
            
            // Panning based on Mouse X
            if (panNodeRef.current && audioCtxRef.current) {
                const panVal = (x - 0.5) * 1.2;
                panNodeRef.current.pan.setTargetAtTime(panVal, audioCtxRef.current.currentTime, 0.1);
            }
            
            playPiano(freq, vel, 0);
        };
        
        const handleInteractionStart = () => {
            if (!audioCtxRef.current) ensureAudio();
            if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
                audioCtxRef.current.resume();
                startAmbientPad();
            }
        };

        // --- Setup and Cleanup ---
        resize();
        let animationFrameId = requestAnimationFrame(animate);
        
        window.addEventListener('resize', resize);
        window.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('click', handleInteractionStart);
        document.addEventListener('keydown', handleInteractionStart);
        
        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('click', handleInteractionStart);
            document.removeEventListener('keydown', handleInteractionStart);
            
            // Cleanup Oscillators
            backingOscillatorsRef.current.forEach(node => {
                try {
                    node.osc.stop();
                    node.lfo.stop();
                    node.osc.disconnect();
                } catch(e){}
            });

            if(audioCtxRef.current) {
                audioCtxRef.current.close().catch(console.error);
            }
        };

    }, []);

    return <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 99 }} />;
};

export default CursorPianoEffect;
