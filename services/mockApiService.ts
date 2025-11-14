
import { DJProfile, Booking, User, DJCalendarEntry, CalendarStatus, BookingStatus, Role, SubscriptionTier } from '../types';
import { MOCK_DJS, MOCK_BOOKINGS, MOCK_USERS, MOCK_CALENDAR_ENTRIES } from '../constants';

const ARTIFICIAL_DELAY = 500;

// This is a mutable store for the sake of the demo. In a real app, this would be a database.
let calendarEntriesStore = [...MOCK_CALENDAR_ENTRIES];
let bookingsStore = [...MOCK_BOOKINGS];
let usersStore = [...MOCK_USERS];
let djsStore = [...MOCK_DJS];


export const loginUser = async (email: string, password_param: string): Promise<User> => {
    console.log(`Attempting to log in user with email: ${email}`);
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const user = usersStore.find(u => u.email.toLowerCase() === email.toLowerCase());
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

export const registerUser = async (name: string, email: string, password_param: string, role: Role): Promise<User> => {
    console.log(`Attempting to register new user: ${email} with role: ${role}`);
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (usersStore.some(u => u.email.toLowerCase() === email.toLowerCase())) {
                console.log("Registration failed: Email already exists");
                return reject(new Error('A user with this email already exists.'));
            }

            const newUser: User = {
                id: `user-${Date.now()}`,
                name,
                email,
                password: password_param,
                role,
            };

            if (role === Role.DJ) {
                const newDjProfile: DJProfile = {
                    id: `dj-${Date.now()}`,
                    userId: newUser.id,
                    name: name, // Default to user name
                    slug: name.toLowerCase().replace(/\s+/g, '-') + `-${Date.now()}`,
                    city: '',
                    genres: [],
                    eventTypes: [],
                    minFee: 0,
                    bio: '',
                    gallery: [],
                    videos: [],
                    verified: false,
                    featured: false,
                    avgRating: 0,
                    reviews: [],
                    profileImage: 'https://picsum.photos/seed/newdj/400/400',
                    coverImage: 'https://picsum.photos/seed/newdj_cover/1600/900',
                    approvalStatus: 'PENDING',
                    plan: SubscriptionTier.FREE
                };
                djsStore.push(newDjProfile);
                newUser.djProfileId = newDjProfile.id;
                console.log("Created new PENDING DJ profile:", newDjProfile.id);
            }

            usersStore.push(newUser);
            console.log("Registration successful for new user:", newUser);
            resolve(newUser);

        }, ARTIFICIAL_DELAY);
    });
};

export const getDjs = async (): Promise<DJProfile[]> => {
  console.log('Fetching all approved DJs...');
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(djsStore.filter(dj => dj.approvalStatus === 'APPROVED'));
    }, ARTIFICIAL_DELAY);
  });
};

export const getAllDjsForAdmin = async (): Promise<DJProfile[]> => {
  console.log('Fetching all DJs for admin...');
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(djsStore);
    }, ARTIFICIAL_DELAY);
  });
};


export const getFeaturedDjs = async (): Promise<DJProfile[]> => {
    console.log('Fetching featured DJs...');
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(djsStore.filter(dj => dj.featured && dj.approvalStatus === 'APPROVED'));
      }, ARTIFICIAL_DELAY);
    });
};

export const getDjBySlug = async (slug: string): Promise<DJProfile | undefined> => {
  console.log(`Fetching DJ with slug: ${slug}`);
  return new Promise(resolve => {
    setTimeout(() => {
      const dj = djsStore.find(dj => dj.slug === slug);
      resolve(dj);
    }, ARTIFICIAL_DELAY);
  });
};

export const getDjById = async (id: string): Promise<DJProfile | undefined> => {
  console.log(`Fetching DJ with id: ${id}`);
  return new Promise(resolve => {
    setTimeout(() => {
      const dj = djsStore.find(dj => dj.id === id);
      resolve(dj);
    }, ARTIFICIAL_DELAY);
  });
};

export const getBookingsByDjId = async (djId: string): Promise<Booking[]> => {
    console.log(`Fetching bookings for DJ: ${djId}`);
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(bookingsStore.filter(booking => booking.djId === djId));
        }, ARTIFICIAL_DELAY);
    });
};

export const getAllBookings = async (): Promise<Booking[]> => {
    console.log("Fetching all bookings for admin...");
     return new Promise(resolve => {
        setTimeout(() => {
            resolve(bookingsStore);
        }, ARTIFICIAL_DELAY);
    });
}

