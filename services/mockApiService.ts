
import { DJProfile, Booking, User, GoogleCalendarEvent } from '../types';
import { MOCK_DJS, MOCK_BOOKINGS, MOCK_USERS, MOCK_GCAL_EVENTS } from '../constants';

const ARTIFICIAL_DELAY = 500;

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
            resolve(MOCK_BOOKINGS.filter(booking => booking.djId === djId));
        }, ARTIFICIAL_DELAY);
    });
};

export const getBookingsByCustomerId = async (customerId: string): Promise<Booking[]> => {
    console.log(`Fetching bookings for customer: ${customerId}`);
    return new Promise(resolve => {
        setTimeout(() => {
            const bookings = MOCK_BOOKINGS.filter(booking => booking.customerId === customerId).map(b => {
                const dj = MOCK_DJS.find(d => d.id === b.djId);
                return {...b, djName: dj?.name || 'Unknown DJ', djProfileImage: dj?.profileImage || ''};
            });
            resolve(bookings);
        }, ARTIFICIAL_DELAY);
    });
};

export const getGoogleCalendarEvents = async (djId: string): Promise<GoogleCalendarEvent[]> => {
    console.log(`Simulating fetching Google Calendar events for DJ: ${djId}`);
    // In a real app, you'd make an API call here.
    // We'll return the mock data for any DJ for this simulation.
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(MOCK_GCAL_EVENTS);
        }, ARTIFICIAL_DELAY + 200); // slightly longer delay
    });
}