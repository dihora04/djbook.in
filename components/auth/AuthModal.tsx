import React, { useState } from 'react';
import { Role, SubscriptionTier } from '../../types';
import { LoaderIcon, MapPinIcon, CheckCircleIcon } from '../icons';

interface AuthModalProps {
    closeModal: () => void;
    onLogin: (email: string, pass: string) => Promise<any>;
    onRegister: (name: string, email: string, pass: string, role: Role, location?: { lat: number, lon: number }, plan?: SubscriptionTier) => Promise<any>;
    initialTab?: 'login' | 'register';
    initialRole?: Role;
    initialPlan?: SubscriptionTier;
}

type AuthTab = 'login' | 'register';

const AuthModal: React.FC<AuthModalProps> = ({ closeModal, onLogin, onRegister, initialTab = 'login', initialRole = Role.CUSTOMER, initialPlan }) => {
    const [activeTab, setActiveTab] = useState<AuthTab>(initialTab);
    const [isLoading, setIsLoading] = useState(false);
    
    // Login State
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    // Register State
    const [regName, setRegName] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [regRole, setRegRole] = useState<Role>(initialRole);
    const [regLocation, setRegLocation] = useState<{lat: number, lon: number} | null>(null);
    const [isLocating, setIsLocating] = useState(false);

    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await onLogin(loginEmail, loginPassword);
        } catch (error) {
            // Toast handled in App
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegisterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (regPassword.length < 6) {
            alert('Password must be at least 6 characters long.');
            return;
        }
        setIsLoading(true);
        try {
            await onRegister(regName, regEmail, regPassword, regRole, regLocation || undefined, initialPlan);
        } catch (error) {
           // Toast handled in App
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser.");
            return;
        }
        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setRegLocation({ lat: latitude, lon: longitude });
                setIsLocating(false);
            },
            () => {
                alert("Unable to retrieve your location.");
                setIsLocating(false);
            }
        );
    };

    return (
        <div 
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
            {/* Backdrop with blur */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={closeModal}></div>

            {/* Modal Content */}
            <div 
                className="relative bg-[#0a0a0a] border border-glass-border rounded-2xl shadow-2xl shadow-brand-cyan/20 w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Neon Top Line */}
                <div className="h-1 w-full bg-gradient-to-r from-brand-violet to-brand-cyan"></div>

                {/* Header / Tabs */}
                <div className="flex border-b border-glass-border">
                    <button 
                        type="button"
                        onClick={() => setActiveTab('login')}
                        className={`flex-1 py-4 font-display font-bold tracking-wide text-sm transition-colors ${activeTab === 'login' ? 'text-white bg-white/5' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        ACCESS TERMINAL
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('register')}
                        className={`flex-1 py-4 font-display font-bold tracking-wide text-sm transition-colors ${activeTab === 'register' ? 'text-brand-cyan bg-brand-cyan/5 shadow-[inset_0_-2px_0_#00f2ea]' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        NEW REGISTRATION
                    </button>
                </div>

                <div className="p-8 overflow-y-auto custom-scrollbar">
                    {activeTab === 'login' ? (
                        <form onSubmit={handleLoginSubmit} className="space-y-5">
                            <div className="text-center mb-6">
                                <h2 className="text-2xl font-bold text-white mb-1">Welcome Back</h2>
                                <p className="text-gray-400 text-sm">Enter credentials to access system.</p>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Email Address</label>
                                    <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required className="w-full bg-white/5 text-white border border-glass-border rounded-lg px-4 py-3 focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan focus:outline-none transition-all" placeholder="name@example.com" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Password</label>
                                    <input type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required className="w-full bg-white/5 text-white border border-glass-border rounded-lg px-4 py-3 focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan focus:outline-none transition-all" placeholder="••••••••" />
                                </div>
                            </div>
                            <button type="submit" disabled={isLoading} className="w-full mt-6 bg-white text-black font-bold py-3.5 px-4 rounded-lg hover:bg-brand-cyan hover:shadow-neon transition-all duration-300 disabled:opacity-50 flex justify-center items-center">
                                {isLoading ? <LoaderIcon className="w-5 h-5" /> : 'AUTHENTICATE'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleRegisterSubmit} className="space-y-5">
                             <div className="text-center mb-6">
                                <h2 className="text-2xl font-bold text-white mb-1">Create Identity</h2>
                                <p className="text-gray-400 text-sm">Join the platform network.</p>
                            </div>

                            {initialPlan && regRole === Role.DJ && (
                                <div className="bg-brand-violet/10 border border-brand-violet/40 text-brand-violet text-sm p-3 rounded-lg flex items-center gap-3 mb-4">
                                    <CheckCircleIcon className="w-5 h-5"/>
                                    <span>Selected Plan: <strong className="text-white">{initialPlan}</strong></span>
                                </div>
                            )}
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Full Name / Stage Name</label>
                                    <input type="text" value={regName} onChange={e => setRegName(e.target.value)} required className="w-full bg-white/5 text-white border border-glass-border rounded-lg px-4 py-3 focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan focus:outline-none transition-all" placeholder="e.g. DJ Phantom" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Email</label>
                                    <input type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} required className="w-full bg-white/5 text-white border border-glass-border rounded-lg px-4 py-3 focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan focus:outline-none transition-all" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Password</label>
                                    <input type="password" value={regPassword} onChange={e => setRegPassword(e.target.value)} required className="w-full bg-white/5 text-white border border-glass-border rounded-lg px-4 py-3 focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan focus:outline-none transition-all" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Account Type</label>
                                    <div className="grid grid-cols-2 gap-3">
                                       <button type="button" onClick={() => setRegRole(Role.CUSTOMER)} className={`p-3 rounded-lg border transition-all font-semibold text-sm ${regRole === Role.CUSTOMER ? 'border-brand-cyan bg-brand-cyan/10 text-brand-cyan' : 'border-gray-700 text-gray-400 hover:border-gray-500'}`}>User</button>
                                       <button type="button" onClick={() => setRegRole(Role.DJ)} className={`p-3 rounded-lg border transition-all font-semibold text-sm ${regRole === Role.DJ ? 'border-brand-cyan bg-brand-cyan/10 text-brand-cyan' : 'border-gray-700 text-gray-400 hover:border-gray-500'}`}>Artist (DJ)</button>
                                    </div>
                                </div>
                                {regRole === Role.DJ && (
                                     <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Base Location</label>
                                        {regLocation ? (
                                            <div className="flex items-center gap-2 text-green-400 bg-green-500/10 border border-green-500/20 p-3 rounded-lg">
                                                <CheckCircleIcon className="w-5 h-5"/>
                                                <span className="text-sm font-semibold">Coordinates Locked</span>
                                            </div>
                                        ) : (
                                            <button type="button" onClick={handleGetLocation} disabled={isLocating} className="w-full flex justify-center items-center gap-2 p-3 rounded-lg border border-gray-700 hover:border-brand-cyan hover:text-brand-cyan transition-colors text-sm font-medium disabled:opacity-50">
                                                {isLocating ? <LoaderIcon className="w-4 h-4" /> : <MapPinIcon className="w-4 h-4" />}
                                                {isLocating ? 'Acquiring Satellite Lock...' : 'Auto-Detect Location'}
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>

                            <button type="submit" disabled={isLoading} className="w-full mt-6 bg-gradient-to-r from-brand-violet to-brand-cyan text-white font-bold py-3.5 px-4 rounded-lg shadow-lg hover:shadow-neon transition-all duration-300 disabled:opacity-50 flex justify-center items-center tracking-wide">
                                {isLoading ? <LoaderIcon className="w-5 h-5" /> : 'INITIALIZE ACCOUNT'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthModal;