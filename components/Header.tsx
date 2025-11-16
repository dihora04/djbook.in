
import React, { useState } from 'react';
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleMobileLinkClick = (view: View) => {
    setView(view);
    setIsMobileMenuOpen(false);
  }

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
          <div className="hidden md:flex items-center space-x-4">
            {currentUser ? (
                 <div className="flex items-center space-x-4">
                    {currentUser.role === Role.DJ && <a onClick={() => setView({ page: 'dj-dashboard' })} className="text-sm font-medium text-white hover:text-brand-cyan transition-colors duration-300 cursor-pointer">DJ Dashboard</a>}
                    {currentUser.role === Role.ADMIN && <a onClick={() => setView({ page: 'admin-dashboard' })} className="text-sm font-medium text-white hover:text-brand-cyan transition-colors duration-300 cursor-pointer">Admin Panel</a>}
                     {currentUser.role === Role.CUSTOMER && <a onClick={() => setView({ page: 'user-dashboard' })} className="text-sm font-medium text-white hover:text-brand-cyan transition-colors duration-300 cursor-pointer flex items-center gap-2"><UserIcon className="w-5 h-5" /> My Bookings</a>}
                    <button onClick={logout} className="text-sm font-medium text-gray-300 hover:text-white">Logout</button>
                 </div>
            ) : (
                <>
                    <a onClick={openLoginModal} className="text-sm font-medium text-white hover:text-brand-cyan transition-colors duration-300 cursor-pointer">Login</a>
                    <button
                      onClick={() => setView({ page: 'pricing' })}
                      className="bg-gradient-to-r from-brand-violet to-brand-cyan text-white font-bold py-2 px-6 rounded-full hover:scale-105 transition-transform duration-300 shadow-lg shadow-brand-cyan/30"
                    >
                      Join as DJ
                    </button>
                </>
            )}
          </div>
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
             <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={!isMobileMenuOpen ? "M4 6h16M4 12h16M4 18h16" : "M6 18L18 6M6 6l12 12"} />
              </svg>
            </button>
          </div>
        </div>
      </div>
      {/* Mobile menu, show/hide based on menu state. */}
      {isMobileMenuOpen && (
        <div className="md:hidden" id="mobile-menu">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                <a onClick={() => handleMobileLinkClick({ page: 'home' })} className="text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium cursor-pointer">Home</a>
                <a onClick={() => handleMobileLinkClick({ page: 'search' })} className="text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium cursor-pointer">Find DJs</a>
                <a onClick={() => handleMobileLinkClick({ page: 'pricing' })} className="text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium cursor-pointer">Pricing</a>
            </div>
            <div className="pt-4 pb-3 border-t border-gray-700">
                {currentUser ? (
                    <div>
                        <div className="flex items-center px-5">
                            <div className="flex-shrink-0"><UserIcon className="w-8 h-8 text-gray-400"/></div>
                            <div className="ml-3">
                                <div className="text-base font-medium text-white">{currentUser.name}</div>
                                <div className="text-sm font-medium text-gray-400">{currentUser.email}</div>
                            </div>
                        </div>
                        <div className="mt-3 px-2 space-y-1">
                            {currentUser.role === Role.DJ && <a onClick={() => handleMobileLinkClick({ page: 'dj-dashboard' })} className="block px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-gray-700 cursor-pointer">DJ Dashboard</a>}
                            {currentUser.role === Role.ADMIN && <a onClick={() => handleMobileLinkClick({ page: 'admin-dashboard' })} className="block px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-gray-700 cursor-pointer">Admin Panel</a>}
                            {currentUser.role === Role.CUSTOMER && <a onClick={() => handleMobileLinkClick({ page: 'user-dashboard' })} className="block px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-gray-700 cursor-pointer">My Bookings</a>}
                            <a onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="block px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-gray-700 cursor-pointer">Logout</a>
                        </div>
                    </div>
                ) : (
                    <div className="px-5 space-y-3">
                        <a onClick={() => { openLoginModal(); setIsMobileMenuOpen(false); }} className="block w-full text-center text-sm font-medium bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-md cursor-pointer">Login</a>
                        <a onClick={() => handleMobileLinkClick({ page: 'pricing' })} className="block w-full text-center bg-gradient-to-r from-brand-violet to-brand-cyan text-white font-bold py-2 px-4 rounded-md cursor-pointer">Join as DJ</a>
                    </div>
                )}
            </div>
        </div>
      )}
    </header>
  );
};

export default Header;
