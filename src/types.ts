/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface MessageEntity {
  id: string;
  senderName: string;
  senderAvatar: string;
  senderVerification: 'Member' | 'Identity Verified' | 'Trusted Organizer';
  content: string;
  timestamp: string;
  pinned?: boolean;
  image?: string;
}

export interface Hub {
  id: string;
  name: string;
  members: number;
  activeMembers: number;
  eventsThisMonth: number;
  attendanceRate: number; // percentage
  verifiedEventsCount: number;
  rating: number; // out of 5
  healthScore: number; // out of 100
  healthLevel: 'Excellent' | 'Active' | 'Growing' | 'Inactive';
  activeNow: boolean;
  image: string;
  icon: string; // lucide icon name
  bgColor: string;
  latestUpdate: string;
  latestTime: string;
  isJoined: boolean;
  tag: string;
  category: string;
  suspended?: boolean;
  announcements?: MessageEntity[];
  discussionMessages?: MessageEntity[];
  resources?: string[];
  lastEventDate?: string;
  description?: string;
  hasDiscussions?: boolean;
  gallery?: string[];
}

export interface FeedPost {
  id: string;
  avatar: string;
  author: string;
  authorVerification: 'Member' | 'Identity Verified' | 'Trusted Organizer';
  subtext: string;
  image?: string;
  text: string;
  tags: string[];
  
  // Redesigned outcomes reaction metrics
  appreciates: number;
  inspirations: number;
  participated: number;
  isAppreciated?: boolean;
  isInspired?: boolean;
  isParticipated?: boolean;
  
  likes?: number; // legacy backward compatibility
  isLiked?: boolean; // legacy backward compatibility

  commentsCount: number;
  isBookmarked: boolean;
  quote?: {
    text: string;
    author: string;
  };

  // Structured Activity & Living Record Fields
  type?: 'event_recap' | 'hub_milestone' | 'thank_you_note' | 'outcome_report' | 'hub_update';
  updateType?: string; // Community Milestone, Challenge Announcement, Important Notice, Community Achievement, Gallery Update, Summary Update
  eventName?: string;
  eventId?: string;
  hubName?: string;
  hubId?: string;
  hostName?: string;
  completionDate?: string;
  participantCount?: number;
  attendanceRate?: number;
  volunteerHours?: number;
  wasteCollectedKg?: number;
  treesPlanted?: number;
  fundsRaised?: number;
  photos?: string[];

  // Outcomes & Impact fields
  impactMetrics?: {
    participantsInvolved?: number;
    volunteerHours?: number;
    fundsRaised?: number;
    treesPlanted?: number;
    wasteCollectedKg?: number;
    distanceCoveredKm?: number;
    generalMetric?: string;
  };
  reported?: boolean;
  reportedReason?: string;
}

export interface EventEntity {
  id: string;
  hubId?: string;
  title: string;
  description: string;
  category: string;
  image: string;
  date: string;
  time: string;
  location: string;
  isFree: boolean;
  attendees: { avatar: string; name: string; participationLevel: 'Interested' | 'Maybe' | 'Confirmed' | 'Committed'; approved?: boolean; invited?: boolean; invitedAccepted?: boolean; }[];
  attendeesCount: number;
  isAttending: boolean;
  isImpact?: boolean;
  impactValue?: string;
  
  // Organizer Specific Details
  organizerName: string;
  organizerAvatar: string;
  organizerVerification: 'Member' | 'Identity Verified' | 'Trusted Organizer';
  organizerPastEvents: number;

  // Interest System Tags
  primaryInterest?: string;
  secondaryInterest?: string;
  thirdInterest?: string;
  
  // Rules setup
  capacity: number;
  safetyNotes: string;
  materialsRequired: string;
  whatToBring: string;
  accessMode: 'Open' | 'Approval Required' | 'Invite Only';
  participationLevel?: 'Interested' | 'Maybe' | 'Confirmed' | 'Committed'; // user rsvp level

  // Event features
  announcements?: MessageEntity[];
  discussion?: MessageEntity[];
  photos?: string[];
  impactReport?: {
    volunteerHours: number;
    fundsRaised?: number;
    metrics: string;
    summary: string;
  };

  // Completion Submission for moderation
  isCompleted?: boolean;
  isVerifiedConduct?: boolean;
  completionSubmission?: {
    attendanceEvidence: string;
    photos: string[];
    venueProof: string;
    supportingDoc: string;
    expenses?: string;
    status: 'Pending' | 'Approved' | 'Rejected';
  };

  suspended?: boolean;
  reported?: boolean;
  reportedReason?: string;

  // Dynamic QR check-in fields
  isStarted?: boolean;
  attendanceRadiusLimit?: number; // 50, 100, 200, 300 meters
  attendanceCoordinates?: { lat: number; lng: number };
  currentQRToken?: string;
  qrTokenExpiresAt?: number;

  // Event Communication & Management features
  moderators?: EventModerator[];
  mutedParticipants?: string[]; // Names/emails muted from this event's chat
  removedParticipants?: string[]; // Names/emails removed from this event's chat
  communicationMode?: 'Discussion' | 'Announcement'; // Default 'Discussion'
  recap?: EventRecap;
  discussionsEnabled?: boolean;
}

export interface EventModerator {
  name: string;
  avatar: string;
  permissions: {
    editEventDetails: boolean;
    updateEventDescription: boolean;
    updateEventSchedule: boolean;
    updateEventLocation: boolean;
    publishAnnouncements: boolean;
    manageParticipants: boolean;
    moderateChat: boolean;
    uploadEventImages: boolean;
    publishEventRecap: boolean;
    pinMessages: boolean;
  };
}

export interface EventRecap {
  thankYouNotes: string;
  summary: string;
  outcomes: string;
  photos: string[];
  attendanceStats: string;
  communityImpact: string;
  visibility: 'Private' | 'Public';
  isPublished: boolean;
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  eventId: string;
  eventTitle: string;
  timestamp: string;
  coords: { lat: number; lng: number };
  radiusLimit: number;
  distanceMeters: number;
  impactAwarded: boolean;
}

export interface AttendanceAuditLog {
  id: string;
  timestamp: string;
  action: 'Scan Success' | 'Scan Rejected (Distance)' | 'Scan Rejected (Token Expired)' | 'Scan Rejected (No RSVP)' | 'Event Started' | 'Event Radius Changed' | 'Service Disabled';
  details: string;
  operator: string;
  status: 'Success' | 'Failure' | 'Info';
}

export interface UserProfile {
  name: string;
  avatar: string;
  email: string;
  phone: string;
  bio: string;
  location: string;
  
  // Reputation & Verification
  verificationStatus: 'Member' | 'Identity Verified' | 'Trusted Organizer';
  isTrustedOrganizer: boolean;
  eventsAttendedCount: number;
  eventsHostedCount: number;
  attendanceRate: number; // percent e.g. 96
  volunteerHours: number;
  impactPoints: number;
  verifiedEventsConducted: number;
  communityContributions: string[];
  organizerRating?: number; // e.g. 4.9
  earnedBadges: string[];

  // Interest System Fields
  interests?: string[];
  causes?: string[];
  participationPreferences?: string[];
  discoveryRadius?: number | 'Custom';
  customRadiusValue?: number;
  interestNotificationsEnabled?: boolean;
  feedInterestsSettingEnabled?: boolean;
}

export type Tab = 'Landing' | 'Discover' | 'Feed' | 'Host' | 'Profile' | 'MyHubs';
