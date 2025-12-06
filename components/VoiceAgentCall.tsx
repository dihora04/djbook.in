
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Type } from '@google/genai';
import { findDjsForAi, checkAvailabilityForAi, createBookingForAi, createLeadForAi } from '../services/mockApiService';
import { PhoneIcon, XCircleIcon, LoaderIcon, CheckCircleIcon } from './icons';

// --- ICONS ---
const PhoneOffIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"></path><line x1="23" y1="1" x2="1" y2="23"></line></svg>
);
const PhoneIncomingIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2z"></path><line x1="23" y1="1" x2="17" y2="7"></line><line x1="17" y1="1" x2="23" y2="7"></line></svg>
);

// --- HELPER FUNCTIONS ---
function downsampleTo16k(inputData: Float32Array, inputSampleRate: number): Float32Array {
    if (inputSampleRate === 16000) return inputData;
    const ratio = inputSampleRate / 16000;
    const newLength = Math.round(inputData.length / ratio);
    const result = new Float32Array(newLength);
    for (let i = 0; i < newLength; i++) {
        const offset = i * ratio;
        const index = Math.floor(offset);
        const decimal = offset - index;
        const s1 = inputData[index] || 0;
        const s2 = inputData[index + 1] || s1;
        result[i] = s1 + (s2 - s1) * decimal;
    }
    return result;
}

function createBlob(data: Float32Array): { data: string, mimeType: string } {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
        int16[i] = Math.max(-1, Math.min(1, data[i])) * 32767;
    }
    let binary = '';
    const bytes = new Uint8Array(int16.buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return { data: btoa(binary), mimeType: 'audio/pcm;rate=16000' };
}

function decodeBase64(base64: string) {
    try {
        const binaryString = atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
    } catch (e) {
        console.error("Failed to decode base64 audio", e);
        return new Uint8Array(0);
    }
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
            channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
        }
    }
    return buffer;
}

// --- TOOLS ---
const tools = [
    {
        functionDeclarations: [
            {
                name: 'search_djs',
                description: 'Search for DJs based on location, genre, or name.',
                parameters: {
                    type: Type.OBJECT,
                    properties: {
                        location: { type: Type.STRING },
                        genre: { type: Type.STRING },
                        name: { type: Type.STRING }
                    }
                }
            },
            {
                name: 'check_availability',
                description: 'Check if a DJ is available on a specific date.',
                parameters: {
                    type: Type.OBJECT,
                    properties: {
                        djName: { type: Type.STRING },
                        date: { type: Type.STRING }
                    },
                    required: ['djName', 'date']
                }
            },
            {
                name: 'create_lead',
                description: 'Capture a detailed lead/booking request.',
                parameters: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING },
                        phone: { type: Type.STRING },
                        city: { type: Type.STRING },
                        event_type: { type: Type.STRING },
                        event_date: { type: Type.STRING },
                        guest_count: { type: Type.STRING },
                        budget: { type: Type.STRING },
                        requirements: { type: Type.STRING }
                    },
                    required: ['name', 'phone', 'city', 'event_type']
                }
            }
        ]
    }
];

