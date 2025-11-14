import React, { useState, useEffect } from 'react';
import { DJProfile, View } from '../types';
import { getFeaturedDjs } from '../services/mockApiService';
import DjCard from './DjCard';
import { LoaderIcon } from './icons';
import { renderCanvas } from './ui/canvas';

interface HomePageProps {
  setView: (view: View) => void;
}

const HomePage: React.FC<HomePageProps> = ({ setView }) => {
    const [featuredDjs, setFeaturedDjs] = useState<DJProfile[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDjs = async () => {
            setLoading(true);
            const djs = await getFeaturedDjs();
            setFeaturedDjs(djs);
            setLoading(false);
        };
        fetchDjs();
    }, []);

    useEffect(() => {
      renderCanvas();
    }, []);

    return (
        <div className="pt-20">
            {/* Hero Section */}
            <section 
              className="relative min-h-[60vh] md:min-h-[80vh] flex items-center justify-center text-center bg-cover bg-center overflow-hidden"
              style={{backgroundImage: "url('https://picsum.photos/seed/partybg/1920/1080')"}}
            >
                <canvas id="canvas" className="absolute top-0 left-0 w-full h-full pointer-events-none"></canvas>
                <div className="absolute inset-0 bg-brand-dark/70"></div>
                <div className="relative z-10 px-4">
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter mb-4 text-white">
                        Book DJs Instantly.
                        <br />
                        <span className="text-brand-cyan">Anytime. Anywhere.</span>
                    </h1>
                    <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-300 mb-8">
                        Find verified DJs for weddings, parties & corporate events across India.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <input 
                            type="text" 
                            placeholder="Find DJ by city, genre, or name..." 
                            className="w-full sm:w-80 bg-white/10 backdrop-blur-sm text-white placeholder-gray-400 border border-gray-600 rounded-full px-6 py-3 focus:ring-2 focus:ring-brand-cyan focus:outline-none"
                        />
                        <button 
                            onClick={() => setView({ page: 'search' })}
                            className="bg-gradient-to-r from-brand-violet to-brand-cyan text-white font-bold py-3 px-8 rounded-full hover:scale-105 transition-transform duration-300 shadow-lg shadow-brand-cyan/30"
                        >
                            Search
                        </button>
                    </div>
                </div>
            </section>

            {/* Featured DJs */}
            <section className="py-20 bg-brand-dark">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Featured DJs</h2>
                    {loading ? (
                         <div className="flex justify-center items-center h-64">
                            <LoaderIcon className="w-12 h-12 text-brand-cyan" />
                         </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {featuredDjs.map(dj => (
                                <DjCard key={dj.id} dj={dj} setView={setView} />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* How it works */}
            <section className="py-20 bg-brand-surface">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">How It Works</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                    <div className="p-6">
                        <div className="text-5xl mb-4 text-brand-cyan">1</div>
                        <h3 className="text-2xl font-bold mb-2">Explore DJs</h3>
                        <p className="text-gray-400">Search and filter hundreds of verified DJs by city, genre, and event type.</p>
                    </div>
                    <div className="p-6">
                        <div className="text-5xl mb-4 text-brand-cyan">2</div>
                        <h3 className="text-2xl font-bold mb-2">Book Instantly</h3>
                        <p className="text-gray-400">Check availability, get quotes, and pay a secure advance to confirm your booking.</p>
                    </div>
                    <div className="p-6">
                        <div className="text-5xl mb-4 text-brand-cyan">3</div>
                        <h3 className="text-2xl font-bold mb-2">Enjoy the Beat</h3>
                        <p className="text-gray-400">Your chosen DJ arrives and makes your event unforgettable. It's that simple!</p>
                    </div>
                </div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;