
import { DJProfile, User, Role, Booking, BookingStatus, DJCalendarEntry, CalendarStatus, SubscriptionTier } from './types';

export const CITIES = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Ahmedabad", "Pune", "Jaipur", "Goa"];
export const GENRES = ["Bollywood", "EDM", "Punjabi", "Retro", "House", "Techno", "Hip-Hop"];
export const EVENT_TYPES = ["Wedding", "Corporate", "Club", "College", "Private Party", "Sangeet"];


export let MOCK_DJS: DJProfile[] = [
  {
    id: 'dj-rohan-mumbai',
    userId: 'user-dj-rohan',
    name: 'DJ Rohan',
    slug: 'dj-rohan-mumbai',
    city: 'Mumbai',
    genres: ['Bollywood', 'EDM', 'Punjabi'],
    eventTypes: ['Wedding', 'Club', 'Private Party'],
    minFee: 25000,
    bio: 'With over 10 years of experience, DJ Rohan knows how to get the party started. Specializing in high-energy Bollywood and EDM sets for weddings and clubs.',
    instagram: 'https://instagram.com/djrohan',
    youtube: 'https://youtube.com/djrohan',
    soundcloud: 'https://soundcloud.com/djrohan',
    gallery: [
      'https://picsum.photos/seed/rohan1/800/600',
      'https://picsum.photos/seed/rohan2/800/600',
      'https://picsum.photos/seed/rohan3/800/600',
      'https://picsum.photos/seed/rohan4/800/600',
    ],
    videos: ["https://www.youtube.com/embed/dQw4w9WgXcQ"],
    verified: true,
    featured: true,
    avgRating: 4.9,
    profileImage: 'https://picsum.photos/seed/djrohan/400/400',
    coverImage: 'https://picsum.photos/seed/rohan_cover/1600/900',
    approvalStatus: 'APPROVED',
    plan: SubscriptionTier.ELITE,
    phone: '9876543210',
    reviews: [
      { id: 'r1', authorName: 'Priya S.', authorImage: 'https://picsum.photos/seed/priya/100/100', rating: 5, comment: 'Absolutely amazing! Kept everyone dancing all night at our wedding.', createdAt: new Date('2023-11-15') },
      { id: 'r2', authorName: 'Amit K.', authorImage: 'https://picsum.photos/seed/amit/100/100', rating: 5, comment: 'Professional and played a fantastic set. Highly recommend!', createdAt: new Date('2023-10-20') },
    ],
  },
  {
    id: 'dj-neha-delhi',
    userId: 'user-dj-neha',
    name: 'DJ Neha',
    slug: 'dj-neha-delhi',
    city: 'Delhi',
    genres: ['Techno', 'House', 'Retro'],
    eventTypes: ['Club', 'Corporate', 'Private Party'],
    minFee: 30000,
    bio: 'Delhi\'s top techno and house DJ. DJ Neha brings an underground vibe to corporate events and exclusive private parties.',
    instagram: 'https://instagram.com/djneha',
    youtube: 'https://youtube.com/djneha',
    soundcloud: 'https://soundcloud.com/djneha',
    gallery: [
      'https://picsum.photos/seed/neha1/800/600',
      'https://picsum.photos/seed/neha2/800/600',
    ],
    videos: [],
    verified: true,
    featured: true,
    avgRating: 4.8,
    profileImage: 'https://picsum.photos/seed/djneha/400/400',
    coverImage: 'https://picsum.photos/seed/neha_cover/1600/900',
    approvalStatus: 'APPROVED',
    plan: SubscriptionTier.PRO,
    reviews: [
      { id: 'r3', authorName: 'Vikram R.', authorImage: 'https://picsum.photos/seed/vikram/100/100', rating: 5, comment: 'Incredible techno set for our company launch event. Pure class.', createdAt: new Date('2023-12-01') },
    ],
  },
  {
    id: 'dj-sunil-bangalore',
    userId: 'user-dj-sunil',
    name: 'DJ Sunil',
    slug: 'dj-sunil-bangalore',
    city: 'Bangalore',
    genres: ['Hip-Hop', 'Retro', 'Bollywood'],
    eventTypes: ['Private Party', 'College'],
    minFee: 15000,
    bio: 'The king of retro and hip-hop mashups. Perfect for college fests and private parties where you want to vibe.',
    instagram: 'https://instagram.com/djsunil',
    soundcloud: 'https://soundcloud.com/djsunil',
    gallery: [
      'https://picsum.photos/seed/sunil1/800/600',
      'https://picsum.photos/seed/sunil2/800/600',
      'https://picsum.photos/seed/sunil3/800/600',
    ],
    videos: [],
    verified: false,
    featured: false,
    avgRating: 4.5,
    profileImage: 'https://picsum.photos/seed/djsunil/400/400',
    coverImage: 'https://picsum.photos/seed/sunil_cover/1600/900',
    approvalStatus: 'PENDING',
    plan: SubscriptionTier.FREE,
    reviews: [
      { id: 'r4', authorName: 'Anjali P.', authorImage: 'https://picsum.photos/seed/anjali/100/100', rating: 4, comment: 'Good music selection for our college fest, but was a bit late.', createdAt: new Date('2023-09-10') },
    ],
  },
    {
    id: 'dj-riya-pune',
    userId: 'user-dj-riya',
    name: 'DJ Riya',
    slug: 'dj-riya-pune',
    city: 'Pune',
    genres: ['Punjabi', 'Bollywood'],
    eventTypes: ['Wedding', 'Sangeet'],
    minFee: 20000,
    bio: 'Pune\'s favorite wedding DJ! DJ Riya brings the best of Punjabi and Bollywood beats to make your sangeet unforgettable.',
    instagram: 'https://instagram.com/djriya',
    soundcloud: 'https://soundcloud.com/djriya',
    gallery: [
      'https://picsum.photos/seed/riya1/800/600',
      'https://picsum.photos/seed/riya2/800/600'
    ],
    videos: [],
    verified: true,
    featured: false,
    avgRating: 4.7,
    profileImage: 'https://picsum.photos/seed/djriya/400/400',
    coverImage: 'https://picsum.photos/seed/riya_cover/1600/900',
    approvalStatus: 'APPROVED',
    plan: SubscriptionTier.PRO,
    reviews: [
      { id: 'r5', authorName: 'Karan M.', authorImage: 'https://picsum.photos/seed/karan/100/100', rating: 5, comment: 'DJ Riya was the highlight of our sangeet. Everyone loved her energy!', createdAt: new Date('2023-11-25') },
    ],
  },
  {
    id: 'dj-arjun-goa',
    userId: 'user-dj-arjun',
    name: 'DJ Arjun',
    slug: 'dj-arjun-goa',
    city: 'Goa',
    genres: ['House', 'Techno'],
    eventTypes: ['Club', 'Private Party'],
    minFee: 40000,
    bio: 'Resident DJ at Goa\'s top clubs. Arjun specializes in deep house and melodic techno, perfect for sunset parties.',
    instagram: 'https://instagram.com/djarjun',
    soundcloud: 'https://soundcloud.com/djarjun',
    gallery: [
        'https://picsum.photos/seed/arjun1/800/600',
        'https://picsum.photos/seed/arjun2/800/600',
        'https://picsum.photos/seed/arjun3/800/600'
    ],
    videos: [],
    verified: false,
    featured: false,
    avgRating: 4.9,
    profileImage: 'https://picsum.photos/seed/djarjun/400/400',
    coverImage: 'https://picsum.photos/seed/arjun_cover/1600/900',
    approvalStatus: 'REJECTED',
    plan: SubscriptionTier.FREE,
    reviews: [
      { id: 'r6', authorName: 'Chloe F.', authorImage: 'https://picsum.photos/seed/chloe/100/100', rating: 5, comment: 'Best sunset set I\'ve ever heard. Pure magic!', createdAt: new Date('2024-01-05') },
    ],
  },
];