const VoiceAgentCall: React.FC = () => {
    // States: 'idle' | 'ringing' | 'active' | 'ending'
    const [callState, setCallState] = useState<'idle' | 'ringing' | 'active' | 'ending'>('idle');
    const [statusText, setStatusText] = useState('');
    
    // API & Audio Refs
    const liveSessionRef = useRef<any>(null);
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const outputGainNodeRef = useRef<GainNode | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    
    const audioStreamRef = useRef<MediaStream | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
    const nextStartTimeRef = useRef<number>(0);
    
    // Visualizer Refs
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationFrameRef = useRef<number>(0);

    // Prompt instructions
    const SYSTEM_INSTRUCTION = `
    You are 'DJBook AI', a helpful and energetic FEMALE voice assistant for DJBook.in. 
    Speaking Style: Hinglish (Hindi + English mix). Friendly, polite, warm.
    Greeting: "Namaste! Main DJBook AI hoon. Bataiye aapke event ke liye main kaise help kar sakti hoon?"
    Role: Help users find DJs, check availability, and book.
    Goal: Capture leads (Name, Phone, City, Event Date, Budget).
    Note: Today is ${new Date().toDateString()}.
    `;

    const triggerIncomingCall = () => {
        setCallState('ringing');
    };

    const getApiKey = () => {
        try {
            return process.env.API_KEY;
        } catch (e) {
            console.warn("process.env.API_KEY is not accessible directly.");
            return undefined;
        }
    };

    // --- VISUALIZER DRAW LOOP ---
    const startVisualizer = () => {
        if (!analyserRef.current || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const analyser = analyserRef.current;
        
        if (!ctx) return;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const draw = () => {
            animationFrameRef.current = requestAnimationFrame(draw);
            // Safe check inside the loop
            if (!analyser || !ctx) return;
            
            try {
                analyser.getByteFrequencyData(dataArray);

                ctx.clearRect(0, 0, canvas.width, canvas.height);

                const bars = 20; // Number of bars to display
                const step = Math.floor(bufferLength / bars);
                const width = canvas.width / bars;

                for (let i = 0; i < bars; i++) {
                    const dataIndex = i * step;
                    const value = dataArray[dataIndex];
                    const percent = value / 255;
                    const height = canvas.height * percent * 0.8;
                    
                    const x = i * width;
                    const y = (canvas.height - height) / 2; // Center vertically

                    // Gradient
                    const gradient = ctx.createLinearGradient(0, y, 0, y + height);
                    gradient.addColorStop(0, '#00E5FF'); // Cyan
                    gradient.addColorStop(1, '#9b5cff'); // Violet

                    ctx.fillStyle = gradient;
                    
                    // Draw rounded bar
                    ctx.beginPath();
                    ctx.roundRect(x + 2, y, width - 4, Math.max(4, height), 4);
                    ctx.fill();
                }
            } catch (e) {
                // Silently fail frame
            }
        };
        draw();
    };

    const acceptCall = async () => {
        setCallState('active');
        setStatusText('Connecting...');

        try {
            // 1. Microphone Access
            try {
                if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                    throw new Error("Microphone not supported.");
                }
                const stream = await navigator.mediaDevices.getUserMedia({
                    audio: { sampleRate: 16000, channelCount: 1, echoCancellation: true }
                });
                audioStreamRef.current = stream;
            } catch (micError: any) {
                console.error("Microphone Access Error:", micError);
                throw new Error("Mic Access Denied. Check permissions.");
            }

            // 2. API Key
            const apiKey = getApiKey();
            if (!apiKey) throw new Error("API Key missing.");
            const ai = new GoogleGenAI({ apiKey });

            // 3. Audio Contexts Setup
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            
            // Input
            try {
                inputAudioContextRef.current = new AudioContext({ sampleRate: 16000 });
            } catch(e) {
                console.warn("Falling back to default sample rate input context");
                inputAudioContextRef.current = new AudioContext();
            }
            
            // Output & Visualizer Chain
            try {
                outputAudioContextRef.current = new AudioContext({ sampleRate: 24000 });
            } catch (e) {
                 outputAudioContextRef.current = new AudioContext();
            }
            
            const analyser = outputAudioContextRef.current.createAnalyser();
            analyser.fftSize = 256;
            analyser.smoothingTimeConstant = 0.6;
            analyserRef.current = analyser;
            
            const masterGain = outputAudioContextRef.current.createGain();
            outputGainNodeRef.current = masterGain;
            
            // Connect: Source (added later) -> MasterGain -> Analyser -> Destination
            masterGain.connect(analyser);
            analyser.connect(outputAudioContextRef.current.destination);

            // Resume audio contexts if suspended
            if (inputAudioContextRef.current?.state === 'suspended') await inputAudioContextRef.current.resume();
            if (outputAudioContextRef.current?.state === 'suspended') await outputAudioContextRef.current.resume();

            // Start Visualizer Loop
            setTimeout(startVisualizer, 100);

            // 4. Connect Gemini Live
            const sessionPromise = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                config: {
                    responseModalities: [Modality.AUDIO],
                    tools: tools,
                    systemInstruction: SYSTEM_INSTRUCTION,
                    speechConfig: {
                        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
                    }
                },
                callbacks: {
                    onopen: () => {
                        setStatusText('Live');
                        if (!inputAudioContextRef.current || !audioStreamRef.current) return;
                        
                        try {
                            const source = inputAudioContextRef.current.createMediaStreamSource(audioStreamRef.current);
                            const processor = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
                            scriptProcessorRef.current = processor;

                            processor.onaudioprocess = (e) => {
                                try {
                                    if (!inputAudioContextRef.current) return;
                                    const inputData = e.inputBuffer.getChannelData(0);
                                    const currentRate = inputAudioContextRef.current.sampleRate || 16000;
                                    const downsampled = downsampleTo16k(inputData, currentRate);
                                    const blob = createBlob(downsampled);
                                    sessionPromise.then(session => session.sendRealtimeInput({ media: blob }));
                                } catch (err) {
                                    console.error("Audio Process Error", err);
                                }
                            };

                            source.connect(processor);
                            processor.connect(inputAudioContextRef.current.destination);
                        } catch (e) {
                            console.error("Audio Pipeline Setup Error", e);
                            setStatusText("Audio Error");
                        }
                    },
                    onmessage: async (msg: LiveServerMessage) => {
                        try {
                            // Audio Out
                            const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                            if (audioData && outputAudioContextRef.current && outputGainNodeRef.current) {
                                const ctx = outputAudioContextRef.current;
                                nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
                                const decodedBytes = decodeBase64(audioData);
                                if (decodedBytes.length > 0) {
                                    const buffer = await decodeAudioData(decodedBytes, ctx, 24000, 1);
                                    const source = ctx.createBufferSource();
                                    source.buffer = buffer;
                                    // Connect to Master Gain (which goes to Analyser -> Speakers)
                                    source.connect(outputGainNodeRef.current);
                                    
                                    source.addEventListener('ended', () => audioSourcesRef.current.delete(source));
                                    source.start(nextStartTimeRef.current);
                                    nextStartTimeRef.current += buffer.duration;
                                    audioSourcesRef.current.add(source);
                                }
                            }

                            // Interruption
                            if (msg.serverContent?.interrupted) {
                                audioSourcesRef.current.forEach(src => {
                                    try { src.stop(); } catch(e){}
                                });
                                audioSourcesRef.current.clear();
                                if(outputAudioContextRef.current) nextStartTimeRef.current = outputAudioContextRef.current.currentTime;
                            }

                            // Function Calling
                            if (msg.toolCall) {
                                for (const fc of msg.toolCall.functionCalls) {
                                    let result = "";
                                    if (fc.name === 'search_djs') result = await findDjsForAi(fc.args as any);
                                    else if (fc.name === 'check_availability') result = await checkAvailabilityForAi(fc.args.djName as string, fc.args.date as string);
                                    else if (fc.name === 'create_lead') result = await createLeadForAi(fc.args);
                                    
                                    sessionPromise.then(session => {
                                        session.sendToolResponse({
                                            functionResponses: {
                                                id: fc.id,
                                                name: fc.name,
                                                response: { result }
                                            }
                                        });
                                    });
                                }
                            }
                        } catch (err) {
                            console.error("Msg Error", err);
                        }
                    },
                    onclose: () => endCall(),
                    onerror: (e) => {
                        console.error("Session Error:", e);
                        setStatusText("Connection Lost");
                        setTimeout(endCall, 2000);
                    }
                }
            });
            
            sessionPromise.catch(err => {
                console.error("Connection Handshake Failed:", err);
                setStatusText(`Connect Failed: ${err.message || 'Unknown'}`);
                setTimeout(endCall, 3000);
            });

            liveSessionRef.current = sessionPromise;

        } catch (error: any) {
            console.error("Setup Error:", error);
            setStatusText(error.message || "Call Failed");
            setTimeout(endCall, 3000);
        }
    };

    const endCall = () => {
        setCallState('idle');
        setStatusText('');
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        
        // Cleanup
        if (scriptProcessorRef.current) {
            try { scriptProcessorRef.current.disconnect(); } catch(e){}
            scriptProcessorRef.current = null;
        }
        if (audioStreamRef.current) {
            audioStreamRef.current.getTracks().forEach(t => t.stop());
            audioStreamRef.current = null;
        }
        if (inputAudioContextRef.current) {
            inputAudioContextRef.current.close().catch(console.error);
            inputAudioContextRef.current = null;
        }
        if (outputAudioContextRef.current) {
            outputAudioContextRef.current.close().catch(console.error);
            outputAudioContextRef.current = null;
        }
        if (liveSessionRef.current) {
            liveSessionRef.current.then((s: any) => s.close()).catch(console.error);
            liveSessionRef.current = null;
        }
    };

    // Render "Start Call" trigger button (simulated incoming call trigger)
    if (callState === 'idle') {
        return (
            <button
                onClick={triggerIncomingCall}
                className="fixed bottom-24 right-24 z-40 bg-green-500 hover:bg-green-400 text-white rounded-full p-4 shadow-lg hover:shadow-neon transition-all"
                title="Talk to DJBook AI"
            >
               <PhoneIncomingIcon />
            </button>
        );
    }

    // Incoming Call UI
    if (callState === 'ringing') {
        return (
            <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
                <div className="bg-brand-surface border border-white/10 rounded-3xl w-full max-w-sm p-8 flex flex-col items-center relative overflow-hidden shadow-2xl">
                    <div className="absolute inset-0 bg-brand-violet/10 animate-pulse"></div>
                    
                    {/* Caller Info */}
                    <div className="relative z-10 flex flex-col items-center mb-10 mt-6">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-brand-violet to-brand-cyan p-1 mb-4 shadow-[0_0_30px_rgba(155,92,255,0.5)]">
                            <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                                <span className="text-3xl">👩‍💻</span>
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold text-white">DJBook AI</h2>
                        <p className="text-brand-cyan animate-pulse">Incoming Voice Call...</p>
                        <p className="text-gray-400 text-sm mt-2">Namaste! Let's plan your event.</p>
                    </div>

                    {/* Actions */}
                    <div className="relative z-10 w-full flex justify-around items-center mt-auto">
                        <div className="flex flex-col items-center gap-2">
                            <button 
                                onClick={() => setCallState('idle')} 
                                className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-white shadow-lg transition-transform hover:scale-110"
                            >
                                <PhoneOffIcon />
                            </button>
                            <span className="text-sm text-gray-400">Decline</span>
                        </div>

                        <div className="flex flex-col items-center gap-2">
                            <button 
                                onClick={acceptCall} 
                                className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-400 flex items-center justify-center text-white shadow-lg shadow-green-500/30 animate-bounce-slow"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2z"></path></svg>
                            </button>
                            <span className="text-sm text-white font-bold">Accept</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Active Call UI
    return (
        <div className="fixed inset-0 z-[200] bg-black/90 flex flex-col items-center justify-center p-4">
            <div className="flex flex-col items-center gap-6 w-full max-w-md">
                <div className="relative">
                    {/* User Mic Active Indicator (Ripple) */}
                    <div className="absolute inset-0 bg-brand-cyan/20 rounded-full blur-xl animate-ping opacity-30"></div>
                    
                    <div className="w-32 h-32 rounded-full border-4 border-brand-cyan/50 flex items-center justify-center bg-black relative z-10 shadow-[0_0_50px_rgba(0,229,255,0.2)]">
                         <span className="text-4xl">👩‍💻</span>
                    </div>
                </div>
                
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-white mb-2">DJBook AI</h2>
                    <p className="text-brand-cyan font-mono text-lg tracking-wider">{statusText || 'Listening...'}</p>
                </div>

                {/* Real-time Frequency Visualizer */}
                <div className="w-full h-32 bg-white/5 rounded-2xl border border-white/10 p-4 flex items-center justify-center overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-brand-dark/50 z-10"></div>
                    <canvas ref={canvasRef} width={300} height={100} className="w-full h-full z-0"></canvas>
                </div>
                
                <p className="text-gray-500 text-xs mt-2">Voice & Intelligence by Google Gemini</p>
            </div>

            <button 
                onClick={endCall}
                className="mt-12 w-20 h-20 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-white shadow-2xl hover:scale-105 transition-all"
            >
                <PhoneOffIcon />
            </button>
        </div>
    );
};

export default VoiceAgentCall;
