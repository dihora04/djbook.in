
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { findDjsForAi, checkAvailabilityForAi, createBookingForAi, createLeadForAi } from '../services/mockApiService';
import { XCircleIcon } from './icons';

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

// --- TYPES ---
interface Message {
    id: string;
    role: 'user' | 'model';
    text: string;
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
                name: 'create_lead',
                description: 'Capture a detailed lead/booking request from the user.',
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

// --- SYSTEM PROMPT ---
const DJ_AGENT_PROMPT = `
You are DJBook AI – Chat Assistant.
Goal: Help users find DJs, check availability, and create leads via text.
Style: Polite, helpful, using simple English or Hinglish.
Tools: Use 'search_djs', 'check_availability', 'create_lead' when appropriate.
Note: Current date is ${new Date().toDateString()}.
`;

const ChatBot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', role: 'model', text: "Hi there! I'm DJBook AI. Need help finding a DJ or checking availability? Just ask!" }
    ]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [voiceMode, setVoiceMode] = useState(false); // TTS for text chat
    const [isListening, setIsListening] = useState(false); // Text chat dictation

    // Refs
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatRef = useRef<any>(null); // GoogleGenAI Chat Session
    const recognitionRef = useRef<any>(null); // SpeechRecognition

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isOpen]);

    // Helper to get API key safely
    const getApiKey = () => {
        try {
            return process.env.API_KEY;
        } catch (e) {
            console.warn("process.env.API_KEY is not accessible directly.");
            return undefined;
        }
    };

    // Initialize Gemini Chat (Text Mode)
    useEffect(() => {
        const initChat = async () => {
            try {
                const apiKey = getApiKey();
                if (!apiKey) return;
                const ai = new GoogleGenAI({ apiKey });
                chatRef.current = ai.chats.create({
                    model: 'gemini-3-pro-preview',
                    config: {
                        tools: tools,
                        systemInstruction: DJ_AGENT_PROMPT,
                    },
                });
            } catch (e) {
                console.error("Failed to initialize text chat", e);
            }
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
        if (!voiceMode) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => v.lang.includes('IN')) || voices[0];
        if (preferredVoice) utterance.voice = preferredVoice;
        utterance.rate = 1.0;
        window.speechSynthesis.speak(utterance);
    };

    const toggleListening = () => {
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
                    else if (call.name === 'create_lead') result = await createLeadForAi(call.args);
                    
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

    return (
        <div className="fixed bottom-24 right-6 z-50 flex flex-col items-end">
            {/* Chat Window */}
            {isOpen && (
                <div className="mb-4 w-[350px] md:w-[400px] h-[500px] bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-brand-cyan/20 flex flex-col overflow-hidden animate-slideUp origin-bottom-right relative">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-brand-violet/20 to-brand-cyan/20 p-4 border-b border-white/10 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="font-bold text-white tracking-wide">DJBook Chat</span>
                        </div>
                        <div className="flex items-center gap-2">
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
                                placeholder="Type a message..."
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