export let MOCK_USERS: User[] = [
    { id: 'user-admin', name: 'Admin', email: 'admin@djbook.in', password: 'Ajaydjbook@909911', role: Role.ADMIN },
    { id: 'user-customer', name: 'Aarav Mehta', email: 'customer@email.com', password: 'password', role: Role.CUSTOMER },
    { id: 'user-dj-rohan', name: 'Rohan Sharma', email: 'dj@email.com', password: 'password', role: Role.DJ, djProfileId: 'dj-rohan-mumbai' },
];

const TOMORROW = new Date();
TOMORROW.setDate(TOMORROW.getDate() + 1);
const NEXT_WEEK = new Date();
NEXT_WEEK.setDate(NEXT_WEEK.getDate() + 7);
const LAST_MONTH = new Date();
LAST_MONTH.setMonth(LAST_MONTH.getMonth() - 1);
const IN_10_DAYS = new Date();
IN_10_DAYS.setDate(IN_10_DAYS.getDate() + 10);
const IN_15_DAYS = new Date();
IN_15_DAYS.setDate(IN_15_DAYS.getDate() + 15);


export let MOCK_BOOKINGS: Booking[] = [
    {
        id: 'booking1',
        djId: 'dj-rohan-mumbai',
        djName: 'DJ Rohan',
        djProfileImage: 'https://picsum.photos/seed/djrohan/400/400',
        customerId: 'user-customer',
        customerName: 'Aarav Mehta',
        eventDate: TOMORROW,
        eventType: 'Private Party',
        location: 'Juhu, Mumbai',
        status: BookingStatus.PENDING,
        notes: 'Birthday party for 50 guests. Needs a good mix of Bollywood and international pop.'
    },
    {
        id: 'booking2',
        djId: 'dj-rohan-mumbai',
        djName: 'DJ Rohan',
        djProfileImage: 'https://picsum.photos/seed/djrohan/400/400',
        customerId: 'user-customer',
        customerName: 'Sneha Verma',
        eventDate: NEXT_WEEK,
        eventType: 'Wedding',
        location: 'Taj Lands End, Mumbai',
        status: BookingStatus.ACCEPTED,
        notes: 'Sangeet ceremony. Focus on classic Bollywood and Punjabi hits.'
    },
     {
        id: 'booking3',
        djId: 'dj-rohan-mumbai',
        djName: 'DJ Rohan',
        djProfileImage: 'https://picsum.photos/seed/djrohan/400/400',
        customerId: 'user-customer',
        customerName: 'Ravi Kumar',
        eventDate: LAST_MONTH,
        eventType: 'Corporate',
        location: 'BKC, Mumbai',
        status: BookingStatus.COMPLETED,
        notes: 'Annual company party. Played a great retro set.'
    },
    {
        id: 'booking4',
        djId: 'dj-neha-delhi',
        djName: 'DJ Neha',
        djProfileImage: 'https://picsum.photos/seed/djneha/400/400',
        customerId: 'user-customer',
        customerName: 'Aarav Mehta',
        eventDate: IN_10_DAYS,
        eventType: 'Club',
        location: 'Kitty Su, Delhi',
        status: BookingStatus.PENDING,
        notes: 'Techno night, need a 3-hour set.'
    }
];

export let MOCK_CALENDAR_ENTRIES: DJCalendarEntry[] = [
    // Entry automatically created from an accepted platform booking
    {
        id: 'cal-entry-1',
        djProfileId: 'dj-rohan-mumbai',
        date: NEXT_WEEK,
        status: CalendarStatus.BOOKED,
        title: 'Platform Booking: Wedding',
        bookingId: 'booking2',
    },
    // A manually entered booking by the DJ
    {
        id: 'cal-entry-2',
        djProfileId: 'dj-rohan-mumbai',
        date: IN_10_DAYS,
        status: CalendarStatus.BOOKED,
        title: 'Private Corporate Gig',
        note: 'Client: Acme Corp. Contact: Priya.',
    },
    // A manually blocked-off date
    {
        id: 'cal-entry-3',
        djProfileId: 'dj-rohan-mumbai',
        date: IN_15_DAYS,
        status: CalendarStatus.UNAVAILABLE,
        title: 'Day Off',
    },
    // A pending inquiry from the platform
     {
        id: 'cal-entry-4',
        djProfileId: 'dj-rohan-mumbai',
        date: TOMORROW,
        status: CalendarStatus.HOLD,
        title: 'Platform Inquiry',
        bookingId: 'booking1',
    },
];
