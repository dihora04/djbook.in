
export enum Role {
  ADMIN = 'ADMIN',
  DJ = 'DJ',
  CUSTOMER = 'CUSTOMER',
}

export interface User {
  id: string;
  name: string;
  email: string;
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
  city: string;
  genres: string[];
  eventTypes: string[];
  minFee: number;
  bio: string;
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
}

export type View = {
  page: 'home' | 'search' | 'profile' | 'pricing' | 'dj-dashboard' | 'admin-dashboard' | 'user-dashboard';
  slug?: string | null;
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
  date: Date; // Store the full date object
  status: CalendarStatus;
  title?: string;      // e.g., "Wedding", "Day Off", "Platform Booking"
  note?: string;       // Optional details for manual entries
  bookingId?: string;  // Link to Booking if platform-initiated
}
