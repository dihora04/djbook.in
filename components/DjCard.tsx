
import React from 'react';
import { DJProfile, View } from '../types';
import { StarIcon, VerifiedIcon, MapPinIcon } from './icons';

interface DjCardProps {
  dj: DJProfile;
  setView: (view: View) => void;
}

const DjCard: React.FC<DjCardProps> = ({ dj, setView }) => {
  return (
    <div 
      className="bg-brand-surface rounded-xl overflow-hidden shadow-lg shadow-brand-violet/10 transform hover:-translate-y-2 transition-transform duration-300 cursor-pointer group"
      onClick={() => setView({ page: 'profile', slug: dj.slug })}
    >
      <div className="relative">
        <img className="w-full h-56 object-cover" src={dj.profileImage} alt={dj.name} />
        <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-bold flex items-center gap-1">
          <StarIcon className="w-4 h-4 text-yellow-400" />
          <span>{dj.avgRating.toFixed(1)}</span>
        </div>
        {dj.verified && (
            <div className="absolute top-3 left-3" title="Verified DJ">
                <VerifiedIcon className="w-6 h-6 text-brand-cyan" />
            </div>
        )}
      </div>
      <div className="p-5">
        <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-brand-cyan transition-colors duration-300">{dj.name}</h3>
        <p className="text-sm text-gray-400 flex items-center mb-3">
          <MapPinIcon className="w-4 h-4 mr-1" /> {dj.city}
        </p>
        <div className="flex flex-wrap gap-2 mb-4">
          {dj.genres.slice(0, 3).map(genre => (
            <span key={genre} className="bg-gray-700 text-gray-300 text-xs font-semibold px-2.5 py-1 rounded-full">{genre}</span>
          ))}
        </div>
        <button
            className="w-full bg-gradient-to-r from-brand-violet to-brand-cyan text-white font-bold py-2 px-4 rounded-full hover:scale-105 transition-transform duration-300"
        >
          View Profile
        </button>
      </div>
    </div>
  );
};

export default DjCard;
