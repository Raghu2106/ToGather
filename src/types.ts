/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Hub {
  id: string;
  name: string;
  members: number;
  activeNow: boolean;
  image: string;
  icon: string; // lucide icon name
  bgColor: string;
  latestUpdate: string;
  latestTime: string;
  isJoined: boolean;
  tag: string;
}

export interface FeedPost {
  id: string;
  avatar: string;
  author: string;
  subtext: string;
  image?: string;
  text: string;
  tags: string[];
  likes: number;
  commentsCount: number;
  isLiked: boolean;
  isBookmarked: boolean;
  quote?: {
    text: string;
    author: string;
  };
}

export interface EventEntity {
  id: string;
  title: string;
  category: 'Trekking' | 'Volunteer' | 'Book Clubs' | 'Pet Meets';
  image: string;
  date: string;
  location: string;
  isFree: boolean;
  attendees: { avatar: string; name: string }[];
  attendeesCount: number;
  isAttending: boolean;
  isImpact?: boolean;
  impactValue?: string;
}

export interface UserProfile {
  name: string;
  avatar: string;
  email: string;
  phone: string;
  bio: string;
  location: string;
}

export type Tab = 'Landing' | 'Discover' | 'Feed' | 'Host' | 'Profile' | 'MyHubs';
