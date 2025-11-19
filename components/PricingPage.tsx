import React from 'react';
import { View, SubscriptionTier } from '../types';
import { CheckCircleIcon } from './icons';

interface PricingPageProps {
  setView: (view: View) => void;
  openRegisterModal: (plan?: SubscriptionTier) => void;
}

const PricingCard = ({ tier, price, features, primary = false, onGetStarted }: { tier: string, price: string, features: string[], primary?: boolean, onGetStarted: () => void }) => (
    <div className={`relative p-8 flex flex-col rounded-3xl transition-all duration-500 group hover:-translate-y-2 ${primary ? 'bg-white/5 border border-brand-cyan/30 shadow-neon' : 'bg-black/40 border border-white/10 hover:border-white/30'}`}>
        {primary && <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand-cyan text-black text-xs font-bold px-4 py-1 rounded-full uppercase tracking-widest shadow-[0_0_10px_#00f2ea]">Most Popular</div>}
        
        <h3 className={`text-3xl font-display font-bold mb-2 ${primary ? 'text-brand-cyan' : 'text-white'}`}>{tier}</h3>
        <p className="text-5xl font-bold mb-6 text-white">{price}<span className="text-lg font-normal text-gray-500">/mo</span></p>
        
        <ul className="space-y-4 mb-10 flex-grow">
            {features.map((feature, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-300">
                    <CheckCircleIcon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${primary ? 'text-brand-cyan' : 'text-gray-500'}`} />
                    <span className="text-sm font-medium">{feature}</span>
                </li>
            ))}
        </ul>
        
        <button 
            onClick={onGetStarted}
            className={`w-full font-bold py-4 px-6 rounded-xl transition-all duration-300 uppercase tracking-wider text-sm ${primary ? 'bg-brand-cyan text-black hover:shadow-[0_0_20px_#00f2ea]' : 'bg-white/10 hover:bg-white/20 text-white'}`}
        >
            Get Access
        </button>
    </div>
);


const PricingPage: React.FC<PricingPageProps> = ({ setView, openRegisterModal }) => {
  return (
    <div className="pt-24 bg-brand-dark min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 relative">
        {/* Background Decoration */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-brand-violet/20 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="text-center max-w-3xl mx-auto relative z-10 mb-20">
          <h1 className="text-5xl md:text-7xl font-bold font-display tracking-tight mb-6 text-white">
            Unlock Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan to-brand-violet">Potential</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Select your tier. Amplify your reach. Dominate the event scene.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto relative z-10">
          <PricingCard
            tier="Starter"
            price="₹0"
            features={[
              'Basic Neural Profile',
              'Standard Search Visibility',
              'Direct Booking Inquiries',
              'Community Support',
            ]}
            onGetStarted={() => openRegisterModal(SubscriptionTier.FREE)}
          />
          <PricingCard
            tier="Professional"
            price="₹499"
            features={[
              'Holographic Profile Badge',
              'Priority Search Algorithm',
              'Verified Artist Status',
              'Social Signal Amplification',
              '24/7 Priority Uplink',
            ]}
            primary
            onGetStarted={() => openRegisterModal(SubscriptionTier.PRO)}
          />
          <PricingCard
            tier="Elite"
            price="₹999"
            features={[
                'Maximum Visibility Boost',
                'Guaranteed Monthly Leads',
                'CRM Integration Suite',
                'Advanced Data Analytics',
                'Dedicated Talent Manager'
            ]}
            onGetStarted={() => openRegisterModal(SubscriptionTier.ELITE)}
          />
        </div>
      </div>
    </div>
  );
};

export default PricingPage;