export const getBookingsByCustomerId = async (customerId: string): Promise<Booking[]> => {
    console.log(`Fetching bookings for customer: ${customerId}`);
    return new Promise(resolve => {
        setTimeout(() => {
            const bookings = bookingsStore.filter(booking => booking.customerId === customerId).map(b => {
                const dj = djsStore.find(d => d.id === b.djId);
                return {...b, djName: dj?.name || 'Unknown DJ', djProfileImage: dj?.profileImage || ''};
            });
            resolve(bookings);
        }, ARTIFICIAL_DELAY);
    });
};

export const getDjCalendarEntries = async (djId: string): Promise<DJCalendarEntry[]> => {
    console.log(`Fetching calendar entries for DJ: ${djId}`);
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(calendarEntriesStore.filter(entry => entry.djProfileId === djId));
        }, ARTIFICIAL_DELAY);
    });
};

export const getPublicDjAvailability = async (djId: string): Promise<Pick<DJCalendarEntry, 'date' | 'status'>[]> => {
    console.log(`Fetching public availability for DJ: ${djId}`);
    return new Promise(resolve => {
        setTimeout(() => {
            const entries = calendarEntriesStore
                .filter(entry => entry.djProfileId === djId)
                .map(({ date, status }) => ({ date, status }));
            resolve(entries);
        }, ARTIFICIAL_DELAY);
    });
};

export const updateDjCalendarEntry = async (djId: string, entryData: Omit<DJCalendarEntry, 'id' | 'djProfileId'>): Promise<DJCalendarEntry> => {
    console.log(`Updating calendar for DJ ${djId} on date ${entryData.date.toDateString()}`);
    return new Promise(resolve => {
        setTimeout(() => {
            const dateToFind = entryData.date.setHours(0,0,0,0);
            let updatedEntry: DJCalendarEntry | undefined;

            const existingEntryIndex = calendarEntriesStore.findIndex(entry => 
                entry.djProfileId === djId && entry.date.setHours(0,0,0,0) === dateToFind
            );

            if (existingEntryIndex !== -1) {
                if (entryData.status === CalendarStatus.AVAILABLE) {
                    updatedEntry = calendarEntriesStore[existingEntryIndex];
                    calendarEntriesStore.splice(existingEntryIndex, 1);
                     console.log('Removed entry:', updatedEntry);
                } else {
                    calendarEntriesStore[existingEntryIndex] = { ...calendarEntriesStore[existingEntryIndex], ...entryData };
                    updatedEntry = calendarEntriesStore[existingEntryIndex];
                     console.log('Updated entry:', updatedEntry);
                }
            } else if (entryData.status !== CalendarStatus.AVAILABLE) {
                updatedEntry = {
                    ...entryData,
                    id: `cal-entry-${Date.now()}`,
                    djProfileId: djId,
                };
                calendarEntriesStore.push(updatedEntry);
                 console.log('Created new entry:', updatedEntry);
            }
            
            resolve(updatedEntry || { ...entryData, id: 'temp-removed', djProfileId: djId });
        }, ARTIFICIAL_DELAY);
    });
};


export const acceptBooking = async (bookingId: string, djId: string): Promise<Booking> => {
    console.log(`Accepting booking ${bookingId} for DJ ${djId}`);
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const bookingIndex = bookingsStore.findIndex(b => b.id === bookingId && b.djId === djId);
            if (bookingIndex === -1) {
                return reject(new Error('Booking not found'));
            }

            const updatedBooking = { ...bookingsStore[bookingIndex], status: BookingStatus.ACCEPTED };
            bookingsStore[bookingIndex] = updatedBooking;

            const dateToFind = updatedBooking.eventDate.setHours(0,0,0,0);
            const calendarEntryIndex = calendarEntriesStore.findIndex(entry => 
                entry.djProfileId === djId && entry.date.setHours(0,0,0,0) === dateToFind
            );

            if (calendarEntryIndex !== -1) {
                calendarEntriesStore[calendarEntryIndex].status = CalendarStatus.BOOKED;
                calendarEntriesStore[calendarEntryIndex].title = `Platform: ${updatedBooking.eventType}`;
                calendarEntriesStore[calendarEntryIndex].bookingId = bookingId;
            } else {
                calendarEntriesStore.push({
                    id: `cal-entry-${Date.now()}`,
                    djProfileId: djId,
                    date: updatedBooking.eventDate,
                    status: CalendarStatus.BOOKED,
                    title: `Platform: ${updatedBooking.eventType}`,
                    bookingId: bookingId,
                });
            }
            
            console.log("Updated Calendar:", calendarEntriesStore);
            resolve(updatedBooking);
        }, ARTIFICIAL_DELAY);
    });
};

