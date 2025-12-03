
import { DJProfile, Booking, User, DJCalendarEntry, CalendarStatus, BookingStatus, Role, SubscriptionTier, BlogPost } from '../types';
import { MOCK_USERS, MOCK_DJS, MOCK_BOOKINGS, MOCK_CALENDAR_ENTRIES } from '../constants';

const ARTIFICIAL_DELAY = 300; 

// --- MOCK BLOG DATA ---
const MOCK_BLOG_POSTS: BlogPost[] = [
    {
        id: '1',
        slug: 'how-to-hire-wedding-dj-india',
        title: 'The Ultimate Guide to Hiring a Wedding DJ in India (2025)',
        excerpt: 'Don\'t let a bad DJ ruin your Sangeet. Here are the top 5 things to look for when booking a wedding DJ.',
        content: 'Planning an Indian wedding is chaotic. The music shouldn\'t be. In this guide, we break down pricing, equipment checks, and how to verify a DJ\'s experience...',
        author: 'DJBook Team',
        date: 'October 15, 2024',
        coverImage: 'https://picsum.photos/seed/blog1/800/400',
        tags: ['Wedding', 'Tips', 'Guide']
    },
    {
        id: '2',
        slug: 'cost-of-dj-in-mumbai',
        title: 'How Much Does a DJ Cost in Mumbai? Price Breakdown',
        excerpt: 'From club gigs to private parties, understand the standard rates for professional DJs in Mumbai.',
        content: 'Mumbai is the entertainment capital. Prices range from ₹15,000 for beginners to ₹2,00,000+ for celebrity DJs...',
        author: 'Rahul Verma',
        date: 'November 2, 2024',
        coverImage: 'https://picsum.photos/seed/blog2/800/400',
        tags: ['Pricing', 'Mumbai', 'Corporate']
    },
    {
        id: '3',
        slug: 'top-songs-wedding-2025',
        title: 'Top 20 Bollywood Songs for Your Baraat in 2025',
        excerpt: 'Update your playlist with these high-energy tracks that are guaranteed to get everyone dancing.',
        content: 'No Baraat is complete without the classics, but 2025 brings a new wave of remixes...',
        author: 'DJ Riya',
        date: 'November 10, 2024',
        coverImage: 'https://picsum.photos/seed/blog3/800/400',
        tags: ['Music', 'Playlist', 'Bollywood']
    }
];

if (!(window as any).mockDb) {
  console.log("Initializing mock database with data...");
  (window as any).mockDb = {
    djsStore: [...MOCK_DJS],
    bookingsStore: [...MOCK_BOOKINGS],
    usersStore: [...MOCK_USERS],
    calendarEntriesStore: [...MOCK_CALENDAR_ENTRIES],
  };
}

const db = (window as any).mockDb;

// Helper to get consistent YYYY-MM-DD string from Date object
const getDateStr = (date: Date | string) => {
    const d = new Date(date);
    // Use ISO string split, assumes Date objects are UTC or we just want the date part
    return d.toISOString().split('T')[0];
};

const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

// --- CITY WISE RANKING LOGIC ---
const calculateDjRankings = (djs: DJProfile[]): DJProfile[] => {
    // 1. Group DJs by city
    const djsByCity: Record<string, DJProfile[]> = {};
    djs.forEach(dj => {
        if (dj.city && dj.approvalStatus === 'APPROVED') {
            if (!djsByCity[dj.city]) djsByCity[dj.city] = [];
            djsByCity[dj.city].push(dj);
        }
    });

    // 2. Sort each city group by Rating (High to Low), then by Review Count
    Object.keys(djsByCity).forEach(city => {
        djsByCity[city].sort((a, b) => {
            if (b.avgRating !== a.avgRating) return b.avgRating - a.avgRating;
            return b.reviews.length - a.reviews.length;
        });
        
        // 3. Assign rank to top 3
        djsByCity[city].forEach((dj, index) => {
            dj.cityRank = index + 1;
        });
    });
    
    return djs;
};

