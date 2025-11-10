
export enum Role {
  ADMIN = 'ADMIN',
  DJ = 'DJ',
  CUSTOMER = 'CUSTOMER',
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
}

export type View = {
  page: 'home' | 'search' | 'profile';
  slug?: string | null;
}
