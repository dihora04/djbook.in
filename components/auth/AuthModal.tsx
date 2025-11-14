
import React from 'react';
import { User } from '../../types';

interface AuthModalProps {
    closeModal: () => void;
    onLogin: (user: User) => void;
    users: User[];
}

const AuthModal: React.FC<AuthModalProps> = ({ closeModal, onLogin, users }) => {
    return (
        <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center"
            onClick={closeModal}
        >
            <div 
                className="bg-brand-surface rounded-xl shadow-2xl shadow-brand-violet/20 p-8 w-full max-w-md text-center"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-3xl font-bold mb-2">Login As</h2>
                <p className="text-gray-400 mb-8">Select a role to explore the platform.</p>
                <div className="space-y-4">
                    {users.map(user => (
                        <button
                            key={user.id}
                            onClick={() => onLogin(user)}
                            className="w-full text-left p-4 bg-brand-dark hover:bg-gray-800 rounded-lg transition-colors duration-200"
                        >
                            <p className="font-bold text-white text-lg">{user.name}</p>
                            <p className="text-sm text-brand-cyan">{user.role}</p>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