export const loginUser = async (email: string, password_param: string): Promise<User> => {
    console.log(`Attempting to log in user with email: ${email}`);
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const user = db.usersStore.find((u: User) => u.email.toLowerCase() === email.toLowerCase());
            if (user && user.password === password_param) {
                console.log("Login successful for:", user.name);
                resolve(user);
            } else {
                console.log("Login failed: Invalid credentials");
                reject(new Error('Invalid email or password'));
            }
        }, ARTIFICIAL_DELAY);
    });
};

export const registerUser = async (name: string, email: string, password_param: string, role: Role, location?: { lat: number, lon: number }, plan: SubscriptionTier = SubscriptionTier.FREE, state?: string, city?: string): Promise<User> => {
    console.log(`Attempting to register new user: ${email} with role: ${role} and plan: ${plan}`);
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (db.usersStore.some((u: User) => u.email.toLowerCase() === email.toLowerCase())) {
                console.log("Registration failed: Email already exists");
                return reject(new Error('A user with this email already exists.'));
            }

            const timestamp = Date.now();
            const randomId = Math.floor(Math.random() * 10000);
            
            const newUser: User = {
                id: `user-${timestamp}-${randomId}`,
                name,
                email,
                password: password_param,
                role,
            };

            if (role === Role.DJ) {
                const newDjProfile: DJProfile = {
                    id: `dj-${timestamp}-${randomId}`,
                    userId: newUser.id,
                    name: name,
                    slug: name.toLowerCase().replace(/\s+/g, '-') + `-${timestamp}`,
                    city: city || '',
                    state: state || '',
                    genres: [],
                    eventTypes: [],
                    minFee: 0,
                    bio: '',
                    gallery: [],
                    videos: [],
                    verified: plan === SubscriptionTier.PRO || plan === SubscriptionTier.ELITE,
                    featured: plan === SubscriptionTier.PRO || plan === SubscriptionTier.ELITE,
                    avgRating: 0,
                    reviews: [],
                    profileImage: 'https://picsum.photos/seed/newdj/400/400',
                    coverImage: 'https://picsum.photos/seed/newdj_cover/1600/900',
                    approvalStatus: 'PENDING',
                    plan: plan,
                    latitude: location?.lat,
                    longitude: location?.lon,
                    googleCalendarConnected: false,
                };
                db.djsStore.push(newDjProfile);
                newUser.djProfileId = newDjProfile.id;
                console.log("Created new PENDING DJ profile:", newDjProfile.id);
            }

            db.usersStore.push(newUser);
            console.log("Registration successful for new user:", newUser);
            resolve(newUser);

        }, ARTIFICIAL_DELAY);
    });
};

export const getDjs = async (): Promise<DJProfile[]> => {
  return new Promise(resolve => {
    setTimeout(() => {
      let djs = db.djsStore.filter((dj: DJProfile) => dj.approvalStatus === 'APPROVED');
      // Apply ranking logic
      djs = calculateDjRankings(djs);
      resolve(djs);
    }, ARTIFICIAL_DELAY);
  });
};

export const getDjsByCity = async (city: string): Promise<DJProfile[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            let djs = db.djsStore.filter((dj: DJProfile) => 
                dj.approvalStatus === 'APPROVED' && 
                dj.city.toLowerCase() === city.toLowerCase()
            );
            djs = calculateDjRankings(djs);
            resolve(djs);
        }, ARTIFICIAL_DELAY);
    });
};

export const getNearbyDjs = async (lat: number, lon: number, radius: number = 50): Promise<DJProfile[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            // 1. Get all approved DJs first to calculate global city ranks
            const allApproved = calculateDjRankings(db.djsStore.filter((d: DJProfile) => d.approvalStatus === 'APPROVED'));
            
            // 2. Filter for nearby
            let nearbyDjs = allApproved
                .filter(dj => dj.latitude && dj.longitude)
                .map(dj => ({
                    ...dj,
                    distance: haversineDistance(lat, lon, dj.latitude!, dj.longitude!),
                }))
                .filter(dj => dj.distance <= radius)
                .sort((a, b) => a.distance - b.distance);
            
            resolve(nearbyDjs);
        }, ARTIFICIAL_DELAY);
    });
};

export const getAllDjsForAdmin = async (): Promise<DJProfile[]> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve([...db.djsStore]);
    }, ARTIFICIAL_DELAY);
  });
};

