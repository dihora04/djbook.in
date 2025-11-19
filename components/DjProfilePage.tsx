
import React, { useState, useEffect } from 'react';
import { DJProfile, View, DJCalendarEntry, CalendarStatus, User } from '../types';
import { getDjBySlug, getPublicDjAvailability, createBooking } from '../services/mockApiService';
import { StarIcon, VerifiedIcon, MapPinIcon, ChevronLeftIcon, LoaderIcon, MusicIcon, CalendarIcon, CheckCircleIcon, PhoneIcon, UserIcon, XCircleIcon } from './icons';

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
  const [availability, setAvailability] = useState<Set<string>>(new Set());
  
  // Booking Form State
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedEventType, setSelectedEventType] = useState('');
  const [dateError, setDateError] = useState<string>('');
  
  // Modal State
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [confirmDateChecked, setConfirmDateChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchDjData = async () => {
      setLoading(true);
      const fetchedDj = await getDjBySlug(slug);
      if (fetchedDj) {
        setDj(fetchedDj);
        // Set default event type
        if(fetchedDj.eventTypes.length > 0) setSelectedEventType(fetchedDj.eventTypes[0]);
        
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
  
  // Pre-fill name if user is logged in
  useEffect(() => {
      if (currentUser && isBookingModalOpen) {
          setCustomerName(currentUser.name);
      }
  }, [currentUser, isBookingModalOpen]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateVal = e.target.value;
    setSelectedDate(dateVal);
    if (availability.has(dateVal)) {
        setDateError('This date is unavailable. Please choose another.');
    } else {
        setDateError('');
    }
  };

  const handleInitialRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
        showToast("Please log in or register to book a DJ.", "error");
        openLoginModal();
        return;
    }
    if (dateError || !selectedDate) {
        showToast("Please select a valid date.", "error");
        return;
    }
    setIsBookingModalOpen(true);
  };

  const handleFinalBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dj || !currentUser) return;
    
    if (!customerName || !customerPhone) {
        showToast("Please provide all contact details.", "error");
        return;
    }
    if (!confirmDateChecked) {
        showToast("Please confirm the event date.", "error");
        return;
    }

    setIsSubmitting(true);
    
    try {
        const newBooking = await createBooking({
            djId: dj.id,
            customerId: currentUser.id,
            customerName: customerName, // Use the name from the modal
            customerPhone: customerPhone,
            eventDate: new Date(selectedDate),
            eventType: selectedEventType,
            location: dj.city, // simplified for demo
            notes: 'Booking request via platform.'
        });
        setIsBookingModalOpen(false);
        setView({ page: 'user-dashboard' });
        showToast(`Booking request sent (ID: ${newBooking.id}). The DJ has been notified.`, "success");
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
                    <h3 className="text-2xl font-bold text-white text-center">Book {dj.name}</h3>
                    <div className="text-center my-4">
                        <p className="text-gray-400 text-sm">Starting From</p>
                        <p className="text-4xl font-bold text-brand-cyan">₹{dj.minFee.toLocaleString('en-IN')}</p>
                    </div>
                    <form className="space-y-4" onSubmit={handleInitialRequest}>
                        <div>
                            <label className="text-sm font-medium text-gray-300">Event Date</label>
                            <input 
                            required 
                            type="date"
                            name="eventDate"
                            value={selectedDate}
                            min={new Date().toISOString().split("T")[0]}
                            onChange={handleDateChange}
                            className="w-full mt-1 bg-brand-dark text-white border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-cyan focus:outline-none" 
                            />
                            {dateError && <p className="text-red-400 text-sm mt-1">{dateError}</p>}
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-300">Event Type</label>
                            <select 
                                name="eventType" 
                                required 
                                value={selectedEventType}
                                onChange={(e) => setSelectedEventType(e.target.value)}
                                className="w-full mt-1 bg-brand-dark text-white border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-brand-cyan focus:outline-none appearance-none"
                            >
                            {dj.eventTypes.map(e => <option key={e} value={e}>{e}</option>)}
                            </select>
                        </div>
                        <button type="submit" disabled={!!dateError} className="w-full bg-gradient-to-r from-brand-violet to-brand-cyan text-white font-bold py-3 px-4 rounded-full hover:scale-105 transition-transform duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                            Request Quote
                        </button>
                    </form>
                    <p className="text-xs text-gray-500 text-center mt-4">You won't be charged yet</p>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- BOOKING CONFIRMATION MODAL --- */}
      {isBookingModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsBookingModalOpen(false)}></div>
              
              <div className="relative bg-brand-surface border border-glass-border rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-brand-violet/20 to-brand-cyan/20 p-6 border-b border-white/10 flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-display font-bold text-white">Complete Request</h2>
                            <p className="text-gray-400 text-sm mt-1">Booking Inquiry for <span className="text-brand-cyan font-bold">{dj.name}</span></p>
                        </div>
                        <button onClick={() => setIsBookingModalOpen(false)} className="text-gray-400 hover:text-white">
                            <XCircleIcon className="w-8 h-8" />
                        </button>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* 1. Date Confirmation Box */}
                        <div className="bg-brand-dark/50 border border-brand-cyan/30 rounded-xl p-4 flex flex-col items-center text-center">
                            <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Selected Event Date</p>
                            <div className="text-3xl font-bold text-white font-mono tracking-tight">
                                {selectedDate ? new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : 'No Date'}
                            </div>
                             <div className="mt-3 flex items-center gap-2 bg-brand-cyan/10 px-3 py-1 rounded-full border border-brand-cyan/20">
                                <CheckCircleIcon className="w-4 h-4 text-brand-cyan" />
                                <span className="text-xs text-brand-cyan font-bold uppercase">{selectedEventType}</span>
                            </div>
                        </div>

                        <form onSubmit={handleFinalBookingSubmit} className="space-y-4">
                             {/* 2. Contact Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Your Name</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <UserIcon className="h-5 w-5 text-gray-500" />
                                        </div>
                                        <input 
                                            type="text" 
                                            required
                                            value={customerName}
                                            onChange={(e) => setCustomerName(e.target.value)}
                                            className="w-full pl-10 bg-black/30 border border-gray-700 rounded-lg py-3 text-white focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan focus:outline-none transition-all"
                                            placeholder="Full Name"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Mobile Number</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <PhoneIcon className="h-5 w-5 text-gray-500" />
                                        </div>
                                        <input 
                                            type="tel" 
                                            required
                                            value={customerPhone}
                                            onChange={(e) => setCustomerPhone(e.target.value)}
                                            className="w-full pl-10 bg-black/30 border border-gray-700 rounded-lg py-3 text-white focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan focus:outline-none transition-all"
                                            placeholder="+91 98765 43210"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* 3. Explicit Confirmation Checkbox */}
                            <div className="pt-2">
                                <label className="flex items-start gap-3 cursor-pointer group p-3 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/10">
                                    <div className="relative flex items-center">
                                        <input 
                                            type="checkbox" 
                                            checked={confirmDateChecked}
                                            onChange={(e) => setConfirmDateChecked(e.target.checked)}
                                            className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-gray-600 bg-brand-dark transition-all checked:border-brand-cyan checked:bg-brand-cyan"
                                        />
                                        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-black opacity-0 peer-checked:opacity-100">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    </div>
                                    <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                                        I confirm that I want to book <span className="font-bold text-white">{dj.name}</span> for <span className="text-brand-cyan font-bold">{selectedDate}</span>.
                                    </span>
                                </label>
                            </div>

                            <button 
                                type="submit" 
                                disabled={isSubmitting || !confirmDateChecked}
                                className="w-full bg-gradient-to-r from-brand-violet to-brand-cyan text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-neon transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center mt-4"
                            >
                                {isSubmitting ? <LoaderIcon className="w-6 h-6" /> : 'CONFIRM & SEND REQUEST'}
                            </button>
                        </form>
                    </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default DjProfilePage;
