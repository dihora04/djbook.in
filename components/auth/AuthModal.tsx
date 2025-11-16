
import React, { useState } from 'react';
import { Role } from '../../types';
import { LoaderIcon, MapPinIcon, CheckCircleIcon } from '../icons';

interface AuthModalProps {
    closeModal: () => void;
    onLogin: (email: string, pass: string) => Promise<any>;
    onRegister: (name: string, email: string, pass: string, role: Role, location?: { lat: number, lon: number }) => Promise<any>;
    initialTab?: 'login' | 'register';
    initialRole?: Role;
}

type AuthTab = 'login' | 'register';

const AuthModal: React.FC<AuthModalProps> = ({ closeModal, onLogin, onRegister, initialTab, initialRole }) => {
    const [activeTab, setActiveTab] = useState<AuthTab>(initialTab || 'login');
    const [isLoading, setIsLoading] = useState(false);
    
    // Login State
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    // Register State
    const [regName, setRegName] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [regRole, setRegRole] = useState<Role>(initialRole || Role.CUSTOMER);
    const [regLocation, setRegLocation] = useState<{lat: number, lon: number} | null>(null);
    const [isLocating, setIsLocating] = useState(false);

    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await onLogin(loginEmail, loginPassword);
        } catch (error) {
            // Error toast is handled in App.tsx
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
            await onRegister(regName, regEmail, regPassword, regRole, regLocation || undefined);
        } catch (error) {
           // Error toast is handled in App.tsx
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
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center"
            onClick={closeModal}
        >
            <div 
                className="bg-brand-surface rounded-xl shadow-2xl shadow-brand-violet/20 p-8 w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex border-b border-gray-700 mb-6">
                    <button 
                        onClick={() => setActiveTab('login')}
                        className={`py-3 px-6 font-semibold transition-colors ${activeTab === 'login' ? 'text-brand-cyan border-b-2 border-brand-cyan' : 'text-gray-400'}`}
                    >
                        Login
                    </button>
                    <button
                        onClick={() => setActiveTab('register')}
                        className={`py-3 px-6 font-semibold transition-colors ${activeTab === 'register' ? 'text-brand-cyan border-b-2 border-brand-cyan' : 'text-gray-400'}`}
                    >
                        Register
                    </button>
                </div>

                {activeTab === 'login' ? (
                    <form onSubmit={handleLoginSubmit} className="space-y-4">
                        <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
                        <div>
                            <label className="text-sm font-medium text-gray-300">Email</label>
                            <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required className="w-full mt-1 bg-brand-dark text-white border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-cyan focus:outline-none" />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-300">Password</label>
                            <input type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required className="w-full mt-1 bg-brand-dark text-white border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-cyan focus:outline-none" />
                        </div>
                        <button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-brand-violet to-brand-cyan text-white font-bold py-3 px-4 rounded-full hover:scale-105 transition-transform duration-300 disabled:opacity-50 flex justify-center">
                            {isLoading ? <LoaderIcon className="w-6 h-6" /> : 'Login'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleRegisterSubmit} className="space-y-4">
                        <h2 className="text-2xl font-bold text-white">Create Your Account</h2>
                        <div>
                            <label className="text-sm font-medium text-gray-300">Full Name</label>
                            <input type="text" value={regName} onChange={e => setRegName(e.target.value)} required className="w-full mt-1 bg-brand-dark text-white border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-cyan focus:outline-none" />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-300">Email</label>
                            <input type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} required className="w-full mt-1 bg-brand-dark text-white border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-cyan focus:outline-none" />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-300">Password</label>
                            <input type="password" value={regPassword} onChange={e => setRegPassword(e.target.value)} required className="w-full mt-1 bg-brand-dark text-white border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-cyan focus:outline-none" />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-300 mb-2 block">I am a...</label>
                            <div className="flex gap-4">
                               <button type="button" onClick={() => setRegRole(Role.CUSTOMER)} className={`flex-1 p-3 rounded-lg border-2 ${regRole === Role.CUSTOMER ? 'border-brand-cyan bg-brand-cyan/10' : 'border-gray-600'}`}>Customer</button>
                               <button type="button" onClick={() => setRegRole(Role.DJ)} className={`flex-1 p-3 rounded-lg border-2 ${regRole === Role.DJ ? 'border-brand-cyan bg-brand-cyan/10' : 'border-gray-600'}`}>DJ</button>
                            </div>
                        </div>
                        {regRole === Role.DJ && (
                             <div>
                                <label className="text-sm font-medium text-gray-300 mb-2 block">Your Location (for nearby searches)</label>
                                {regLocation ? (
                                    <div className="flex items-center gap-2 text-green-400 bg-green-500/10 p-2 rounded-lg">
                                        <CheckCircleIcon className="w-5 h-5"/>
                                        <span className="text-sm font-semibold">Location Saved!</span>
                                    </div>
                                ) : (
                                    <button type="button" onClick={handleGetLocation} disabled={isLocating} className="w-full flex justify-center items-center gap-2 p-3 rounded-lg border-2 border-gray-600 hover:border-brand-cyan transition-colors disabled:opacity-50">
                                        {isLocating ? <LoaderIcon className="w-5 h-5" /> : <MapPinIcon className="w-5 h-5" />}
                                        {isLocating ? 'Getting Location...' : 'Set Your Location'}
                                    </button>
                                )}
                            </div>
                        )}
                        <button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-brand-violet to-brand-cyan text-white font-bold py-3 px-4 rounded-full hover:scale-105 transition-transform duration-300 disabled:opacity-50 flex justify-center">
                            {isLoading ? <LoaderIcon className="w-6 h-6" /> : 'Register'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default AuthModal;
