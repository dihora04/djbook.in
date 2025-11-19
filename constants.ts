
import { DJProfile, User, Role, Booking, BookingStatus, DJCalendarEntry, CalendarStatus, SubscriptionTier } from './types';

export const CITIES = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Ahmedabad", "Pune", "Jaipur", "Goa"];
export const GENRES = ["Bollywood", "EDM", "Punjabi", "Retro", "House", "Techno", "Hip-Hop"];
export const EVENT_TYPES = ["Wedding", "Corporate", "Club", "College", "Private Party", "Sangeet"];


export let MOCK_DJS: DJProfile[] = [
  {
    id: 'dj-1',
    userId: 'user-dj-1',
    name: 'DJ Axle',
    slug: 'dj-axle',
    city: 'Mumbai',
    genres: ['Bollywood', 'EDM', 'Punjabi'],
    eventTypes: ['Wedding', 'Club', 'Corporate'],
    minFee: 50000,
    bio: 'High-energy DJ with over 10 years of experience rocking crowds across the country. Specializes in seamless transitions and electrifying Bollywood remixes.',
    gallery: ['https://picsum.photos/seed/dj1_1/800/600', 'https://picsum.photos/seed/dj1_2/800/600', 'https://picsum.photos/seed/dj1_3/800/600', 'https://picsum.photos/seed/dj1_4/800/600'],
    videos: ['https://www.youtube.com/embed/v2aPG3z1a7A'],
    verified: true,
    featured: false,
    avgRating: 4.9,
    reviews: [
      { id: 'rev-1', authorName: 'Priya Sharma', authorImage: 'https://i.pravatar.cc/150?u=priya', rating: 5, comment: 'DJ Axle was absolutely phenomenal at our wedding! The dance floor was packed all night.', createdAt: new Date('2023-10-20') },
      { id: 'rev-2', authorName: 'Rohan Verma', authorImage: 'https://i.pravatar.cc/150?u=rohan', rating: 5, comment: 'Best corporate event DJ we have ever hired. Professional and played the perfect mix.', createdAt: new Date('2023-09-15') },
    ],
    profileImage: 'https://picsum.photos/seed/djaxle/400/400',
    coverImage: 'https://picsum.photos/seed/djaxle_cover/1600/900',
    approvalStatus: 'APPROVED',
    plan: SubscriptionTier.PRO,
    latitude: 19.0760,
    longitude: 72.8777,
  },
   {
    id: 'dj-2',
    userId: 'user-dj-2',
    name: 'DJ Riya',
    slug: 'dj-riya',
    city: 'Bangalore',
    genres: ['House', 'Techno', 'Retro'],
    eventTypes: ['Club', 'Private Party'],
    minFee: 75000,
    bio: 'Bringing the underground sounds of house and techno to the forefront. Known for deep, groovy sets that keep you dancing till dawn.',
    gallery: ['https://picsum.photos/seed/dj2_1/800/600', 'https://picsum.photos/seed/dj2_2/800/600', 'https://picsum.photos/seed/dj2_3/800/600', 'https://picsum.photos/seed/dj2_4/800/600'],
    videos: [],
    verified: true,
    featured: true,
    avgRating: 5.0,
    reviews: [
        { id: 'rev-3', authorName: 'Anjali Rao', authorImage: 'https://i.pravatar.cc/150?u=anjali', rating: 5, comment: 'Riya knows her music! A true artist. Her techno set was mind-blowing.', createdAt: new Date('2023-11-01') },
    ],
    profileImage: 'https://picsum.photos/seed/djriya/400/400',
    coverImage: 'https://picsum.photos/seed/djriya_cover/1600/900',
    approvalStatus: 'APPROVED',
    plan: SubscriptionTier.ELITE,
    latitude: 12.9716,
    longitude: 77.5946,
  },
  {
    id: 'dj-3',
    userId: 'user-dj-3',
    name: 'DJ Spinz',
    slug: 'dj-spinz',
    city: 'Delhi',
    genres: [],
    eventTypes: [],
    minFee: 20000,
    bio: 'Upcoming DJ specializing in Hip-Hop and commercial mixes. Ready to bring the vibes to your college fest or private party.',
    gallery: ['https://picsum.photos/seed/dj3_1/800/600', 'https://picsum.photos/seed/dj3_2/800/600'],
    videos: [],
    verified: false,
    featured: false,
    avgRating: 0,
    reviews: [],
    profileImage: 'https://picsum.photos/seed/djspinz/400/400',
    coverImage: 'https://picsum.photos/seed/djspinz_cover/1600/900',
    approvalStatus: 'PENDING',
    plan: SubscriptionTier.FREE,
    latitude: 28.7041,
    longitude: 77.1025,
  }
];

