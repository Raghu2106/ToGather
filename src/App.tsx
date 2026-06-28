/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Menu, 
  Bell, 
  Compass, 
  Users, 
  Rss, 
  PlusSquare, 
  User, 
  X, 
  LogOut, 
  Mail, 
  Phone, 
  AlertCircle,
  TrendingUp,
  Globe,
  Award,
  Sparkles,
  Smartphone,
  Shield,
  CheckCircle,
  UserCheck,
  Flag,
  RotateCcw,
  Sliders,
  Trash,
  Search,
  ArrowLeft
} from 'lucide-react';

import { Tab, Hub, FeedPost, EventEntity, UserProfile, MessageEntity, AttendanceRecord, AttendanceAuditLog } from './types';
import { INITIAL_HUBS, INITIAL_POSTS, INITIAL_EVENTS, INITIAL_IMPACTS, DEFAULT_PROFILE } from './data';

import LandingPage from './components/LandingPage';
import MyHubsTab from './components/MyHubsTab';
import FeedTab from './components/FeedTab';
import DiscoverTab from './components/DiscoverTab';
import HostTab from './components/HostTab';
import ProfileTab from './components/ProfileTab';
import AdminPortal, { ReportTicket, VerificationRequest } from './components/AdminPortal';

export default function App() {
  // Main Navigation tab flow
  const [tab, setTab] = useState<Tab>(() => {
    const savedTab = localStorage.getItem('togather_current_tab');
    return (savedTab as Tab) || 'Discover';
  });

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    const savedLogin = localStorage.getItem('togather_logged_in');
    return savedLogin === null ? true : savedLogin === 'true';
  });

  // Stateful lists backed by standard localStorage persistence
  const [hubs, setHubs] = useState<Hub[]>(() => {
    const saved = localStorage.getItem('togather_hubs');
    return saved ? JSON.parse(saved) : INITIAL_HUBS;
  });

  const [posts, setPosts] = useState<FeedPost[]>(() => {
    const saved = localStorage.getItem('togather_posts');
    return saved ? JSON.parse(saved) : INITIAL_POSTS;
  });

  const [events, setEvents] = useState<EventEntity[]>(() => {
    const saved = localStorage.getItem('togather_events');
    return saved ? JSON.parse(saved) : INITIAL_EVENTS;
  });

  const [impacts, setImpacts] = useState<EventEntity[]>(() => {
    const saved = localStorage.getItem('togather_impacts');
    return saved ? JSON.parse(saved) : INITIAL_IMPACTS;
  });

  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('togather_profile');
    return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
  });

  // UI state control triggers
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authFormEmail, setAuthFormEmail] = useState('');
  const [authFormName, setAuthFormName] = useState('');
  const [authFormPhone, setAuthFormPhone] = useState('');
  
  // Onboarding Wizard states
  const [onboardingStep, setOnboardingStep] = useState<number>(1);
  const [onboardingInterests, setOnboardingInterests] = useState<string[]>([]);
  const [onboardingCauses, setOnboardingCauses] = useState<string[]>([]);
  const [onboardingPrefs, setOnboardingPrefs] = useState<string[]>(['Attend Events', 'Volunteer']);
  const [onboardingRadius, setOnboardingRadius] = useState<number | 'Custom'>(25);
  const [showNotificationDrawer, setShowNotificationDrawer] = useState(false);
  const [drawerTab, setDrawerTab] = useState<'notifications' | 'profile'>('notifications');
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    title: string;
    body: string;
    type: 'event' | 'hub' | 'system';
    targetId: string;
    read: boolean;
    time: string;
  }>>([
    {
      id: 'notif-1',
      title: 'Beach Pollution Cleanup Starts Tomorrow!',
      body: 'David Atten shifting meetup spots near Main Gate Tower. Click to view event details.',
      type: 'event',
      targetId: 'event-1',
      read: false,
      time: '1h ago',
    },
    {
      id: 'notif-2',
      title: 'Shelter Dog Walk Social Active Now!',
      body: 'Multiple coordinators have arrived at Eastside Municipal Shelter. Click to view.',
      type: 'event',
      targetId: 'event-4',
      read: false,
      time: '3h ago',
    },
    {
      id: 'notif-3',
      title: 'New Hub Active: Green Earth Volunteers',
      body: 'Check out recent eco interventions and community updates. Click to view hub.',
      type: 'hub',
      targetId: 'hub-1',
      read: false,
      time: '1d ago',
    },
    {
      id: 'notif-4',
      title: 'City Bike Riders Joined',
      body: 'You are now a verified member of City Bike Riders! Click to view hub details.',
      type: 'hub',
      targetId: 'hub-2',
      read: true,
      time: '2d ago',
    },
  ]);

  const handleNotificationClick = (notif: {
    id: string;
    type: 'event' | 'hub' | 'system';
    targetId: string;
  }) => {
    // Mark as read
    setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
    
    // Direct navigation
    if (notif.type === 'event') {
      setInitialSelectedEventId(notif.targetId);
      setTab('Discover');
    } else if (notif.type === 'hub') {
      setInitialSelectedHubId(notif.targetId);
      setTab('MyHubs');
    }
    
    // Close notification drawer
    setShowNotificationDrawer(false);
  };

  const [showMenuDrawer, setShowMenuDrawer] = useState(false);
  const [isSearchOverlayOpen, setIsSearchOverlayOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasSearchFiltersApplied, setHasSearchFiltersApplied] = useState(false);
  const [toastNotification, setToastNotification] = useState<string | null>(null);
  const [initialSelectedHubId, setInitialSelectedHubId] = useState<string | undefined>(undefined);
  const [initialSelectedEventId, setInitialSelectedEventId] = useState<string | undefined>(undefined);

  // Auto-close search overlay if the user transitions tasks
  useEffect(() => {
    if (tab !== 'Discover') {
      setIsSearchOverlayOpen(false);
    }
  }, [tab]);

  // Admin Portal State & Persistence
  const [isAdminOpened, setIsAdminOpened] = useState<boolean>(() => {
    return window.location.search.includes('admin=true') || window.location.hash === '#admin';
  });

  const [tickets, setTickets] = useState<ReportTicket[]>(() => {
    const saved = localStorage.getItem('togather_tickets');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'ticket-1',
        type: 'post',
        targetId: 'post-1',
        targetName: 'Found some dating pamphlets. Matches at 8 PM nearby!',
        reporterName: 'Sara Miller',
        category: 'Spam',
        details: 'Ad promoting off-topic dating and matchmaking flyers under the guise of park cleaning.',
        timestamp: '1 hour ago',
        status: 'Pending'
      },
      {
        id: 'ticket-2',
        type: 'event',
        targetId: 'event-2',
        targetName: 'Sunset Solo Social & Speed Date Event',
        reporterName: 'John Doe',
        category: 'Inappropriate Content',
        details: 'This event listing violates the non-dating safety rules of ToGather.',
        timestamp: '2 hours ago',
        status: 'Pending'
      }
    ];
  });

  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>(() => {
    const saved = localStorage.getItem('togather_verification_requests');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'req-1',
        userId: 'current-user',
        userName: 'Elena Rossi',
        userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        appliedStatus: 'Identity Verified',
        reason: 'Voluntary check. I want to participate in neighborhood restoration.',
        supportingInfo: 'Student Card Ref: #IT-9011421A • Linked verified registry',
        timestamp: '30 mins ago',
        status: 'Pending'
      }
    ];
  });

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('togather_attendance_records');
    return saved ? JSON.parse(saved) : [];
  });

  const [attendanceAuditLogs, setAttendanceAuditLogs] = useState<AttendanceAuditLog[]>(() => {
    const saved = localStorage.getItem('togather_attendance_audit_logs');
    return saved ? JSON.parse(saved) : [];
  });

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('togather_attendance_records', JSON.stringify(attendanceRecords));
  }, [attendanceRecords]);

  useEffect(() => {
    localStorage.setItem('togather_attendance_audit_logs', JSON.stringify(attendanceAuditLogs));
  }, [attendanceAuditLogs]);
  useEffect(() => {
    localStorage.setItem('togather_current_tab', tab);
  }, [tab]);

  useEffect(() => {
    localStorage.setItem('togather_logged_in', String(isLoggedIn));
    if (!isLoggedIn && tab !== 'Landing') {
      setTab('Landing');
    }
  }, [isLoggedIn, tab]);

  useEffect(() => {
    localStorage.setItem('togather_hubs', JSON.stringify(hubs));
  }, [hubs]);

  useEffect(() => {
    localStorage.setItem('togather_posts', JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem('togather_events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('togather_impacts', JSON.stringify(impacts));
  }, [impacts]);

  useEffect(() => {
    localStorage.setItem('togather_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('togather_tickets', JSON.stringify(tickets));
  }, [tickets]);

  useEffect(() => {
    localStorage.setItem('togather_verification_requests', JSON.stringify(verificationRequests));
  }, [verificationRequests]);

  // Handler: Join/Leave Hub
  const handleToggleJoinHub = (hubId: string) => {
    if (!isLoggedIn) {
      setShowAuthModal(true);
      return;
    }
    setHubs(prev => prev.map(hub => {
      if (hub.id === hubId) {
        const nextState = !hub.isJoined;
        if (nextState) {
          alert(`Success: Welcome to "${hub.name}"! Feel free to participate in our active sectors.`);
        }
        return { 
          ...hub, 
          isJoined: nextState, 
          members: nextState ? hub.members + 1 : hub.members - 1 
        };
      }
      return hub;
    }));
  };

  // Handler: Reaction Feedback Metrics (Appreciate, Inspire, Participated)
  const handleUpdateFeedback = (postId: string, type: 'appreciates' | 'inspirations' | 'participated') => {
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        if (type === 'appreciates') {
          const toggled = !post.isAppreciated;
          return {
            ...post,
            isAppreciated: toggled,
            appreciates: toggled ? post.appreciates + 1 : post.appreciates - 1
          };
        } else if (type === 'inspirations') {
          const toggled = !post.isInspired;
          return {
            ...post,
            isInspired: toggled,
            inspirations: toggled ? post.inspirations + 1 : post.inspirations - 1
          };
        } else if (type === 'participated') {
          const toggled = !post.isParticipated;
          return {
            ...post,
            isParticipated: toggled,
            participated: toggled ? post.participated + 1 : post.participated - 1
          };
        }
      }
      return post;
    }));
  };

  // Handler: Create Dynamic Post Outcomes
  const handleAddNewPost = (firstArg: string | any, secondArg?: string, thirdArg?: any) => {
    if (typeof firstArg === 'object') {
      const newPost: FeedPost = {
        id: `post-${Date.now()}`,
        avatar: profile.avatar,
        author: profile.name,
        authorVerification: profile.verificationStatus,
        subtext: `Just now • Downtown Hubs Area`,
        appreciates: 0,
        inspirations: 0,
        participated: 0,
        commentsCount: 0,
        isBookmarked: false,
        ...firstArg
      };
      setPosts(prev => [newPost, ...prev]);
    } else {
      const text = firstArg as string;
      const tag = secondArg || '#Volunteering';
      const impactMetrics = thirdArg || {};
      const newPost: FeedPost = {
        id: `post-${Date.now()}`,
        avatar: profile.avatar,
        author: profile.name,
        authorVerification: profile.verificationStatus,
        subtext: `Just now • Downtown Hubs Area`,
        text,
        tags: [tag],
        appreciates: 1,
        inspirations: 1,
        participated: 0,
        commentsCount: 0,
        isBookmarked: false,
        impactMetrics,
        // Deducing fields
        type: 'outcome_report',
        eventName: 'Activity Outcome Logged',
        completionDate: 'Just now',
        participantCount: impactMetrics.participantsInvolved || 10,
        volunteerHours: impactMetrics.volunteerHours || 20
      };
      setPosts(prev => [newPost, ...prev]);
    }
  };

  // Handler: Host Local Event
  const handleAddNewEvent = (newEvent: Omit<EventEntity, 'id' | 'attendees' | 'attendeesCount' | 'isAttending'>) => {
    const freshEvent: EventEntity = {
      ...newEvent,
      id: `event-${Date.now()}`,
      attendees: [
        { name: profile.name, avatar: profile.avatar, participationLevel: 'Committed' }
      ],
      attendeesCount: 1,
      isAttending: true,
      isCompleted: false,
      isVerifiedConduct: false
    };
    
    setEvents(prev => [freshEvent, ...prev]);
    setTab('Discover');

    // Interest Notification Match Trigger
    const isTopicMatched = profile.interests && freshEvent.primaryInterest && profile.interests.includes(freshEvent.primaryInterest);
    const isCauseMatched = !!(profile.causes && freshEvent.category && profile.causes.some(u => 
      String(freshEvent.category || '').toLowerCase().includes(String(u || '').toLowerCase())
    ));
    
    if (profile.interestNotificationsEnabled && (isTopicMatched || isCauseMatched)) {
      setToastNotification(`🔔 Match Notification: A new local event "${freshEvent.title}" aligning with your Chosen Interests has been listed!`);
    } else {
      setToastNotification(`🚀 Success: Your gathering outline "${freshEvent.title}" has been created and verified!`);
    }

    // Auto fade after 6s
    setTimeout(() => {
      setToastNotification(null);
    }, 6000);
  };

  // Handler: RSVP Join/Leave Event with customizable level status
  const handleToggleRSVPEvent = (eventId: string, rsvpLevel: 'Interested' | 'Maybe' | 'Confirmed' | 'Committed' = 'Confirmed') => {
    setEvents(prev => prev.map(evt => {
      if (evt.id === eventId) {
        const nextState = !evt.isAttending;
        return {
          ...evt,
          isAttending: nextState,
          participationLevel: nextState ? rsvpLevel : undefined,
          attendeesCount: nextState ? evt.attendeesCount + 1 : evt.attendeesCount - 1,
          attendees: nextState 
            ? [...evt.attendees, { name: profile.name, avatar: profile.avatar, participationLevel: rsvpLevel }]
            : evt.attendees.filter(a => a.name !== profile.name)
        };
      }
      return evt;
    }));
  };

  // Handlers for Messaging Rooms inside Hub Details
  const handleAddHubMessage = (hubId: string, type: 'announcements' | 'discussionMessages', text: string) => {
    setHubs(prev => prev.map(hub => {
      if (hub.id === hubId) {
        const freshMessage: MessageEntity = {
          id: `msg-hub-${Date.now()}`,
          senderName: profile.name,
          senderAvatar: profile.avatar,
          senderVerification: profile.verificationStatus,
          content: text,
          timestamp: 'Just now'
        };
        const currentMessages = hub[type] || [];
        return {
          ...hub,
          [type]: [...currentMessages, freshMessage]
        };
      }
      return hub;
    }));
  };

  // Publish dynamic official hub bulletins and broadcast to main activity feed
  const handlePublishHubUpdate = (hubId: string, updateData: { text: string; updateType: string; isFeedUpdate: boolean; photoUrl?: string }) => {
    const freshMessage: MessageEntity = {
      id: `ann-hub-${Date.now()}`,
      senderName: profile.name,
      senderAvatar: profile.avatar,
      senderVerification: profile.verificationStatus,
      content: `[${updateData.updateType}] ${updateData.text}`,
      timestamp: 'Just now',
      image: updateData.photoUrl
    };

    setHubs(prev => prev.map(hub => {
      if (hub.id === hubId) {
        const currentAnnouncements = hub.announcements || [];
        return {
          ...hub,
          announcements: [freshMessage, ...currentAnnouncements]
        };
      }
      return hub;
    }));

    if (updateData.isFeedUpdate) {
      const associatedHub = hubs.find(h => h.id === hubId);
      const newPost: FeedPost = {
        id: `hub-update-post-${Date.now()}`,
        avatar: profile.avatar,
        author: profile.name,
        authorVerification: profile.verificationStatus,
        subtext: `${updateData.updateType} • Just now`,
        image: updateData.photoUrl,
        text: updateData.text,
        tags: associatedHub ? [associatedHub.tag, '#HubUpdate'] : ['#HubUpdate'],
        appreciates: 0,
        inspirations: 0,
        participated: 0,
        commentsCount: 0,
        isBookmarked: false,
        type: 'hub_update',
        updateType: updateData.updateType,
        hubName: associatedHub ? associatedHub.name : 'Community Hub',
        hubId: hubId,
        completionDate: 'Just now'
      };

      setPosts(prev => [newPost, ...prev]);
    }
  };

  // Handlers for Messaging Rooms inside Event Details
  const handleAddEventMessage = (eventId: string, type: 'announcements' | 'discussion', text: string) => {
    setEvents(prev => prev.map(evt => {
      if (evt.id === eventId) {
        const freshMessage: MessageEntity = {
          id: `msg-evt-${Date.now()}`,
          senderName: profile.name,
          senderAvatar: profile.avatar,
          senderVerification: profile.verificationStatus,
          content: text,
          timestamp: 'Just now'
        };
        const currentMessages = evt[type] || [];
        return {
          ...evt,
          [type]: [...currentMessages, freshMessage]
        };
      }
      return evt;
    }));
  };

  const handleAddEventPhoto = (eventId: string, photoUrl: string) => {
    setEvents(prev => prev.map(evt => {
      if (evt.id === eventId) {
        const currentPhotos = evt.photos || [];
        return {
          ...evt,
          photos: [...currentPhotos, photoUrl]
        };
      }
      return evt;
    }));
  };

  const handleSubmitEventCompletion = (eventId: string, submission: any) => {
    setEvents(prev => prev.map(evt => {
      if (evt.id === eventId) {
        return {
          ...evt,
          isCompleted: true,
          completionSubmission: {
            ...submission,
            status: 'Pending'
          }
        };
      }
      return evt;
    }));
  };

  // Safety Verification Moderation Handlers
  const handleReportHub = (hubId: string, reason: string) => {
    const hub = hubs.find(h => h.id === hubId);
    if (!hub) return;
    setHubs(prev => prev.map(h => h.id === hubId ? { ...h, reported: true, reportedReason: reason } : h));
    const newTicket: ReportTicket = {
      id: `ticket-${Date.now()}`,
      type: 'hub',
      targetId: hubId,
      targetName: hub.name,
      reporterName: profile.name || 'Anonymous Local',
      category: 'Safety Concern',
      details: reason,
      timestamp: 'Just now',
      status: 'Pending'
    };
    setTickets(prev => [newTicket, ...prev]);
    alert('Thank you. Hub reported. Our administration team will manually audit this report in the staff portal shortly.');
  };

  const handleReportEvent = (eventId: string, reason: string) => {
    const evt = events.find(e => e.id === eventId);
    if (!evt) return;
    setEvents(prev => prev.map(e => e.id === eventId ? { ...e, reported: true, reportedReason: reason } : e));
    const newTicket: ReportTicket = {
      id: `ticket-${Date.now()}`,
      type: 'event',
      targetId: eventId,
      targetName: evt.title,
      reporterName: profile.name || 'Anonymous Local',
      category: 'Inappropriate Content',
      details: reason,
      timestamp: 'Just now',
      status: 'Pending'
    };
    setTickets(prev => [newTicket, ...prev]);
    alert('Thank you. Event reported. Our administration team will manually audit this report in the staff portal shortly.');
  };

  const handleReportPost = (postId: string, reason: string) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, reported: true, reportedReason: reason } : p));
    const newTicket: ReportTicket = {
      id: `ticket-${Date.now()}`,
      type: 'post',
      targetId: postId,
      targetName: `Story by ${post.author}`,
      reporterName: profile.name || 'Anonymous Local',
      category: 'Inappropriate Content',
      details: `${reason} - Text: "${post.text.substring(0, 60)}..."`,
      timestamp: 'Just now',
      status: 'Pending'
    };
    setTickets(prev => [newTicket, ...prev]);
    alert('Thank you. Activity record reported. Our administration team will manually audit this report in the staff portal shortly.');
  };

  const handleRequestVerification = (appliedStatus: 'Identity Verified' | 'Trusted Organizer', reason: string, details: string) => {
    const newRequest: VerificationRequest = {
      id: `req-${Date.now()}`,
      userId: 'current-user',
      userName: profile.name,
      userAvatar: profile.avatar,
      appliedStatus,
      reason,
      supportingInfo: details,
      timestamp: 'Just now',
      status: 'Pending'
    };
    setVerificationRequests(prev => [newRequest, ...prev]);
  };

  // Account Flow control
  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authFormName.trim()) {
      alert('Your name is required to personalize registration.');
      return;
    }
    const emailToUse = authFormEmail || 'explorer@togather.local';
    const phoneToUse = authFormPhone || '+1 (555) 000-0000';
    
    setProfile(prev => ({
      ...prev,
      name: authFormName,
      email: emailToUse,
      phone: phoneToUse,
      verificationStatus: 'Identity Verified',
      interests: onboardingInterests,
      causes: onboardingCauses,
      participationPreferences: onboardingPrefs,
      discoveryRadius: onboardingRadius,
      interestNotificationsEnabled: true,
      feedInterestsSettingEnabled: false
    }));

    setIsLoggedIn(true);
    setShowAuthModal(false);
    setOnboardingStep(1); // Reset
    setTab('Discover');
    alert(`Success: ToGather profile established with ${onboardingInterests.length} selected interests and ${onboardingCauses.length} causes!`);
  };

  const handleDemologin = () => {
    setIsLoggedIn(true);
    setTab('Discover');
    alert('Authenticated: Welcome back as guest explorer!');
  };

  // Moderator dashboard operations (persisted in stats)
  const handleVerifyEventConduct = (eventId: string) => {
    setEvents(prev => prev.map(evt => {
      if (evt.id === eventId) {
        // Build impact metrics record
        const impactValueText = `${evt.completionSubmission?.attendanceEvidence || '25 participants'} • Converted to verified conduct`;
        
        // Auto reward profile impact points
        setProfile(p => ({
          ...p,
          impactPoints: p.impactPoints + 60,
          verifiedEventsConducted: p.verifiedEventsConducted + 1
        }));

        // Push outcome story to feed board
        const outcomeText = `COMMUNITY OUTCOME REWARD: Event "${evt.title}" has successfully passed regional safety board reviews! Under organizer stewardship, true evidence shows complete adherence to civic guidelines. Thank you for making our blocks safer!`;
        handleAddNewPost(outcomeText, `#${evt.category}`, {
          volunteerHours: 36,
          participantsInvolved: 25
        });

        return {
          ...evt,
          isVerifiedConduct: true,
          isCompleted: true,
          impactValue: `${evt.capacity || 15} volunteers coordinates verified`,
          impactReport: {
            volunteerHours: 36,
            metrics: `${evt.capacity || 15} volunteers fully verified`,
            summary: `Event completed successfully at ${evt.location}. GPS coordinates audited.`
          },
          completionSubmission: {
            ...(evt.completionSubmission || {}),
            status: 'Approved' as const
          }
        };
      }
      return evt;
    }));
    
    // Refresh impacts
    setTimeout(() => {
      setImpacts(events.filter(e => e.isCompleted || e.isVerifiedConduct));
    }, 50);

    alert('Event verified successfully! Outcome record added to the Activity tab.');
  };

  const handleRejectEventSubmission = (eventId: string) => {
    setEvents(prev => prev.map(evt => {
      if (evt.id === eventId) {
        return {
          ...evt,
          isCompleted: false,
          completionSubmission: {
            ...(evt.completionSubmission || {}),
            status: 'Rejected' as const
          }
        };
      }
      return evt;
    }));
    alert('Evidence rejected. Organizer notified to submit geo-tagged credentials.');
  };

  const handleSuspendHub = (hubId: string) => {
    setHubs(prev => prev.map(h => h.id === hubId ? { ...h, suspended: true } : h));
    alert('Safety Protection: Hub has been suspended due to validation violations.');
  };

  const handleSuspendEvent = (eventId: string) => {
    setEvents(prev => prev.map(e => e.id === eventId ? { ...e, suspended: true } : e));
    alert('Safety Protection: Event listing suspended.');
  };

  const handleDismissReport = (type: 'hub' | 'event' | 'post', id: string) => {
    if (type === 'hub') {
      setHubs(prev => prev.map(h => h.id === id ? { ...h, reported: false, reportedReason: undefined } : h));
    } else if (type === 'event') {
      setEvents(prev => prev.map(e => e.id === id ? { ...e, reported: false, reportedReason: undefined } : e));
    } else if (type === 'post') {
      setPosts(prev => prev.map(p => p.id === id ? { ...p, reported: false, reportedReason: undefined } : p));
    }
    alert('Report dismissed. Content deemed safe according to community guidelines.');
  };

  const handleRemovePost = (postId: string) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
    alert('Inappropriate post content permanently removed from public feed logs.');
  };

  const handleUpgradeUserIdentity = () => {
    setProfile(p => ({
      ...p,
      verificationStatus: 'Trusted Organizer',
      isTrustedOrganizer: true
    }));
    alert('Demo Identity updated to 🛡 Trusted Organizer!');
  };

  const handleResetLocalStorage = () => {
    if (confirm('Clear ToGather demo cache to initial state?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  if (isAdminOpened) {
    return (
      <AdminPortal 
        onBackToApp={() => {
          setIsAdminOpened(false);
          window.history.pushState({}, '', window.location.pathname);
        }}
        hubs={hubs}
        events={events}
        posts={posts}
        profile={profile}
        tickets={tickets}
        verificationRequests={verificationRequests}
        onUpdateHubs={setHubs}
        onUpdateEvents={setEvents}
        onUpdatePosts={setPosts}
        onUpdateTickets={setTickets}
        onUpdateVerificationRequests={setVerificationRequests}
        onUpdateProfile={setProfile}
      />
    );
  }

  return (
    <div className="min-h-screen bg-surface text-on-surface font-sans selection:bg-primary-container selection:text-on-primary-container">
      
      {/* App Bar Header */}
      {tab !== 'Landing' && (
        <header className="fixed top-0 left-0 w-full z-40 bg-surface/90 backdrop-blur-md shadow-sm border-b border-outline-variant/10 flex items-center px-4 h-16 select-none max-w-7xl mx-auto right-0">
          {isSearchOverlayOpen && (tab === 'Discover' || tab === 'MyHubs') ? (
            <div className="w-full flex items-center gap-3">
              {/* Back Button */}
              <button 
                onClick={() => {
                  setIsSearchOverlayOpen(false);
                  setSearchQuery('');
                }}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-outline hover:text-on-surface hover:bg-surface-container-low transition-all rounded-xl cursor-pointer shrink-0"
              >
                <ArrowLeft className="w-4 h-4 text-primary" />
                <span>Back</span>
              </button>

              {/* Compact Search Field */}
              <div className="relative flex-grow">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-outline">
                  <Search className="w-4 h-4 text-primary" />
                </span>
                <input
                  id="header-search-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={tab === 'MyHubs' ? "Search hubs, communities or categories..." : "Search events, communities, hashtags or locations"}
                  className="w-full h-10 pl-9 pr-8 bg-slate-50 border border-outline-variant/30 rounded-xl text-xs focus:ring-1 focus:ring-primary focus:bg-white text-on-surface focus:outline-none transition-all placeholder:text-outline/70 font-medium"
                  autoFocus
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-outline hover:text-on-surface hover:bg-neutral-100 rounded-full cursor-pointer animate-none"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="w-full flex justify-between items-center">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setShowMenuDrawer(true)}
                  className="p-2 hover:bg-surface-container-low transition-colors rounded-full active:scale-95 duration-100 ease-in-out cursor-pointer text-primary"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <h1 
                  onClick={() => setTab('Discover')}
                  className="text-headline-md font-extrabold text-primary tracking-tight text-xl md:text-2xl cursor-pointer select-none"
                >
                  ToGather
                </h1>
              </div>

              <div className="flex items-center gap-2.5">
                {/* Dedicated Search Header Trigger */}
                {(tab === 'Discover' || tab === 'MyHubs') && (
                  <button
                    type="button"
                    onClick={() => setIsSearchOverlayOpen(!isSearchOverlayOpen)}
                    className={`p-2 hover:bg-surface-container-low transition-colors rounded-full active:scale-95 duration-100 ease-in-out cursor-pointer relative ${isSearchOverlayOpen ? 'text-primary bg-primary/10' : 'text-on-surface-variant'}`}
                    title="Search and filter events/hubs"
                  >
                    <Search className="w-5 h-5" />
                    {hasSearchFiltersApplied && (
                      <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-secondary border border-white rounded-full animate-pulse" />
                    )}
                  </button>
                )}

                {/* Bell trigger notifications */}
                <button 
                  onClick={() => { setShowNotificationDrawer(true); setDrawerTab('notifications'); }}
                  className="p-2 hover:bg-surface-container-low transition-colors rounded-full active:scale-95 duration-100 ease-in-out cursor-pointer text-on-surface-variant relative"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {notifications.some(n => !n.read) && (
                    <span className="absolute top-1.5 right-1.5 min-w-4 h-4 px-1 bg-rose-500 text-[8px] font-black text-white rounded-full flex items-center justify-center border border-white">
                      {notifications.filter(n => !n.read).length}
                    </span>
                  )}
                </button>
              </div>
            </div>
          )}
        </header>
      )}

      {/* Main container orchestration wrapper */}
      <main className={`w-full max-w-2xl mx-auto px-4 ${tab !== 'Landing' ? 'pt-20 pb-28' : ''}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="w-full"
          >
            {tab === 'Landing' && (
              <LandingPage 
                onSignUp={() => setShowAuthModal(true)} 
                onLogIn={handleDemologin} 
                onStaffPortalAccess={() => setIsAdminOpened(true)}
              />
            )}

            {tab === 'MyHubs' && (
              <MyHubsTab 
                hubs={hubs}
                onToggleJoin={handleToggleJoinHub}
                onNavigateToDiscover={() => setTab('Discover')}
                onShowAuthModal={() => setShowAuthModal(true)}
                isLoggedIn={isLoggedIn}
                onReportHub={handleReportHub}
                events={events}
                onAddHubMessage={handleAddHubMessage}
                initialHubId={initialSelectedHubId}
                onClearInitialHubId={() => setInitialSelectedHubId(undefined)}
                onPublishHubUpdate={handlePublishHubUpdate}
                isSearchOverlayOpen={isSearchOverlayOpen}
                onCloseSearchOverlay={() => setIsSearchOverlayOpen(false)}
                searchQuery={searchQuery}
                onSearchQueryChange={setSearchQuery}
              />
            )}

            {tab === 'Feed' && (
              <FeedTab 
                posts={posts}
                onAddNewPost={handleAddNewPost}
                isLoggedIn={isLoggedIn}
                onShowAuthModal={() => setShowAuthModal(true)}
                onUpdateFeedback={handleUpdateFeedback}
                onReportPost={handleReportPost}
                hubs={hubs}
                events={events}
                onViewHub={(hubId) => {
                  setInitialSelectedHubId(hubId);
                  setTab('MyHubs');
                }}
                onViewEvent={(eventId) => {
                  setInitialSelectedEventId(eventId);
                  setTab('Discover');
                }}
              />
            )}

            {tab === 'Discover' && (
              <DiscoverTab 
                events={events}
                impacts={impacts.length ? impacts : events.filter(e => e.isCompleted || e.isVerifiedConduct)}
                onToggleRSVP={handleToggleRSVPEvent}
                onNavigateToHost={() => setTab('Host')}
                isLoggedIn={isLoggedIn}
                onShowAuthModal={() => setShowAuthModal(true)}
                onReportEvent={handleReportEvent}
                onAddEventMessage={handleAddEventMessage}
                onAddEventPhoto={handleAddEventPhoto}
                onSubmitEventCompletion={handleSubmitEventCompletion}
                profileName={profile.name}
                profileAvatar={profile.avatar}
                profileLocation={profile.location}
                profile={profile}
                
                attendanceRecords={attendanceRecords}
                onVerifyAttendance={(rec) => setAttendanceRecords(prev => [...prev, rec])}
                attendanceAuditLogs={attendanceAuditLogs}
                onAddAuditLog={(log) => setAttendanceAuditLogs(prev => [log, ...prev])}
                onUpdateEvent={(updated) => setEvents(prev => prev.map(e => e.id === updated.id ? updated : e))}

                // New Search and Hub props
                isSearchOverlayOpen={isSearchOverlayOpen}
                onCloseSearchOverlay={() => setIsSearchOverlayOpen(false)}
                onFiltersChange={setHasSearchFiltersApplied}
                searchQuery={searchQuery}
                onSearchQueryChange={setSearchQuery}
                hubs={hubs}
                onToggleJoinHub={handleToggleJoinHub}
                initialEventId={initialSelectedEventId}
                onClearInitialEventId={() => setInitialSelectedEventId(undefined)}
              />
            )}

            {tab === 'Host' && (
              <HostTab 
                onAddNewEvent={handleAddNewEvent}
                isLoggedIn={isLoggedIn}
                onShowAuthModal={() => setShowAuthModal(true)}
              />
            )}

            {tab === 'Profile' && (
              <ProfileTab 
                profile={profile}
                onUpdateProfile={setProfile}
                joinedHubCount={hubs.filter(h => h.isJoined).length}
                rsvpdEvents={events.filter(e => e.isAttending)}
                allEvents={events}
                hubs={hubs}
                onUpdateEvents={setEvents}
                onCancelRSVP={handleToggleRSVPEvent}
                onRequestVerification={handleRequestVerification}
                onLogOut={() => {
                  setIsLoggedIn(false);
                  setTab('Landing');
                }}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Floating Bottom Navigation Bar matching screenshot spec */}
      {tab !== 'Landing' && (
        <nav className="fixed bottom-0 left-0 w-full z-45 bg-surface border-t border-outline-variant/10 shadow-[0_-4px_16px_rgba(164,60,40,0.06)] rounded-t-2xl py-2 px-4 flex justify-around items-center select-none shrink-0 border-outline-variant/10 max-h-20 max-w-2xl mx-auto right-0">
          
          <button 
            onClick={() => setTab('Discover')}
            className={`flex flex-col items-center justify-center p-2 transition-all text-xs font-semibold cursor-pointer rounded-full ${
              tab === 'Discover' 
                ? 'bg-primary-fixed text-on-primary-fixed-variant' 
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            <Compass className={`w-5 h-5 mb-0.5 ${tab === 'Discover' ? 'fill-current text-primary' : ''}`} />
            <span className="text-[10px]">Discover</span>
          </button>

          <button 
            onClick={() => setTab('Host')}
            className={`flex flex-col items-center justify-center p-2 transition-all text-xs font-semibold cursor-pointer rounded-full ${
              tab === 'Host' 
                ? 'bg-primary-fixed text-on-primary-fixed-variant' 
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            <PlusSquare className={`w-5 h-5 mb-0.5 ${tab === 'Host' ? 'fill-current text-primary' : ''}`} />
            <span className="text-[10px]">Host</span>
          </button>

          <button 
            onClick={() => setTab('MyHubs')}
            className={`flex flex-col items-center justify-center p-2 transition-all text-xs font-semibold cursor-pointer rounded-full ${
              tab === 'MyHubs' 
                ? 'bg-primary-fixed text-on-primary-fixed-variant' 
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            <Users className={`w-5 h-5 mb-0.5 ${tab === 'MyHubs' ? 'fill-current text-primary' : ''}`} />
            <span className="text-[10px]">Hubs</span>
          </button>

          <button 
            onClick={() => setTab('Feed')}
            className={`flex flex-col items-center justify-center p-2 transition-all text-xs font-semibold cursor-pointer rounded-full ${
              tab === 'Feed' 
                ? 'bg-primary-fixed text-on-primary-fixed-variant' 
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            <Rss className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Feed</span>
          </button>

        </nav>
      )}

      {/* Unified Registration / Authentication Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className={`bg-surface rounded-2xl w-full p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-200 transition-all ${onboardingStep === 1 ? 'max-w-sm' : 'max-w-md'}`}>
            <button 
              onClick={() => {
                setShowAuthModal(false);
                setOnboardingStep(1);
              }}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface p-1 rounded-full cursor-pointer bg-surface-container hover:bg-surface-container-high transition-colors z-10"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Stepper Progress Indicator */}
            <div className="flex items-center justify-between mb-4 mt-1 select-none">
              <span className="text-[10px] font-black uppercase tracking-wider text-primary">Onboarding Step {onboardingStep} of 3</span>
              <div className="flex gap-1.5">
                <span className={`w-6 h-1 rounded-full transition-colors ${onboardingStep >= 1 ? 'bg-primary' : 'bg-outline-variant/30'}`} />
                <span className={`w-6 h-1 rounded-full transition-colors ${onboardingStep >= 2 ? 'bg-primary' : 'bg-outline-variant/30'}`} />
                <span className={`w-6 h-1 rounded-full transition-colors ${onboardingStep >= 3 ? 'bg-primary' : 'bg-outline-variant/30'}`} />
              </div>
            </div>

            {onboardingStep === 1 && (
              <>
                <div className="flex justify-center mb-3">
                  <span className="p-3 bg-primary/10 rounded-full text-primary">
                    <Sparkles className="w-7 h-7 animate-pulse" />
                  </span>
                </div>

                <h3 className="text-lg font-black text-center text-on-surface mb-1">Join the ToGather Tribe</h3>
                <p className="text-xs text-center text-on-surface-variant mb-6">Discover events and share updates with local community members.</p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-outline mb-1 uppercase tracking-wider">Your Full Name *</label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. Elena Rossi"
                      value={authFormName}
                      onChange={(e) => setAuthFormName(e.target.value)}
                      className="w-full h-11 px-3 bg-surface-container-low border border-outline-variant/35 rounded-xl text-xs focus:ring-1 focus:ring-primary focus:outline-none placeholder:text-outline text-on-surface"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-outline mb-1 uppercase tracking-wider">Phone / SMS Number</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-outline animate-none">
                        <Smartphone className="w-3.5 h-3.5" />
                      </span>
                      <input 
                        type="tel"
                        placeholder="e.g. +1 (555) 123-4567"
                        value={authFormPhone}
                        onChange={(e) => setAuthFormPhone(e.target.value)}
                        className="w-full h-11 pl-9 pr-3 bg-surface-container-low border border-outline-variant/35 rounded-xl text-xs focus:ring-1 focus:ring-primary focus:outline-none placeholder:text-outline text-on-surface"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-outline mb-1 uppercase tracking-wider">Email Address</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-outline">
                        <Mail className="w-3.5 h-3.5" />
                      </span>
                      <input 
                        type="email"
                        placeholder="e.g. elena@local.org"
                        value={authFormEmail}
                        onChange={(e) => setAuthFormEmail(e.target.value)}
                        className="w-full h-11 pl-9 pr-3 bg-surface-container-low border border-outline-variant/35 rounded-xl text-xs focus:ring-1 focus:ring-primary focus:outline-none placeholder:text-outline text-on-surface"
                      />
                    </div>
                  </div>

                  <button 
                    type="button"
                    disabled={!authFormName.trim()}
                    onClick={() => setOnboardingStep(2)}
                    className="w-full h-12 bg-primary text-on-primary rounded-xl font-bold text-xs hover:bg-primary/95 active:scale-95 transition-transform flex items-center justify-center gap-2 mt-2 cursor-pointer shadow-md disabled:opacity-50"
                  >
                    Continue to Interests &nbsp; ➜
                  </button>
                </div>

                <div className="relative flex py-3 items-center mt-4">
                  <div className="flex-grow border-t border-outline-variant/20"></div>
                  <span className="flex-shrink mx-4 text-[10px] font-bold text-outline uppercase tracking-wider">Or Fast Track</span>
                  <div className="flex-grow border-t border-outline-variant/20"></div>
                </div>

                <button 
                  onClick={handleDemologin}
                  className="w-full h-11 border border-outline-variant/30 hover:bg-surface-container-low rounded-xl text-xs font-bold text-on-surface flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  Explore as Guest Explorer
                </button>
              </>
            )}

            {onboardingStep === 2 && (
              <>
                <h3 className="text-base font-black text-on-surface mb-1">🎯 Select Your Sub-Interests</h3>
                <p className="text-[11px] text-on-surface-variant mb-4">Choose multiple interests to match with relevant neighborhood opportunities.</p>
                
                <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                  {[
                    { category: 'Outdoor Activities', items: ['Cycling', 'Motorcycling', 'Running', 'Walking', 'Trekking', 'Camping', 'Travel'] },
                    { category: 'Learning & Creativity', items: ['Reading', 'Writing', 'Technology', 'Programming', 'Artificial Intelligence', 'Startups', 'Entrepreneurship', 'Education', 'Public Speaking', 'Debate'] },
                    { category: 'Arts & Culture', items: ['Photography', 'Videography', 'Painting', 'Crafts', 'Music', 'Dance', 'Theatre', 'Movies', 'History & Heritage', 'Cultural Activities'] },
                    { category: 'Lifestyle & Wellness', items: ['Yoga', 'Meditation', 'Fitness', 'Wellness', 'Nutrition', 'Mental Wellness'] },
                    { category: 'Community & Causes', items: ['Community Service', 'Volunteering', 'Environmental Action', 'Beach Cleanup', 'Tree Plantation', 'Blood Donation', 'Disaster Relief', 'Social Impact'] },
                    { category: 'Animals & Nature', items: ['Pets', 'Animal Welfare', 'Bird Watching', 'Gardening'] },
                    { category: 'Hobbies & Recreation', items: ['Chess', 'Board Games', 'Food & Cooking', 'Baking'] },
                  ].map(group => (
                    <div key={group.category} className="space-y-1.5 border-b border-dashed border-outline-variant/10 pb-3 last:border-0 last:pb-0">
                      <span className="text-[10px] uppercase font-black tracking-wider text-primary">{group.category}</span>
                      <div className="flex flex-wrap gap-1.5">
                        {group.items.map(item => {
                          const isSelected = onboardingInterests.includes(item);
                          return (
                            <button
                              type="button"
                              key={item}
                              onClick={() => {
                                if (isSelected) {
                                  setOnboardingInterests(onboardingInterests.filter(i => i !== item));
                                } else {
                                  setOnboardingInterests([...onboardingInterests, item]);
                                }
                              }}
                              className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer ${
                                isSelected 
                                  ? 'bg-primary text-on-primary' 
                                  : 'bg-surface-container hover:bg-surface-container-high border border-outline-variant/20 text-on-surface-variant'
                              }`}
                            >
                              {isSelected ? `✓ ${item}` : `+ ${item}`}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2.5 mt-6 border-t border-outline-variant/15 pt-4">
                  <button
                    type="button"
                    onClick={() => setOnboardingStep(1)}
                    className="w-1/2 h-11 border border-outline-variant/35 rounded-xl text-xs font-bold text-on-surface hover:bg-surface-container cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setOnboardingStep(3)}
                    className="w-1/2 h-11 bg-primary text-on-primary rounded-xl text-xs font-bold hover:bg-primary/95 shadow-md flex items-center justify-center gap-1 cursor-pointer"
                  >
                    Next Step &nbsp; ➜
                  </button>
                </div>
              </>
            )}

            {onboardingStep === 3 && (
              <>
                <h3 className="text-base font-black text-on-surface mb-1">🎗 Causes & Preferences</h3>
                <p className="text-[11px] text-on-surface-variant mb-4 font-medium">Fine tune your discovery scope and geographic radius.</p>
                
                <form onSubmit={handleAuthSubmit} className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
                  <div>
                    <label className="block text-[10px] font-bold text-outline mb-1.5 uppercase tracking-wider">Causes You Care About</label>
                    <div className="flex flex-wrap gap-1 border border-outline-variant/15 rounded-xl p-2.5 bg-surface-container-lowest max-h-32 overflow-y-auto">
                      {[
                        'Environmental Protection',
                        'Animal Welfare',
                        'Education',
                        'Public Health',
                        'Community Development',
                        'Women Empowerment',
                        'Child Welfare',
                        'Senior Citizen Support',
                        'Disability Inclusion',
                        'Mental Health',
                        'Disaster Relief'
                      ].map(cause => {
                        const isSelected = onboardingCauses.includes(cause);
                        return (
                          <button
                            type="button"
                            key={cause}
                            onClick={() => {
                              if (isSelected) {
                                setOnboardingCauses(onboardingCauses.filter(c => c !== cause));
                              } else {
                                setOnboardingCauses([...onboardingCauses, cause]);
                              }
                            }}
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors cursor-pointer ${
                              isSelected 
                                ? 'bg-secondary text-on-secondary' 
                                : 'bg-surface border border-outline-variant/10 hover:bg-surface-container text-on-surface-variant'
                            }`}
                          >
                            {isSelected ? `✓ ${cause}` : cause}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-outline mb-1.5 uppercase tracking-wider">How do you typically engage?</label>
                    <div className="grid grid-cols-2 gap-1.5 border border-outline-variant/15 rounded-xl p-2.5 bg-surface-container-lowest max-h-28 overflow-y-auto">
                      {[
                        'Attend Events',
                        'Volunteer',
                        'Organize Events',
                        'Join Communities',
                        'Learning Activities',
                        'Outdoor Activities',
                        'Professional Networking'
                      ].map(pref => {
                        const isSelected = onboardingPrefs.includes(pref);
                        return (
                          <label key={pref} className="flex items-center gap-1.5 text-[10.5px] text-on-surface font-semibold cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {
                                if (isSelected) {
                                  setOnboardingPrefs(onboardingPrefs.filter(p => p !== pref));
                                } else {
                                  setOnboardingPrefs([...onboardingPrefs, pref]);
                                }
                              }}
                              className="w-3.5 h-3.5 rounded accent-primary bg-surface border border-outline-variant/25"
                            />
                            <span>{pref}</span>
                          </label>
                        )
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-outline mb-1 uppercase tracking-wider">Preferred Discovery Radius</label>
                    <select
                      value={onboardingRadius}
                      onChange={(e) => {
                        const val = e.target.value;
                        setOnboardingRadius(val === 'Custom' ? 'Custom' : Number(val));
                      }}
                      className="w-full h-11 px-3 bg-surface-container-low border border-outline-variant/35 rounded-xl text-xs focus:ring-1 focus:ring-primary focus:outline-none text-on-surface"
                    >
                      <option value={5}>5 km</option>
                      <option value={10}>10 km</option>
                      <option value={25}>25 km</option>
                      <option value={50}>50 km</option>
                      <option value={100}>100 km</option>
                      <option value="Custom">Custom Radius (Default to 25km)</option>
                    </select>
                  </div>

                  <div className="flex gap-2.5 pt-2 border-t border-outline-variant/15 mt-4">
                    <button
                      type="button"
                      onClick={() => setOnboardingStep(2)}
                      className="w-1/2 h-11 border border-outline-variant/35 rounded-xl text-xs font-bold text-on-surface hover:bg-surface-container cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="w-1/2 h-11 bg-primary text-on-primary rounded-xl text-xs font-bold hover:bg-primary/95 shadow-md flex items-center justify-center gap-1 cursor-pointer"
                    >
                      Complete &nbsp; ✓
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* Notifications Drawer Backdrop */}
      {showNotificationDrawer && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex justify-end">
          <div className="bg-surface w-full max-w-xs h-full p-6 shadow-xl flex flex-col justify-between animate-in slide-in-from-right duration-250 border-l border-outline-variant/20">
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex justify-between items-center mb-6 shrink-0 border-b border-outline-variant/15 pb-4">
                <h3 className="font-bold text-base text-on-surface flex items-center gap-2 select-none">
                  <Bell className="w-4 h-4 text-primary" /> Active Notifications
                </h3>
                <button 
                  onClick={() => setShowNotificationDrawer(false)}
                  className="p-1.5 rounded-full hover:bg-surface-container cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto pr-1 animate-in fade-in duration-150">
                {notifications.length === 0 ? (
                  <div className="text-center py-12 px-4 select-none">
                    <p className="text-xs font-bold text-outline">No active notifications</p>
                    <p className="text-[10px] text-outline-variant mt-1">You are all caught up!</p>
                  </div>
                ) : (
                  notifications.map((notif) => {
                    const isEvent = notif.type === 'event';
                    return (
                      <div
                        key={notif.id}
                        onClick={() => handleNotificationClick(notif)}
                        className={`group p-3.5 rounded-xl border transition-all cursor-pointer text-left relative overflow-hidden select-none active:scale-[0.98] ${
                          notif.read
                            ? 'bg-surface-container-low border-outline-variant/20 hover:bg-surface-container-high/60'
                            : 'bg-primary/5 border-primary/20 hover:bg-primary/10 shadow-3xs'
                        }`}
                      >
                        {!notif.read && (
                          <span className="absolute top-3 right-3 w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
                        )}
                        
                        <div className="flex items-center gap-1.5 mb-1 select-none">
                          <span className={`text-[8.5px] font-black uppercase px-2 py-0.5 rounded-full ${
                            isEvent 
                              ? 'bg-[#9c27b0]/10 text-[#9c27b0]' 
                              : 'bg-primary/10 text-primary'
                          }`}>
                            {notif.type}
                          </span>
                          <span className="text-[9px] text-outline font-medium">{notif.time}</span>
                        </div>

                        <p className={`text-xs font-black leading-tight ${notif.read ? 'text-on-surface' : 'text-primary'}`}>
                          {notif.title}
                        </p>
                        
                        <p className="text-[10px] text-on-surface-variant/90 mt-1 line-clamp-2">
                          {notif.body}
                        </p>

                        <div className="mt-2.5 pt-2 border-t border-outline-variant/10 flex items-center justify-between text-[9px] text-outline font-extrabold group-hover:text-primary transition-colors">
                          <span className="uppercase tracking-wider flex items-center gap-1">
                            {isEvent ? '📅 VIEW EVENT' : '👥 VIEW TRIBE HUB'}
                          </span>
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                            Go →
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="pt-4 shrink-0 space-y-2">
              {notifications.some(n => !n.read) && (
                <button
                  type="button"
                  onClick={() => {
                    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                  }}
                  className="w-full py-2 bg-primary/10 hover:bg-primary/15 text-primary text-[10px] font-black uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
                >
                  Mark All As Read
                </button>
              )}
              
              <button 
                onClick={() => {
                  setNotifications([]);
                  setShowNotificationDrawer(false);
                }}
                className="w-full py-2.5 bg-surface-container hover:bg-surface-container-high transition-colors text-[10px] font-black uppercase tracking-wider rounded-xl cursor-pointer text-outline"
              >
                Clear All Notifications
              </button>
            </div>
          </div>
        </div>
      )}
        {/* Main menu Sidebar Drawer backdrop */}
      {showMenuDrawer && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex justify-start">
          <div className="bg-surface w-full max-w-xs h-full p-6 shadow-xl flex flex-col justify-between animate-in slide-in-from-left duration-250 border-r border-outline-variant/20 select-none">
            
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-outline-variant/10 pb-4">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-lg text-primary tracking-tight">ToGather Info</span>
                  <span className="bg-primary/20 text-primary text-[9px] font-bold px-2 py-0.5 rounded-full">v1.2</span>
                </div>
                <button 
                  onClick={() => setShowMenuDrawer(false)}
                  className="p-1 rounded-full hover:bg-surface-container cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Profile Card (On Top) */}
              <div 
                onClick={() => {
                  setTab('Profile');
                  setShowMenuDrawer(false);
                }}
                className="p-3 bg-surface-container-low hover:bg-surface-container-high/65 transition-all rounded-xl border border-outline-variant/10 cursor-pointer flex justify-between items-center group active:scale-[0.98] text-left"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative w-9 h-9 rounded-full bg-primary/15 text-primary font-black text-xs flex items-center justify-center shrink-0 overflow-hidden">
                    {profile.avatar ? (
                      <img 
                        referrerPolicy="no-referrer"
                        src={profile.avatar} 
                        alt={profile.name} 
                        className="absolute inset-0 w-full h-full object-cover" 
                        onError={(e) => { 
                          e.currentTarget.style.display = 'none'; 
                        }}
                      />
                    ) : null}
                    <span>{String(profile.name || 'U').charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] font-extrabold text-primary uppercase tracking-wider">MY PROFILE</p>
                    <p className="text-xs font-black text-on-surface truncate group-hover:text-primary transition-colors mt-0.5">
                      {profile.name}
                    </p>
                    <p className="text-[10px] text-outline truncate font-medium">{profile.email}</p>
                  </div>
                </div>
                <span className="text-outline/70 group-hover:text-primary transition-colors text-xs font-bold pr-1 shrink-0">
                  →
                </span>
              </div>

              {/* Developer / Demo Reset Utilities */}
              <div className="p-3 bg-orange-50 text-orange-900 rounded-xl border border-orange-100">
                <p className="text-[10px] font-bold uppercase mb-1">Demo sandbox reset</p>
                <p className="text-[9px] mb-2">Revert variables back to initial states</p>
                <button 
                  onClick={handleResetLocalStorage}
                  className="px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white rounded font-bold text-[9.5px]"
                >
                  Clear Demo Cache
                </button>
              </div>

              {/* App vision summary blocks */}
              <div className="space-y-4 text-xs font-medium text-on-surface-variant">
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-outline animate-none" />
                  <span>2,400 Active Local Gathers</span>
                </div>
                <div className="flex items-center gap-3">
                  <Award className="w-5 h-5 text-outline" />
                  <span>36 Active Public Hubs</span>
                </div>
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-outline" />
                  <span>100% Proximity geocheck approved</span>
                </div>
              </div>

              {/* Community rules list */}
              <div className="pt-4 border-t border-outline-variant/10">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-outline mb-2">Tribe Principles</h4>
                <ul className="space-y-2 text-xs text-on-surface-variant">
                  <li className="flex gap-2">
                    <span className="text-primary font-bold">1.</span> Warmth &amp; inclusivity first
                  </li>
                  <li className="flex gap-2">
                    <span className="text-secondary font-bold">2.</span> Geolocation safety approved
                  </li>
                  <li className="flex gap-2">
                    <span className="text-tertiary font-bold">3.</span> Intention turned to impact
                  </li>
                </ul>
              </div>
            </div>

            {/* Account controls */}
            <div className="pt-4 border-t border-outline-variant/10">
              <button 
                onClick={() => {
                  setShowMenuDrawer(false);
                  setIsLoggedIn(false);
                  setTab('Landing');
                }}
                className="w-full py-3 hover:bg-red-50 hover:text-red-650 transition-colors text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer text-outline border border-outline-variant/10"
              >
                <LogOut className="w-4 h-4" /> Guest Standby Mode
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Dynamic matching notification toast */}
      {toastNotification && (
        <div id="interest-match-toast" className="fixed bottom-6 right-6 z-50 max-w-sm p-4 bg-slate-900 border border-slate-700 text-white rounded-2xl shadow-xl flex items-start gap-3 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="text-xs font-semibold flex-1 leading-snug">
            {toastNotification}
          </div>
          <button 
            onClick={() => setToastNotification(null)}
            className="text-white/60 hover:text-white transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

    </div>
  );
}
