
import React, { useState } from 'react';
import { DJProfile, SubscriptionTier } from '../../types';
import { upgradeSubscription } from '../../services/mockApiService';
import { LoaderIcon, StarIcon, CheckCircleIcon } from '../icons';

interface SubscriptionSectionProps {
    dj: DJProfile;
    onPlanChange: (updatedDj: DJProfile) => void;
    showToast: (message: string, type?: 'success' | 'error') => void;
}

const SubscriptionSection: React.FC<SubscriptionSectionProps> = ({ dj, onPlanChange, showToast }) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleUpgrade = async (plan: SubscriptionTier) => {
        if (dj.plan === plan) {
            showToast("You are already on this plan.", "error");
            return;
        }
        setIsLoading(true);
        try {
            const updatedDj = await upgradeSubscription(dj.id, plan);
            onPlanChange(updatedDj);
            showToast(`Successfully upgraded to ${plan} plan!`, 'success');
        } catch (error) {
            showToast('Failed to upgrade plan.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const PlanCard = ({ tier, benefits, isCurrent, onSelect, disabled }: { tier: SubscriptionTier, benefits: string, isCurrent: boolean, onSelect: (plan: SubscriptionTier) => void, disabled: boolean }) => (
        <div className={`p-6 rounded-lg border-2 ${isCurrent ? 'border-brand-cyan bg-brand-cyan/10' : 'border-gray-700'}`}>
            <h3 className="text-2xl font-bold text-brand-cyan flex items-center gap-2">
                {tier} Plan {isCurrent && <span className="text-xs bg-brand-cyan text-brand-dark font-bold px-2 py-0.5 rounded-full">Current</span>}
            </h3>
            <p className="text-gray-400 mt-2">{benefits}</p>
            <button 
                onClick={() => onSelect(tier)}
                disabled={disabled || isCurrent}
                className="mt-6 w-full font-bold py-2 px-6 rounded-full transition-colors bg-brand-violet hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed flex justify-center items-center"
            >
                {isLoading ? <LoaderIcon className="w-5 h-5" /> : isCurrent ? 'Active Plan' : `Upgrade to ${tier}`}
            </button>
        </div>
    );

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Manage Your Subscription</h2>
            <div className="space-y-6">
                <PlanCard 
                    tier={SubscriptionTier.FREE}
                    benefits="Basic listing and profile."
                    isCurrent={dj.plan === SubscriptionTier.FREE}
                    onSelect={handleUpgrade}
                    disabled={isLoading}
                />
                <PlanCard 
                    tier={SubscriptionTier.PRO}
                    benefits="Get a verified badge and higher search ranking."
                    isCurrent={dj.plan === SubscriptionTier.PRO}
                    onSelect={handleUpgrade}
                    disabled={isLoading}
                />
                <PlanCard 
                    tier={SubscriptionTier.ELITE}
                    benefits="Top ranking, guaranteed leads, and advanced tools."
                    isCurrent={dj.plan === SubscriptionTier.ELITE}
                    onSelect={handleUpgrade}
                    disabled={isLoading}
                />
            </div>
        </div>
    );
};

export default SubscriptionSection;