export const rejectBooking = async (bookingId: string, djId: string): Promise<Booking> => {
    console.log(`Rejecting booking ${bookingId} for DJ ${djId}`);
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const bookingIndex = bookingsStore.findIndex(b => b.id === bookingId && b.djId === djId);
            if (bookingIndex === -1) {
                return reject(new Error('Booking not found'));
            }

            const updatedBooking = { ...bookingsStore[bookingIndex], status: BookingStatus.REJECTED };
            bookingsStore[bookingIndex] = updatedBooking;

            const dateToFind = updatedBooking.eventDate.setHours(0,0,0,0);
            const calendarEntryIndex = calendarEntriesStore.findIndex(entry => 
                entry.djProfileId === djId && 
                entry.date.setHours(0,0,0,0) === dateToFind &&
                entry.bookingId === bookingId
            );

            if (calendarEntryIndex !== -1) {
                calendarEntriesStore.splice(calendarEntryIndex, 1);
            }
            
            console.log("Updated Calendar:", calendarEntriesStore);
            resolve(updatedBooking);
        }, ARTIFICIAL_DELAY);
    });
};

export const createBooking = async (bookingData: Omit<Booking, 'id'|'status'|'djName'|'djProfileImage'>): Promise<Booking> => {
    console.log("Creating new booking for DJ:", bookingData.djId);
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Check availability
            const dateToCheck = bookingData.eventDate.toISOString().split('T')[0];
            const djCalendar = calendarEntriesStore.filter(e => e.djProfileId === bookingData.djId);
            const isUnavailable = djCalendar.some(e => e.date.toISOString().split('T')[0] === dateToCheck && e.status !== CalendarStatus.AVAILABLE);

            if (isUnavailable) {
                console.error("Booking creation failed: Date is not available.");
                return reject(new Error("The selected date is no longer available."));
            }

            const dj = djsStore.find(d => d.id === bookingData.djId);
            if (!dj) return reject(new Error("DJ not found"));

            const newBooking: Booking = {
                ...bookingData,
                id: `booking-${Date.now()}`,
                status: BookingStatus.PENDING,
                djName: dj.name,
                djProfileImage: dj.profileImage
            };
            bookingsStore.push(newBooking);

            // Add a HOLD entry to the calendar
            calendarEntriesStore.push({
                id: `cal-entry-${Date.now()}`,
                djProfileId: bookingData.djId,
                date: newBooking.eventDate,
                status: CalendarStatus.HOLD,
                title: 'Platform Inquiry',
                bookingId: newBooking.id,
            });
            
            console.log("New booking created:", newBooking);
            resolve(newBooking);
        }, ARTIFICIAL_DELAY);
    });
};

export const updateDjProfile = async (djId: string, profileData: Partial<DJProfile>): Promise<DJProfile> => {
    console.log("Updating profile for DJ:", djId);
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const djIndex = djsStore.findIndex(d => d.id === djId);
            if (djIndex === -1) {
                return reject(new Error("DJ profile not found"));
            }
            djsStore[djIndex] = { ...djsStore[djIndex], ...profileData };
            console.log("Profile updated successfully");
            resolve(djsStore[djIndex]);
        }, ARTIFICIAL_DELAY);
    });
};

export const approveDj = async (djId: string): Promise<DJProfile> => {
    console.log("Approving DJ:", djId);
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const djIndex = djsStore.findIndex(d => d.id === djId);
            if (djIndex === -1) return reject(new Error("DJ not found"));
            djsStore[djIndex].approvalStatus = 'APPROVED';
            resolve(djsStore[djIndex]);
        }, ARTIFICIAL_DELAY);
    });
};

export const rejectDj = async (djId: string): Promise<DJProfile> => {
    console.log("Rejecting DJ:", djId);
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const djIndex = djsStore.findIndex(d => d.id === djId);
            if (djIndex === -1) return reject(new Error("DJ not found"));
            djsStore[djIndex].approvalStatus = 'REJECTED';
            resolve(djsStore[djIndex]);
        }, ARTIFICIAL_DELAY);
    });
};

export const upgradeSubscription = async (djId: string, plan: SubscriptionTier): Promise<DJProfile> => {
    console.log(`Upgrading subscription for DJ ${djId} to ${plan}`);
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const djIndex = djsStore.findIndex(d => d.id === djId);
            if (djIndex === -1) return reject(new Error("DJ not found"));
            djsStore[djIndex].plan = plan;
            if (plan === SubscriptionTier.PRO || plan === SubscriptionTier.ELITE) {
                djsStore[djIndex].verified = true;
            } else {
                 djsStore[djIndex].verified = false;
            }
            resolve(djsStore[djIndex]);
        }, ARTIFICIAL_DELAY);
    });
}
