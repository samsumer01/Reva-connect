import { Session } from '@supabase/supabase-js';

export enum Category {
  SOCIAL = 'Social',
  ACADEMICS = 'Academics',
  EVENTS = 'Events',
  LOST_FOUND = 'Lost & Found',
  JOBS = 'Jobs & Internships',
}

export enum ItemType {
  LOST = 'Lost',
  FOUND = 'Found',
}

export enum ReactionType {
  LIKE = 'like',
  LOVE = 'love',
  FUNNY = 'funny',
  INSIGHTFUL = 'insightful',
}

export type View = 'feed' | 'clubs' | 'profile' | 'clubFeed' | 'postDetail' | 'clubDetail' | 'userSearch';

export interface UserProfile {
  id: string;
  name: string;
  avatarUrl: string;
  major: string;
  graduationYear: number;
  bio: string;
  // New optional fields for follow system
  followerCount?: number;
  followingCount?: number;
  isFollowedByCurrentUser?: boolean;
}

// A more detailed profile for the currently logged-in user
export interface CurrentUserProfile extends UserProfile {
  following: string[]; // An array of user IDs the current user is following
}

export interface Comment {
  id: number; // Changed to number to match postgres serial
  author: UserProfile;
  content: string;
  created_at: string;
}

export interface Post {
  id: string;
  author: UserProfile;
  title: string;
  content: string;
  category: Category;
  timestamp: string; // Changed to string for Supabase timestamp
  reactions: Partial<Record<ReactionType, string[]>>; // array of user ids
  comments: Comment[];
  edited?: boolean;
  clubId?: string; // Optional if post belongs to a club
  
  // For media
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  
  // For Lost & Found
  itemType?: ItemType;
  location?: string;
  
  // For Events
  eventDate?: string;
  eventTime?: string;
  eventLocation?: string;
}

export interface DraftPost {
    draftId: string;
    title: string;
    content: string;
    category: Category;
    itemType?: ItemType;
    location?: string;
    eventDate?: string;
    eventTime?: string;
    eventLocation?: string;
    mediaUrl?: string; // store as object URL for preview
    mediaFile?: File;
}

export interface Club {
    id: string;
    name: string;
    description: string;
    bannerUrl: string;
    memberCount: number;
    members: string[]; // array of user ids
}

export interface Message {
  id: string;
  sender: UserProfile;
  text: string;
  timestamp: Date;
}

export interface Conversation {
  id: string;
  participants: UserProfile[];
  messages: Message[];
}
