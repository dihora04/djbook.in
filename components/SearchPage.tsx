
import React, { useState, useEffect } from 'react';
import { DJProfile, View } from '../types';
import { getDjs, getNearbyDjs } from '../services/mockApiService';
import { CITIES, GENRES } from '../constants';
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
  const [cityFilter, setCityFilter] = useState('');
  const [genreFilter, setGenreFilter] = useState('');
  const [searchMessage, setSearchMessage] = useState<string | null>(null);


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
    
    if (cityFilter) {
      result = result.filter(dj => dj.city === cityFilter);
    }
    
    if (genreFilter) {
      result = result.filter(dj => dj.genres.includes(genreFilter));
    }
    
    setFilteredDjs(result);
  }, [searchTerm, cityFilter, genreFilter, allDjs, searchMessage]);

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
    }, () => {
      alert("Unable to retrieve your location.");
      setIsLocating(false);
      setLoading(false);
    });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setCityFilter('');
    setGenreFilter('');
    setSearchMessage(null);
    setFilteredDjs(allDjs);
  };


  return (
    <div className="pt-24 bg-brand-dark min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-brand-surface p-6 rounded-xl shadow-lg mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-center mb-6">Find Your Perfect DJ</h1>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input 
                    type="text"
                    placeholder="Search by name..."
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setSearchMessage(null); }}
                    className="w-full md:col-span-2 bg-brand-dark text-white placeholder-gray-400 border border-gray-600 rounded-full px-6 py-3 focus:ring-2 focus:ring-brand-cyan focus:outline-none"
                />
                <select 
                    value={cityFilter}
                    onChange={(e) => { setCityFilter(e.target.value); setSearchMessage(null); }}
                    className="w-full bg-brand-dark text-white border border-gray-600 rounded-full px-6 py-3 focus:ring-2 focus:ring-brand-cyan focus:outline-none appearance-none"
                >
                    <option value="">All Cities</option>
                    {CITIES.map(city => <option key={city} value={city}>{city}</option>)}
                </select>
                <select 
                    value={genreFilter}
                    onChange={(e) => { setGenreFilter(e.target.value); setSearchMessage(null); }}
                    className="w-full bg-brand-dark text-white border border-gray-600 rounded-full px-6 py-3 focus:ring-2 focus:ring-brand-cyan focus:outline-none appearance-none"
                >
                    <option value="">All Genres</option>
                    {GENRES.map(genre => <option key={genre} value={genre}>{genre}</option>)}
                </select>
                <button
                    onClick={handleNearbySearch}
                    disabled={isLocating}
                    className="md:col-span-4 bg-brand-cyan/20 text-brand-cyan font-bold py-3 px-6 rounded-full hover:bg-brand-cyan/30 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {isLocating ? <LoaderIcon className="w-5 h-5" /> : <MapPinIcon className="w-5 h-5"/>}
                    {isLocating ? 'Finding you...' : 'Find DJs Near Me'}
                </button>
            </div>
        </div>

        {searchMessage && (
            <div className="text-center mb-4 text-gray-300 flex justify-center items-center gap-4">
                <p>{searchMessage}</p>
                <button onClick={clearFilters} className="text-brand-cyan font-semibold hover:underline text-sm">Clear</button>
            </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <LoaderIcon className="w-16 h-16 text-brand-cyan" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-20">
            {filteredDjs.length > 0 ? (
              filteredDjs.map(dj => <DjCard key={dj.id} dj={dj} setView={setView} />)
            ) : (
              <p className="col-span-full text-center text-gray-400 text-lg">No DJs found matching your criteria.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;