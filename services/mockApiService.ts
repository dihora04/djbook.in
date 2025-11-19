import { DJProfile, Booking, User, DJCalendarEntry, CalendarStatus, BookingStatus, Role, SubscriptionTier } from '../types';
import { MOCK_USERS, MOCK_DJS, MOCK_BOOKINGS, MOCK_CALENDAR_ENTRIES } from '../constants';

const ARTIFICIAL_DELAY = 300; // Snappy, fast response for 2050 feel

// --- FIX: Persist mock database on the window object ---
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

const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
};

export const loginUser = async (email: string, password_param: string): Promise<User> => {
    console.log(`Attempting to log in user with email: ${email}`);
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const user = db.usersStore.find(u => u.email.toLowerCase() === email.toLowerCase());
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

export const registerUser = async (name: string, email: string, password_param: string, role: Role, location?: { lat: number, lon: number }, plan: SubscriptionTier = SubscriptionTier.FREE): Promise<User> => {
    console.log(`Attempting to register new user: ${email} with role: ${role} and plan: ${plan}`);
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (db.usersStore.some(u => u.email.toLowerCase() === email.toLowerCase())) {
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
                    name: name, // Default to user name
                    slug: name.toLowerCase().replace(/\s+/g, '-') + `-${timestamp}`,
                    city: '',
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
                };
                db.djsStore.push(newDjProfile);
                newUser.djProfileId = newDjProfile.id;
                console.log("Created new PENDING DJ profile:", newDjProfile.id);
            }

            db.usersStore.push(newUser);
            console.log("Registration successful for new user:", newUser);
            console.log("Current DJs in store:", db.djsStore.length);
            resolve(newUser);

        }, ARTIFICIAL_DELAY);
    });
};

export const getDjs = async (): Promise<DJProfile[]> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(db.djsStore.filter(dj => dj.approvalStatus === 'APPROVED'));
    }, ARTIFICIAL_DELAY);
  });
};

export const getNearbyDjs = async (lat: number, lon: number, radius: number = 50): Promise<DJProfile[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const nearbyDjs = db.djsStore
                .filter(dj => dj.approvalStatus === 'APPROVED' && dj.latitude && dj.longitude)
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
        resolve(db.djsStore.filter(dj => dj.featured && dj.approvalStatus === 'APPROVED'));
      }, ARTIFICIAL_DELAY);
    });
};

export const getDjBySlug = async (slug: string): Promise<DJProfile | undefined> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const dj = db.djsStore.find(dj => dj.slug === slug);
      if (dj && dj.approvalStatus === 'APPROVED') {
        resolve(dj);
      } else {
        resolve(undefined);
      }
    }, ARTIFICIAL_DELAY);
  });
};

export const getDjById = async (id: string): Promise<DJProfile | undefined> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const dj = db.djsStore.find(dj => dj.id === id);
      resolve(dj);
    }, ARTIFICIAL_DELAY);
  });
};

export const getBookingsByDjId = async (djId: string): Promise<Booking[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(db.bookingsStore.filter(booking => booking.djId === djId));
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
            const bookings = db.bookingsStore.filter(booking => booking.customerId === customerId).map(b => {
                const dj = db.djsStore.find(d => d.id === b.djId);
                return {...b, djName: dj?.name || 'Unknown DJ', djProfileImage: dj?.profileImage || ''};
            });
            resolve(bookings);
        }, ARTIFICIAL_DELAY);
    });
};

export const getDjCalendarEntries = async (djId: string): Promise<DJCalendarEntry[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(db.calendarEntriesStore.filter(entry => entry.djProfileId === djId));
        }, ARTIFICIAL_DELAY);
    });
};

export const getPublicDjAvailability = async (djId: string): Promise<Pick<DJCalendarEntry, 'date' | 'status'>[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const entries = db.calendarEntriesStore
                .filter(entry => entry.djProfileId === djId)
                .map(({ date, status }) => ({ date, status }));
            resolve(entries);
        }, ARTIFICIAL_DELAY);
    });
};

export const updateDjCalendarEntry = async (djId: string, entryData: Omit<DJCalendarEntry, 'id' | 'djProfileId'>): Promise<DJCalendarEntry> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const dateToFind = entryData.date.setHours(0,0,0,0);
            let updatedEntry: DJCalendarEntry | undefined;

            const existingEntryIndex = db.calendarEntriesStore.findIndex(entry => 
                entry.djProfileId === djId && entry.date.setHours(0,0,0,0) === dateToFind
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


export const acceptBooking = async (bookingId: string, djId: string): Promise<Booking> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const bookingIndex = db.bookingsStore.findIndex(b => b.id === bookingId && b.djId === djId);
            if (bookingIndex === -1) {
                return reject(new Error('Booking not found'));
            }

            const updatedBooking = { ...db.bookingsStore[bookingIndex], status: BookingStatus.ACCEPTED };
            db.bookingsStore[bookingIndex] = updatedBooking;

            const dateToFind = updatedBooking.eventDate.setHours(0,0,0,0);
            const calendarEntryIndex = db.calendarEntriesStore.findIndex(entry => 
                entry.djProfileId === djId && entry.date.setHours(0,0,0,0) === dateToFind
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
            const bookingIndex = db.bookingsStore.findIndex(b => b.id === bookingId && b.djId === djId);
            if (bookingIndex === -1) {
                return reject(new Error('Booking not found'));
            }

            const updatedBooking = { ...db.bookingsStore[bookingIndex], status: BookingStatus.REJECTED };
            db.bookingsStore[bookingIndex] = updatedBooking;

            const dateToFind = updatedBooking.eventDate.setHours(0,0,0,0);
            const calendarEntryIndex = db.calendarEntriesStore.findIndex(entry => 
                entry.djProfileId === djId && 
                entry.date.setHours(0,0,0,0) === dateToFind &&
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
            const dateToCheck = bookingData.eventDate.toISOString().split('T')[0];
            const djCalendar = db.calendarEntriesStore.filter(e => e.djProfileId === bookingData.djId);
            const isUnavailable = djCalendar.some(e => e.date.toISOString().split('T')[0] === dateToCheck && e.status !== CalendarStatus.AVAILABLE);

            if (isUnavailable) {
                return reject(new Error("The selected date is no longer available."));
            }

            const dj = db.djsStore.find(d => d.id === bookingData.djId);
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
            const djIndex = db.djsStore.findIndex(d => d.id === djId);
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
            const djIndex = db.djsStore.findIndex(d => d.id === djId);
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
            const djIndex = db.djsStore.findIndex(d => d.id === djId);
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
            const djIndex = db.djsStore.findIndex(d => d.id === djId);
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
}