export const getFeaturedDjs = async (): Promise<DJProfile[]> => {
    return new Promise(resolve => {
      setTimeout(() => {
        let allApproved = calculateDjRankings(db.djsStore.filter((d: DJProfile) => d.approvalStatus === 'APPROVED'));
        resolve(allApproved.filter(dj => dj.featured));
      }, ARTIFICIAL_DELAY);
    });
};

export const getDjBySlug = async (slug: string): Promise<DJProfile | undefined> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const dj = db.djsStore.find((dj: DJProfile) => dj.slug === slug);
      if (dj && dj.approvalStatus === 'APPROVED') {
          // Calculate ranks for context
          const allApproved = calculateDjRankings(db.djsStore.filter((d: DJProfile) => d.approvalStatus === 'APPROVED'));
          const rankedDj = allApproved.find(d => d.id === dj.id);
          resolve(rankedDj || dj);
      } else {
        resolve(undefined);
      }
    }, ARTIFICIAL_DELAY);
  });
};

export const getDjById = async (id: string): Promise<DJProfile | undefined> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const dj = db.djsStore.find((dj: DJProfile) => dj.id === id);
      resolve(dj);
    }, ARTIFICIAL_DELAY);
  });
};

export const getBookingsByDjId = async (djId: string): Promise<Booking[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(db.bookingsStore.filter((booking: Booking) => booking.djId === djId));
        }, ARTIFICIAL_DELAY);
    });
};

export const getAllBookings = async (): Promise<Booking[]> => {
     return new Promise(resolve => {
        setTimeout(() => {
            resolve(db.bookingsStore);
        }, ARTIFICIAL_DELAY);
    });
}

export const getBookingsByCustomerId = async (customerId: string): Promise<Booking[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const bookings = db.bookingsStore.filter((booking: Booking) => booking.customerId === customerId).map((b: Booking) => {
                const dj = db.djsStore.find((d: DJProfile) => d.id === b.djId);
                return {...b, djName: dj?.name || 'Unknown DJ', djProfileImage: dj?.profileImage || ''};
            });
            resolve(bookings);
        }, ARTIFICIAL_DELAY);
    });
};

export const getDjCalendarEntries = async (djId: string): Promise<DJCalendarEntry[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(db.calendarEntriesStore.filter((entry: DJCalendarEntry) => entry.djProfileId === djId));
        }, ARTIFICIAL_DELAY);
    });
};

export const getPublicDjAvailability = async (djId: string): Promise<Pick<DJCalendarEntry, 'date' | 'status'>[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const entries = db.calendarEntriesStore
                .filter((entry: DJCalendarEntry) => entry.djProfileId === djId)
                .map(({ date, status }: DJCalendarEntry) => ({ date, status }));
            resolve(entries);
        }, ARTIFICIAL_DELAY);
    });
};

export const updateDjCalendarEntry = async (djId: string, entryData: Omit<DJCalendarEntry, 'id' | 'djProfileId'>): Promise<DJCalendarEntry> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const dateStr = getDateStr(entryData.date);
            let updatedEntry: DJCalendarEntry | undefined;

            const existingEntryIndex = db.calendarEntriesStore.findIndex((entry: DJCalendarEntry) => 
                entry.djProfileId === djId && getDateStr(entry.date) === dateStr
            );

            if (existingEntryIndex !== -1) {
                if (entryData.status === CalendarStatus.AVAILABLE) {
                    updatedEntry = db.calendarEntriesStore[existingEntryIndex];
                    db.calendarEntriesStore.splice(existingEntryIndex, 1);
                } else {
                    db.calendarEntriesStore[existingEntryIndex] = { ...db.calendarEntriesStore[existingEntryIndex], ...entryData };
                    updatedEntry = db.calendarEntriesStore[existingEntryIndex];
                }
            } else if (entryData.status !== CalendarStatus.AVAILABLE) {
                updatedEntry = {
                    ...entryData,
                    id: `cal-entry-${Date.now()}`,
                    djProfileId: djId,
                };
                db.calendarEntriesStore.push(updatedEntry);
            }
            
            resolve(updatedEntry || { ...entryData, id: 'temp-removed', djProfileId: djId });
        }, ARTIFICIAL_DELAY);
    });
};

