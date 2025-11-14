
import React from 'react';
import { View } from '../types';
import { CheckCircleIcon } from './icons';

interface PricingPageProps {
  setView: (view: View) => void;
}

const PricingCard = ({ tier, price, features, primary = false }: { tier: string, price: string, features: string[], primary?: boolean }) => (
    <div className={`border rounded-xl p-8 flex flex-col ${primary ? 'bg-brand-surface border-brand-violet shadow-2xl shadow-brand-violet/20' : 'border-gray-700'}`}>
        <h3 className="text-2xl font-bold text-brand-cyan">{tier}</h3>
        <p className="text-4xl font-bold my-4">{price}<span className="text-lg font-normal text-gray-400">/month</span></p>
        <ul className="space-y-3 mb-8 text-gray-300">
            {features.map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                    <CheckCircleIcon className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                </li>
            ))}
        </ul>
        <button className={`mt-auto w-full font-bold py-3 px-6 rounded-full transition-transform duration-300 hover:scale-105 ${primary ? 'bg-gradient-to-r from-brand-violet to-brand-cyan' : 'bg-gray-600 hover:bg-gray-500'}`}>
            Get Started
        </button>
    </div>
);


const PricingPage: React.FC<PricingPageProps> = ({ setView }) => {
  return (
    <div className="pt-24 bg-brand-dark min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4 text-white">
            Become a <span className="text-brand-cyan">DJBook</span> Star
          </h1>
          <p className="text-lg md:text-xl text-gray-300">
            Choose a plan that fits your needs and get discovered by thousands of clients across India.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-6xl mx-auto">
          <PricingCard
            tier="Free"
            price="₹0"
            features={[
              'Basic Profile Listing',
              'Receive Booking Inquiries',
              'Limited Visibility in Search',
              'Email Support',
            ]}
          />
          <PricingCard
            tier="Pro"
            price="₹499"
            features={[
              'Everything in Free, plus:',
              'Featured Listing on Homepage',
              'Higher Search Ranking',
              'Verified Badge',
              'Social Media Promotion',
              'Priority Support',
            ]}
            primary
          />
          <PricingCard
            tier="Elite"
            price="₹999"
            features={[
                'Everything in Pro, plus:',
                'Guaranteed Leads Every Month',
                'Profile Boost for Top Events',
                'Access to CRM Tools',
                'Advanced Profile Analytics',
                'Dedicated Account Manager'
            ]}
          />
        </div>
      </div>
    </div>
  );
};

export default PricingPage;