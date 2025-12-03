
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, FunctionDeclaration, Type, LiveServerMessage, Modality } from '@google/genai';
import { findDjsForAi, checkAvailabilityForAi, createBookingForAi } from '../services/mockApiService';
import { LoaderIcon, CheckCircleIcon, XCircleIcon, PhoneIcon } from './icons';

// --- ICONS ---
const ChatIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
);
const SendIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
);
const MicIcon = ({ active }: { active: boolean }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={active ? "text-red-500 animate-pulse" : ""}><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
);
const SpeakerIcon = ({ active }: { active: boolean }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
);
const RobotIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"></rect><circle cx="12" cy="5" r="2"></circle><path d="M12 7v4"></path><line x1="8" y1="16" x2="8" y2="16"></line><line x1="16" y1="16" x2="16" y2="16"></line></svg>
);
const EndCallIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"></path><line x1="23" y1="1" x2="1" y2="23"></line></svg>
);
const HeadphoneIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"></path><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path></svg>
);

// --- TYPES ---
interface Message {
    id: string;
    role: 'user' | 'model';
    text: string;
}

// --- AUDIO UTILS ---
function createBlob(data: Float32Array): { data: string, mimeType: string } {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
        int16[i] = Math.max(-1, Math.min(1, data[i])) * 32767;
    }
    
    // Simple Binary to Base64 conversion
    let binary = '';
    const bytes = new Uint8Array(int16.buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    
    return {
        data: btoa(binary),
        mimeType: 'audio/pcm;rate=16000',
    };
}