// --- GOOGLE CALENDAR SIMULATION ---
export const toggleGoogleCalendar = async (djId: string): Promise<boolean> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const djIndex = db.djsStore.findIndex((d: DJProfile) => d.id === djId);
            if (djIndex === -1) return reject(new Error("DJ not found"));

            const currentStatus = !!db.djsStore[djIndex].googleCalendarConnected;
            const newStatus = !currentStatus;

            // Update Profile
            db.djsStore[djIndex].googleCalendarConnected = newStatus;

            // Simulate fetching/removing events
            if (newStatus) {
                // Simulating adding Google Events
                const today = new Date();
                const sampleEvents = [
                    { offset: 2, title: 'Google: Studio Session' },
                    { offset: 5, title: 'Google: Personal' },
                    { offset: 12, title: 'Google: Vacation' }
                ];

                sampleEvents.forEach((evt, idx) => {
                    const date = new Date(today);
                    date.setDate(today.getDate() + evt.offset);
                    
                    db.calendarEntriesStore.push({
                        id: `google-event-${Date.now()}-${idx}`,
                        djProfileId: djId,
                        date: date,
                        status: CalendarStatus.UNAVAILABLE, // Block the date
                        title: evt.title,
                        note: 'Synced from Google Calendar'
                    });
                });
            } else {
                // Simulating removing Google Events
                db.calendarEntriesStore = db.calendarEntriesStore.filter((entry: DJCalendarEntry) => 
                    entry.djProfileId !== djId || !entry.title?.startsWith('Google:')
                );
            }

            resolve(newStatus);
        }, 1000); // Longer delay to simulate API handshake
    });
};

export const acceptBooking = async (bookingId: string, djId: string): Promise<Booking> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const bookingIndex = db.bookingsStore.findIndex((b: Booking) => b.id === bookingId && b.djId === djId);
            if (bookingIndex === -1) {
                return reject(new Error('Booking not found'));
            }

            const updatedBooking = { ...db.bookingsStore[bookingIndex], status: BookingStatus.ACCEPTED };
            db.bookingsStore[bookingIndex] = updatedBooking;

            const dateStr = getDateStr(updatedBooking.eventDate);
            const calendarEntryIndex = db.calendarEntriesStore.findIndex((entry: DJCalendarEntry) => 
                entry.djProfileId === djId && getDateStr(entry.date) === dateStr
            );

            if (calendarEntryIndex !== -1) {
                db.calendarEntriesStore[calendarEntryIndex].status = CalendarStatus.BOOKED;
                db.calendarEntriesStore[calendarEntryIndex].title = `Platform: ${updatedBooking.eventType}`;
                db.calendarEntriesStore[calendarEntryIndex].bookingId = bookingId;
            } else {
                db.calendarEntriesStore.push({
                    id: `cal-entry-${Date.now()}`,
                    djProfileId: djId,
                    date: updatedBooking.eventDate,
                    status: CalendarStatus.BOOKED,
                    title: `Platform: ${updatedBooking.eventType}`,
                    bookingId: bookingId,
                });
            }
            
            resolve(updatedBooking);
        }, ARTIFICIAL_DELAY);
    });
};

export const rejectBooking = async (bookingId: string, djId: string): Promise<Booking> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const bookingIndex = db.bookingsStore.findIndex((b: Booking) => b.id === bookingId && b.djId === djId);
            if (bookingIndex === -1) {
                return reject(new Error('Booking not found'));
            }

            const updatedBooking = { ...db.bookingsStore[bookingIndex], status: BookingStatus.REJECTED };
            db.bookingsStore[bookingIndex] = updatedBooking;

            const dateStr = getDateStr(updatedBooking.eventDate);
            const calendarEntryIndex = db.calendarEntriesStore.findIndex((entry: DJCalendarEntry) => 
                entry.djProfileId === djId && 
                getDateStr(entry.date) === dateStr &&
                entry.bookingId === bookingId
            );

            if (calendarEntryIndex !== -1) {
                db.calendarEntriesStore.splice(calendarEntryIndex, 1);
            }
            
            resolve(updatedBooking);
        }, ARTIFICIAL_DELAY);
    });
};