export let MOCK_USERS: User[] = [
    { id: 'user-admin', name: 'Admin', email: 'admin@djbook.in', password: 'Ajaydjbook@909911', role: Role.ADMIN },
    { id: 'user-customer', name: 'Aarav Mehta', email: 'customer@email.com', password: 'password', role: Role.CUSTOMER },
    { id: 'user-dj-1', name: 'DJ Axle', email: 'axle@email.com', password: 'password', role: Role.DJ, djProfileId: 'dj-1' },
    { id: 'user-dj-2', name: 'DJ Riya', email: 'riya@email.com', password: 'password', role: Role.DJ, djProfileId: 'dj-2' },
    { id: 'user-dj-3', name: 'DJ Spinz', email: 'spinz@email.com', password: 'password', role: Role.DJ, djProfileId: 'dj-3' },
];

export let MOCK_BOOKINGS: Booking[] = [
   {
        id: 'booking-1',
        djId: 'dj-1',
        djName: 'DJ Axle',
        djProfileImage: 'https://picsum.photos/seed/djaxle/400/400',
        customerId: 'user-customer',
        customerName: 'Aarav Mehta',
        eventDate: new Date('2024-07-15'),
        eventType: 'Wedding',
        location: 'Mumbai',
        status: BookingStatus.ACCEPTED,
        notes: 'Need a good mix of old and new Bollywood hits.'
    },
    {
        id: 'booking-2',
        djId: 'dj-2',
        djName: 'DJ Riya',
        djProfileImage: 'https://picsum.photos/seed/djriya/400/400',
        customerId: 'user-customer',
        customerName: 'Aarav Mehta',
        eventDate: new Date('2024-05-20'),
        eventType: 'Club',
        location: 'Bangalore',
        status: BookingStatus.COMPLETED,
        notes: 'Strictly techno.'
    },
     {
        id: 'booking-3',
        djId: 'dj-1',
        djName: 'DJ Axle',
        djProfileImage: 'https://picsum.photos/seed/djaxle/400/400',
        customerId: 'user-customer',
        customerName: 'Aarav Mehta',
        eventDate: new Date('2024-08-01'),
        eventType: 'Corporate',
        location: 'Pune',
        status: BookingStatus.PENDING,
        notes: 'Corporate event for our annual gala.'
    },
    {
        id: 'booking-4',
        djId: 'dj-2',
        djName: 'DJ Riya',
        djProfileImage: 'https://picsum.photos/seed/djriya/400/400',
        customerId: 'user-customer',
        customerName: 'Aarav Mehta',
        eventDate: new Date('2024-06-10'),
        eventType: 'Private Party',
        location: 'Goa',
        status: BookingStatus.REJECTED,
        notes: 'Birthday party inquiry.'
    }
];

export let MOCK_CALENDAR_ENTRIES: DJCalendarEntry[] = [
    {
        id: 'cal-1',
        djProfileId: 'dj-1',
        date: new Date('2024-07-15'),
        status: CalendarStatus.BOOKED,
        title: 'Platform: Wedding',
        bookingId: 'booking-1',
    },
    {
        id: 'cal-2',
        djProfileId: 'dj-1',
        date: new Date('2024-08-01'),
        status: CalendarStatus.HOLD,
        title: 'Platform Inquiry',
        bookingId: 'booking-3',
    },
    {
        id: 'cal-3',
        djProfileId: 'dj-2',
        date: new Date('2024-07-20'),
        status: CalendarStatus.UNAVAILABLE,
        title: 'Day Off',
    }
];
