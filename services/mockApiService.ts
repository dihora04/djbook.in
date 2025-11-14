import { DJProfile, Booking, User, DJCalendarEntry, CalendarStatus, BookingStatus } from '../types';
import { MOCK_DJS, MOCK_BOOKINGS, MOCK_USERS, MOCK_CALENDAR_ENTRIES } from '../constants';

const ARTIFICIAL_DELAY = 500;

// This is a mutable store for the sake of the demo. In a real app, this would be a database.
let calendarEntriesStore = [...MOCK_CALENDAR_ENTRIES];
let bookingsStore = [...MOCK_BOOKINGS];


export const getDjs = async (): Promise<DJProfile[]> => {
  console.log('Fetching all approved DJs...');
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(MOCK_DJS.filter(dj => dj.approvalStatus === 'APPROVED'));
    }, ARTIFICIAL_DELAY);
  });
};

export const getAllDjsForAdmin = async (): Promise<DJProfile[]> => {
  console.log('Fetching all DJs for admin...');
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(MOCK_DJS);
    }, ARTIFICIAL_DELAY);
  });
};


export const getFeaturedDjs = async (): Promise<DJProfile[]> => {
    console.log('Fetching featured DJs...');
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(MOCK_DJS.filter(dj => dj.featured && dj.approvalStatus === 'APPROVED'));
      }, ARTIFICIAL_DELAY);
    });
};

export const getDjBySlug = async (slug: string): Promise<DJProfile | undefined> => {
  console.log(`Fetching DJ with slug: ${slug}`);
  return new Promise(resolve => {
    setTimeout(() => {
      const dj = MOCK_DJS.find(dj => dj.slug === slug);
      resolve(dj);
    }, ARTIFICIAL_DELAY);
  });
};

export const getDjById = async (id: string): Promise<DJProfile | undefined> => {
  console.log(`Fetching DJ with id: ${id}`);
  return new Promise(resolve => {
    setTimeout(() => {
      const dj = MOCK_DJS.find(dj => dj.id === id);
      resolve(dj);
    }, ARTIFICIAL_DELAY);
  });
};

export const getUsers = async (): Promise<User[]> => {
    console.log('Fetching all users...');
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(MOCK_USERS);
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

export const getBookingsByCustomerId = async (customerId: string): Promise<Booking[]> => {
    console.log(`Fetching bookings for customer: ${customerId}`);
    return new Promise(resolve => {
        setTimeout(() => {
            const bookings = bookingsStore.filter(booking => booking.customerId === customerId).map(b => {
                const dj = MOCK_DJS.find(d => d.id === b.djId);
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
                // Update existing entry
                if (entryData.status === CalendarStatus.AVAILABLE) {
                    // If setting to available, remove the entry
                    updatedEntry = calendarEntriesStore[existingEntryIndex];
                    calendarEntriesStore.splice(existingEntryIndex, 1);
                     console.log('Removed entry:', updatedEntry);
                } else {
                    calendarEntriesStore[existingEntryIndex] = { ...calendarEntriesStore[existingEntryIndex], ...entryData };
                    updatedEntry = calendarEntriesStore[existingEntryIndex];
                     console.log('Updated entry:', updatedEntry);
                }
            } else if (entryData.status !== CalendarStatus.AVAILABLE) {
                // Create new entry if it's not being set to 'AVAILABLE'
                updatedEntry = {
                    ...entryData,
                    id: `cal-entry-${Date.now()}`,
                    djProfileId: djId,
                };
                calendarEntriesStore.push(updatedEntry);
                 console.log('Created new entry:', updatedEntry);
            }
            
            // This is a bit of a hack for the simulation, but it ensures the caller gets a resolved entry
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

            // Update booking status
            const updatedBooking = { ...bookingsStore[bookingIndex], status: BookingStatus.ACCEPTED };
            bookingsStore[bookingIndex] = updatedBooking;

            // Update or create calendar entry
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

            // Update booking status
            const updatedBooking = { ...bookingsStore[bookingIndex], status: BookingStatus.REJECTED };
            bookingsStore[bookingIndex] = updatedBooking;

            // Remove corresponding 'HOLD' calendar entry
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
