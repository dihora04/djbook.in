
import React from 'react';
import { View, User, Role } from '../types';
import { UserIcon } from './icons';

interface AuthProp {
    currentUser: User | null;
    logout: () => void;
    openLoginModal: () => void;
}
interface HeaderProps {
  setView: (view: View) => void;
  auth: AuthProp;
}

const Header: React.FC<HeaderProps> = ({ setView, auth }) => {
  const { currentUser, logout, openLoginModal } = auth;

  return (
    <header className="bg-brand-dark/80 backdrop-blur-sm fixed top-0 left-0 right-0 z-50 shadow-lg shadow-brand-violet/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex-shrink-0">
            <a onClick={() => setView({ page: 'home' })} className="cursor-pointer text-2xl font-bold tracking-tighter">
              <span className="text-white">DJ</span><span className="text-brand-cyan">Book</span>
            </a>
          </div>
          <nav className="hidden md:flex md:space-x-8">
            <a onClick={() => setView({ page: 'home' })} className="text-gray-300 hover:text-white transition-colors duration-300 cursor-pointer">Home</a>
            <a onClick={() => setView({ page: 'search' })} className="text-gray-300 hover:text-white transition-colors duration-300 cursor-pointer">Find DJs</a>
            <a onClick={() => setView({ page: 'pricing' })} className="text-gray-300 hover:text-white transition-colors duration-300 cursor-pointer">Pricing</a>
          </nav>
          <div className="flex items-center space-x-4">
            {currentUser ? (
                 <div className="flex items-center space-x-4">
                    {currentUser.role === Role.DJ && <a onClick={() => setView({ page: 'dj-dashboard' })} className="text-sm font-medium text-white hover:text-brand-cyan transition-colors duration-300 cursor-pointer">DJ Dashboard</a>}
                    {currentUser.role === Role.ADMIN && <a onClick={() => setView({ page: 'admin-dashboard' })} className="text-sm font-medium text-white hover:text-brand-cyan transition-colors duration-300 cursor-pointer">Admin Panel</a>}
                     {currentUser.role === Role.CUSTOMER && <a onClick={() => setView({ page: 'user-dashboard' })} className="text-sm font-medium text-white hover:text-brand-cyan transition-colors duration-300 cursor-pointer flex items-center gap-2"><UserIcon className="w-5 h-5" /> My Bookings</a>}
                    <button onClick={logout} className="text-sm font-medium text-gray-300 hover:text-white">Logout</button>
                 </div>
            ) : (
                <>
                    <a onClick={openLoginModal} className="hidden sm:inline-block text-sm font-medium text-white hover:text-brand-cyan transition-colors duration-300 cursor-pointer">Login</a>
                    <button
                      onClick={() => setView({ page: 'pricing' })}
                      className="bg-gradient-to-r from-brand-violet to-brand-cyan text-white font-bold py-2 px-6 rounded-full hover:scale-105 transition-transform duration-300 shadow-lg shadow-brand-cyan/30"
                    >
                      Join as DJ
                    </button>
                </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
