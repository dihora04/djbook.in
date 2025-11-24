
import React, { useEffect, useState } from 'react';
import { DJProfile, View } from '../types';
import { getDjsByCity } from '../services/mockApiService';
import DjCard from './DjCard';
import Seo from './ui/Seo';
import { LoaderIcon, CheckCircleIcon, MapPinIcon } from './icons';

interface CityPageProps {
    city: string;
    state?: string; // Optional state prop for better SEO context
    setView: (view: View) => void;
}

const CityPage: React.FC<CityPageProps> = ({ city, state, setView }) => {
    const [djs, setDjs] = useState<DJProfile[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDjs = async () => {
            setLoading(true);
            const result = await getDjsByCity(city);
            setDjs(result);
            setLoading(false);
        };
        fetchDjs();
    }, [city]);

    // Dynamic SEO Data
    const pageTitle = `Hire the Best Wedding DJ in ${city} - DJBook.in`;
    const pageDesc = `Looking for top-rated DJs in ${city}? Book verified professional DJs for weddings, parties, and corporate events in ${city}. Check prices and availability instantly.`;
    const canonical = `https://djbook.in/city/${city.toLowerCase().replace(/\s+/g, '-')}`;

    // Schema.org LocalBusiness/Service Data
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Service",
        "name": `DJ Services in ${city}`,
        "serviceType": "Entertainment",
        "areaServed": {
            "@type": "City",
            "name": city
        },
        "provider": {
            "@type": "Organization",
            "name": "DJBook.in",
            "url": "https://djbook.in",
            "logo": "https://djbook.in/logo.png"
        },
        "description": `Premium DJ booking services in ${city} for weddings and parties.`,
        "offers": {
            "@type": "Offer",
            "priceCurrency": "INR",
            "price": "15000",
            "description": "Starting price for DJ services"
        }
    };

    return (
        <div className="pt-20 bg-brand-dark min-h-screen">
            <Seo title={pageTitle} description={pageDesc} canonicalUrl={canonical} jsonLd={jsonLd} />

            {/* Hero Section */}
            <section className="relative py-20 overflow-hidden">
                <div className="absolute inset-0 bg-brand-violet/10 pointer-events-none"></div>
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-cyan/5 rounded-full blur-[100px] pointer-events-none"></div>
                
                <div className="container mx-auto px-4 text-center relative z-10">
                    <span className="inline-block py-1 px-3 rounded-full bg-white/10 border border-white/20 text-brand-cyan text-sm font-bold mb-4 uppercase tracking-widest backdrop-blur-md">
                        <MapPinIcon className="w-4 h-4 inline mr-1 mb-1"/> {city} {state ? `, ${state}` : ''}
                    </span>
                    <h1 className="text-4xl md:text-6xl font-bold text-white font-display mb-6">
                        Top Rated DJs for Hire in <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan to-brand-violet">{city}</span>
                    </h1>
                    <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                        Make your event unforgettable. Find verified, high-energy DJs in {city} for weddings, sangeets, and private parties.
                    </p>
                </div>
            </section>

            {/* DJ Listings */}
            <section className="py-12 container mx-auto px-4">
                <div className="flex justify-between items-end mb-8">
                    <h2 className="text-3xl font-bold text-white">Featured {city} DJs</h2>
                    <button onClick={() => setView({ page: 'search' })} className="text-brand-cyan hover:underline">View All</button>
                </div>

                {loading ? (
                     <div className="flex justify-center py-20"><LoaderIcon className="w-12 h-12 text-brand-cyan" /></div>
                ) : djs.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {djs.map(dj => <DjCard key={dj.id} dj={dj} setView={setView} />)}
                    </div>
                ) : (
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
                        <p className="text-xl text-gray-300">We are currently onboarding partners in {city}.</p>
                        <button onClick={() => setView({ page: 'search' })} className="mt-4 bg-brand-cyan text-black font-bold py-2 px-6 rounded-full">Find Nearby DJs</button>
                    </div>
                )}
            </section>

            {/* SEO Content: "Why Book" */}
            <section className="py-20 bg-brand-surface border-y border-white/5">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-white text-center mb-12">The DJBook {city} Guarantee</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { title: 'Verified Talent', desc: `Every DJ in ${city} on our platform is vetted for experience and equipment quality.` },
                            { title: 'Secure Payments', desc: 'Your advance is safe with us. We release payments only after booking confirmation.' },
                            { title: 'Backup Support', desc: `In the rare event of a cancellation, we help you find a replacement DJ in ${city} instantly.` }
                        ].map((item, i) => (
                            <div key={i} className="bg-brand-dark p-8 rounded-2xl border border-white/5 hover:border-brand-cyan/30 transition-all">
                                <CheckCircleIcon className="w-8 h-8 text-brand-cyan mb-4" />
                                <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                                <p className="text-gray-400">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* SEO Content: FAQ */}
            <section className="py-20 container mx-auto px-4 max-w-4xl">
                <h2 className="text-3xl font-bold text-white text-center mb-12">FAQ: DJ Booking Cost in {city}</h2>
                <div className="space-y-4">
                    {[
                        { q: `How much does a Wedding DJ cost in ${city}?`, a: `Prices in ${city} typically range from ₹15,000 for budget options to ₹75,000+ for premium artists with sound setups.` },
                        { q: `Do ${city} DJs bring their own sound and lights?`, a: "Most professional DJs listed on DJBook provide comprehensive packages that include PA systems, dance floor lighting, and smoke machines." },
                        { q: "How far in advance should I book?", a: `For wedding seasons in ${city}, we recommend booking at least 3-6 months in advance to secure the best talent.` }
                    ].map((faq, i) => (
                        <div key={i} className="bg-white/5 rounded-xl p-6">
                            <h3 className="font-bold text-lg text-white mb-2">{faq.q}</h3>
                            <p className="text-gray-300">{faq.a}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default CityPage;
