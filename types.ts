
export enum Role {
  ADMIN = 'ADMIN',
  DJ = 'DJ',
  CUSTOMER = 'CUSTOMER',
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: Role;
  djProfileId?: string;
}

export enum SubscriptionTier {
    FREE = 'FREE',
    PRO = 'PRO',
    ELITE = 'ELITE'
}

export enum BookingStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  PAID = 'PAID',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

export interface Booking {
    id: string;
    djId: string;
    djName: string;
    djProfileImage: string;
    customerId: string;
    customerName: string;
    customerEmail?: string;
    customerPhone?: string; // Added Phone Number
    eventDate: Date;
    eventType: string;
    location: string;
    status: BookingStatus;
    notes?: string;
}


export interface Review {
  id: string;
  authorName: string;
  authorImage: string;
  rating: number; // 1-5
  comment: string;
  createdAt: Date;
}

export interface DJProfile {
  id: string;
  userId: string;
  name: string;
  slug: string;
  state?: string;
  city: string;
  genres: string[];
  eventTypes: string[];
  minFee: number;
  bio: string;
  phone?: string;
  instagram?: string;
  youtube?: string;
  soundcloud?: string;
  gallery: string[];
  videos: string[];
  verified: boolean;
  featured: boolean;
  avgRating: number;
  reviews: Review[];
  profileImage: string;
  coverImage: string;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  plan: SubscriptionTier;
  latitude?: number;
  longitude?: number;
  distance?: number;
  cityRank?: number; // Added for Top 3 Badge
  googleCalendarConnected?: boolean; // New field for Calendar Sync
}

export interface BlogPost {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    author: string;
    date: string;
    coverImage: string;
    tags: string[];
}

export type View = {
  page: 'home' | 'search' | 'profile' | 'pricing' | 'dj-dashboard' | 'admin-dashboard' | 'user-dashboard' | 'city' | 'blog' | 'blog-post';
  slug?: string | null;
  cityParam?: string | null; // For city pages
}

export enum CalendarStatus {
  AVAILABLE = 'AVAILABLE',
  BOOKED = 'BOOKED',
  HOLD = 'HOLD',
  UNAVAILABLE = 'UNAVAILABLE',
}

export interface DJCalendarEntry {
  id: string;
  djProfileId: string;
  date: Date;
  status: CalendarStatus;
  title?: string;
  note?: string;
  bookingId?: string;
}