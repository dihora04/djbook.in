
import React, { useState, useEffect } from 'react';
import { DJProfile, View } from '../types';
import { getDjs } from '../services/mockApiService';
import { CITIES, GENRES } from '../constants';
import DjCard from './DjCard';
import { LoaderIcon } from './icons';

interface SearchPageProps {
  setView: (view: View) => void;
}

const SearchPage: React.FC<SearchPageProps> = ({ setView }) => {
  const [allDjs, setAllDjs] = useState<DJProfile[]>([]);
  const [filteredDjs, setFilteredDjs] = useState<DJProfile[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [genreFilter, setGenreFilter] = useState('');

  useEffect(() => {
    const fetchDjs = async () => {
      setLoading(true);
      // getDjs now only fetches approved DJs
      const djs = await getDjs();
      setAllDjs(djs);
      setFilteredDjs(djs);
      setLoading(false);
    };
    fetchDjs();
  }, []);
  
  useEffect(() => {
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
  }, [searchTerm, cityFilter, genreFilter, allDjs]);


  return (
    <div className="pt-24 bg-brand-dark min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-brand-surface p-6 rounded-xl shadow-lg mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-center mb-6">Find Your Perfect DJ</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input 
                    type="text"
                    placeholder="Search by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-brand-dark text-white placeholder-gray-400 border border-gray-600 rounded-full px-6 py-3 focus:ring-2 focus:ring-brand-cyan focus:outline-none"
                />
                <select 
                    value={cityFilter}
                    onChange={(e) => setCityFilter(e.target.value)}
                    className="w-full bg-brand-dark text-white border border-gray-600 rounded-full px-6 py-3 focus:ring-2 focus:ring-brand-cyan focus:outline-none appearance-none"
                >
                    <option value="">All Cities</option>
                    {CITIES.map(city => <option key={city} value={city}>{city}</option>)}
                </select>
                <select 
                    value={genreFilter}
                    onChange={(e) => setGenreFilter(e.target.value)}
                    className="w-full bg-brand-dark text-white border border-gray-600 rounded-full px-6 py-3 focus:ring-2 focus:ring-brand-cyan focus:outline-none appearance-none"
                >
                    <option value="">All Genres</option>
                    {GENRES.map(genre => <option key={genre} value={genre}>{genre}</option>)}
                </select>
            </div>
        </div>

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
