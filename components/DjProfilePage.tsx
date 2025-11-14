
import React, { useState, useEffect } from 'react';
import { DJProfile, View, DJCalendarEntry, CalendarStatus, User } from '../types';
import { getDjBySlug, getPublicDjAvailability, createBooking } from '../services/mockApiService';
import { StarIcon, VerifiedIcon, MapPinIcon, ChevronLeftIcon, LoaderIcon, MusicIcon, CalendarIcon, CheckCircleIcon } from './icons';

interface DjProfilePageProps {
  slug: string;
  setView: (view: View) => void;
  currentUser: User | null;
  showToast: (message: string, type?: 'success' | 'error') => void;
  openLoginModal: () => void;
}

const DjProfilePage: React.FC<DjProfilePageProps> = ({ slug, setView, currentUser, showToast, openLoginModal }) => {
  const [dj, setDj] = useState<DJProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [quoteRequested, setQuoteRequested] = useState(false);
  const [availability, setAvailability] = useState<Set<string>>(new Set());
  const [dateError, setDateError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchDjData = async () => {
      setLoading(true);
      const fetchedDj = await getDjBySlug(slug);
      if (fetchedDj) {
        setDj(fetchedDj);
        const availabilityData = await getPublicDjAvailability(fetchedDj.id);
        const unavailableDates = new Set<string>();
        availabilityData.forEach(entry => {
          if (entry.status !== CalendarStatus.AVAILABLE) {
            unavailableDates.add(new Date(entry.date).toISOString().split('T')[0]);
          }
        });
        setAvailability(unavailableDates);
      }
      setLoading(false);
    };
    fetchDjData();
  }, [slug]);
  
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = e.target.value;
    if (availability.has(selectedDate)) {
        setDateError('This date is unavailable. Please choose another.');
    } else {
        setDateError('');
    }
  };

  const handleRequestQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
        showToast("Please log in or register to book a DJ.", "error");
        openLoginModal();
        return;
    }
    if (dateError) {
        showToast("Please select an available date.", "error");
        return;
    }
    if (!dj) return;

    setIsSubmitting(true);
    const formData = new FormData(e.target as HTMLFormElement);
    const eventDate = formData.get('eventDate') as string;
    const eventType = formData.get('eventType') as string;
    
    try {
        await createBooking({
            djId: dj.id,
            customerId: currentUser.id,
            customerName: currentUser.name,
            eventDate: new Date(eventDate),
            eventType,
            location: dj.city, // simplified for demo
            notes: 'New inquiry from profile page.'
        });
        setQuoteRequested(true);
        showToast("Your inquiry has been sent!", "success");
    } catch(error: any) {
        showToast(error.message || "Failed to send inquiry.", "error");
    } finally {
        setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-dark">
        <LoaderIcon className="w-16 h-16 text-brand-cyan" />
      </div>
    );
  }

  if (!dj) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-brand-dark pt-20 text-white">
        <h2 className="text-3xl font-bold mb-4">DJ Not Found</h2>
        <button onClick={() => setView({ page: 'search' })} className="text-brand-cyan hover:underline">Go back to search</button>
      </div>
    );
  }

  const isVerified = dj.plan === 'PRO' || dj.plan === 'ELITE';

  return (
    <div className="bg-brand-dark text-white min-h-screen">
      <div className="relative h-64 md:h-96">
        <img src={dj.coverImage} alt={`${dj.name} cover`} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark to-transparent"></div>
        <button onClick={() => setView({ page: 'search' })} className="absolute top-24 left-4 md:left-8 bg-black/50 p-2 rounded-full hover:bg-black/75 transition-colors">
            <ChevronLeftIcon className="w-6 h-6"/>
        </button>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="relative -mt-24 md:-mt-32">
          <div className="lg:grid lg:grid-cols-3 lg:gap-8">
            <div className="lg:col-span-2">
              <div className="flex items-end space-x-5">
                <div className="flex-shrink-0">
                  <div className="relative">
                    <img className="h-32 w-32 md:h-48 md:w-48 rounded-full ring-4 ring-brand-dark object-cover" src={dj.profileImage} alt={dj.name} />
                  </div>
                </div>
                <div className="pt-1.5 pb-4">
                  <h1 className="text-3xl md:text-5xl font-bold text-white flex items-center gap-3">
                    {dj.name}
                    {isVerified && <VerifiedIcon className="w-8 h-8 text-brand-cyan" />}
                  </h1>
                  <p className="text-lg text-gray-400 flex items-center mt-2">
                    <MapPinIcon className="w-5 h-5 mr-2" /> {dj.city}
                  </p>
                   <div className="flex items-center gap-2 mt-2">
                    <StarIcon className="w-5 h-5 text-yellow-400" />
                    <span className="font-bold">{dj.avgRating.toFixed(1)}</span>
                    <span className="text-gray-400">({dj.reviews.length} reviews)</span>
                   </div>
                </div>
              </div>

              <div className="mt-8 space-y-8">
                <div>
                  <h2 className="text-2xl font-bold text-brand-cyan mb-4">About</h2>
                  <p className="text-gray-300 leading-relaxed">{dj.bio}</p>
                </div>

                <div>
                    <h2 className="text-2xl font-bold text-brand-cyan mb-4">Specialties</h2>
                    <div className="flex flex-wrap gap-4">
                        <div>
                            <h3 className="font-semibold text-white mb-2 flex items-center gap-2"><MusicIcon className="w-5 h-5"/>Genres</h3>
                            <div className="flex flex-wrap gap-2">
                                {dj.genres.map(g => <span key={g} className="bg-gray-700 text-gray-300 text-sm font-semibold px-3 py-1 rounded-full">{g}</span>)}
                            </div>
                        </div>
                        <div>
                            <h3 className="font-semibold text-white mb-2 flex items-center gap-2"><CalendarIcon className="w-5 h-5"/>Event Types</h3>
                            <div className="flex flex-wrap gap-2">
                                {dj.eventTypes.map(e => <span key={e} className="bg-gray-700 text-gray-300 text-sm font-semibold px-3 py-1 rounded-full">{e}</span>)}
                            </div>
                        </div>
                    </div>
                </div>
                
                 {dj.videos && dj.videos.length > 0 && (
                     <div>
                        <h2 className="text-2xl font-bold text-brand-cyan mb-4">Videos</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {dj.videos.map((videoUrl, i) => (
                                <div key={i} className="aspect-video">
                                    <iframe
                                        className="w-full h-full rounded-lg"
                                        src={videoUrl}
                                        title={`DJ video ${i + 1}`}
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    ></iframe>
                                </div>
                            ))}
                        </div>
                    </div>
                 )}

                <div>
                  <h2 className="text-2xl font-bold text-brand-cyan mb-4">Gallery</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {dj.gallery.map((img, i) => (
                      <img key={i} src={img} alt={`Gallery image ${i + 1}`} className="rounded-lg object-cover aspect-square hover:scale-105 transition-transform" />
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-brand-cyan mb-4">Reviews</h2>
                  <div className="space-y-6">
                    {dj.reviews.map(review => (
                      <div key={review.id} className="bg-brand-surface p-5 rounded-lg flex gap-4">
                        <img src={review.authorImage} alt={review.authorName} className="w-12 h-12 rounded-full"/>
                        <div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-bold text-white">{review.authorName}</p>
                                    <p className="text-xs text-gray-400">{review.createdAt.toLocaleDateString()}</p>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="font-bold text-white">{review.rating}</span>
                                    <StarIcon className="w-4 h-4 text-yellow-400" />
                                </div>
                            </div>
                            <p className="text-gray-300 mt-2">{review.comment}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1 mt-8 lg:mt-0">
              <div className="sticky top-24">
                 <div className="bg-brand-surface rounded-xl shadow-lg p-6">
                    {quoteRequested ? (
                         <div className="text-center py-8">
                            <CheckCircleIcon className="w-16 h-16 text-green-400 mx-auto mb-4" />
                            <h3 className="text-2xl font-bold text-white">Inquiry Sent!</h3>
                            <p className="text-gray-300 mt-2">{dj.name} will get back to you shortly.</p>
                         </div>
                    ) : (
                        <>
                          <h3 className="text-2xl font-bold text-white text-center">Book {dj.name}</h3>
                          <div className="text-center my-4">
                            <p className="text-gray-400 text-sm">Starting From</p>
                            <p className="text-4xl font-bold text-brand-cyan">₹{dj.minFee.toLocaleString('en-IN')}</p>
                          </div>
                          <form className="space-y-4" onSubmit={handleRequestQuote}>
                            <div>
                              <label className="text-sm font-medium text-gray-300">Event Date</label>
                              <input 
                                required 
                                type="date"
                                name="eventDate"
                                min={new Date().toISOString().split("T")[0]}
                                onChange={handleDateChange}
                                className="w-full mt-1 bg-brand-dark text-white border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-cyan focus:outline-none" 
                               />
                               {dateError && <p className="text-red-400 text-sm mt-1">{dateError}</p>}
                            </div>
                             <div>
                              <label className="text-sm font-medium text-gray-300">Event Type</label>
                              <select name="eventType" required className="w-full mt-1 bg-brand-dark text-white border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-cyan focus:outline-none appearance-none">
                                {dj.eventTypes.map(e => <option key={e}>{e}</option>)}
                              </select>
                            </div>
                            <button type="submit" disabled={!!dateError || isSubmitting} className="w-full bg-gradient-to-r from-brand-violet to-brand-cyan text-white font-bold py-3 px-4 rounded-full hover:scale-105 transition-transform duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center">
                              {isSubmitting ? <LoaderIcon className="w-6 h-6"/> : 'Request a Quote'}
                            </button>
                          </form>
                          <p className="text-xs text-gray-500 text-center mt-4">You won't be charged yet</p>
                        </>
                    )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DjProfilePage;