export const createBooking = async (bookingData: Omit<Booking, 'id'|'status'|'djName'|'djProfileImage'>): Promise<Booking> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const dateStr = getDateStr(bookingData.eventDate);
            const djCalendar = db.calendarEntriesStore.filter((e: DJCalendarEntry) => e.djProfileId === bookingData.djId);
            
            // Check for conflict using String comparison to avoid timezone issues
            const isUnavailable = djCalendar.some((e: DJCalendarEntry) => getDateStr(e.date) === dateStr && e.status !== CalendarStatus.AVAILABLE);

            if (isUnavailable) {
                return reject(new Error("The selected date is no longer available."));
            }

            const dj = db.djsStore.find((d: DJProfile) => d.id === bookingData.djId);
            if (!dj) return reject(new Error("DJ not found"));

            const newBooking: Booking = {
                ...bookingData,
                id: `booking-${Date.now()}`,
                status: BookingStatus.PENDING,
                djName: dj.name,
                djProfileImage: dj.profileImage
            };
            db.bookingsStore.push(newBooking);

            db.calendarEntriesStore.push({
                id: `cal-entry-${Date.now()}`,
                djProfileId: bookingData.djId,
                date: newBooking.eventDate,
                status: CalendarStatus.HOLD,
                title: 'Platform Inquiry',
                bookingId: newBooking.id,
            });
            
            resolve(newBooking);
        }, ARTIFICIAL_DELAY);
    });
};

export const updateDjProfile = async (djId: string, profileData: Partial<DJProfile>): Promise<DJProfile> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const djIndex = db.djsStore.findIndex((d: DJProfile) => d.id === djId);
            if (djIndex === -1) {
                return reject(new Error("DJ profile not found"));
            }
            db.djsStore[djIndex] = { ...db.djsStore[djIndex], ...profileData };
            resolve(db.djsStore[djIndex]);
        }, ARTIFICIAL_DELAY);
    });
};

export const approveDj = async (djId: string): Promise<DJProfile> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const djIndex = db.djsStore.findIndex((d: DJProfile) => d.id === djId);
            if (djIndex === -1) return reject(new Error("DJ not found"));
            
            const updatedDj = {
                ...db.djsStore[djIndex],
                approvalStatus: 'APPROVED' as const
            };
            db.djsStore[djIndex] = updatedDj;
            
            resolve(updatedDj);
        }, ARTIFICIAL_DELAY);
    });
};

export const rejectDj = async (djId: string): Promise<DJProfile> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const djIndex = db.djsStore.findIndex((d: DJProfile) => d.id === djId);
            if (djIndex === -1) return reject(new Error("DJ not found"));

            const updatedDj = {
                ...db.djsStore[djIndex],
                approvalStatus: 'REJECTED' as const
            };
            db.djsStore[djIndex] = updatedDj;
            
            resolve(updatedDj);
        }, ARTIFICIAL_DELAY);
    });
};

export const upgradeSubscription = async (djId: string, plan: SubscriptionTier): Promise<DJProfile> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const djIndex = db.djsStore.findIndex((d: DJProfile) => d.id === djId);
            if (djIndex === -1) return reject(new Error("DJ not found"));
            db.djsStore[djIndex].plan = plan;
            if (plan === SubscriptionTier.PRO || plan === SubscriptionTier.ELITE) {
                db.djsStore[djIndex].verified = true;
            } else {
                 db.djsStore[djIndex].verified = false;
            }
            resolve(db.djsStore[djIndex]);
        }, ARTIFICIAL_DELAY);
    });
};

// --- BLOG SERVICE ---
export const getBlogPosts = async (): Promise<BlogPost[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(MOCK_BLOG_POSTS);
        }, ARTIFICIAL_DELAY);
    });
};

export const getBlogPostBySlug = async (slug: string): Promise<BlogPost | undefined> => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(MOCK_BLOG_POSTS.find(p => p.slug === slug));
        }, ARTIFICIAL_DELAY);
    });
};


