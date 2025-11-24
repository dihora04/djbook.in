import React from 'react';
import { DJProfile, View, SubscriptionTier } from '../types';
import { StarIcon, VerifiedIcon, MapPinIcon } from './icons';

interface DjCardProps {
  dj: DJProfile;
  setView: (view: View) => void; 
}

const DjCard: React.FC<DjCardProps> = ({ dj, setView }) => {
  const isVerified = dj.plan === SubscriptionTier.PRO || dj.plan === SubscriptionTier.ELITE;

  // Ranking Badge Logic
  const getRankBadge = () => {
    if (!dj.cityRank || dj.cityRank > 3) return null;
    
    let label = "";
    let colorClass = "";
    
    if (dj.cityRank === 1) {
        label = `#1 in ${dj.city}`;
        colorClass = "from-yellow-400 via-yellow-500 to-yellow-600 text-black shadow-[0_0_20px_rgba(234,179,8,0.6)]";
    } else if (dj.cityRank === 2) {
        label = `#2 in ${dj.city}`;
        colorClass = "from-gray-200 via-gray-300 to-gray-400 text-black shadow-[0_0_20px_rgba(209,213,219,0.6)]";
    } else if (dj.cityRank === 3) {
        label = `#3 in ${dj.city}`;
        colorClass = "from-orange-400 via-orange-500 to-orange-600 text-black shadow-[0_0_20px_rgba(249,115,22,0.6)]";
    }

    return (
        <div className={`absolute top-3 left-3 z-20 bg-gradient-to-r ${colorClass} text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest border-t border-white/40 backdrop-blur-md animate-pulse`}>
            {label}
        </div>
    );
  };

  return (
    <div 
      className="group relative bg-brand-surface border border-white/5 rounded-2xl overflow-hidden hover:border-brand-cyan/30 transition-all duration-500 hover:shadow-[0_0_30px_rgba(0,242,234,0.15)] flex flex-col h-full cursor-pointer"
      onClick={() => setView({ page: 'profile', slug: dj.slug })}
    >
      {/* Image Section */}
      <div className="relative h-64 overflow-hidden">
        {getRankBadge()}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-surface via-transparent to-transparent z-10 opacity-80"></div>
        <img 
            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out" 
            src={dj.profileImage} 
            alt={dj.name} 
        />
        
        {/* Floating Rating Pill */}
        <div className="absolute top-3 right-3 z-20 bg-black/60 backdrop-blur-md rounded-full pl-2 pr-3 py-1 text-xs font-bold flex items-center gap-1.5 border border-white/10 shadow-lg group-hover:border-brand-cyan/50 transition-colors">
          <StarIcon className="w-3.5 h-3.5 text-yellow-400" />
          <span className="text-white">{dj.avgRating > 0 ? dj.avgRating.toFixed(1) : 'New'}</span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6 flex flex-col flex-grow relative z-20 -mt-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
                <h3 className="text-2xl font-display font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-brand-cyan transition-all duration-300 truncate max-w-[180px]">
                    {dj.name}
                </h3>
                {isVerified && (
                    <div title="Verified Artist" className="animate-bounce-slow">
                        <VerifiedIcon className="w-5 h-5 text-brand-cyan drop-shadow-[0_0_8px_rgba(0,242,234,0.8)]" />
                    </div>
                )}
            </div>
        </div>

        {/* Location */}
        <div className="flex justify-between items-center text-sm text-gray-400 mb-5 border-b border-white/5 pb-4">
            <p className="flex items-center truncate">
                <MapPinIcon className="w-4 h-4 mr-1.5 text-gray-500 group-hover:text-brand-cyan transition-colors" /> 
                <span className="group-hover:text-gray-300 transition-colors">{dj.city}</span>
            </p>
            {dj.distance && (
                 <p className="font-mono text-xs font-bold text-brand-cyan bg-brand-cyan/10 px-2 py-0.5 rounded border border-brand-cyan/20">
                    {dj.distance.toFixed(1)} km
                 </p>
            )}
        </div>

        {/* Genre Categories - Redesigned */}
        <div className="flex flex-wrap gap-2 mb-6">
          {dj.genres.slice(0, 3).map(genre => (
            <span 
                key={genre} 
                className="
                    bg-brand-cyan/5 text-brand-cyan/90 
                    border border-brand-cyan/20 
                    text-[11px] font-bold uppercase tracking-wider 
                    px-3 py-1.5 rounded-lg
                    hover:bg-brand-cyan hover:text-black hover:border-brand-cyan
                    hover:shadow-[0_0_15px_rgba(0,242,234,0.4)]
                    transition-all duration-300 cursor-default
                "
            >
                {genre}
            </span>
          ))}
          {dj.genres.length > 3 && (
              <span className="text-[10px] text-gray-500 flex items-center px-1">+ {dj.genres.length - 3}</span>
          )}
        </div>

        {/* Action Button */}
        <div className="mt-auto">
            <button
                className="
                    w-full relative overflow-hidden
                    bg-white/5 border border-white/10 text-white 
                    font-bold py-3 px-4 rounded-xl 
                    group-hover:border-brand-cyan/50 group-hover:text-brand-cyan
                    transition-all duration-300
                    uppercase tracking-widest text-xs
                "
            >
                <span className="relative z-10 group-hover:drop-shadow-[0_0_5px_rgba(0,242,234,0.8)]">View Profile</span>
                <div className="absolute inset-0 bg-brand-cyan/10 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
            </button>
        </div>
      </div>
    </div>
  );
};

export default DjCard;