
import React, { useState } from 'react';
import { DJProfile, View } from '../types';
import { getLiveDjs } from '../services/mockApiService';
import { findLiveDjsWithGemini } from '../services/geminiService';
import { LoaderIcon, RadioIcon, MapPinIcon } from './icons';
import DjCard from './DjCard';

interface FindLiveDjsProps {
    setView: (view: View) => void;
}

const FindLiveDjs: React.FC<FindLiveDjsProps> = ({ setView }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [liveDjs, setLiveDjs] = useState<DJProfile[]>([]);
    const [geminiResponse, setGeminiResponse] = useState<string | null>(null);
    const [hasSearched, setHasSearched] = useState(false);

    const handleFindLiveDjs = () => {
        setIsLoading(true);
        setError(null);
        setGeminiResponse(null);
        setLiveDjs([]);
        setHasSearched(true);

        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser.");
            setIsLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const fetchedLiveDjs = await getLiveDjs();
                    setLiveDjs(fetchedLiveDjs);
                    
                    const response = await findLiveDjsWithGemini({ latitude, longitude }, fetchedLiveDjs);
                    setGeminiResponse(response);

                } catch (apiError) {
                    console.error("API Error:", apiError);
                    setError("Could not fetch live DJ data. Please try again later.");
                } finally {
                    setIsLoading(false);
                }
            },
            (geoError) => {
                console.error("Geolocation Error:", geoError);
                let errorMessage = "Could not get your location. ";
                switch(geoError.code) {
                    case geoError.PERMISSION_DENIED:
                        errorMessage += "Please allow location access and try again.";
                        break;
                    case geoError.POSITION_UNAVAILABLE:
                        errorMessage += "Location information is unavailable.";
                        break;
                    case geoError.TIMEOUT:
                        errorMessage += "The request to get user location timed out.";
                        break;
                    default:
                        errorMessage += "An unknown error occurred.";
                        break;
                }
                setError(errorMessage);
                setIsLoading(false);
            }
        );
    };

    return (
        <section className="py-20 bg-brand-surface">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <RadioIcon className="w-12 h-12 mx-auto text-brand-cyan mb-4" />
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
                    Who's Playing Live Right Now?
                </h2>
                <p className="max-w-2xl mx-auto text-lg text-gray-400 mb-8">
                    Discover DJs performing live near you and jump into the action.
                </p>
                <button
                    onClick={handleFindLiveDjs}
                    disabled={isLoading}
                    className="bg-gradient-to-r from-red-600 to-red-800 text-white font-bold py-4 px-10 rounded-full hover:scale-105 transition-transform duration-300 shadow-lg shadow-red-500/30 flex items-center justify-center mx-auto disabled:opacity-50"
                >
                    {isLoading ? (
                        <>
                            <LoaderIcon className="w-6 h-6 mr-3" />
                            Finding DJs...
                        </>
                    ) : (
                         <>
                            <MapPinIcon className="w-6 h-6 mr-3" />
                            Find Live DJs Near Me
                        </>
                    )}
                </button>

                {hasSearched && (
                    <div className="mt-12 text-left">
                         {error && <p className="text-red-400 text-center">{error}</p>}
                         
                         {geminiResponse && (
                            <div className="bg-brand-dark p-6 rounded-xl prose prose-invert prose-p:text-gray-300 prose-headings:text-brand-cyan max-w-4xl mx-auto">
                                <p>{geminiResponse}</p>
                            </div>
                         )}

                         {liveDjs.length > 0 && (
                            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                                {liveDjs.map(dj => (
                                    <DjCard key={dj.id} dj={dj} setView={setView} />
                                ))}
                            </div>
                         )}
                    </div>
                )}
            </div>
        </section>
    );
};

export default FindLiveDjs;