
import React from 'react';
import { View } from '../types';

interface HeaderProps {
  setView: (view: View) => void;
}

const Header: React.FC<HeaderProps> = ({ setView }) => {
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
            <a href="#" className="text-gray-300 hover:text-white transition-colors duration-300">How It Works</a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors duration-300">Blog</a>
          </nav>
          <div className="flex items-center space-x-4">
            <a href="#" className="hidden sm:inline-block text-sm font-medium text-white hover:text-brand-cyan transition-colors duration-300">Join as DJ</a>
            <button
              onClick={() => setView({ page: 'search' })}
              className="bg-gradient-to-r from-brand-violet to-brand-cyan text-white font-bold py-2 px-6 rounded-full hover:scale-105 transition-transform duration-300 shadow-lg shadow-brand-cyan/30"
            >
              Book Now
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
