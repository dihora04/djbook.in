import React, { useRef, useEffect } from 'react';

const CursorPianoEffect: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const notesRef = useRef<any[]>([]);
    const audioCtxRef = useRef<AudioContext | null>(null);
    const masterGainRef = useRef<GainNode | null>(null);
    const panNodeRef = useRef<StereoPannerNode | null>(null);
    const reverbLevelNodeRef = useRef<GainNode | null>(null);
    const lastMoveRef = useRef(0);

    // --- Refined settings for a "Happy & Soulful" experience ---
    const settings = {
        pianoMode: true,
        scale: 'major', // Changed to Major for a happier, uplifting feel
        reverb: 0.25,    // Increased for a more lush, ambient sound
        masterVol: 0.5, // Reduced to a comfortable medium level
        throttleMs: 80, // Increased to create more melodic spacing between notes
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: true });
        if (!ctx) return;

        // --- Visual Animation Logic (no changes here) ---
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
            const vx = (Math.random() - 0.5) * 1.1;
            const vy = -0.6 - Math.random() * 1.1;
            const life = 1800 + Math.random() * 1500;
            const rotate = (Math.random() - 0.5) * 0.6;
            const char = CHARS[Math.floor(Math.random() * CHARS.length)];
            const hue = 180 + Math.random() * 160;
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
                n.vy += 0.002;
                n.x += n.vx * 1.2;
                n.y += n.vy * 1.2;
                n.rotate += 0.002;
                n.alpha = 1 - (t * t * (3 - 2 * t));
                ctx.save();
                ctx.globalAlpha = n.alpha;
                ctx.font = `${n.size}px serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.translate(n.x, n.y);
                ctx.rotate(n.rotate);
                ctx.shadowBlur = 14 * (1 - t);
                ctx.shadowColor = `hsla(${n.hue},90%,55%,${0.6 * (1 - t)})`;
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
            minor: [0, 2, 3, 5, 7, 8, 10],
        };
        const ROOT = 60; // Middle C

        const ensureAudio = () => {
            if (audioCtxRef.current) return;
            const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
            audioCtxRef.current = audioCtx;
            
            masterGainRef.current = audioCtx.createGain();
            masterGainRef.current.gain.value = settings.masterVol;
            
            panNodeRef.current = audioCtx.createStereoPanner();
            
            reverbLevelNodeRef.current = audioCtx.createGain();
            
            const delay = audioCtx.createDelay(); delay.delayTime.value = 0.08;
            const fb = audioCtx.createGain(); fb.gain.value = 0.35;
            const lp = audioCtx.createBiquadFilter(); lp.frequency.value = 2500;
            delay.connect(lp); lp.connect(fb); fb.connect(delay);
            
            reverbLevelNodeRef.current.connect(delay);
            delay.connect(masterGainRef.current);
            masterGainRef.current.connect(panNodeRef.current);
            panNodeRef.current.connect(audioCtx.destination);
            delay.connect(audioCtx.destination);
            masterGainRef.current.connect(audioCtx.destination);
            reverbLevelNodeRef.current.gain.value = settings.reverb;
        };
        
        const playPiano = (freq: number, vel = 0.7, time = 0) => {
            if (!audioCtxRef.current || !masterGainRef.current || !reverbLevelNodeRef.current) ensureAudio();
            const audioCtx = audioCtxRef.current!;
            const masterGain = masterGainRef.current!;
            const reverbLevelNode = reverbLevelNodeRef.current!;

            const now = audioCtx.currentTime + time;
            
            // --- New Synth Voice ---
            const osc1 = audioCtx.createOscillator(); // Main tone
            const osc2 = audioCtx.createOscillator(); // Sub-bass/body
            const gainNode = audioCtx.createGain();
            const filter = audioCtx.createBiquadFilter();
            
            // Vibrato for soulful feel
            const lfo = audioCtx.createOscillator();
            const lfoGain = audioCtx.createGain();
            lfo.type = 'sine';
            lfo.frequency.value = 5 + Math.random() * 2; // Natural vibrato speed
            lfoGain.gain.value = 4; // Vibrato depth
            lfo.connect(lfoGain);
            lfoGain.connect(osc1.detune);

            // Tonal characteristics for a warmer, happier sound
            filter.type = 'lowpass';
            filter.frequency.value = 2500;
            filter.Q.value = 2;

            osc1.type = 'sawtooth'; // Richer, warmer harmonic content
            osc2.type = 'sine';    // Deep, clean fundamental tone

            osc1.frequency.value = freq;
            osc2.frequency.value = freq / 2; // One octave lower for body
            
            // Envelope (ADSR) for a softer attack and longer, soulful release
            const a = 0.02, d = 0.3, s = 0.2, r = 1.5; // Longer release for ambient feel
            const peak = Math.max(0.001, vel);
            gainNode.gain.setValueAtTime(0.0001, now);
            gainNode.gain.exponentialRampToValueAtTime(peak, now + a);
            gainNode.gain.exponentialRampToValueAtTime(peak * s, now + a + d);
            
            const dur = 0.5 + Math.random() * 0.4;
            gainNode.gain.setValueAtTime(peak * s, now + dur);
            gainNode.gain.exponentialRampToValueAtTime(0.0001, now + dur + r);

            // Routing
            osc1.connect(filter);
            osc2.connect(gainNode); // Mix sub-oscillator post-filter for clean bass
            filter.connect(gainNode);
            gainNode.connect(masterGain);
            gainNode.connect(reverbLevelNode);
            
            // Start/Stop
            lfo.start(now);
            osc1.start(now);
            osc2.start(now);
            const stopTime = now + dur + r + 0.2;
            lfo.stop(stopTime);
            osc1.stop(stopTime);
            osc2.stop(stopTime);
            
            setTimeout(() => { try { lfo.disconnect(); osc1.disconnect(); osc2.disconnect(); filter.disconnect(); gainNode.disconnect(); } catch (e) {} }, (stopTime - now) * 1000);
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
        
        // --- Event Handlers ---
        const handleMouseMove = (e: MouseEvent) => {
            const x = e.clientX / window.innerWidth;
            const y = e.clientY / window.innerHeight;
            
            spawnNote(e.clientX, e.clientY);
            
            if (!settings.pianoMode) return;
            const now = performance.now();
            if (now - lastMoveRef.current < settings.throttleMs) return;
            lastMoveRef.current = now;

            if (!audioCtxRef.current) {
                try {
                    ensureAudio();
                    if (audioCtxRef.current?.state === 'suspended') audioCtxRef.current.resume();
                } catch (e) { console.warn('audio init error', e); }
            }
            
            const freq = quantizeToScale(Math.min(0.999, Math.max(0, x)), settings.scale as any);
            const vel = 0.2 + (1 - Math.min(1, Math.max(0, y))) * 0.85;
            
            if (panNodeRef.current && audioCtxRef.current) panNodeRef.current.pan.setValueAtTime((x - 0.5) * 1.6, audioCtxRef.current.currentTime);
            playPiano(freq, vel, 0);
        };
        
        const handleClick = (e: MouseEvent) => {
            if (!settings.pianoMode) return;
            const x = e.clientX / window.innerWidth;
            const scaleKey = settings.scale as 'pentatonic' | 'major' | 'minor';
            const scale = SCALES[scaleKey];
            const baseIdx = Math.floor(Math.min((scale.length * 2) - 3, x * (scale.length * 2)));
            for (let i = 0; i < 3; i++) {
                const step = baseIdx + i;
                const octave = Math.floor(step / scale.length);
                const degree = step % scale.length;
                const midi = ROOT + octave * 12 + scale[degree];
                const freq = midiToFreq(midi);
                setTimeout(() => playPiano(freq, 0.9 - i * 0.15, 0), i * 120); // Slowed down arpeggio
            }
        };
        
        const handlePointerDown = () => {
            if (!audioCtxRef.current) ensureAudio();
            if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();
        };

        // --- Setup and Cleanup ---
        resize();
        let animationFrameId = requestAnimationFrame(animate);
        
        window.addEventListener('resize', resize);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('click', handleClick);
        document.addEventListener('pointerdown', handlePointerDown, { once: true });
        
        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('click', handleClick);
            if(audioCtxRef.current) {
                audioCtxRef.current.close().catch(console.error);
            }
        };

    }, []);

    return <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 99 }} />;
};

export default CursorPianoEffect;