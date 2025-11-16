
import { DJProfile, User, Role, Booking, BookingStatus, DJCalendarEntry, CalendarStatus, SubscriptionTier } from './types';

export const CITIES = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Ahmedabad", "Pune", "Jaipur", "Goa"];
export const GENRES = ["Bollywood", "EDM", "Punjabi", "Retro", "House", "Techno", "Hip-Hop"];
export const EVENT_TYPES = ["Wedding", "Corporate", "Club", "College", "Private Party", "Sangeet"];


export let MOCK_DJS: DJProfile[] = [
  // All mock DJs removed for production.
];

export let MOCK_USERS: User[] = [
    { id: 'user-admin', name: 'Admin', email: 'admin@djbook.in', password: 'Ajaydjbook@909911', role: Role.ADMIN },
    { id: 'user-customer', name: 'Aarav Mehta', email: 'customer@email.com', password: 'password', role: Role.CUSTOMER },
    // Removed mock DJ user. DJs will now register through the app.
];

export let MOCK_BOOKINGS: Booking[] = [
   // All mock bookings removed for production.
];

export let MOCK_CALENDAR_ENTRIES: DJCalendarEntry[] = [
    // All mock calendar entries removed for production.
];