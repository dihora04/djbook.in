
import React, { useState, useEffect } from 'react';
import { DJProfile, View } from '../types';
import { getDjs, getNearbyDjs } from '../services/mockApiService';
import { INDIAN_LOCATIONS, GENRES } from '../constants';
import DjCard from './DjCard';
import { LoaderIcon, MapPinIcon } from './icons';

interface SearchPageProps {
  setView: (view: View) => void;
}

const SearchPage: React.FC<SearchPageProps> = ({ setView }) => {
  const [allDjs, setAllDjs] = useState<DJProfile[]>([]);
  const [filteredDjs, setFilteredDjs] = useState<DJProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLocating, setIsLocating] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [genreFilter, setGenreFilter] = useState('');
  const [searchMessage, setSearchMessage] = useState<string | null>(null);

  // Get derived districts based on state selection
  const availableDistricts = stateFilter ? (INDIAN_LOCATIONS[stateFilter] || []) : [];

  const fetchAllDjs = async () => {
    setLoading(true);
    const djs = await getDjs();
    setAllDjs(djs);
    setFilteredDjs(djs);
    setSearchMessage(null);
    setLoading(false);
  };

  useEffect(() => {
    fetchAllDjs();
  }, []);
  
  useEffect(() => {
    // Don't apply filters if a nearby search is active
    if (searchMessage) return;

    let result = allDjs;
    
    if (searchTerm) {
      result = result.filter(dj => 
        dj.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (stateFilter) {
        result = result.filter(dj => dj.state === stateFilter);
    }

    if (cityFilter) {
      result = result.filter(dj => dj.city === cityFilter);
    }
    
    if (genreFilter) {
      result = result.filter(dj => dj.genres.includes(genreFilter));
    }
    
    setFilteredDjs(result);
  }, [searchTerm, stateFilter, cityFilter, genreFilter, allDjs, searchMessage]);

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setStateFilter(e.target.value);
      setCityFilter(''); // Reset city when state changes
      setSearchMessage(null);
  };

  const handleNearbySearch = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setIsLocating(true);
    setLoading(true);
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      const nearbyDjs = await getNearbyDjs(latitude, longitude);
      setFilteredDjs(nearbyDjs);
      setSearchMessage(`Showing DJs within 50km of your location.`);
      setIsLocating(false);
      setLoading(false);
      
      // Clear manual filters to avoid confusion
      setStateFilter('');
      setCityFilter('');
      setGenreFilter('');
      setSearchTerm('');

    }, () => {
      alert("Unable to retrieve your location.");
      setIsLocating(false);
      setLoading(false);
    });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStateFilter('');
    setCityFilter('');
    setGenreFilter('');
    setSearchMessage(null);
    setFilteredDjs(allDjs);
  };


  return (
    <div className="pt-24 bg-brand-dark min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-brand-surface border border-white/10 p-6 rounded-2xl shadow-2xl shadow-brand-violet/5 mb-8 backdrop-blur-sm">
            <h1 className="text-3xl md:text-4xl font-bold text-center mb-6 font-display">Find Your Perfect DJ</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* Search Name */}
                <div className="md:col-span-12">
                     <input 
                        type="text"
                        placeholder="Search by DJ Name..."
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setSearchMessage(null); }}
                        className="w-full bg-black/30 text-white placeholder-gray-500 border border-gray-700 rounded-xl px-5 py-3 focus:ring-1 focus:ring-brand-cyan focus:border-brand-cyan focus:outline-none transition-all"
                    />
                </div>

                {/* State Filter */}
                 <div className="md:col-span-3">
                    <select 
                        value={stateFilter}
                        onChange={handleStateChange}
                        className="w-full bg-black/30 text-white border border-gray-700 rounded-xl px-5 py-3 focus:ring-1 focus:ring-brand-cyan focus:border-brand-cyan focus:outline-none appearance-none transition-all"
                    >
                        <option value="">Select State</option>
                        {Object.keys(INDIAN_LOCATIONS).sort().map(state => <option key={state} value={state}>{state}</option>)}
                    </select>
                </div>

                {/* District/City Filter */}
                <div className="md:col-span-3">
                     <select 
                        value={cityFilter}
                        onChange={(e) => { setCityFilter(e.target.value); setSearchMessage(null); }}
                        disabled={!stateFilter}
                        className="w-full bg-black/30 text-white border border-gray-700 rounded-xl px-5 py-3 focus:ring-1 focus:ring-brand-cyan focus:border-brand-cyan focus:outline-none appearance-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <option value="">{stateFilter ? 'Select District' : 'Select State First'}</option>
                        {availableDistricts.sort().map(city => <option key={city} value={city}>{city}</option>)}
                    </select>
                </div>

                {/* Genre Filter */}
                <div className="md:col-span-3">
                    <select 
                        value={genreFilter}
                        onChange={(e) => { setGenreFilter(e.target.value); setSearchMessage(null); }}
                        className="w-full bg-black/30 text-white border border-gray-700 rounded-xl px-5 py-3 focus:ring-1 focus:ring-brand-cyan focus:border-brand-cyan focus:outline-none appearance-none transition-all"
                    >
                        <option value="">All Genres</option>
                        {GENRES.map(genre => <option key={genre} value={genre}>{genre}</option>)}
                    </select>
                </div>

                {/* GPS Button */}
                <div className="md:col-span-3">
                    <button
                        onClick={handleNearbySearch}
                        disabled={isLocating}
                        className="w-full h-full bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan font-bold py-3 px-6 rounded-xl hover:bg-brand-cyan/20 hover:shadow-[0_0_15px_rgba(0,242,234,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isLocating ? <LoaderIcon className="w-5 h-5" /> : <MapPinIcon className="w-5 h-5"/>}
                        {isLocating ? 'Scanning...' : 'Near Me'}
                    </button>
                </div>
            </div>
        </div>

        {searchMessage && (
            <div className="text-center mb-8 flex justify-center items-center gap-4 bg-brand-violet/10 border border-brand-violet/30 p-3 rounded-lg inline-block mx-auto w-full max-w-md">
                <p className="text-brand-violet font-semibold">{searchMessage}</p>
                <button onClick={clearFilters} className="text-white text-sm underline hover:text-brand-cyan">Clear Results</button>
            </div>
        )}

        {loading ? (
          <div className="flex flex-col justify-center items-center py-32">
            <LoaderIcon className="w-16 h-16 text-brand-cyan" />
            <p className="text-gray-500 mt-4 animate-pulse">Accessing Artist Database...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-20">
            {filteredDjs.length > 0 ? (
              filteredDjs.map(dj => <DjCard key={dj.id} dj={dj} setView={setView} />)
            ) : (
              <div className="col-span-full text-center py-20">
                  <p className="text-2xl font-bold text-gray-600">No Artists Found</p>
                  <p className="text-gray-500 mt-2">Try adjusting your state or district filters.</p>
                  <button onClick={clearFilters} className="mt-6 text-brand-cyan hover:underline">View All DJs</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