// --- AI BOT HELPERS (NEW) ---

export const findDjsForAi = async (params: { location?: string, genre?: string, name?: string }): Promise<string> => {
    return new Promise(resolve => {
        setTimeout(() => {
            let results = db.djsStore.filter((dj: DJProfile) => dj.approvalStatus === 'APPROVED');
            
            if (params.location) {
                const loc = params.location.toLowerCase();
                results = results.filter((dj: DJProfile) => 
                    dj.city.toLowerCase().includes(loc) || dj.state?.toLowerCase().includes(loc)
                );
            }
            
            if (params.genre) {
                 const g = params.genre.toLowerCase();
                 results = results.filter((dj: DJProfile) => 
                    dj.genres.some(genre => genre.toLowerCase().includes(g))
                 );
            }
            
            if (params.name) {
                const n = params.name.toLowerCase();
                results = results.filter((dj: DJProfile) => dj.name.toLowerCase().includes(n));
            }
            
            // Map to simplified structure for AI context
            const simplified = results.slice(0, 5).map((d: DJProfile) => ({
                id: d.id,
                name: d.name,
                city: d.city,
                fee: d.minFee,
                genres: d.genres.join(", ")
            }));
            
            resolve(JSON.stringify(simplified));
        }, 500);
    });
};

export const checkAvailabilityForAi = async (djName: string, date: string): Promise<string> => {
    return new Promise(resolve => {
        setTimeout(() => {
             // 1. Find DJ
             const dj = db.djsStore.find((d: DJProfile) => d.name.toLowerCase().includes(djName.toLowerCase()));
             if (!dj) return resolve("DJ not found.");
             
             // 2. Check Calendar
             const queryDateStr = getDateStr(date);
             const entry = db.calendarEntriesStore.find((e: DJCalendarEntry) => 
                 e.djProfileId === dj.id && getDateStr(e.date) === queryDateStr
             );
             
             if (!entry || entry.status === CalendarStatus.AVAILABLE) {
                 resolve(`Yes, ${dj.name} is available on ${date}. Minimum fee is ₹${dj.minFee}.`);
             } else {
                 resolve(`Sorry, ${dj.name} is currently marked as ${entry.status} on ${date}.`);
             }
        }, 500);
    });
};

export const createBookingForAi = async (djName: string, customerName: string, date: string, requirements: string): Promise<string> => {
    return new Promise(resolve => {
        setTimeout(() => {
             const dj = db.djsStore.find((d: DJProfile) => d.name.toLowerCase().includes(djName.toLowerCase()));
             if (!dj) return resolve("Could not find that DJ to book.");
             
             // Create a "Guest" booking
             const newBooking: Booking = {
                id: `booking-ai-${Date.now()}`,
                djId: dj.id,
                djName: dj.name,
                djProfileImage: dj.profileImage,
                customerId: 'guest-user',
                customerName: customerName,
                eventDate: new Date(date),
                eventType: 'Private Event (AI Booking)',
                location: dj.city,
                status: BookingStatus.PENDING,
                notes: requirements
            };
            
            db.bookingsStore.push(newBooking);
            
            // Block calendar
             db.calendarEntriesStore.push({
                id: `cal-entry-ai-${Date.now()}`,
                djProfileId: dj.id,
                date: newBooking.eventDate,
                status: CalendarStatus.HOLD,
                title: 'AI Inquiry',
                bookingId: newBooking.id,
            });
            
            resolve(`Booking inquiry created successfully! Reference ID: ${newBooking.id}. The DJ has been notified.`);
        }, 500);
    });
};

export const createLeadForAi = async (leadDetails: any): Promise<string> => {
    return new Promise(resolve => {
        setTimeout(() => {
            console.log("New AI Lead Captured:", leadDetails);
            
            // In a real app, this would save to a 'Leads' table
            // For now, we simulate a general booking inquiry if a DJ is mentioned, or just log it.
            
            resolve(`Great! I've captured your details. Our team will contact you shortly at ${leadDetails.phone} with the best options for your ${leadDetails.event_type} in ${leadDetails.city}. Reference Lead ID: LD-${Date.now()}.`);
        }, 500);
    });
};
