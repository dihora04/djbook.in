
import React from 'react';
import { View } from '../types';

interface FooterProps {
    setView: (view: View) => void;
}

const Footer: React.FC<FooterProps> = ({ setView }) => {
  return (
    <footer className="bg-brand-surface text-gray-400">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4"><span className="text-white">DJ</span><span className="text-brand-cyan">Book</span></h3>
            <p className="text-sm">Book DJs Instantly. Anytime. Anywhere. India's #1 DJ booking platform.</p>
            <div className="mt-4 text-sm">
                <p>Ring Road, Bhavnagar</p>
                <p>Gujarat 364001</p>
                <p>Email: aj@djbook.in</p>
                <p>WhatsApp: 9099110411</p>
            </div>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><a onClick={() => setView({ page: 'search' })} className="cursor-pointer hover:text-brand-cyan transition-colors">Find DJs</a></li>
              <li><a href="#" className="hover:text-brand-cyan transition-colors">How It Works</a></li>
              <li><a onClick={() => setView({ page: 'pricing' })} className="cursor-pointer hover:text-brand-cyan transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-brand-cyan transition-colors">Blog</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">For DJs</h4>
            <ul className="space-y-2 text-sm">
              <li><a onClick={() => setView({ page: 'pricing' })} className="cursor-pointer hover:text-brand-cyan transition-colors">Join as DJ</a></li>
               <li><a onClick={() => setView({ page: 'dj-dashboard' })} className="cursor-pointer hover:text-brand-cyan transition-colors">DJ Dashboard</a></li>
              <li><a href="#" className="hover:text-brand-cyan transition-colors">Support</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-brand-cyan transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-brand-cyan transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-800 pt-8 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm">&copy; {new Date().getFullYear()} DJBook. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 sm:mt-0">
            {/* Social Icons would go here */}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;