function decodeBase64(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

async function decodeAudioData(
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
): Promise<AudioBuffer> {
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


// --- TOOLS DEFINITION ---
const tools = [
    {
        functionDeclarations: [
            {
                name: 'search_djs',
                description: 'Search for DJs based on location, genre, or name.',
                parameters: {
                    type: Type.OBJECT,
                    properties: {
                        location: { type: Type.STRING, description: 'City or state' },
                        genre: { type: Type.STRING, description: 'Music genre like Bollywood, EDM, etc.' },
                        name: { type: Type.STRING, description: 'Specific DJ name' }
                    }
                }
            },
            {
                name: 'check_availability',
                description: 'Check if a DJ is available on a specific date.',
                parameters: {
                    type: Type.OBJECT,
                    properties: {
                        djName: { type: Type.STRING, description: 'Name of the DJ' },
                        date: { type: Type.STRING, description: 'Date in YYYY-MM-DD format' }
                    },
                    required: ['djName', 'date']
                }
            },
            {
                name: 'book_dj',
                description: 'Create a booking inquiry for a DJ.',
                parameters: {
                    type: Type.OBJECT,
                    properties: {
                        djName: { type: Type.STRING, description: 'Name of the DJ to book' },
                        customerName: { type: Type.STRING, description: 'Name of the customer' },
                        date: { type: Type.STRING, description: 'Event date' },
                        requirements: { type: Type.STRING, description: 'Any specific event details or notes' }
                    },
                    required: ['djName', 'customerName', 'date']
                }
            }
        ]
    }
];

const ChatBot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', role: 'model', text: "Hey! I'm your AI Booking Agent. Looking for a DJ in Mumbai or Delhi? Or maybe checking availability for a specific artist?" }
    ]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [voiceMode, setVoiceMode] = useState(false); // TTS for text chat
    const [isListening, setIsListening] = useState(false); // Text chat dictation
    const [isLiveCallActive, setIsLiveCallActive] = useState(false); // Live API State
    const [liveStatus, setLiveStatus] = useState<string>('');

    // Refs for Text Chat
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatRef = useRef<any>(null); // GoogleGenAI Chat Session
    const recognitionRef = useRef<any>(null); // SpeechRecognition

    // Refs for Live Call
    const liveSessionRef = useRef<any>(null);
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const audioStreamRef = useRef<MediaStream | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
    const nextStartTimeRef = useRef<number>(0);

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isOpen]);

    // Initialize Gemini Chat (Text Mode)
    useEffect(() => {
        const initChat = async () => {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            chatRef.current = ai.chats.create({
                model: 'gemini-3-pro-preview',
                config: {
                    tools: tools,
                    systemInstruction: `You are an expert DJ Booking Assistant for 'DJBook.in'. 
                    Rules: Check availability before booking. Use search_djs for finding artists. 
                    Today: ${new Date().toDateString()}. Currency: INR.`,
                },
            });
        };
        initChat();

        // Init Speech Recognition for Text Mode
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                setInputText(transcript);
                handleSend(transcript);
                setIsListening(false);
            };

            recognitionRef.current.onerror = () => { setIsListening(false); };
            recognitionRef.current.onend = () => { setIsListening(false); };
        }
    }, []);

    // --- TEXT CHAT FUNCTIONS ---

    const speak = (text: string) => {
        if (!voiceMode || isLiveCallActive) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => v.name.includes('Google US English')) || voices[0];
        if (preferredVoice) utterance.voice = preferredVoice;
        utterance.rate = 1.1;
        window.speechSynthesis.speak(utterance);
    };

    const toggleListening = () => {
        if (isLiveCallActive) return;
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
        } else {
            try {
                recognitionRef.current?.start();
                setIsListening(true);
            } catch (e) {
                console.error("Mic error", e);
            }
        }
    };

    const handleSend = async (textOverride?: string) => {
        const text = textOverride || inputText;
        if (!text.trim() || !chatRef.current) return;

        const userMsg: Message = { id: Date.now().toString(), role: 'user', text };
        setMessages(prev => [...prev, userMsg]);
        setInputText('');
        setIsLoading(true);

        try {
            let response = await chatRef.current.sendMessage({ message: text });
            
            let functionCalls = response.candidates?.[0]?.content?.parts?.filter((part: any) => part.functionCall);

            while (functionCalls && functionCalls.length > 0) {
                const parts: any[] = [];
                for (const callPart of functionCalls) {
                    const call = callPart.functionCall;
                    let result = "";
                    if (call.name === 'search_djs') result = await findDjsForAi(call.args as any);
                    else if (call.name === 'check_availability') result = await checkAvailabilityForAi(call.args.djName, call.args.date);
                    else if (call.name === 'book_dj') result = await createBookingForAi(call.args.djName, call.args.customerName, call.args.date, call.args.requirements || '');

                    parts.push({
                        functionResponse: {
                            id: call.id,
                            name: call.name,
                            response: { result: result }
                        }
                    });
                }
                response = await chatRef.current.sendMessage({ message: parts });
                functionCalls = response.candidates?.[0]?.content?.parts?.filter((part: any) => part.functionCall);
            }

            const modelText = response.text;
            if (modelText) {
                setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: modelText }]);
                speak(modelText);
            }

        } catch (error: any) {
            setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: `Error: ${error.message || "Something went wrong."}` }]);
        } finally {
            setIsLoading(false);
        }
    };


    // --- LIVE CALL FUNCTIONS ---

    const startLiveCall = async () => {
        try {
            setIsLiveCallActive(true);
            setLiveStatus('Connecting...');
            window.speechSynthesis.cancel(); // Stop any TTS

            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            // 1. Audio Contexts
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            inputAudioContextRef.current = new AudioContext({ sampleRate: 16000 });
            outputAudioContextRef.current = new AudioContext({ sampleRate: 24000 });
            
            // 2. Microphone Stream
            audioStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            // 3. Connect to Live API
            const sessionPromise = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                config: {
                    responseModalities: [Modality.AUDIO],
                    tools: tools,
                    systemInstruction: "You are a helpful, energetic voice assistant for DJBook.in. Help users find DJs and book them. Keep responses concise and conversational.",
                },
                callbacks: {
                    onopen: () => {
                        setLiveStatus('Live');
                        // Start Audio Streaming
                        if (!inputAudioContextRef.current || !audioStreamRef.current) return;
                        
                        const source = inputAudioContextRef.current.createMediaStreamSource(audioStreamRef.current);
                        const processor = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
                        scriptProcessorRef.current = processor;
                        
                        processor.onaudioprocess = (e) => {
                            const inputData = e.inputBuffer.getChannelData(0);
                            const pcmBlob = createBlob(inputData);
                            sessionPromise.then(session => {
                                session.sendRealtimeInput({ media: pcmBlob });
                            });
                        };
                        
                        source.connect(processor);
                        processor.connect(inputAudioContextRef.current.destination);
                    },
                    onmessage: async (msg: LiveServerMessage) => {
                        // Handle Audio Output
                        const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                        if (audioData && outputAudioContextRef.current) {
                            const ctx = outputAudioContextRef.current;
                            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
                            
                            const buffer = await decodeAudioData(
                                decodeBase64(audioData),
                                ctx,
                                24000,
                                1
                            );
                            
                            const source = ctx.createBufferSource();
                            source.buffer = buffer;
                            source.connect(ctx.destination);
                            
                            source.addEventListener('ended', () => {
                                audioSourcesRef.current.delete(source);
                            });
                            
                            source.start(nextStartTimeRef.current);
                            nextStartTimeRef.current += buffer.duration;
                            audioSourcesRef.current.add(source);
                        }
                        
                        // Handle Interruptions
                        if (msg.serverContent?.interrupted) {
                             audioSourcesRef.current.forEach(src => src.stop());
                             audioSourcesRef.current.clear();
                             if (outputAudioContextRef.current) nextStartTimeRef.current = outputAudioContextRef.current.currentTime;
                        }

                        // Handle Tool Calls
                        if (msg.toolCall) {
                            for (const fc of msg.toolCall.functionCalls) {
                                console.log('Live Tool Call:', fc.name, fc.args);
                                let result = "";
                                if (fc.name === 'search_djs') result = await findDjsForAi(fc.args as any);
                                else if (fc.name === 'check_availability') result = await checkAvailabilityForAi(fc.args.djName as string, fc.args.date as string);
                                else if (fc.name === 'book_dj') result = await createBookingForAi(fc.args.djName as string, fc.args.customerName as string, fc.args.date as string, fc.args.requirements as string || '');
                                
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
                    },
                    onclose: () => {
                        console.log("Live session closed");
                        endLiveCall();
                    },
                    onerror: (e) => {
                        console.error("Live session error", e);
                        setLiveStatus('Error');
                        setTimeout(endLiveCall, 2000);
                    }
                }
            });
            
            liveSessionRef.current = sessionPromise;

        } catch (error) {
            console.error("Failed to start live call", error);
            endLiveCall();
        }
    };

    const endLiveCall = () => {
        setIsLiveCallActive(false);
        setLiveStatus('');
        
        // Cleanup Audio
        if (scriptProcessorRef.current) {
            scriptProcessorRef.current.disconnect();
            scriptProcessorRef.current = null;
        }
        if (audioStreamRef.current) {
            audioStreamRef.current.getTracks().forEach(t => t.stop());
            audioStreamRef.current = null;
        }
        if (inputAudioContextRef.current) {
            inputAudioContextRef.current.close();
            inputAudioContextRef.current = null;
        }
        if (outputAudioContextRef.current) {
            outputAudioContextRef.current.close();
            outputAudioContextRef.current = null;
        }
        
        // Close Session
        if (liveSessionRef.current) {
            liveSessionRef.current.then((session: any) => session.close());
            liveSessionRef.current = null;
        }
    };


    return (
        <div className="fixed bottom-24 right-6 z-50 flex flex-col items-end">
            
            {/* Chat Window */}
            {isOpen && (
                <div className="mb-4 w-[350px] md:w-[400px] h-[500px] bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-brand-cyan/20 flex flex-col overflow-hidden animate-slideUp origin-bottom-right relative">
                    
                    {/* LIVE CALL OVERLAY */}
                    {isLiveCallActive && (
                        <div className="absolute inset-0 z-20 bg-black/90 flex flex-col items-center justify-center p-6 animate-fadeIn">
                             <div className="w-40 h-40 rounded-full border-4 border-brand-cyan/30 flex items-center justify-center relative mb-8">
                                <div className="absolute inset-0 bg-brand-cyan/10 rounded-full animate-ping"></div>
                                <div className="absolute inset-2 bg-brand-cyan/20 rounded-full animate-pulse"></div>
                                <RobotIcon />
                             </div>
                             
                             <h3 className="text-2xl font-bold text-white mb-2">Voice Agent Active</h3>
                             <p className="text-brand-cyan font-mono mb-12">{liveStatus}</p>
                             
                             <button 
                                onClick={endLiveCall}
                                className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg shadow-red-500/30"
                            >
                                <EndCallIcon />
                             </button>
                        </div>
                    )}

                    {/* Header */}
                    <div className="bg-gradient-to-r from-brand-violet/20 to-brand-cyan/20 p-4 border-b border-white/10 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="font-bold text-white tracking-wide">AI Booking Agent</span>
                        </div>
                        <div className="flex items-center gap-2">
                            {/* Start Call Button */}
                            <button 
                                onClick={startLiveCall}
                                disabled={isLiveCallActive}
                                className="p-2 rounded-full text-brand-cyan hover:bg-white/10 transition-colors"
                                title="Start Voice Call"
                            >
                                <HeadphoneIcon />
                            </button>
                            
                            <button 
                                onClick={() => setVoiceMode(!voiceMode)}
                                className={`p-2 rounded-full transition-colors ${voiceMode ? 'bg-white/20 text-white' : 'text-gray-400 hover:text-white'}`}
                                title={voiceMode ? "Mute Text-to-Speech" : "Enable Text-to-Speech"}
                            >
                                <SpeakerIcon active={voiceMode} />
                            </button>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-black/40">
                        {messages.map((msg) => (
                            <div 
                                key={msg.id} 
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                {msg.role === 'model' && (
                                    <div className="w-8 h-8 rounded-full bg-brand-violet/20 flex items-center justify-center mr-2 mt-1 border border-brand-violet/30 flex-shrink-0">
                                        <RobotIcon />
                                    </div>
                                )}
                                <div 
                                    className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${
                                        msg.role === 'user' 
                                        ? 'bg-brand-cyan text-black rounded-tr-none font-medium' 
                                        : 'bg-white/10 text-gray-200 rounded-tl-none border border-white/5'
                                    }`}
                                >
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="w-8 h-8 rounded-full bg-brand-violet/20 flex items-center justify-center mr-2 mt-1 border border-brand-violet/30">
                                    <RobotIcon />
                                </div>
                                <div className="bg-white/10 p-3 rounded-2xl rounded-tl-none border border-white/5 flex items-center gap-2">
                                   <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                                   <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                                   <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-black/60 border-t border-white/10">
                        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-1 py-1 pl-4">
                            <input 
                                type="text" 
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Type or speak..."
                                className="flex-1 bg-transparent text-white text-sm focus:outline-none placeholder-gray-500"
                            />
                            
                            {recognitionRef.current && (
                                <button 
                                    onClick={toggleListening}
                                    className={`p-2 rounded-full transition-all ${isListening ? 'bg-red-500/20 text-red-500 scale-110' : 'hover:bg-white/10 text-gray-400'}`}
                                >
                                    <MicIcon active={isListening} />
                                </button>
                            )}
                            
                            <button 
                                onClick={() => handleSend()}
                                disabled={!inputText.trim() && !isLoading}
                                className="p-2 bg-brand-cyan text-black rounded-full hover:shadow-[0_0_10px_#00f2ea] transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <SendIcon />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Floating Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ${
                    isOpen 
                    ? 'bg-gray-800 text-white rotate-90' 
                    : 'bg-gradient-to-r from-brand-violet to-brand-cyan text-white hover:scale-110 hover:shadow-[0_0_20px_rgba(0,242,234,0.5)]'
                }`}
            >
                {isOpen ? <XCircleIcon className="w-6 h-6" /> : <ChatIcon />}
            </button>
        </div>
    );
};

export default ChatBot;
