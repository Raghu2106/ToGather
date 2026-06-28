/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { EventEntity, MessageEntity, AttendanceRecord, AttendanceAuditLog, FeedPost, EventModerator, EventRecap, Hub, UserProfile } from '../types';
import { 
  Search, 
  MapPin, 
  ToggleLeft, 
  ToggleRight, 
  Users, 
  Check, 
  Plus, 
  Award,
  Sparkles,
  Shield,
  Calendar,
  Clock,
  Briefcase,
  Layers,
  ChevronRight,
  Info,
  X,
  Send,
  Pin,
  Camera,
  CheckCircle,
  FileText,
  AlertTriangle,
  Receipt,
  Heart,
  Sliders,
  SlidersHorizontal,
  QrCode,
  History,
  Map,
  Zap,
  Trash2,
  Settings,
  Lock,
  Unlock,
  VolumeX,
  ArrowLeft,
  Globe
} from 'lucide-react';
import { APPROVED_CATEGORIES } from '../data';

interface DiscoverTabProps {
  events: EventEntity[];
  impacts: EventEntity[];
  onToggleRSVP: (eventId: string, rsvpLevel?: 'Interested' | 'Maybe' | 'Confirmed' | 'Committed') => void;
  onNavigateToHost: () => void;
  isLoggedIn: boolean;
  onShowAuthModal: () => void;
  onReportEvent?: (eventId: string, reason: string) => void;
  onAddEventMessage?: (eventId: string, type: 'announcements' | 'discussion', text: string) => void;
  onAddEventPhoto?: (eventId: string, photoUrl: string) => void;
  onSubmitEventCompletion?: (eventId: string, submission: any) => void;
  profileName?: string;
  profileAvatar?: string;
  profileLocation?: string;

  // Attendance Additions
  attendanceRecords: AttendanceRecord[];
  onVerifyAttendance: (record: AttendanceRecord) => void;
  attendanceAuditLogs: AttendanceAuditLog[];
  onAddAuditLog: (log: AttendanceAuditLog) => void;
  onUpdateEvent: (updated: EventEntity) => void;
  onPublishFeedPost?: (post: FeedPost) => void;

  // Search Additions from App header
  isSearchOverlayOpen?: boolean;
  onCloseSearchOverlay?: () => void;
  onFiltersChange?: (hasFilters: boolean) => void;
  hubs?: Hub[];
  onToggleJoinHub?: (hubId: string) => void;
  searchQuery?: string;
  onSearchQueryChange?: (value: string) => void;
  initialEventId?: string;
  onClearInitialEventId?: () => void;
  profile?: UserProfile;
}

export default function DiscoverTab({ 
  events, 
  impacts, 
  onToggleRSVP, 
  onNavigateToHost,
  isLoggedIn,
  onShowAuthModal,
  onReportEvent,
  onAddEventMessage,
  onAddEventPhoto,
  onSubmitEventCompletion,
  profileName,
  profileAvatar,
  profileLocation = 'Downtown Hubs Area',
  
  attendanceRecords,
  onVerifyAttendance,
  attendanceAuditLogs,
  onAddAuditLog,
  onUpdateEvent,
  onPublishFeedPost,

  // New Search Prop Bindings
  isSearchOverlayOpen = false,
  onCloseSearchOverlay,
  onFiltersChange,
  hubs = [],
  onToggleJoinHub,
  searchQuery: externalSearchQuery,
  onSearchQueryChange,
  initialEventId,
  onClearInitialEventId,
  profile
}: DiscoverTabProps) {
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [showSuggestionsCollapse, setShowSuggestionsCollapse] = useState(false);
  const searchQuery = externalSearchQuery !== undefined ? externalSearchQuery : localSearchQuery;
  const setSearchQuery = onSearchQueryChange !== undefined ? onSearchQueryChange : setLocalSearchQuery;

  // Interactive Detailed Event Experience modal state
  const [selectedEvent, setSelectedEvent] = useState<EventEntity | null>(null);

  React.useEffect(() => {
    if (initialEventId) {
      const foundEvt = events.find(e => e.id === initialEventId);
      if (foundEvt) {
        setSelectedEvent(foundEvt);
        // Switch subtab to overview or recap if completed
        if (foundEvt.isCompleted) {
          setActiveExpTab('recap');
        } else {
          setActiveExpTab('overview');
        }
        if (onClearInitialEventId) {
          onClearInitialEventId();
        }
      }
    }
  }, [initialEventId, events, onClearInitialEventId]);
  const [activeExpTab, setActiveExpTab] = useState<
    | 'overview'
    | 'announcements'
    | 'discussion'
    | 'participants'
    | 'photos'
    | 'checkin'
    | 'impact'
    | 'moderation'
    | 'recap'
    | 'location'
    | 'moderators_view'
  >('overview');
  const [selectedProfileUser, setSelectedProfileUser] = useState<{
    name: string;
    avatar: string;
    verificationStatus: 'Member' | 'Identity Verified' | 'Trusted Organizer';
    bio?: string;
    location?: string;
  } | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isEditingRecap, setIsEditingRecap] = useState(false);
  const [recapPhotosList, setRecapPhotosList] = useState<string[]>([]);

  // Computed Check-in Helpers
  const eventCheckIns = selectedEvent ? attendanceRecords.filter(r => r.eventId === selectedEvent.id) : [];
  const isUserCheckedIn = selectedEvent ? eventCheckIns.some(r => r.userName === profileName) : false;
  const isOrganizer = selectedEvent ? selectedEvent.organizerName === profileName : false;
  const isModerator = selectedEvent ? selectedEvent.moderators?.some(m => m.name === profileName) || false : false;
  
  // Check-In & Scanner States
  const [customRole, setCustomRole] = useState<'participant' | 'organizer' | null>(null);
  const [simulatedDistance, setSimulatedDistance] = useState<number>(5); // Default is 5 meters (Very close, safe)
  const [simulatedLocationServices, setSimulatedLocationServices] = useState<boolean>(true); // Location enabled by default
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string } | null>(null);
  const [qrTimeLeft, setQrTimeLeft] = useState(30 - (Math.floor(Date.now() / 1000) % 30));

  React.useEffect(() => {
    const timer = setInterval(() => {
      setQrTimeLeft(30 - (Math.floor(Date.now() / 1000) % 30));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getActiveToken = (eventId: string) => {
    const epoch30s = Math.floor(Date.now() / 30000);
    const hash = (eventId.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) + epoch30s) % 10000;
    return `TG-${eventId.slice(-3).toUpperCase()}-${1000 + hash}`;
  };

  const [reportReason, setReportReason] = useState('');
  const [showReportModal, setShowReportModal] = useState<string | null>(null);

  // Completion Submission Form State
  const [showCompletionForm, setShowCompletionForm] = useState(false);
  const [attendanceCountEv, setAttendanceCountEv] = useState(20);
  const [venueProofText, setVenueProofText] = useState('Geo-tagged GPS Sign-in Code: D40-CentralPark');
  const [photoSubmissionText, setPhotoSubmissionText] = useState('');
  const [expenseReceipts, setExpenseReceipts] = useState('');

  // Advanced Search Modal State
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);

  // User controlled discovery Radius State (KM)
  const [selectedRadius, setSelectedRadius] = useState<number | 'Custom'>(() => {
    const saved = localStorage.getItem('togather_nearby_radius');
    if (saved === 'Custom') return 'Custom';
    return saved ? Number(saved) : 25; // default to 25 km
  });
  const [customRadiusValue, setCustomRadiusValue] = useState<number>(() => {
    const saved = localStorage.getItem('togather_custom_radius_value');
    return saved ? Number(saved) : 15;
  });
  const [isChangingRadius, setIsChangingRadius] = useState<boolean>(false);
  const [isSearchChangingRadius, setIsSearchChangingRadius] = useState<boolean>(false);

  // Saved/Interested events persistence list
  const [savedEventIds, setSavedEventIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('togather_saved_event_ids');
    return saved ? JSON.parse(saved) : [];
  });

  const toggleSaveEvent = (eventId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSavedEventIds(prev => {
      const next = prev.includes(eventId) ? prev.filter(id => id !== eventId) : [...prev, eventId];
      localStorage.setItem('togather_saved_event_ids', JSON.stringify(next));
      return next;
    });
  };

  React.useEffect(() => {
    localStorage.setItem('togather_nearby_radius', String(selectedRadius));
  }, [selectedRadius]);

  React.useEffect(() => {
    localStorage.setItem('togather_custom_radius_value', String(customRadiusValue));
  }, [customRadiusValue]);

  // Full Page view modes & filters (within Discover Tab)
  const [viewingFullSection, setViewingFullSection] = useState<'near' | 'today' | 'weekend' | 'activity' | 'saved' | 'suggested' | 'organizers' | null>(null);
  const [subPageSearch, setSubPageSearch] = useState('');
  const [subPageInterest, setSubPageInterest] = useState('All');
  const [subPageLocation, setSubPageLocation] = useState('All');
  const [subPageSort, setSubPageSort] = useState<'soonest' | 'closest' | 'attendees' | 'reliability' | 'name'>('soonest');

  React.useEffect(() => {
    setSubPageSearch('');
    setSubPageInterest('All');
    setSubPageLocation('All');
    if (viewingFullSection === 'organizers') {
      setSubPageSort('name');
    } else {
      setSubPageSort('soonest');
    }
  }, [viewingFullSection]);

  // Active Filter states (applied)
  const [activeCountry, setActiveCountry] = useState('');
  const [activeState, setActiveState] = useState('');
  const [activeCity, setActiveCity] = useState('');
  
  const [activeDateMode, setActiveDateMode] = useState<'All' | 'Today' | 'This Week' | 'This Month' | 'Custom'>('All');
  const [activeCustomStart, setActiveCustomStart] = useState('');
  const [activeCustomEnd, setActiveCustomEnd] = useState('');
  const [activeCategories, setActiveCategories] = useState<string[]>([]);
  const [activeVerifiedOnly, setActiveVerifiedOnly] = useState(false);
  const [activeAccessFilter, setActiveAccessFilter] = useState<'All' | 'Open' | 'Approval Required' | 'Invite Only'>('All');

  // Working / draft state for Advanced Search Modal
  const [draftCountry, setDraftCountry] = useState('');
  const [draftState, setDraftState] = useState('');
  const [draftCity, setDraftCity] = useState('');
  const [draftDateMode, setDraftDateMode] = useState<'All' | 'Today' | 'This Week' | 'This Month' | 'Custom'>('All');
  const [draftCustomStart, setDraftCustomStart] = useState('');
  const [draftCustomEnd, setDraftCustomEnd] = useState('');
  const [draftCategories, setDraftCategories] = useState<string[]>([]);
  const [draftVerifiedOnly, setDraftVerifiedOnly] = useState(false);
  const [draftAccessFilter, setDraftAccessFilter] = useState<'All' | 'Open' | 'Approval Required' | 'Invite Only'>('All');

  const advancedCategoriesList = [
    'Volunteering',
    'Environment',
    'Education',
    'Cycling',
    'Motorcycling',
    'Trekking',
    'Reading',
    'Photography',
    'Technology',
    'Wellness',
    'Pets',
    'Social Causes'
  ];

  const toggleDraftCategory = (cat: string) => {
    setDraftCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const handleResetFilters = () => {
    setDraftCountry('');
    setDraftState('');
    setDraftCity('');
    setDraftDateMode('All');
    setDraftCustomStart('');
    setDraftCustomEnd('');
    setDraftCategories([]);
    setDraftVerifiedOnly(false);
    setDraftAccessFilter('All');

    setActiveCountry('');
    setActiveState('');
    setActiveCity('');
    setActiveDateMode('All');
    setActiveCustomStart('');
    setActiveCustomEnd('');
    setActiveCategories([]);
    setActiveVerifiedOnly(false);
    setActiveAccessFilter('All');
    
    setShowAdvancedSearch(false);
  };

  const handleApplyFilters = () => {
    setActiveCountry(draftCountry);
    setActiveState(draftState);
    setActiveCity(draftCity);
    setActiveDateMode(draftDateMode);
    setActiveCustomStart(draftCustomStart);
    setActiveCustomEnd(draftCustomEnd);
    setActiveCategories(draftCategories);
    setActiveVerifiedOnly(draftVerifiedOnly);
    setActiveAccessFilter(draftAccessFilter);
    
    setShowAdvancedSearch(false);
  };

  const hasAnyActiveFilter = () => {
    return !!activeCountry || !!activeState || !!activeCity || activeDateMode !== 'All' || activeCategories.length > 0 || activeVerifiedOnly || activeAccessFilter !== 'All';
  };

  useEffect(() => {
    if (onFiltersChange) {
      onFiltersChange(hasAnyActiveFilter() || searchQuery.trim() !== '');
    }
  }, [
    searchQuery,
    activeCountry,
    activeState,
    activeCity,
    activeDateMode,
    activeCustomStart,
    activeCustomEnd,
    activeCategories,
    activeVerifiedOnly,
    activeAccessFilter,
    onFiltersChange
  ]);

  // Proximity math in KM
  const getProximityKm = (eventLocation: string) => {
    const charSum = eventLocation.split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
    // Standardized mathematical spread between 1.0 km and 59.8 km
    const kmScale = 1.2 + (charSum % 14) * 4.1;
    return Number(kmScale.toFixed(1));
  };

  const getProximityLabel = (eventLocation: string) => {
    return `${getProximityKm(eventLocation)} km`;
  };

  const matchesDateFilter = (eventDate: string) => {
    if (activeDateMode === 'All') return true;
    if (!eventDate) return false;
    
    const dLower = String(eventDate).toLowerCase();
    if (activeDateMode === 'Today') {
      return dLower.includes('today') || dLower.includes('tomorrow') || dLower.includes('may 24') || dLower.includes('completed');
    }
    if (activeDateMode === 'This Week') {
      return !dLower.includes('next') && !dLower.includes('completed');
    }
    if (activeDateMode === 'This Month') {
      return dLower.includes('may') || dLower.includes('this month') || !dLower.includes('completed');
    }
    if (activeDateMode === 'Custom') {
      // Custom date filter selected
      return true;
    }
    return true;
  };

  const matchesCategoriesFilter = (category: string) => {
    if (activeCategories.length === 0) return true;
    if (!category) return false;
    return activeCategories.some(cat => String(category).toLowerCase().includes(String(cat || '').toLowerCase()));
  };

  const matchesOrganizerFilter = (organizerVerification: string) => {
    if (!activeVerifiedOnly) return true;
    return organizerVerification === 'Trusted Organizer' || organizerVerification === 'Identity Verified';
  };

  const matchesAccessFilter = (accessMode: string) => {
    if (activeAccessFilter === 'All') return true;
    if (!accessMode) return false;
    return String(accessMode).toLowerCase() === String(activeAccessFilter || '').toLowerCase();
  };

  // Handle Event Filtering
  const filteredEvents = events.filter(e => {
    if (e.suspended) return false;

    // Proximity range filter
    const distanceVal = getProximityKm(e.location || '');
    const activeRadius = selectedRadius === 'Custom' ? customRadiusValue : selectedRadius;
    const matchesRadius = distanceVal <= activeRadius;

    // Search matches Title, Location, Organizer Name, Category, hashtags
    const q = String(searchQuery || '').toLowerCase();
    const title = String(e.title || '').toLowerCase();
    const loc = String(e.location || '').toLowerCase();
    const cat = String(e.category || '').toLowerCase();
    const org = String(e.organizerName || '').toLowerCase();
    const matchesSearch = title.includes(q) || 
                          loc.includes(q) ||
                          cat.includes(q) ||
                          org.includes(q);
    
    // Country, State, City matches event location string
    const locLower = String(e.location || '').toLowerCase();
    const matchesCountry = !activeCountry || locLower.includes(String(activeCountry || '').toLowerCase());
    const matchesState = !activeState || locLower.includes(String(activeState || '').toLowerCase());
    const matchesCity = !activeCity || locLower.includes(String(activeCity || '').toLowerCase());
    
    // Date filter matches
    const matchesDate = matchesDateFilter(e.date || '');
    
    // Categories matches
    const matchesCategory = matchesCategoriesFilter(e.category || '');
    
    // Organizer matches
    const matchesOrganizer = matchesOrganizerFilter(e.organizerVerification || '');
    
    // Access matches
    const matchesAccess = matchesAccessFilter(e.accessMode || '');

    return matchesRadius && matchesSearch && matchesCountry && matchesState && matchesCity && matchesCategory && matchesDate && matchesOrganizer && matchesAccess;
  });

  // Events Near You dynamic logic filtered by selectedRadius preference
  const nearEvents = events.filter(e => {
    if (e.suspended || e.isCompleted) return false;
    const distanceVal = getProximityKm(e.location);
    const activeRadius = selectedRadius === 'Custom' ? customRadiusValue : selectedRadius;
    return distanceVal <= activeRadius;
  });

  // Suggested For You Scoring Engine
  const getSuggestionScore = (evt: EventEntity) => {
    if (evt.suspended || evt.isCompleted) return 0;
    
    let score = 0;
    
    // 1. Tag matching: Primary interest matches user's selected interests
    if (profile?.interests && profile.interests.length > 0) {
      if (evt.primaryInterest && profile.interests.includes(evt.primaryInterest)) {
        score += 50; // High score for primary interest tag match
      }
      if (evt.secondaryInterest && profile.interests.includes(evt.secondaryInterest)) {
        score += 25; // Medium score for secondary interest tag match
      }
      if (evt.thirdInterest && profile.interests.includes(evt.thirdInterest)) {
        score += 15; // Low score for third interest tag match
      }
    }

    // 2. Causes matching: Event category matches a cause the user cares about
    if (profile?.causes && profile.causes.length > 0 && evt.category) {
      const causeMatches = profile.causes.some(cause => {
        if (!cause) return false;
        const causeStr = String(cause).toLowerCase();
        return String(evt.category || '').toLowerCase().includes(causeStr) || 
               String(evt.title || '').toLowerCase().includes(causeStr);
      });
      if (causeMatches) {
        score += 30;
      }
    }

    // 3. Proximity bonus within discovery radius limit
    const distanceVal = getProximityKm(evt.location || '');
    const activeRadius = selectedRadius === 'Custom' ? customRadiusValue : (selectedRadius || 25);
    if (distanceVal <= Number(activeRadius)) {
      score += 20;
      if (distanceVal < 10) {
        score += 15; // ultra local bonus
      }
    } else {
      score -= 25; // penalize outside discovery radius
    }

    // 4. Joined Hub matching:
    const userIsMemberOfHub = hubs && hubs.some(hub => hub && hub.isJoined && (
      String(evt.location || '').toLowerCase().includes(String(hub.name || '').toLowerCase()) ||
      String(evt.organizerName || '').toLowerCase() === String(hub.name || '').toLowerCase()
    ));
    if (userIsMemberOfHub) {
      score += 25;
    }

    // 5. RSVP / interaction status:
    if (evt.isAttending || savedEventIds.includes(evt.id)) {
      score += 40;
    }

    return score;
  };

  const suggestedEvents = events
    .filter(e => !e.suspended && !e.isCompleted)
    .map(e => ({ event: e, score: getSuggestionScore(e) }))
    .filter(item => item.score > 20)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  const getChatAccessStatus = (evt: EventEntity, name: string) => {
    if (evt.organizerName === name) return { hasAccess: true, reason: 'Organizer' };
    const attendee = evt.attendees?.find(a => a.name === name);
    if (!attendee) return { hasAccess: false, reason: 'Not Joined' };
    if (evt.removedParticipants?.includes(name)) return { hasAccess: false, reason: 'Removed' };
    
    if (evt.accessMode === 'Open') {
      return { hasAccess: true, reason: 'Open' };
    } else if (evt.accessMode === 'Approval Required') {
      if (attendee.approved) {
        return { hasAccess: true, reason: 'Approved' };
      } else {
        return { hasAccess: false, reason: 'Pending Approval' };
      }
    } else if (evt.accessMode === 'Invite Only') {
      if (attendee.invitedAccepted || attendee.approved) {
        return { hasAccess: true, reason: 'Invite Accepted' };
      } else {
        return { hasAccess: false, reason: 'Not Invited/Awaiting Invitation' };
      }
    }
    return { hasAccess: true, reason: 'Default' };
  };

  const executeRSVPToggle = (evt: EventEntity, requestedLevel: 'Interested' | 'Maybe' | 'Confirmed' | 'Committed' = 'Confirmed') => {
    if (!profileName) {
      onShowAuthModal();
      return;
    }
    const isCurrentlyAttending = evt.isAttending;
    
    if (isCurrentlyAttending) {
      const updatedAttendees = evt.attendees.filter(a => a.name !== profileName);
      const updatedModList = evt.moderators?.filter(m => m.name !== profileName) || [];
      const updated: EventEntity = {
        ...evt,
        isAttending: false,
        participationLevel: undefined,
        attendeesCount: Math.max(0, updatedAttendees.length),
        attendees: updatedAttendees,
        moderators: updatedModList
      };
      onUpdateEvent(updated);
      setSelectedEvent(updated);
      alert('You have withdrawn your registration for this event.');
    } else {
      const inviteEntry = evt.attendees?.find(a => a.name === profileName && a.invited);
      
      if (evt.accessMode === 'Invite Only' && !inviteEntry) {
        alert('This is an Invite Only event. You must receive an active invitation from the organizer or moderator first!');
        return;
      }

      let isApproved = true;
      let invitedAccepted = false;

      if (evt.accessMode === 'Approval Required') {
        isApproved = false;
        alert('RSVP Received! Your participation is pending organizer or moderator approval before you can access chat.');
      } else if (evt.accessMode === 'Invite Only' && inviteEntry) {
        isApproved = true;
        invitedAccepted = true;
        alert('Success: Invitation Accepted! You are now a confirmed participant with full chat access!');
      } else {
        alert('Success: You have successfully registered for this active community event!');
      }

      let nextAttendees = [...evt.attendees];
      const existingIdx = nextAttendees.findIndex(a => a.name === profileName);
      
      const attendeeObj = {
        name: profileName,
        avatar: profileAvatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
        participationLevel: requestedLevel,
        approved: isApproved,
        invitedAccepted,
        invited: inviteEntry ? true : false
      };

      if (existingIdx >= 0) {
        nextAttendees[existingIdx] = attendeeObj;
      } else {
        nextAttendees.push(attendeeObj);
      }

      const updated: EventEntity = {
        ...evt,
        isAttending: true,
        participationLevel: requestedLevel,
        attendeesCount: nextAttendees.length,
        attendees: nextAttendees
      };
      
      onUpdateEvent(updated);
      setSelectedEvent(updated);
    }
  };

  const handleSendImageChat = (imageUrl: string) => {
    if (!selectedEvent) return;
    const isOrganizer = selectedEvent.organizerName === profileName;
    const isModerator = selectedEvent.moderators?.some(m => m.name === profileName);
    const modRecord = selectedEvent.moderators?.find(m => m.name === profileName);
    const canUpload = isOrganizer || (isModerator && modRecord?.permissions.uploadEventImages);

    if (!canUpload) {
      alert('You do not have permission to post image messages in this communication stream.');
      return;
    }

    const newMessageObj: MessageEntity = {
      id: `msg-evt-${Date.now()}`,
      senderName: profileName || 'Alex Neighbor',
      senderAvatar: profileAvatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
      senderVerification: isOrganizer ? 'Trusted Organizer' : 'Identity Verified',
      content: 'Shared an event photo:',
      timestamp: 'Just now',
      image: imageUrl,
      pinned: false
    };

    const updated: EventEntity = {
      ...selectedEvent,
      discussion: [...(selectedEvent.discussion || []), newMessageObj]
    };

    onUpdateEvent(updated);
    setSelectedEvent(updated);
    alert('Photo published to discussions!');
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedEvent) return;
    if (!isLoggedIn) {
      onShowAuthModal();
      return;
    }

    const isOrganizer = selectedEvent.organizerName === profileName;
    const isModerator = selectedEvent.moderators?.some(m => m.name === profileName);
    const isModOrOrganizer = isOrganizer || isModerator;

    const chatState = getChatAccessStatus(selectedEvent, profileName || '');
    if (!chatState.hasAccess) {
      alert(`Chat transmission blocked: ${chatState.reason}`);
      return;
    }

    const isMuted = selectedEvent.mutedParticipants?.includes(profileName || '');
    if (isMuted) {
      alert('You are currently muted in discussions by an Event Moderator.');
      return;
    }

    const isAnnouncementMode = (selectedEvent.communicationMode || 'Discussion') === 'Announcement';
    if (isAnnouncementMode && !isModOrOrganizer) {
      alert('Chat is in Announcement-Only Mode. Only organizers and moderators can cast messages.');
      return;
    }

    const newMessageObj: MessageEntity = {
      id: `msg-evt-${Date.now()}`,
      senderName: profileName || 'Alex Neighbor',
      senderAvatar: profileAvatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
      senderVerification: isOrganizer ? 'Trusted Organizer' : 'Identity Verified',
      content: newMessage.trim(),
      timestamp: 'Just now',
      pinned: false
    };

    const targetField = 'discussion';
    const currentMessages = selectedEvent[targetField] || [];

    const updated: EventEntity = {
      ...selectedEvent,
      [targetField]: [...currentMessages, newMessageObj]
    };

    onUpdateEvent(updated);
    setSelectedEvent(updated);
    setNewMessage('');
  };

  const handleAttachPhoto = () => {
    if (!selectedEvent) return;
    const photoUrl = prompt('Enter a valid image URL to publish to the event gallery preset:', 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&auto=format&fit=crop');
    if (photoUrl && onAddEventPhoto) {
      onAddEventPhoto(selectedEvent.id, photoUrl);
      setTimeout(() => {
        const fresh = events.find(e => e.id === selectedEvent.id);
        if (fresh) setSelectedEvent(fresh);
      }, 50);
    }
  };

  const handleReportSubmit = (id: string) => {
    if (!reportReason.trim()) return;
    if (onReportEvent) {
      onReportEvent(id, reportReason);
      alert('Event flagged. Moderation council is evaluating report logs.');
    }
    setReportReason('');
    setShowReportModal(null);
    closeEventDetail();
  };

  const closeEventDetail = () => {
    setSelectedEvent(null);
    setCustomRole(null);
    setScanResult(null);
    setIsScanning(false);
  };

  // Active role calculation
  const activeRole = customRole || (profileName === selectedEvent?.organizerName ? 'organizer' : 'participant');

  // Verify function
  const handleStartEvent = () => {
    if (!selectedEvent) return;
    const updated = {
      ...selectedEvent,
      isStarted: true,
      attendanceRadiusLimit: selectedEvent.attendanceRadiusLimit || 200,
      attendanceCoordinates: selectedEvent.attendanceCoordinates || { lat: 40.785091, lng: -73.968285 }
    };
    onUpdateEvent(updated);
    setSelectedEvent(updated);
    onAddAuditLog({
      id: `audit-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      action: 'Event Started',
      details: `Organizer started check-in session for event "${selectedEvent.title}". Initial radius 200m.`,
      operator: selectedEvent.organizerName,
      status: 'Success'
    });
  };

  const handleChangeRadius = (newRadius: number) => {
    if (!selectedEvent) return;
    const updated = {
      ...selectedEvent,
      attendanceRadiusLimit: newRadius
    };
    onUpdateEvent(updated);
    setSelectedEvent(updated);
    onAddAuditLog({
      id: `audit-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      action: 'Event Radius Changed',
      details: `Radius limit for event "${selectedEvent.title}" updated to ${newRadius}m.`,
      operator: selectedEvent.organizerName,
      status: 'Info'
    });
  };

  const handleScanToken = (isExpiredTokenTest: boolean = false) => {
    if (!selectedEvent) return;
    setIsScanning(true);
    setScanResult(null);

    setTimeout(() => {
      setIsScanning(false);
      
      // 1. Check location services
      if (!simulatedLocationServices) {
        setScanResult({ success: false, message: "Attendance Verification Failed: Device location services disabled." });
        onAddAuditLog({
          id: `audit-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          action: 'Service Disabled',
          details: `Scan rejected. User ${profileName} has device location services disabled.`,
          operator: profileName || 'Member',
          status: 'Failure'
        });
        return;
      }

      // 2. Check RSVP
      if (!selectedEvent.isAttending) {
        setScanResult({ success: false, message: "Attendance Verification Failed: You must register / RSVP for this event first to unlock identity tokens." });
        onAddAuditLog({
          id: `audit-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          action: 'Scan Rejected (No RSVP)',
          details: `Scan rejected. User ${profileName} is not registered for event "${selectedEvent.title}".`,
          operator: profileName || 'Member',
          status: 'Failure'
        });
        return;
      }

      // 3. Check Event Started
      if (!selectedEvent.isStarted) {
        setScanResult({ success: false, message: "Attendance Verification Failed: The organizer has not started this event check-in session yet." });
        return;
      }

      // 4. Token verification
      if (isExpiredTokenTest) {
        setScanResult({ success: false, message: "Attendance Verification Failed: Scanned code is expired or re-used. Dynamic QR refresh required." });
        onAddAuditLog({
          id: `audit-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          action: 'Scan Rejected (Token Expired)',
          details: `Scan rejected. User ${profileName} scanned an expired dynamic token "TG-OLD-5481" (Screenshot fraud-test).`,
          operator: profileName || 'Member',
          status: 'Failure'
        });
        return;
      }

      // 5. Proximity verification
      const allowedRadius = selectedEvent.attendanceRadiusLimit || 200;
      if (simulatedDistance > allowedRadius) {
        setScanResult({ success: false, message: `Attendance Verification Failed: You are outside the permitted ${allowedRadius}m radius. Simulated distance: ${simulatedDistance}m.` });
        onAddAuditLog({
          id: `audit-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          action: 'Scan Rejected (Distance)',
          details: `Scan rejected. User ${profileName} is outside ${allowedRadius}m radius threshold (Distance: ${simulatedDistance}m).`,
          operator: profileName || 'Member',
          status: 'Failure'
        });
        return;
      }

      // Successful Scan!
      const successMsg = `Attendance Verified ✓. Your physical presence within ${simulatedDistance}m was validated under anti-fraud coordinate safety checks.`;
      setScanResult({ success: true, message: successMsg });
      
      const newRecord: AttendanceRecord = {
        id: `att-rec-${Date.now()}`,
        userId: 'current-user',
        userName: profileName || 'Member',
        userAvatar: profileAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
        eventId: selectedEvent.id,
        eventTitle: selectedEvent.title,
        timestamp: new Date().toLocaleTimeString(),
        coords: { lat: 40.785091, lng: -73.968285 },
        radiusLimit: allowedRadius,
        distanceMeters: simulatedDistance,
        impactAwarded: false
      };
      
      onVerifyAttendance(newRecord);
      
      onAddAuditLog({
        id: `audit-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        action: 'Scan Success',
        details: `Verified check-in. ${profileName} scanned active token "${getActiveToken(selectedEvent.id)}" from ${simulatedDistance}m away (radius threshold: ${allowedRadius}m).`,
        operator: profileName || 'Member',
        status: 'Success'
      });
    }, 1200);
  };

  const submitCompletionWorkflow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;
    if (onSubmitEventCompletion) {
      onSubmitEventCompletion(selectedEvent.id, {
        attendanceEvidence: `Self Sign-in: Total ${attendanceCountEv} attendees confirmed.`,
        photos: photoSubmissionText ? [photoSubmissionText] : ['https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600'],
        venueProof: venueProofText,
        supportingDoc: 'Vanguard Community Center logbook verification signature.pdf',
        expenses: expenseReceipts,
        status: 'Pending'
      });
      alert('Success: Your event conduct evidence is submitted to ToGather safety moderators. It will receive a "✓ Verified Event" label upon approval.');
      setShowCompletionForm(false);
      setTimeout(() => {
        const fresh = events.find(e => e.id === selectedEvent.id);
        if (fresh) setSelectedEvent(fresh);
      }, 50);
    }
  };

  const renderEventCard = (evt: EventEntity, sourceSection?: string, isHorizontal = false) => {
    const isSaved = savedEventIds.includes(evt.id);
    const reliabilityRate = 89 + (evt.organizerPastEvents % 3) * 4; // realistic attendance reliability (e.g. 89%, 93%, 97%)
    const distanceStr = getProximityLabel(evt.location);

    return (
      <div 
        key={evt.id}
        onClick={() => {
          setSelectedEvent(evt);
          setActiveExpTab('overview');
        }}
        className={isHorizontal 
          ? "w-[220px] sm:w-[240px] shrink-0 snap-start bg-white rounded-2xl border border-outline-variant/10 overflow-hidden hover:shadow-sm transition-all duration-200 cursor-pointer flex flex-col shadow-3xs group relative animate-in fade-in duration-200"
          : "w-full bg-white rounded-2xl border border-outline-variant/10 overflow-hidden hover:shadow-sm transition-all duration-200 cursor-pointer flex flex-col md:flex-row shadow-3xs group relative animate-in fade-in duration-200"
        }
      >
        {/* Event Image */}
        <div className={isHorizontal 
          ? "h-28 w-full overflow-hidden relative bg-neutral-100 shrink-0" 
          : "h-32 md:h-auto md:w-36 overflow-hidden relative bg-neutral-100 shrink-0"
        }>
          <img 
            referrerPolicy="no-referrer"
            src={evt.image || undefined} 
            alt={evt.title} 
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-250" 
          />
          <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-xs text-white px-2 py-0.5 rounded-md text-[7.5px] font-bold font-mono">
            {distanceStr}
          </div>
          <div className="absolute bottom-2 left-2">
            <span className="bg-primary text-white px-1.5 py-0.5 rounded-md text-[7px] font-black uppercase tracking-wider">
              {evt.category}
            </span>
          </div>

          {/* Bookmark/Save action */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleSaveEvent(evt.id);
            }}
            className="absolute top-2 right-2 p-1 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors active:scale-95 z-10 animate-none"
            title={isSaved ? "Remove from Saved" : "Save Opportunity"}
          >
            <Heart className={`w-3 h-3 ${isSaved ? 'fill-secondary text-secondary' : 'text-neutral-200'}`} />
          </button>
        </div>

        {/* Card Details */}
        <div className="p-3 flex-grow flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-0.5 text-[8.5px] font-bold text-outline uppercase select-none">
              <span className="text-secondary tracking-wide">{evt.category}</span>
              <span className="text-on-surface bg-neutral-100 px-1 rounded-sm">{evt.date}</span>
            </div>

            <h4 className="font-extrabold text-[11.5px] sm:text-xs text-on-surface group-hover:text-primary transition-colors leading-tight mb-0.5 truncate">
              {evt.title}
            </h4>
            <p className="text-outline text-[10px] line-clamp-1 mb-1.5">
              {evt.description || 'Join local community forces around this safe volunteer gathering.'}
            </p>

            {/* Interest alignment tags display */}
            {(evt.primaryInterest || evt.secondaryInterest) && (
              <div className="flex flex-wrap gap-1 mb-2 select-none text-[8px] font-bold">
                {evt.primaryInterest && (
                  <span className={`px-1.5 py-0.5 rounded border flex items-center gap-0.5 transition-colors ${profile?.interests?.includes(evt.primaryInterest) ? 'bg-primary/10 text-primary border-primary/20' : 'bg-neutral-50 border-outline-variant/10 text-outline'}`}>
                    🎯 {evt.primaryInterest}
                  </span>
                )}
                {evt.secondaryInterest && (
                  <span className={`px-1.5 py-0.5 rounded border flex items-center gap-0.5 transition-colors ${profile?.interests?.includes(evt.secondaryInterest) ? 'bg-secondary/5 text-on-secondary-container border-secondary/10' : 'bg-neutral-50 border-outline-variant/10 text-outline'}`}>
                    {evt.secondaryInterest}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Organizer & Attendance Reliability */}
          <div className="flex items-center justify-between text-[9px] text-outline/80 py-1 border-t border-b border-outline-variant/10 my-1 select-none">
            <div className="flex items-center gap-1.5 min-w-0">
              <div className="relative w-5 h-5 rounded-full border border-outline-variant/15 bg-primary/10 text-primary font-black text-[9px] flex items-center justify-center shrink-0 overflow-hidden">
                {evt.organizerAvatar ? (
                  <img 
                    referrerPolicy="no-referrer"
                    src={evt.organizerAvatar} 
                    alt={evt.organizerName} 
                    className="absolute inset-0 w-full h-full object-cover" 
                    onError={(e) => { 
                      e.currentTarget.style.display = 'none'; 
                    }}
                  />
                ) : null}
                <span>{String(evt.organizerName || 'U').charAt(0).toUpperCase()}</span>
              </div>
              <span className="truncate font-bold text-on-surface flex items-center gap-0.5">
                {evt.organizerName}
                {evt.organizerVerification === 'Trusted Organizer' && <span className="text-primary text-[8px]" title="Trusted Organizer">🛡️</span>}
              </span>
            </div>
            <span className="text-emerald-700 bg-emerald-50/70 px-1 py-0.2 rounded font-extrabold shrink-0">
              ★ {reliabilityRate}%
            </span>
          </div>

          {/* Card footer metrics */}
          <div className="flex justify-between items-center text-[9px] pt-1">
            <span className="text-outline font-semibold font-sans">
              👥 {evt.attendeesCount} joined
            </span>
            <div className="flex items-center gap-1 font-extrabold text-primary text-[10.5px]">
              {evt.isAttending && (
                <span className="text-[7.5px] bg-primary/10 border border-primary/20 text-primary px-1.5 py-0.5 rounded-full font-black uppercase tracking-wider">
                  Going
                </span>
              )}
              <span className="group-hover:translate-x-0.5 transition-transform flex items-center">
                Join <ChevronRight className="w-3 h-3" />
              </span>
            </div>
          </div>

        </div>
      </div>
    );
  };

  const uniqueInterestsList = ['Volunteering', 'Environment', 'Education', 'Cycling', 'Yoga & Meditation', 'Reading', 'Photography', 'Technology', 'Pets & Wildlife', 'Wellness', 'Social Causes'];

  const getSubPageEvents = () => {
    let list: EventEntity[] = [];
    if (viewingFullSection === 'near') {
      list = [...nearEvents];
    } else if (viewingFullSection === 'today') {
      list = events.filter(e => !e.suspended && !e.isCompleted && String(e.date || '').toLowerCase().includes('today'));
    } else if (viewingFullSection === 'weekend') {
      list = events.filter(e => !e.suspended && !e.isCompleted && (
        String(e.date || '').toLowerCase().includes('weekend') || 
        String(e.date || '').toLowerCase().includes('saturday') || 
        String(e.date || '').toLowerCase().includes('sunday')
      ));
    } else if (viewingFullSection === 'activity') {
      list = events.filter(e => !e.suspended && e.isAttending);
    } else if (viewingFullSection === 'saved') {
      list = events.filter(e => !e.suspended && (savedEventIds.includes(e.id) || e.participationLevel === 'Interested' || e.participationLevel === 'Maybe'));
    } else if (viewingFullSection === 'suggested') {
      list = suggestedEvents.map(item => item.event);
    }

    return list.filter(e => {
      // 1. Search Query
      if (subPageSearch.trim()) {
        const q = subPageSearch.toLowerCase();
        const matches = String(e.title || '').toLowerCase().includes(q) ||
                        String(e.description || '').toLowerCase().includes(q) ||
                        String(e.organizerName || '').toLowerCase().includes(q) ||
                        String(e.location || '').toLowerCase().includes(q);
        if (!matches) return false;
      }

      // 2. Interest
      if (subPageInterest !== 'All') {
        const isCatMatch = String(e.category || '').toLowerCase().includes(subPageInterest.toLowerCase()) ||
                            String(e.primaryInterest || '').toLowerCase() === subPageInterest.toLowerCase() ||
                            String(e.secondaryInterest || '').toLowerCase() === subPageInterest.toLowerCase();
        if (!isCatMatch) return false;
      }

      // 3. Location Filter
      if (subPageLocation !== 'All') {
        const isLocMatch = String(e.location || '').toLowerCase().includes(subPageLocation.toLowerCase());
        if (!isLocMatch) return false;
      }

      return true;
    }).sort((a, b) => {
      if (subPageSort === 'soonest') {
        return String(a.date).localeCompare(String(b.date));
      }
      if (subPageSort === 'closest') {
        return getProximityKm(a.location) - getProximityKm(b.location);
      }
      if (subPageSort === 'attendees') {
        return (b.attendeesCount || 0) - (a.attendeesCount || 0);
      }
      if (subPageSort === 'reliability') {
        const reliabilityA = 89 + (a.organizerPastEvents % 3) * 4;
        const reliabilityB = 89 + (b.organizerPastEvents % 3) * 4;
        return reliabilityB - reliabilityA;
      }
      if (subPageSort === 'name') {
        return String(a.title).localeCompare(String(b.title));
      }
      return 0;
    });
  };

  const getSubPageOrganizers = () => {
    const list = [
      {
        name: 'David Atten',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        rank: 'Coastal Bay Sector Lead',
        conducted: 24,
        reliability: 97,
        bio: 'Passionate marine ecology, biodiversity, and coastal cleanups. Spearheading shoreline garbage monitoring and micro-plastic extraction programs in Region 4.',
        specialty: 'Environment'
      },
      {
        name: 'Elena Rossi',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
        rank: 'Youth Literacy Moderator',
        conducted: 8,
        reliability: 96,
        bio: 'Educational coordinator. Oversees smart tutoring hubs, homework workshops, and primary curriculum supplements for neighborhood children.',
        specialty: 'Education'
      },
      {
        name: 'Sarah Jenkins',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        rank: 'Municipal Cycle Host',
        conducted: 45,
        reliability: 98,
        bio: 'Community cyclist and endurance racer. Leads safe paced pacing groups, mountain bike path restorations, and urban bike safety courses.',
        specialty: 'Cycling'
      }
    ];

    return list.filter(org => {
      if (subPageSearch.trim()) {
        const q = subPageSearch.toLowerCase();
        if (!org.name.toLowerCase().includes(q) && !org.rank.toLowerCase().includes(q) && !org.bio.toLowerCase().includes(q)) {
          return false;
        }
      }
      if (subPageInterest !== 'All' && org.specialty !== subPageInterest) {
        return false;
      }
      return true;
    }).sort((a, b) => {
      if (subPageSort === 'name') {
        return a.name.localeCompare(b.name);
      }
      if (subPageSort === 'reliability') {
        return b.reliability - a.reliability;
      }
      if (subPageSort === 'attendees') {
        return b.conducted - a.conducted;
      }
      return 0;
    });
  };

  const renderSectionScroll = (
    items: any[], 
    renderItem: (item: any) => React.ReactNode, 
    onViewMore: () => void, 
    emptyPlaceholder: React.ReactNode
  ) => {
    if (items.length === 0) {
      return emptyPlaceholder;
    }

    return (
      <div className="relative w-full">
        <div className="flex overflow-x-auto hide-scrollbar snap-x snap-mandatory gap-3 pb-3 px-1 w-full">
          {items.map((item) => renderItem(item))}
          
          {/* VIEW MORE CARD at the end */}
          <div 
            onClick={onViewMore}
            className="w-[140px] sm:w-[160px] shrink-0 snap-end flex flex-col items-center justify-center bg-zinc-50/75 hover:bg-zinc-100/80 border border-dashed border-outline-variant/30 rounded-2xl cursor-pointer p-3 text-center hover:border-primary/40 transition-all select-none group min-h-[210px]"
          >
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2 group-hover:scale-105 transition-transform">
              <ChevronRight className="w-4 h-4" />
            </div>
            <p className="text-[9.5px] font-extrabold text-[#2c3e50] uppercase tracking-wider">View All</p>
            <p className="text-[8.5px] text-outline mt-1 font-semibold leading-tight select-none">Explore details & filters</p>
          </div>
        </div>
      </div>
    );
  };

  const renderFullSectionView = () => {
    const isOrganizers = viewingFullSection === 'organizers';
    const title = {
      near: '1. Events Near You',
      today: "2. Happening Today",
      weekend: '3. This Weekend',
      activity: '4. Your Activity',
      saved: '5. Saved & Interested Gathers',
      suggested: 'Suggested For You',
      organizers: '7. Trusted Organizers'
    }[viewingFullSection || 'near'] || 'Browse Opportunities';

    const eventItems = isOrganizers ? [] : getSubPageEvents();
    const organizerItems = isOrganizers ? getSubPageOrganizers() : [];
    const totalMatches = isOrganizers ? organizerItems.length : eventItems.length;

    const uniqueLocations = Array.from(new Set(events.map(e => {
      const parts = e.location.split(',');
      return parts[parts.length - 1]?.trim() || e.location;
    }))).filter(Boolean);

    return (
      <div className="bg-white rounded-[2rem] border border-outline-variant/15 p-6 shadow-sm min-h-[600px] animate-in fade-in duration-200 text-left">
        <div className="flex items-center justify-between border-b border-outline-variant/10 pb-4 mb-5">
          <button 
            type="button"
            onClick={() => setViewingFullSection(null)}
            className="flex items-center gap-1.5 text-xs font-black uppercase text-outline hover:text-primary transition-all cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Back to Discover</span>
          </button>
          
          <span className="text-[10px] font-extrabold uppercase bg-neutral-100 text-outline px-2.5 py-1 rounded-full border">
            {totalMatches} Matches Found
          </span>
        </div>

        <div className="mb-6">
          <h1 className="text-xl font-black text-[#2c3e50] tracking-tight">{title}</h1>
          <p className="text-[11px] text-outline mt-1 font-semibold">Explore, sort, or filter through coordinate logs dynamically.</p>
        </div>

        <div className="bg-neutral-50/75 border border-outline-variant/15 rounded-2xl p-4 mb-6 space-y-3.5 select-none">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-grow relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
              <input
                type="text"
                placeholder={isOrganizers ? "Search organizer name or rank..." : "Search title, location, description..."}
                value={subPageSearch}
                onChange={(e) => setSubPageSearch(e.target.value)}
                className="w-full bg-white border border-outline-variant/25 rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary text-on-surface"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex items-center gap-1">
                <span className="text-[10px] uppercase font-bold text-outline shrink-0">Topic:</span>
                <select
                  value={subPageInterest}
                  onChange={(e) => setSubPageInterest(e.target.value)}
                  className="bg-white border border-outline-variant/25 rounded-xl text-xs px-2.5 py-1.5 font-bold focus:outline-none focus:ring-1 focus:ring-primary max-w-[150px] cursor-pointer text-on-surface"
                >
                  <option value="All">All Topics</option>
                  {isOrganizers ? (
                    <>
                      <option value="Environment">Environment</option>
                      <option value="Education">Education</option>
                      <option value="Cycling">Cycling</option>
                    </>
                  ) : (
                    uniqueInterestsList.map(int => (
                      <option key={int} value={int}>{int}</option>
                    ))
                  )}
                </select>
              </div>

              {!isOrganizers && (
                <div className="flex items-center gap-1">
                  <span className="text-[10px] uppercase font-bold text-outline shrink-0">City:</span>
                  <select
                    value={subPageLocation}
                    onChange={(e) => setSubPageLocation(e.target.value)}
                    className="bg-white border border-outline-variant/25 rounded-xl text-xs px-2.5 py-1.5 font-bold focus:outline-none focus:ring-1 focus:ring-primary max-w-[180px] cursor-pointer text-on-surface"
                  >
                    <option value="All">All Cities</option>
                    {uniqueLocations.map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex items-center gap-1">
                <span className="text-[10px] uppercase font-bold text-outline shrink-0">Sort:</span>
                <select
                  value={subPageSort}
                  onChange={(e) => setSubPageSort(e.target.value as any)}
                  className="bg-white border border-outline-variant/25 rounded-xl text-xs px-2.5 py-1.5 font-bold focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer text-on-surface"
                >
                  {isOrganizers ? (
                    <>
                      <option value="name">Name (Alphabetical)</option>
                      <option value="reliability">Avg Attendance</option>
                      <option value="attendees">Events Conducted</option>
                    </>
                  ) : (
                    <>
                      <option value="soonest">Timeline (Soonest)</option>
                      <option value="closest">Distance (Closest)</option>
                      <option value="attendees">Popularity (Most Registered)</option>
                      <option value="reliability">Attendance Reliability</option>
                      <option value="name">Title (Alphabetical)</option>
                    </>
                  )}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div>
          {isOrganizers ? (
            organizerItems.length === 0 ? (
              <div className="p-8 text-center bg-neutral-50 rounded-2xl border border-dashed text-outline select-none py-12">
                <p className="text-xs font-semibold">No organizers found matching those filters.</p>
                <p className="text-[10px] mt-1 text-outline-variant">Try refining your filter preferences.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {organizerItems.map((org, idx) => (
                  <div 
                    key={idx}
                    className="bg-white border border-outline-variant/15 hover:shadow-md rounded-2xl p-4 flex flex-col justify-between text-left transition-all"
                  >
                    <div>
                      <div className="flex items-center gap-2.5 mb-2">
                        <img src={org.avatar} alt={org.name} className="w-10 h-10 rounded-full object-cover shrink-0 border" />
                        <div className="min-w-0">
                          <h4 className="font-extrabold text-xs text-on-surface truncate flex items-center gap-1">
                            {org.name} <span className="text-primary">🛡️</span>
                          </h4>
                          <p className="text-[9px] text-outline truncate">{org.rank}</p>
                        </div>
                      </div>
                      <p className="text-[9.5px] text-outline line-clamp-3 leading-normal mb-3">{org.bio}</p>
                    </div>

                    <div className="border-t border-outline-variant/10 pt-2.5">
                      <div className="flex justify-between items-center text-[9px] text-outline font-bold mb-1.5">
                        <span>Events Conducted:</span>
                        <span className="text-on-surface font-extrabold">{org.conducted}</span>
                      </div>
                      <div className="flex justify-between items-center text-[9px] text-outline font-bold">
                        <span>Avg Attendance:</span>
                        <span className="text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded font-black">{org.reliability}%</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedProfileUser({
                          name: org.name,
                          avatar: org.avatar,
                          verificationStatus: 'Trusted Organizer',
                          bio: org.bio,
                          location: 'Downtown Hubs Area'
                        })}
                        className="w-full mt-3.5 py-1.5 bg-neutral-50 hover:bg-neutral-100 border text-[9.5px] font-black uppercase text-outline rounded-lg active:scale-95 transition-all text-center select-none cursor-pointer"
                      >
                        View Shield Profile
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            eventItems.length === 0 ? (
              <div className="p-8 text-center bg-neutral-50 rounded-2xl border border-dashed text-outline select-none py-12">
                <p className="text-xs font-semibold">No local gatherings align with your filter selections.</p>
                <p className="text-[10px] mt-1 text-outline-variant">Adjust your topics or keywords check to explore broader options.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {eventItems.map((evt) => (
                  <div key={evt.id} className="flex">
                    {renderEventCard(evt, 'fullscreen-grid', false)}
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="pb-16 text-left">
      {isSearchOverlayOpen ? (
        <div id="dedicated-search-overlay" className="space-y-3 animate-in duration-155 fade-in slide-in-from-bottom-2 text-left">
          
          {/* Integrated Proximity & Advanced Filters Bar */}
          <div className="bg-white rounded-2xl p-3 border border-outline-variant/15 shadow-3xs flex flex-wrap items-center justify-between gap-2 select-none">
            {/* Left side: Range information indicator */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 text-secondary animate-bounce" />
              </div>
              <div className="flex flex-col">
                <span className="text-[9.5px] font-extrabold uppercase text-secondary tracking-widest">PROXIMITY</span>
                <span className="text-xs font-black text-on-surface-variant">
                  {selectedRadius === 'Custom' ? `${customRadiusValue} km (Custom)` : `${selectedRadius} km`}
                </span>
              </div>
            </div>

            {/* Right side: Compact interactive buttons */}
            <div className="flex items-center gap-1.5 ml-auto">
              {/* Adjust Radius Button */}
              <button
                type="button"
                onClick={() => {
                  setIsSearchChangingRadius(!isSearchChangingRadius);
                  setShowAdvancedSearch(false); // keep it solitary & clean
                }}
                className={`px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all ${
                  isSearchChangingRadius 
                    ? 'bg-[#2c3e50] border-[#2c3e50] text-white font-extrabold' 
                    : 'bg-neutral-50 hover:bg-neutral-100 border-outline-variant/20 text-outline font-black'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>{isSearchChangingRadius ? 'CLOSE' : 'ADJUST RADIUS'}</span>
              </button>

              {/* Filters Button */}
              <button
                type="button"
                onClick={() => {
                  setShowAdvancedSearch(!showAdvancedSearch);
                  setIsSearchChangingRadius(false); // keep it solitary & clean
                }}
                className={`px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all ${
                  showAdvancedSearch 
                    ? 'bg-primary border-primary text-white font-extrabold' 
                    : 'bg-neutral-50 hover:bg-neutral-100 border-outline-variant/20 text-outline font-black'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>FILTERS</span>
                {hasAnyActiveFilter() && (
                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                )}
                <span className="text-[9px] opacity-75">{showAdvancedSearch ? '▲' : '▼'}</span>
              </button>

              {/* Clear button */}
              {(hasAnyActiveFilter() || selectedRadius !== 25) && (
                <button
                  type="button"
                  onClick={() => {
                    handleResetFilters();
                    setSelectedRadius(25);
                    setIsSearchChangingRadius(false);
                    setShowAdvancedSearch(false);
                  }}
                  className="px-2 py-1 text-[10px] font-extrabold text-rose-600 hover:text-rose-700 cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Inline Proximity Slider */}
          {isSearchChangingRadius && (
            <div className="bg-neutral-50/65 rounded-2xl p-4 border border-outline-variant/15 space-y-3 animate-in fade-in duration-155">
              <div className="flex justify-between items-center select-none">
                <span className="text-[9.5px] uppercase font-black text-outline tracking-wider">SELECT PROXIMITY RANGE</span>
                <button 
                  onClick={() => setIsSearchChangingRadius(false)}
                  className="text-[9.5px] font-black text-rose-600 hover:text-rose-700 cursor-pointer uppercase tracking-wider"
                >
                  CLOSE
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {([5, 10, 25, 50, 100] as const).map((r) => {
                  const isSelected = selectedRadius === r;
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setSelectedRadius(r)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${isSelected ? 'bg-primary border-primary text-white font-extrabold' : 'bg-white border-outline-variant/25 text-on-surface-variant hover:bg-neutral-100/50'}`}
                    >
                      {r} km
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => setSelectedRadius('Custom')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${selectedRadius === 'Custom' ? 'bg-primary border-primary text-white font-extrabold' : 'bg-white border-outline-variant/25 text-on-surface-variant hover:bg-neutral-100/50'}`}
                >
                  Custom Range
                </button>
              </div>

              {selectedRadius === 'Custom' && (
                <div className="pt-2">
                  <div className="flex justify-between items-center text-xs text-outline font-bold mb-1">
                    <span>Radius limit</span>
                    <span className="text-secondary font-black">{customRadiusValue} km</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="150" 
                    value={customRadiusValue} 
                    onChange={(e) => setCustomRadiusValue(Number(e.target.value))}
                    className="w-full h-1 bg-outline-variant rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>
              )}
            </div>
          )}

          {/* Inline Advanced Filters Block */}
          {showAdvancedSearch && (
            <div className="bg-surface-container-low border border-outline-variant/15 p-3 rounded-2xl space-y-3.5 pt-2 text-left animate-in duration-200 fade-in">
                {/* Location filters */}
                <div>
                  <h4 className="text-[9px] uppercase font-black tracking-wider text-outline mb-1.5">📍 Location Filters</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[8px] font-bold text-outline mb-0.5 uppercase tracking-wider">Country</label>
                      <input 
                        type="text" 
                        placeholder="e.g. USA" 
                        value={draftCountry || ''} 
                        onChange={(e) => setDraftCountry(e.target.value)} 
                        className="w-full h-8 px-2 bg-neutral-50 border border-outline-variant/20 rounded-lg text-[10px] text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] font-bold text-outline mb-0.5 uppercase tracking-wider">State</label>
                      <input 
                        type="text" 
                        placeholder="e.g. NY" 
                        value={draftState || ''} 
                        onChange={(e) => setDraftState(e.target.value)} 
                        className="w-full h-8 px-2 bg-neutral-50 border border-outline-variant/20 rounded-lg text-[10px] text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] font-bold text-outline mb-0.5 uppercase tracking-wider">City</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Eastside" 
                        value={draftCity || ''} 
                        onChange={(e) => setDraftCity(e.target.value)} 
                        className="w-full h-8 px-2 bg-neutral-50 border border-outline-variant/20 rounded-lg text-[10px] text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Date filters */}
                <div>
                  <h4 className="text-[9px] uppercase font-black tracking-wider text-outline mb-1.5">📅 Date Filters</h4>
                  <div className="flex flex-wrap gap-1 mb-1.5">
                    {(['All', 'Today', 'This Week', 'This Month', 'Custom'] as const).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setDraftDateMode(mode)}
                        className={`px-2 py-0.5 rounded-lg text-[9.5px] font-bold border transition-all cursor-pointer ${draftDateMode === mode ? 'bg-primary border-primary text-white font-extrabold shadow-xs animate-none' : 'bg-neutral-50 border-outline-variant/25 text-on-surface-variant hover:bg-neutral-100'}`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>

                  {draftDateMode === 'Custom' && (
                    <div className="grid grid-cols-2 gap-2 p-2 bg-neutral-50 rounded-lg border border-outline-variant/20">
                      <div>
                        <label className="block text-[8px] font-bold text-outline mb-0.5 uppercase">Start Date</label>
                        <input 
                          type="date" 
                          value={draftCustomStart || ''}
                          onChange={(e) => setDraftCustomStart(e.target.value)}
                          className="w-full h-7 px-1.5 bg-white border border-outline-variant/30 rounded text-[9.5px] text-on-surface focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[8px] font-bold text-outline mb-0.5 uppercase">End Date</label>
                        <input 
                          type="date" 
                          value={draftCustomEnd || ''}
                          onChange={(e) => setDraftCustomEnd(e.target.value)}
                          className="w-full h-7 px-1.5 bg-white border border-outline-variant/30 rounded text-[9.5px] text-on-surface focus:outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Category Filters */}
                <div>
                  <h4 className="text-[9px] uppercase font-black tracking-wider text-outline mb-1.5">🏷️ Category Filters</h4>
                  <div className="flex flex-wrap gap-1 bg-neutral-100/50 rounded-xl p-2 border border-outline-variant/10">
                    {advancedCategoriesList.map((cat) => {
                      const isSelected = draftCategories.includes(cat);
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => toggleDraftCategory(cat)}
                          className={`px-2 py-0.5 rounded-full text-[9px] font-semibold border transition-all cursor-pointer ${isSelected ? 'bg-secondary border-secondary text-white font-bold shadow-xs animate-none' : 'bg-white border-outline-variant/25 text-on-surface-variant hover:bg-neutral-100'}`}
                        >
                          {cat}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Filters toggle group */}
                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div>
                    <h4 className="text-[9px] uppercase font-black tracking-wider text-outline mb-1 border-b border-outline-variant/5 pb-0.5">🛡️ Verified Organizers</h4>
                    <label className="flex items-center gap-1.5 cursor-pointer py-1 select-none">
                      <input 
                        type="checkbox" 
                        checked={draftVerifiedOnly || false} 
                        onChange={(e) => setDraftVerifiedOnly(e.target.checked)} 
                        className="w-3.5 h-3.5 rounded border-outline-variant/35 text-primary focus:ring-primary cursor-pointer"
                      />
                      <span className="text-[10px] font-semibold text-on-surface">Verified Organizers Only</span>
                    </label>
                  </div>

                  <div>
                    <h4 className="text-[9px] uppercase font-black tracking-wider text-outline mb-1 border-b border-outline-variant/5 pb-0.5">🔑 Event Type</h4>
                    <div className="flex flex-wrap gap-1">
                      {(['All', 'Open', 'Approval Required', 'Invite Only'] as const).map((mode) => {
                        const isSelected = draftAccessFilter === mode;
                        return (
                          <button
                            key={mode}
                            type="button"
                            onClick={() => setDraftAccessFilter(mode)}
                            className={`px-1.5 py-0.5 rounded text-[8.5px] font-semibold border transition-all cursor-pointer animate-none ${isSelected ? 'bg-primary border-primary text-white font-bold' : 'bg-neutral-50 border-outline-variant/25 text-on-surface-variant hover:bg-neutral-100'}`}
                          >
                            {mode}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Apply Draft Action bar */}
                <div className="flex justify-end gap-2 pt-2 border-t border-outline-variant/10">
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="px-2.5 py-1 text-[10px] font-bold text-outline rounded hover:bg-neutral-100 cursor-pointer"
                  >
                    Reset Settings
                  </button>
                  <button
                    type="button"
                    onClick={handleApplyFilters}
                    className="px-4 py-1 bg-primary text-on-primary text-[10px] font-extrabold rounded hover:bg-primary-hover active:scale-95 transition-all cursor-pointer"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            )}

          {/* Dynamic Multi-Sector Result Streams */}
          <div className="space-y-4 pt-1">
            {/* Match events stream list */}
            <div>
              <h3 className="text-[10px] font-extrabold uppercase text-outline tracking-wider flex items-center gap-1.5 mb-2 select-none">
                📅 Matching Neighborhood Events ({filteredEvents.length})
              </h3>
              
              {filteredEvents.length === 0 ? (
                <p className="text-xs text-center text-outline-variant py-8 bg-surface-container-low rounded-2xl border border-dashed border-outline-variant/20 italic select-none">
                  No matching events found under active conditions.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {filteredEvents.map((evt) => (
                    <div 
                      key={evt.id}
                      onClick={() => {
                        setSelectedEvent(evt);
                        setActiveExpTab('overview');
                        onCloseSearchOverlay?.(); // Close search to open event modal
                      }}
                      className="flex gap-2.5 bg-white hover:bg-neutral-50 border border-outline-variant/15 p-2 rounded-2xl cursor-pointer transition-all hover:shadow-2xs group text-left animate-in duration-150 fade-in"
                    >
                      <img src={evt.image || undefined} alt={evt.title} className="w-16 h-16 rounded-xl object-cover border shrink-0" />
                      <div className="min-w-0 flex-grow flex flex-col justify-between py-0.5">
                        <div>
                          <h4 className="text-xs font-black text-on-surface truncate group-hover:text-primary transition-colors leading-tight">{evt.title}</h4>
                          <p className="text-[9.5px] text-outline truncate mt-0.5">📍 {evt.location}</p>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[9.5px] text-primary font-bold">{evt.date}</span>
                          <span className="text-[8px] uppercase bg-primary/10 text-primary font-bold px-1.5 py-0.5 rounded">
                            {evt.category}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Match ToGather Communities/Hubs */}
            {(() => {
              const query = searchQuery.trim().toLowerCase();
              const matchingHubs = hubs.filter(hub => {
                if (!query || !hub) return false; // Show match only if searched query present
                return (
                  String(hub.name || '').toLowerCase().includes(query) ||
                  String(hub.category || '').toLowerCase().includes(query) ||
                  String(hub.tag || '').toLowerCase().includes(query)
                );
              });

              if (matchingHubs.length === 0 && !query) return null;

              return (
                <div className="border-t border-outline-variant/10 pt-3">
                  <h3 className="text-[10px] font-extrabold uppercase text-outline tracking-wider flex items-center gap-1.5 mb-2 select-none">
                    👥 Matching Communities ({matchingHubs.length})
                  </h3>

                  {matchingHubs.length === 0 ? (
                    <p className="text-xs text-center text-outline-variant py-6 bg-surface-container-low rounded-2xl border border-dashed border-outline-variant/20 italic text-left select-none">
                      Type keywords to search neighbor communities...
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {matchingHubs.map((hub) => (
                        <div 
                          key={hub.id}
                          className="flex gap-3 bg-white hover:bg-neutral-50 border border-outline-variant/15 p-2 rounded-2xl transition-all text-left animate-in duration-150 fade-in"
                        >
                          <img src={hub.image || undefined} alt={hub.name} className="w-12 h-12 rounded-xl object-cover border shrink-0" />
                          <div className="min-w-0 flex-grow flex flex-col justify-between py-0.5">
                            <div>
                              <h4 className="text-xs font-black text-on-surface truncate leading-tight">{hub.name}</h4>
                              <p className="text-[9px] text-outline mt-0.5 truncate">{hub.members} members • {hub.activeMembers} active</p>
                            </div>
                            <div className="flex justify-between items-center mt-1">
                              <span className="text-[8px] uppercase bg-secondary/10 text-secondary font-bold px-1.5 py-0.5 rounded">
                                {hub.category}
                              </span>
                              <button
                                type="button"
                                onClick={() => onToggleJoinHub?.(hub.id)}
                                className={`px-2 py-0.5 rounded-lg text-[8.5px] font-bold transition-all cursor-pointer animate-none ${
                                  hub.isJoined 
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                    : 'bg-primary text-on-primary hover:bg-primary/95 shadow-2xs'
                                }`}
                              >
                                {hub.isJoined ? '✓ Joined' : 'Join'}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      ) : selectedEvent ? (
        /* ==================== EXPANDED COMPREHENSIVE EVENT DETAIL MODAL-VIEW ==================== */
        <div className="bg-surface rounded-3xl border border-outline-variant/20 overflow-hidden shadow-lg animate-in fade-in zoom-in-95 duration-200">
          
          {/* Header Banner image and Close keys */}
          <div className="h-52 relative bg-neutral-100">
            <img src={selectedEvent.image || null} alt={selectedEvent.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
            
            <button 
              onClick={closeEventDetail}
              className="absolute top-4 left-4 p-2 bg-black/40 text-white hover:bg-black/60 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <button 
              onClick={() => setShowReportModal(selectedEvent.id)}
              className="absolute top-4 right-4 px-3 py-1 bg-red-600/90 text-white rounded-full text-[10px] font-bold cursor-pointer hover:bg-red-700 transition-colors flex items-center gap-1"
            >
              <AlertTriangle className="w-3.5 h-3.5" /> Flag Event
            </button>

            <div className="absolute bottom-4 left-4 pr-4 text-white">
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-primary px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider">{selectedEvent.category}</span>
                <span className="text-[10px] text-primary-container font-semibold bg-white/15 px-2 py-0.5 rounded-full">Access: {selectedEvent.accessMode}</span>
              </div>
              <h3 className="text-xl font-bold tracking-tight">{selectedEvent.title}</h3>
              <p className="text-xs opacity-90 mt-0.5 flex items-center gap-1"><MapPin className="w-3 h-3" /> {selectedEvent.location}</p>
            </div>
          </div>

          {/* Trust and Organizer Banner */}
          <div className="bg-surface-container-low p-4 border-b border-outline-variant/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={selectedEvent.organizerAvatar || undefined} alt={selectedEvent.organizerName} className="w-10 h-10 rounded-full object-cover border border-outline-variant/15" />
              <div>
                <p className="text-xs font-bold text-on-surface flex items-center gap-1">
                  Hosted by {selectedEvent.organizerName}
                  {selectedEvent.organizerVerification === 'Trusted Organizer' && (
                    <span className="text-secondary text-[11px]" title="🛡 Trusted Organizer Badge">🛡 Trusted Organizer</span>
                  )}
                  {selectedEvent.organizerVerification === 'Identity Verified' && (
                    <span className="text-primary text-[11px]" title="✓ Identity Verified Student/Citizen">✓ Identity Verified</span>
                  )}
                </p>
                <p className="text-[10px] text-outline mt-0.5">
                  Conducted {selectedEvent.organizerPastEvents} past events • {selectedEvent.isVerifiedConduct ? '✓ Conducting Verified Events' : 'Awaiting Review'}
                </p>
              </div>
            </div>

            {selectedEvent.isVerifiedConduct && (
              <div className="bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-lg px-2.5 py-1 text-right">
                <p className="text-[9px] font-extrabold flex items-center gap-1 text-emerald-700 justify-end">✓ Verified Event Conducted</p>
                <p className="text-[8px] text-emerald-600 mt-0.2">Evidence reviewed &amp; approved</p>
              </div>
            )}
          </div>

          {/* Experience Level Tabs */}
          {(() => {
            const hasDiscussions = selectedEvent.discussionsEnabled !== false;
            
            // Only show the tab header if the active tab is overview or discussion.
            // If the active view is a feature page (e.g. participants, checkin, etc.), we show a Back Button inside that view.
            if (activeExpTab !== 'overview' && activeExpTab !== 'discussion') {
              return null;
            }

            // If discussions are disabled, only Overview is available, so no tab bar header is needed.
            if (!hasDiscussions) {
              return null;
            }

            const liveTabs = [
              { id: 'overview', label: '1. Overview' },
              { id: 'discussion', label: '2. Discussions' }
            ];

            return (
              <div className="border-b border-outline-variant/10 flex text-xs font-semibold shrink-0">
                {liveTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveExpTab(tab.id as any)}
                    className={`flex-1 text-center py-3.5 border-b-2 text-[11px] font-bold tracking-tight transition-all cursor-pointer ${
                      activeExpTab === tab.id 
                        ? 'border-primary text-primary font-extrabold' 
                        : 'border-transparent text-outline hover:text-on-surface-variant'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            );
          })()}

          {/* Tab Experience Content */}
          <div className="p-5 min-h-[300px]">
            
            {activeExpTab === 'overview' && (
              <div className="space-y-6 text-xs text-on-surface text-left animate-in duration-300 fade-in">
                {/* Details & Purpose */}
                <div>
                  <h4 className="text-xs font-bold text-outline uppercase tracking-wider mb-2">Details & Purpose</h4>
                  <p className="text-xs text-on-surface leading-normal bg-surface-container-low p-4 rounded-2xl border border-outline-variant/10 whitespace-pre-wrap">{selectedEvent.description || 'Join local community forces around this safe environmental volunteer cleanup and education gathering.'}</p>
                </div>

                {/* Key Attributes Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="bg-surface-container-low p-3.5 rounded-2xl border border-outline-variant/10">
                    <p className="text-[9px] uppercase font-bold text-outline tracking-wider flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-primary" /> Date & Time</p>
                    <p className="text-xs font-black text-on-surface mt-1.5">{selectedEvent.date}</p>
                    <p className="text-[10px] text-on-surface-variant mt-0.5 font-medium">{selectedEvent.time || '9:00 AM onwards'}</p>
                  </div>

                  <div className="bg-surface-container-low p-3.5 rounded-2xl border border-outline-variant/10">
                    <p className="text-[9px] uppercase font-bold text-outline tracking-wider flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-primary" /> Location</p>
                    <p className="text-xs font-black text-on-surface mt-1.5 line-clamp-2">{selectedEvent.location}</p>
                  </div>

                  <div className="bg-surface-container-low p-3.5 rounded-2xl border border-outline-variant/10">
                    <p className="text-[9px] uppercase font-bold text-outline tracking-wider flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-primary" /> Access & Spots</p>
                    <p className="text-xs font-black text-on-surface mt-1.5">{selectedEvent.accessMode}</p>
                    <p className="text-[10px] text-on-surface-variant mt-0.5 font-medium">Capacity: {selectedEvent.capacity} spots available</p>
                  </div>
                </div>

                {/* Safety & Logistics Box */}
                <div className="space-y-3">
                  <div className="p-4 bg-red-50/50 border border-red-100/50 rounded-2xl flex gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-red-900 uppercase tracking-wide">Safety & Conduct Protocols</p>
                      <p className="text-[11px] text-red-800 mt-1.5 leading-relaxed font-medium">{selectedEvent.safetyNotes || 'Follow instructions. Wear protective footwear and stay with team leaders.'}</p>
                    </div>
                  </div>

                  <div className="p-4 bg-primary-container/10 border border-primary-container/35 rounded-2xl flex gap-3 text-left">
                    <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div className="space-y-1.5">
                      <p className="text-xs font-bold text-primary uppercase tracking-wide">Required Logistics & Bringables</p>
                      <p className="text-[11px] text-on-surface-variant leading-relaxed font-medium"><span className="font-extrabold text-on-surface">Materials Supplied:</span> {selectedEvent.materialsRequired || 'Trashpicker bags, guidelines, basic logistics.'}</p>
                      <p className="text-[11px] text-on-surface-variant leading-relaxed font-medium"><span className="font-extrabold text-on-surface">What to Bring:</span> {selectedEvent.whatToBring || 'Water container, protective boots, high attitude.'}</p>
                    </div>
                  </div>
                </div>

                {/* Host Info */}
                <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/10 text-left">
                  <h4 className="text-xs font-bold text-outline uppercase tracking-wider mb-3">Host Information</h4>
                  <div className="flex items-center gap-3">
                    <img src={selectedEvent.organizerAvatar || undefined} alt={selectedEvent.organizerName} className="w-10 h-10 rounded-full object-cover border border-outline-variant/15" />
                    <div>
                      <p className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                        {selectedEvent.organizerName}
                        {selectedEvent.organizerVerification === 'Trusted Organizer' && (
                          <span className="text-secondary text-[10px] font-extrabold bg-secondary/10 px-2 py-0.5 rounded-full" title="🛡 Trusted Organizer Badge">🛡 Host Organizer</span>
                        )}
                        {selectedEvent.organizerVerification === 'Identity Verified' && (
                          <span className="text-primary text-[10px] font-extrabold bg-primary/10 px-2 py-0.5 rounded-full" title="✓ Identity Verified Student/Citizen">✓ Verified Host</span>
                        )}
                      </p>
                      <p className="text-[10px] text-outline mt-0.5">
                        Conducted {selectedEvent.organizerPastEvents} past events • {selectedEvent.isVerifiedConduct ? '✓ Conducting Verified Events' : 'Awaiting Review'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Feature Grid Segment */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-outline uppercase tracking-wider">Event Coordination Dashboard</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {/* Row 1, Card 1: Attendees */}
                    <button
                      type="button"
                      onClick={() => setActiveExpTab('participants')}
                      className="bg-surface-container-low hover:bg-surface-container-high border border-outline-variant/10 p-3.5 rounded-2xl text-left flex flex-col justify-between h-[110px] transition-all hover:scale-[1.02] cursor-pointer"
                    >
                      <div className="p-1.5 bg-primary/10 text-primary rounded-xl w-fit">
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-on-surface">Attendees</p>
                        <p className="text-[9px] text-outline mt-0.5">{selectedEvent.attendees.length} joined</p>
                      </div>
                    </button>

                    {/* Row 1, Card 2: Gallery */}
                    <button
                      type="button"
                      onClick={() => setActiveExpTab('photos')}
                      className="bg-surface-container-low hover:bg-surface-container-high border border-outline-variant/10 p-3.5 rounded-2xl text-left flex flex-col justify-between h-[110px] transition-all hover:scale-[1.02] cursor-pointer"
                    >
                      <div className="p-1.5 bg-purple-50 text-purple-700 rounded-xl w-fit">
                        <Camera className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-on-surface">Gallery</p>
                        <p className="text-[9px] text-outline mt-0.5">{selectedEvent.photos?.length || 0} files</p>
                      </div>
                    </button>

                    {/* Row 1, Card 3: Check-In */}
                    <button
                      type="button"
                      onClick={() => setActiveExpTab('checkin')}
                      className="bg-surface-container-low hover:bg-surface-container-high border border-outline-variant/10 p-3.5 rounded-2xl text-left flex flex-col justify-between h-[110px] transition-all hover:scale-[1.02] cursor-pointer"
                    >
                      <div className="p-1.5 bg-emerald-50 text-emerald-700 rounded-xl w-fit">
                        <QrCode className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-on-surface">Check-In</p>
                        <p className="text-[9px] text-outline mt-0.5">
                          {selectedEvent.isStarted ? '⚡ Live Now' : 'Pending'}
                        </p>
                      </div>
                    </button>

                    {/* Row 2, Card 1: Event Statistics */}
                    <button
                      type="button"
                      onClick={() => setActiveExpTab('impact')}
                      className="bg-surface-container-low hover:bg-surface-container-high border border-outline-variant/10 p-3.5 rounded-2xl text-left flex flex-col justify-between h-[110px] transition-all hover:scale-[1.02] cursor-pointer"
                    >
                      <div className="p-1.5 bg-blue-50 text-blue-700 rounded-xl w-fit">
                        <Sliders className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-on-surface">Statistics</p>
                        <p className="text-[9px] text-outline mt-0.5">Metrics</p>
                      </div>
                    </button>

                    {/* Row 2, Card 2: Location */}
                    <button
                      type="button"
                      onClick={() => setActiveExpTab('location')}
                      className="bg-surface-container-low hover:bg-surface-container-high border border-outline-variant/10 p-3.5 rounded-2xl text-left flex flex-col justify-between h-[110px] transition-all hover:scale-[1.02] cursor-pointer"
                    >
                      <div className="p-1.5 bg-amber-50 text-amber-700 rounded-xl w-fit">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-on-surface">Location</p>
                        <p className="text-[9px] text-outline mt-0.5 truncate">{selectedEvent.location.split(',')[0] || 'Venue'}</p>
                      </div>
                    </button>

                    {/* Row 2, Card 3: Moderators */}
                    <button
                      type="button"
                      onClick={() => setActiveExpTab('moderators_view')}
                      className="bg-surface-container-low hover:bg-surface-container-high border border-outline-variant/10 p-3.5 rounded-2xl text-left flex flex-col justify-between h-[110px] transition-all hover:scale-[1.02] cursor-pointer"
                    >
                      <div className="p-1.5 bg-rose-50 text-rose-700 rounded-xl w-fit">
                        <Shield className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-on-surface">Moderators</p>
                        <p className="text-[9px] text-outline mt-0.5">{(selectedEvent.moderators?.length || 0)} active</p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Host Administration Center for Organizers / Moderators */}
                {(() => {
                  const isOrganizer = selectedEvent.organizerName === profileName;
                  const isModerator = selectedEvent.moderators?.some(m => m.name === profileName);
                  const isModOrOrganizer = isOrganizer || isModerator;
                  
                  if (!isModOrOrganizer) return null;

                  return (
                    <div className="p-4 bg-primary-container/10 border border-primary-container/20 rounded-2xl space-y-2 text-left">
                      <p className="text-[10px] font-black text-primary uppercase tracking-wider flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5" /> Host Administration Center
                      </p>
                      <p className="text-[10px] text-outline font-semibold">
                        You have host/moderator access privileges for managing this community gathering.
                      </p>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <button
                          onClick={() => setActiveExpTab('moderation')}
                          className="py-2.5 bg-primary text-on-primary rounded-xl text-[10px] font-bold text-center cursor-pointer hover:bg-primary-hover shadow-xs"
                        >
                          🛡️ Open Moderation Panel
                        </button>
                        <button
                          onClick={() => setActiveExpTab('recap')}
                          className="py-2.5 bg-secondary text-on-secondary rounded-xl text-[10px] font-bold text-center cursor-pointer hover:bg-secondary-hover shadow-xs"
                        >
                          📝 Compile Post-Event Recap
                        </button>
                      </div>
                    </div>
                  );
                })()}

                {/* Event Updates section */}
                <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/10 text-left space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b">
                    <h4 className="text-xs font-bold text-outline uppercase tracking-wider flex items-center gap-1.5">📢 Event Updates</h4>
                    <span className="text-[8.5px] text-outline-variant bg-surface px-2 py-0.5 rounded-full uppercase font-bold">Chronological • Newest First</span>
                  </div>

                  {/* Submit Update trigger for Host and Authorized Moderators */}
                  {(() => {
                    const isOrganizer = selectedEvent.organizerName === profileName;
                    const isModerator = selectedEvent.moderators?.some(m => m.name === profileName);
                    const modRecord = selectedEvent.moderators?.find(m => m.name === profileName);
                    const canAnnounce = isOrganizer || (isModerator && modRecord?.permissions.publishAnnouncements);

                    if (canAnnounce) {
                      return (
                        <div className="bg-white p-3.5 border rounded-2xl space-y-2.5">
                          <p className="text-[10px] uppercase font-black text-outline">Publish a New official Event Update</p>
                          <div className="flex gap-2 text-xs">
                            <input
                              id="overview-new-announcement"
                              type="text"
                              placeholder="e.g. Schedule shift, venue adjustment, check-in tips..."
                              className="flex-grow border rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-primary bg-white text-on-surface text-xs"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  const textVal = (e.currentTarget as HTMLInputElement).value;
                                  if (textVal.trim()) {
                                    onAddEventMessage?.(selectedEvent.id, 'announcements', textVal);
                                    e.currentTarget.value = '';
                                    alert('Official Event Update published inside Overview!');
                                    // Force state reload
                                    setTimeout(() => {
                                      const updated = events.find(ev => ev.id === selectedEvent.id);
                                      if (updated) setSelectedEvent(updated);
                                    }, 50);
                                  }
                                }
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const inputEl = document.getElementById('overview-new-announcement') as HTMLInputElement;
                                const textVal = inputEl?.value?.trim();
                                if (textVal) {
                                  onAddEventMessage?.(selectedEvent.id, 'announcements', textVal);
                                  if (inputEl) inputEl.value = '';
                                  alert('Official Event Update published inside Overview!');
                                  // Force state reload
                                  setTimeout(() => {
                                    const updated = events.find(ev => ev.id === selectedEvent.id);
                                    if (updated) setSelectedEvent(updated);
                                  }, 50);
                                } else {
                                  alert('Update content cannot be empty.');
                                }
                              }}
                              className="bg-primary text-on-primary text-[10.5px] font-black uppercase px-4 py-2.5 rounded-xl shrink-0 cursor-pointer hover:bg-primary-hover active:scale-95 transition-all"
                            >
                              Publish
                            </button>
                          </div>
                          <p className="text-[8.5px] text-outline italic">Updates are broadcast directly to all participants instantly inside the Overview page.</p>
                        </div>
                      );
                    }
                    return null;
                  })()}

                  {/* Chronic updates listing */}
                  <div className="space-y-3">
                    {selectedEvent.announcements && selectedEvent.announcements.length > 0 ? (
                      [...selectedEvent.announcements].reverse().map((ann) => (
                        <div key={ann.id} className="p-3.5 bg-white hover:bg-slate-50 border border-outline-variant/10 rounded-2xl space-y-2 transition-all">
                          <div className="flex items-center gap-1.5 justify-between">
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-[10px] font-bold text-on-surface">{ann.senderName}</span>
                              <span className="text-[7.5px] font-black bg-primary/15 text-primary tracking-wider px-1.5 rounded uppercase">
                                {selectedEvent.organizerName === ann.senderName ? 'Host' : 'Moderator / Team'}
                              </span>
                            </div>
                            <span className="text-[8.5px] text-outline font-medium">{ann.timestamp || 'Just now'}</span>
                          </div>
                          <p className="text-xs text-on-surface-variant font-medium leading-relaxed whitespace-pre-wrap">{ann.content}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-[10px] text-outline text-center py-4 italic">No Event Updates posted yet. If you are the Host or an authorized Moderator, use the launcher above to dispatch logistics alerts.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeExpTab === 'discussion' && (
              <div className="space-y-4">
                {(() => {
                  const isOrganizer = selectedEvent.organizerName === profileName;
                  const isModerator = selectedEvent.moderators?.some(m => m.name === profileName);
                  const isModOrOrganizer = isOrganizer || isModerator;

                  const chatState = getChatAccessStatus(selectedEvent, profileName || '');
                  const isMuted = selectedEvent.mutedParticipants?.includes(profileName || '');
                  const isAnnouncementMode = (selectedEvent.communicationMode || 'Discussion') === 'Announcement';
                  
                  const modRecord = selectedEvent.moderators?.find(m => m.name === profileName);
                  const canModerateChat = isOrganizer || (isModerator && modRecord?.permissions.moderateChat);

                  if (!chatState.hasAccess) {
                    return (
                      <div className="p-6 text-center bg-surface-container-low rounded-2xl border border-dashed border-outline-variant/15 select-none">
                        <Shield className="w-8 h-8 text-outline/65 mx-auto mb-2.5" />
                        <h5 className="text-xs font-black text-on-surface uppercase tracking-wider">Event Discussions Restricted</h5>
                        <p className="text-[11px] text-outline mt-1.5 mb-3.5 leading-relaxed max-w-xs mx-auto">
                          {chatState.reason === 'Pending Approval' && "🕒 Awaiting Host Approval. Your RSVP is pending verification by the host. Event discussions access is automatically granted once approved."}
                          {chatState.reason === 'Not Invited/Awaiting Invitation' && "🔒 Invite-Only Discussions. This event sector is restricted to confirmed invitees. Request an invitation or wait for organizer dispatch."}
                          {chatState.reason === 'Removed' && "⚠️ Discussions Status Suspended. You have been removed from this event's discussions space by an Event Moderator."}
                          {chatState.reason === 'Not Joined' && "Join this event community space to access the Discussions and coordinate outcomes."}
                        </p>
                        {chatState.reason === 'Not Joined' && (
                          <button 
                            onClick={() => executeRSVPToggle(selectedEvent, 'Confirmed')}
                            className="px-4 py-2 bg-primary text-on-primary text-[10.5px] font-extrabold rounded-xl cursor-pointer hover:bg-primary/95 transition-all active:scale-95 shadow-sm"
                          >
                            RSVP to Unlock Discussions
                          </button>
                        )}
                      </div>
                    );
                  }

                  const activeChannelMessages = selectedEvent.discussion || [];
                  const pinnedMessages = activeChannelMessages.filter(msg => msg.pinned);
                  const standardMessages = activeChannelMessages.filter(msg => !msg.pinned);

                  return (
                    <div className="space-y-4 text-left">
                      {isAnnouncementMode && (
                        <div className="bg-amber-50 border border-amber-100 p-2.5 text-center rounded-xl text-[9px] font-black text-amber-800 uppercase flex items-center justify-center gap-1">
                          📢 Announcement-Only Mode Active. Only organizers and moderators are permitted to cast messages here.
                        </div>
                      )}

                      {/* Render Pinned Messages First if Any */}
                      {pinnedMessages.length > 0 && (
                        <div className="space-y-2.5">
                          <span className="text-[9px] uppercase font-bold text-outline tracking-wider block">📌 Pinned Messages</span>
                          {pinnedMessages.map((msg) => (
                            <div key={`pinned-${msg.id}`} className="flex gap-2.5 items-start p-3 bg-primary/5 border border-primary/20 rounded-2xl relative">
                              <img src={msg.senderAvatar || undefined} alt={msg.senderName} className="w-7 h-7 rounded-full object-cover shrink-0 border" />
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                  <span className="text-[10px] font-extrabold text-on-surface flex items-center gap-1.5">
                                    {msg.senderName}
                                    {selectedEvent.organizerName === msg.senderName && <span className="text-[7px] font-black bg-secondary/10 text-secondary px-1 rounded uppercase">Host</span>}
                                    {selectedEvent.moderators?.some(m => m.name === msg.senderName) && <span className="text-[7px] font-black bg-primary/10 text-primary px-1 rounded uppercase">Mod</span>}
                                  </span>
                                  <div className="flex gap-1.5 items-center">
                                    <span className="text-[8px] text-outline font-medium">{msg.timestamp}</span>
                                    {canModerateChat && (
                                      <button
                                        onClick={() => {
                                          const updatedDis = activeChannelMessages.map(m =>
                                            m.id === msg.id ? { ...m, pinned: false } : m
                                          );
                                          const updated: EventEntity = { ...selectedEvent, discussion: updatedDis };
                                          onUpdateEvent(updated);
                                          setSelectedEvent(updated);
                                        }}
                                        className="text-primary hover:underline text-[9px] font-bold"
                                      >
                                        Unpin
                                      </button>
                                    )}
                                  </div>
                                </div>
                                <p className="text-xs text-on-surface-variant mt-1.5 leading-normal">{msg.content}</p>
                                {msg.image && (
                                  <img src={msg.image || undefined} className="mt-2 rounded-xl max-h-40 object-cover border border-outline-variant/15" />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Render standard messages */}
                      <div className="space-y-3">
                        {pinnedMessages.length > 0 && standardMessages.length > 0 && (
                          <span className="text-[9px] uppercase font-bold text-outline tracking-wider block pt-2 border-t">💬 Recent Chats</span>
                        )}
                        
                        {activeChannelMessages.length === 0 ? (
                          <p className="text-xs text-center text-outline py-8 italic font-medium">No messages sent yet. Ask organizers or fellow neighbors a question!</p>
                        ) : (
                          standardMessages.map((msg) => (
                            <div key={msg.id} className="flex gap-2.5 items-start">
                              <img src={msg.senderAvatar || undefined} alt={msg.senderName} className="w-7 h-7 rounded-full object-cover shrink-0 border mt-0.5" />
                              <div className="bg-surface-container-low p-2.5 rounded-2xl flex-1 max-w-md relative text-left">
                                <div className="flex justify-between items-start">
                                  <span className="text-[10px] font-extrabold text-on-surface flex items-center gap-1.5">
                                    {msg.senderName}
                                    {selectedEvent.organizerName === msg.senderName && <span className="text-[7px] font-black bg-secondary/15 text-secondary px-1 rounded uppercase">Host</span>}
                                    {selectedEvent.moderators?.some(m => m.name === msg.senderName) && <span className="text-[7px] font-black bg-primary/15 text-primary px-1 rounded uppercase">Mod</span>}
                                  </span>
                                  <span className="text-[8px] text-outline font-medium">{msg.timestamp}</span>
                                </div>
                                <p className="text-xs text-on-surface-variant mt-1 leading-normal font-medium">{msg.content}</p>
                                {msg.image && (
                                  <img src={msg.image || undefined} className="mt-2 rounded-xl max-h-40 object-cover border border-outline-variant/15" />
                                )}

                                {/* Moderation action controls inline */}
                                {canModerateChat && (
                                  <div className="mt-2 pt-1.5 border-t border-dashed border-outline-variant/10 flex gap-2.5 items-center text-[9px] select-none">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const updatedDis = activeChannelMessages.map(m =>
                                          m.id === msg.id ? { ...m, pinned: true } : m
                                        );
                                        const updated: EventEntity = { ...selectedEvent, discussion: updatedDis };
                                        onUpdateEvent(updated);
                                        setSelectedEvent(updated);
                                        alert('Message pinned.');
                                      }}
                                      className="text-primary font-bold hover:underline"
                                    >
                                      📌 Pin to Top
                                    </button>
                                    <span className="text-outline/30">•</span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const updatedDis = activeChannelMessages.filter(m => m.id !== msg.id);
                                        const updated: EventEntity = { ...selectedEvent, discussion: updatedDis };
                                        onUpdateEvent(updated);
                                        setSelectedEvent(updated);
                                        alert('Message removed.');
                                      }}
                                      className="text-red-700 font-bold hover:underline"
                                    >
                                      🗑 Delete
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {activeExpTab === 'participants' && (
              <div className="space-y-4 text-left">
                {/* Back Button */}
                <div className="flex items-center gap-1.5 pb-4 border-b border-outline-variant/10 mb-2">
                  <button
                    onClick={() => setActiveExpTab('overview')}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-surface-container hover:bg-surface-high border border-outline-variant/20 rounded-xl text-xs font-bold text-primary transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back to Overview Hub
                  </button>
                </div>

                <h4 className="text-xs font-bold text-outline uppercase tracking-wider mb-2">Registered Attendees ({selectedEvent.attendees.length})</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedEvent.attendees.map((att, i) => (
                    <div 
                      key={i} 
                      onClick={() => {
                        const status = att.name === selectedEvent.organizerName ? selectedEvent.organizerVerification : 'Identity Verified';
                        setSelectedProfileUser({
                          name: att.name,
                          avatar: att.avatar,
                          verificationStatus: status,
                          bio: att.name === selectedEvent.organizerName 
                            ? selectedEvent.description 
                            : `${att.name} is a passionate ToGather community member engaged in local volunteer groups and neighborhood greening.`,
                          location: selectedEvent.location
                        });
                      }}
                      className="flex items-center gap-3 bg-surface-container-low hover:bg-surface-container-high transition-colors cursor-pointer p-2.5 rounded-xl border border-outline-variant/10 text-left"
                    >
                      <img src={att.avatar || undefined} alt={att.name} className="w-8 h-8 rounded-full object-cover border border-outline-variant/20 shrink-0" />
                      <div className="flex-grow min-w-0">
                        <p className="text-xs font-bold text-on-surface truncate hover:underline">{att.name}</p>
                        <p className="text-[9px] text-outline font-medium">{att.participationLevel || 'Confirmed'}</p>
                      </div>
                      <span className="text-[8px] bg-primary/10 text-primary font-bold px-1.5 py-0.5 rounded">APPROVED</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeExpTab === 'photos' && (
              <div className="space-y-4 text-left">
                {/* Back Button */}
                <div className="flex items-center gap-1.5 pb-4 border-b border-outline-variant/10 mb-2">
                  <button
                    onClick={() => setActiveExpTab('overview')}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-surface-container hover:bg-surface-high border border-outline-variant/20 rounded-xl text-xs font-bold text-primary transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back to Overview Hub
                  </button>
                </div>

                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-xs font-bold text-outline uppercase tracking-wider">Event gallery Presets ({selectedEvent.photos?.length || 0})</h4>
                  {(isOrganizer || isModerator) && (
                    <button 
                      onClick={handleAttachPhoto}
                      className="text-primary hover:underline text-[10px] font-bold flex items-center gap-1 cursor-pointer bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-xl border border-primary/20"
                    >
                      <Camera className="w-3.5 h-3.5" /> Upload Photo
                    </button>
                  )}
                </div>

                {selectedEvent.photos && selectedEvent.photos.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {selectedEvent.photos.map((ph, i) => (
                      <div key={i} className="aspect-square bg-neutral-100 rounded-xl overflow-hidden border border-outline-variant/20 relative group">
                        <img src={ph || undefined} alt="Sub" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-center text-outline py-8 font-medium">No photos uploaded to this log portfolio yet.</p>
                )}
              </div>
            )}

            {activeExpTab === 'checkin' && (
              <div className="space-y-5 text-left animate-in duration-300 fade-in">
                {/* Back Button */}
                <div className="flex items-center gap-1.5 pb-2 border-b border-outline-variant/10 mb-2">
                  <button
                    onClick={() => setActiveExpTab('overview')}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-surface-container hover:bg-surface-high border border-outline-variant/20 rounded-xl text-xs font-bold text-primary transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back to Overview Hub
                  </button>
                </div>
                {/* Role Toggle Selector */}
                <div className="bg-surface-container-low p-1.5 border border-outline-variant/20 rounded-2xl flex items-center justify-between max-w-sm mx-auto select-none">
                  <span className="text-[10px] font-bold uppercase text-outline pl-2">Testing Role:</span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => { setCustomRole('participant'); setScanResult(null); }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${activeRole === 'participant' ? 'bg-primary text-on-primary font-extrabold shadow-sm' : 'text-outline hover:bg-surface-container'}`}
                    >
                      Participant Scanned
                    </button>
                    <button
                      type="button"
                      onClick={() => { setCustomRole('organizer'); setScanResult(null); }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${activeRole === 'organizer' ? 'bg-primary text-on-primary font-extrabold shadow-sm' : 'text-outline hover:bg-surface-container'}`}
                    >
                      Organizer Host
                    </button>
                  </div>
                </div>

                {activeRole === 'organizer' ? (
                  /* ================================= ORGANIZER VIEW ================================= */
                  <div className="space-y-4">
                    {!selectedEvent.isStarted ? (
                      <div className="p-6 bg-surface-container-lowest text-center rounded-3xl border border-dashed border-outline-variant/30 max-w-md mx-auto">
                        <QrCode className="w-12 h-12 text-primary mx-auto mb-3 animate-pulse" />
                        <h4 className="text-sm font-bold text-on-surface">Start Verification Tracking Session</h4>
                        <p className="text-xs text-on-surface-variant leading-relaxed max-w-xs mx-auto mt-2">
                          Authorize dynamic security keys to let nearby participants check in within your specified physical boundaries.
                        </p>
                        
                        <div className="mt-4 p-3.5 bg-tertiary-container/30 border border-outline-variant/15 rounded-xl text-left text-xs mb-4">
                          <p className="font-bold text-primary flex items-center gap-1">🧭 Geo-boundary Proximity Info</p>
                          <p className="text-[10px] text-on-surface-variant leading-relaxed mt-1">
                            Participants must have GPS enabled and clear check validity rules. Default radius limit is set to 200 meters.
                          </p>
                        </div>

                        <button
                          onClick={handleStartEvent}
                          className="px-5 py-2.5 bg-primary text-on-primary text-xs font-bold rounded-xl flex items-center gap-1.5 mx-auto hover:bg-primary-hover active:scale-95 transition-all cursor-pointer"
                        >
                          <Clock className="w-4 h-4" /> Start Presence Check-In Session
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Status Grid bar */}
                        <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
                          <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-2xl">
                            <span className="text-[9px] font-bold text-emerald-800 uppercase tracking-widest block">Tracker Condition</span>
                            <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5 mt-0.5">
                              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-ping shrink-0" />
                              Active / Broadcasting
                            </span>
                          </div>
                          <div className="bg-primary-container/30 border border-outline-variant/10 p-3 rounded-2xl">
                            <span className="text-[9px] font-bold text-primary uppercase tracking-widest block">Allowed Boundary Limit</span>
                            <span className="text-xs font-extrabold text-on-primary-container block mt-0.5">
                              {selectedEvent.attendanceRadiusLimit || 200} meters radius
                            </span>
                          </div>
                        </div>

                        {/* Allowed proximity configurations */}
                        <div className="bg-white border border-outline-variant/25 p-4 rounded-3xl max-w-md mx-auto">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-outline block mb-1.5">
                            Configure Event Radius Boundaries
                          </label>
                          <div className="grid grid-cols-4 gap-1.5">
                            {[
                              { label: 'Indoor', radius: 50 },
                              { label: 'Hall', radius: 100 },
                              { label: 'Outdoor', radius: 200 },
                              { label: 'Large', radius: 300 }
                            ].map((preset) => (
                              <button
                                key={preset.radius}
                                onClick={() => handleChangeRadius(preset.radius)}
                                className={`py-1.5 text-center text-[10px] font-bold rounded-lg transition-all ${
                                  (selectedEvent.attendanceRadiusLimit || 200) === preset.radius
                                    ? 'bg-primary text-on-primary font-extrabold shadow-2xs'
                                    : 'bg-surface-container-low text-outline hover:bg-surface-container border border-outline-variant/20'
                                }`}
                              >
                                {preset.label} ({preset.radius}m)
                              </button>
                            ))}
                          </div>
                          <p className="text-[9px] text-outline mt-2 leading-relaxed">
                            Organizers are requested to align radius size with physical reality to protect Impact integrity.
                          </p>
                        </div>

                        {/* The dynamic QR display card */}
                        <div className="bg-slate-950 text-white rounded-3xl p-5 border border-slate-800 max-w-sm mx-auto text-center relative overflow-hidden shadow-md">
                          <p className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest flex items-center justify-center gap-1.5 mb-2 select-none">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            ToGather Anti-Fraud dynamic security key
                          </p>
                          
                          {/* Simulated QR block layout */}
                          <div className="w-40 h-40 mx-auto bg-white p-2.5 rounded-2xl flex items-center justify-center relative shadow-inner">
                            {/* Visual Compass grid matrix for realistic look */}
                            <div className="w-full h-full bg-neutral-100 rounded-lg p-2.5 flex flex-wrap justify-between items-center opacity-90 select-none">
                              {/* Corner matrices */}
                              <div className="w-10 h-10 border-[6px] border-slate-900 rounded bg-transparent m-1"></div>
                              <div className="w-4 h-4 bg-transparent"></div>
                              <div className="w-10 h-10 border-[6px] border-slate-900 rounded bg-transparent m-1"></div>
                              
                              <div className="w-full flex justify-center py-1">
                                <QrCode className="w-12 h-12 text-slate-800" />
                              </div>
                              
                              <div className="w-10 h-10 border-[6px] border-slate-900 rounded bg-transparent m-1"></div>
                              <div className="w-4 h-4 bg-transparent"></div>
                              {/* Bottom right tiny checksum square */}
                              <div className="w-4 h-4 bg-slate-900 m-1.5 rounded"></div>
                            </div>
                            
                            {/* scanning overlay line effect */}
                            <div className="absolute top-1 left-1 w-[95%] h-[4px] bg-primary animate-bounce opacity-80" />
                          </div>

                          <div className="mt-4 space-y-1">
                            <span className="text-xl font-mono font-extrabold tracking-widest text-emerald-300">
                              {getActiveToken(selectedEvent.id)}
                            </span>
                            <div className="flex justify-center items-center gap-1.5 text-[10.5px] text-slate-400 font-medium pt-1">
                              <span className="inline-flex items-center justify-center bg-slate-800 w-5 h-5 rounded-full text-[9px] text-emerald-300 font-extrabold">
                                {qrTimeLeft}
                              </span>
                              Dynamic token rotates in {qrTimeLeft} seconds
                            </div>
                          </div>

                          <p className="text-[9px] text-slate-400 mt-2 leading-relaxed px-4">
                            Prevents screenshot abuse and physical code forwarding. Keys are validated in real-time.
                          </p>
                        </div>

                        {/* Live Check-ins reported table */}
                        <div className="max-w-md mx-auto space-y-2">
                          <h5 className="text-xs font-extrabold uppercase tracking-wider text-outline flex justify-between items-center">
                            <span>Physically Checked-In ({eventCheckIns.length})</span>
                            <span className="text-[10px] text-primary">{eventCheckIns.filter(r => r.impactAwarded).length} Awarded</span>
                          </h5>
                          {eventCheckIns.length === 0 ? (
                            <div className="text-center p-6 bg-surface-container-lowest border border-outline-variant/20 rounded-2xl text-xs text-outline">
                              No participants checked in yet. Ask neighbors to scan the dynamically cycling QR coordinate keys.
                            </div>
                          ) : (
                            <div className="space-y-1.5">
                              {eventCheckIns.map(rec => (
                                <div key={rec.id} className="flex items-center justify-between p-2.5 bg-white border border-outline-variant/15 rounded-xl shadow-2xs">
                                  <div className="flex items-center gap-2">
                                    <img src={rec.userAvatar || undefined} className="w-6 h-6 rounded-full object-cover" />
                                    <div>
                                      <p className="text-xs font-bold text-on-surface">{rec.userName}</p>
                                      <p className="text-[9px] text-outline">In-radius: {rec.distanceMeters}m ({rec.timestamp})</p>
                                    </div>
                                  </div>
                                  <span className={`text-[8.5px] font-bold px-2 py-0.5 rounded-md ${rec.impactAwarded ? 'bg-emerald-100 text-emerald-800 border-emerald-100' : 'bg-primary/10 text-primary'}`}>
                                    {rec.impactAwarded ? '✓ Impact Score Awarded' : '✓ Verified Presence (Pending)'}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Dynamic Attendance Safety Logs */}
                        <div className="max-w-md mx-auto space-y-2">
                          <h5 className="text-xs font-extrabold uppercase tracking-wider text-outline flex items-center gap-1.5">
                            <History className="w-3.5 h-3.5" /> Presence Safety Audit Logs ({attendanceAuditLogs.filter(l => l.details.includes(selectedEvent.id) || l.details.includes(selectedEvent.title)).length})
                          </h5>
                          <div className="bg-surface-container-low max-h-40 overflow-y-auto rounded-2xl border border-outline-variant/20 text-[10px] font-mono p-2.5 space-y-1.5">
                            {attendanceAuditLogs.filter(l => l.details.includes(selectedEvent.id) || l.details.includes(selectedEvent.title)).length === 0 ? (
                              <p className="text-center text-outline py-4">Security registers clear. Awaiting scan activities.</p>
                            ) : (
                              attendanceAuditLogs
                                .filter(l => l.details.includes(selectedEvent.id) || l.details.includes(selectedEvent.title))
                                .map((log, idx) => (
                                  <div key={log.id || idx} className="p-2 bg-white rounded border border-outline-variant/10 text-on-surface-variant leading-relaxed">
                                    <div className="flex justify-between items-center text-[9px] font-bold mb-0.5">
                                      <span className={`${log.status === 'Success' ? 'text-emerald-700' : log.status === 'Failure' ? 'text-rose-700 font-extrabold' : 'text-blue-700'}`}>
                                        [{log.action}]
                                      </span>
                                      <span className="text-outline">{log.timestamp}</span>
                                    </div>
                                    <p className="text-[10px]">{log.details}</p>
                                  </div>
                                ))
                            )}
                          </div>
                        </div>

                        {/* Default Submit Completion Button */}
                        <div className="pt-4 border-t border-outline-variant/10 max-w-md mx-auto">
                          <p className="text-[10px] text-outline leading-relaxed text-center mb-2.5">
                            Ready to finalize and close your event? Submit final outcome reports and public evidence photo logs.
                          </p>
                          <button
                            onClick={() => setShowCompletionForm(true)}
                            className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-98 shadow-sm"
                          >
                            <Receipt className="w-4 h-4" /> Submit Completion Evidence Logs
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* ================================= PARTICIPANT VIEW ================================= */
                  <div className="space-y-4">
                    {!selectedEvent.isStarted ? (
                      <div className="p-6 bg-surface-container-lowest text-center rounded-3xl border border-dashed border-outline-variant/30 max-w-md mx-auto">
                        <Calendar className="w-10 h-10 text-outline mx-auto mb-3 animate-pulse" />
                        <h4 className="text-xs font-bold text-outline uppercase tracking-widest">Presence Check-In Session Offline</h4>
                        <p className="text-xs text-on-surface-variant max-w-xs mt-2.5 leading-relaxed mx-auto">
                          Check-in security keys will unlock once organiser starts live physical tracking. Wait for instructions.
                        </p>
                        <div className="bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/20 max-w-sm mt-3.5 text-left text-[11px] leading-relaxed">
                          <p className="font-bold text-primary">⚡ Quick RSVP Level</p>
                          <p className="text-[10px] text-on-surface-variant mt-0.5">
                            Status: {selectedEvent.isAttending ? '✓ Registered RSVP' : 'Not Registered RSVP'}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Compliance Audit list */}
                        <div className="bg-white border border-outline-variant/25 rounded-3xl p-4 max-w-sm mx-auto space-y-3">
                          <h4 className="text-[10px] font-bold uppercase tracking-wider text-outline mb-1">
                            Physical Compliance Prerequisites
                          </h4>
                          
                          {/* Checked elements list */}
                          <div className="space-y-2 text-xs">
                            <div className="flex items-center justify-between p-1">
                              <span className="text-on-surface-variant font-medium flex items-center gap-2">
                                👤 Logged In Account Verification
                              </span>
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-lg">
                                Verified ✓
                              </span>
                            </div>

                            <div className="flex items-center justify-between p-1">
                              <span className="text-on-surface-variant font-medium flex items-center gap-2">
                                🎟 RSVP Enrollment Reservation
                              </span>
                              {selectedEvent.isAttending ? (
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-lg flex items-center">
                                  Attendee ✓
                                </span>
                              ) : (
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                                    Required X
                                  </span>
                                  <button
                                    onClick={() => onToggleRSVP(selectedEvent.id, 'Confirmed')}
                                    className="px-2 py-1 bg-primary text-on-primary text-[9px] font-extrabold rounded-md cursor-pointer hover:bg-primary-hover shadow-2xs"
                                  >
                                    RSVP Now
                                  </button>
                                </div>
                              )}
                            </div>

                            <div className="flex items-center justify-between p-1">
                              <span className="text-on-surface-variant font-medium flex items-center gap-2">
                                🧭 GPS Device Geolocation SERVICES
                              </span>
                              <div className="flex items-center gap-2">
                                <label className="relative inline-flex items-center cursor-pointer select-none">
                                  <input 
                                    type="checkbox" 
                                    checked={simulatedLocationServices}
                                    onChange={(e) => {
                                      const checked = e.target.checked;
                                      setSimulatedLocationServices(checked);
                                      if (!checked) {
                                        onAddAuditLog({
                                          id: `audit-${Date.now()}`,
                                          timestamp: new Date().toLocaleTimeString(),
                                          action: 'Service Disabled',
                                          details: `User ${profileName} disabled GPS simulation permission.`,
                                          operator: profileName || 'Member',
                                          status: 'Info'
                                        });
                                      }
                                    }}
                                    className="sr-only peer" 
                                  />
                                  <div className="w-9 h-5 bg-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                                </label>
                                <span className={`text-[10px] font-bold ${simulatedLocationServices ? 'text-emerald-700' : 'text-rose-700 font-extrabold'}`}>
                                  {simulatedLocationServices ? 'Geolocated ✓' : 'GPS Offline X'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Simulated distance coordinates selector */}
                        <div className="bg-white border border-outline-variant/25 rounded-3xl p-4 max-w-sm mx-auto">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-outline block mb-1.5">
                            Simulate Physical Distance from Venue
                          </label>
                          <div className="grid grid-cols-4 gap-1.5">
                            {[
                              { label: 'Immediate', dist: 5 },
                              { label: 'Hall Range', dist: 80 },
                              { label: 'Outdoors', dist: 180 },
                              { label: 'Off-Bound', dist: 420 }
                            ].map((p) => (
                              <button
                                key={p.dist}
                                onClick={() => setSimulatedDistance(p.dist)}
                                className={`py-1.5 text-center text-[10px] font-bold rounded-lg transition-all ${
                                  simulatedDistance === p.dist
                                    ? 'bg-secondary text-on-secondary font-extrabold shadow-2xs'
                                    : 'bg-surface-container-low text-outline hover:bg-surface-container'
                                }`}
                              >
                                {p.label} ({p.dist}m)
                              </button>
                            ))}
                          </div>

                          <div className="mt-3 flex justify-between items-center bg-surface-container/30 px-3 py-2 rounded-xl text-xs">
                            <span className="text-on-surface-variant">Simulated distance:</span>
                            <span className={`font-extrabold ${simulatedDistance <= (selectedEvent.attendanceRadiusLimit || 200) ? 'text-emerald-700' : 'text-rose-700'}`}>
                              {simulatedDistance} meters
                            </span>
                          </div>
                          
                          {simulatedDistance > (selectedEvent.attendanceRadiusLimit || 200) && (
                            <div className="mt-2.5 p-2 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-1.5 text-[10px] text-rose-800 leading-relaxed font-semibold">
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                              Range exceeds event limit of {selectedEvent.attendanceRadiusLimit || 200}m. Bring simulated distance within the threshold.
                            </div>
                          )}
                        </div>

                        {/* Scan Interface overlay */}
                        {isUserCheckedIn ? (
                          <div className="bg-emerald-50 border-2 border-emerald-200 rounded-3xl p-6 text-center max-w-sm mx-auto animate-in zoom-in-95 duration-200">
                            <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto mb-2" />
                            <h4 className="text-sm font-extrabold text-emerald-950">Attendance Verified ✓</h4>
                            <p className="text-xs text-emerald-800 leading-relaxed mt-2">
                              Your physical presence log within {simulatedDistance}m from Event Center has been securely captured in the tamper-proof ledger.
                            </p>
                            
                            <div className="mt-4 border-t border-emerald-250 pt-3 text-left space-y-1 text-[10px] text-emerald-900 leading-normal bg-white/40 p-3 rounded-2xl">
                              <p>📌 <strong>Participant:</strong> {profileName}</p>
                              <p>📍 <strong>Check-In Range:</strong> {simulatedDistance}m from venue coordinate</p>
                              <p>⏱ <strong>Audit Stamp:</strong> {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</p>
                              <p className="pt-2 text-primary border-t border-dashed border-emerald-300 font-bold">
                                ⚡ +10 Impact Score Pending Admin Verification Approval
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {/* Scanning viewport box */}
                            <div className="relative w-48 h-48 mx-auto border-2 border-dashed border-primary/50 bg-slate-50 rounded-3xl flex flex-col items-center justify-center overflow-hidden shadow-inner">
                              {isScanning ? (
                                <div className="flex flex-col items-center text-center p-4">
                                  <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                                  <p className="text-[10px] text-primary font-extrabold mt-3">Verifying keys &amp; GPS coordinates...</p>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center text-center p-4 select-none">
                                  <QrCode className="w-12 h-12 text-outline mb-2.5" />
                                  <p className="text-[10.5px] text-outline font-extrabold">Align lens with dynamically rotating organizer code</p>
                                </div>
                              )}
                              
                              <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-primary"></div>
                              <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-primary"></div>
                              <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-primary"></div>
                              <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-primary"></div>
                              
                              {/* pulsing line */}
                              <div className="absolute top-1 left-0 w-full h-[2.5px] bg-red-500 opacity-60 animate-bounce" />
                            </div>

                            {/* Verification Result Feedback cards */}
                            {scanResult && (
                              <div className={`p-4 max-w-sm mx-auto rounded-2xl border text-xs text-left leading-relaxed animate-in fade-in duration-200 ${
                                scanResult.success 
                                  ? 'bg-emerald-50 border-emerald-100 text-emerald-950 font-medium' 
                                  : 'bg-rose-50 border-rose-100 text-rose-950 font-medium'
                              }`}>
                                <p className="font-bold mb-1">
                                  {scanResult.success ? '✓ Session Check-In Success' : '🚨 Boundary Enforcement Violation'}
                                </p>
                                <p className="text-[10.5px] leading-relaxed">{scanResult.message}</p>
                              </div>
                            )}

                            {/* Interaction keys */}
                            <div className="max-w-sm mx-auto space-y-2">
                              <button
                                onClick={() => handleScanToken(false)}
                                disabled={isScanning}
                                className="w-full py-2.5 bg-primary hover:bg-primary-hover text-on-primary text-xs font-bold rounded-xl shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer transition-transform active:scale-97 disabled:opacity-50"
                              >
                                <QrCode className="w-4 h-4" /> Scan Dynamic Presence Proof QR
                              </button>

                              <button
                                onClick={() => handleScanToken(true)}
                                disabled={isScanning}
                                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-outline text-[10.5px] font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer border border-outline-variant/15 transition-transform active:scale-97 disabled:opacity-50"
                              >
                                <Zap className="w-3.5 h-3.5 text-rose-600" /> Simulate Screenshot Spoofing Fraud
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeExpTab === 'impact' && (
              <div className="space-y-5 text-left animate-in duration-300 fade-in">
                {/* Back Button */}
                <div className="flex items-center gap-1.5 pb-4 border-b border-outline-variant/10 mb-2">
                  <button
                    onClick={() => setActiveExpTab('overview')}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-surface-container hover:bg-surface-high border border-outline-variant/20 rounded-xl text-xs font-bold text-primary transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back to Overview Hub
                  </button>
                </div>

                <div className="flex justify-between items-center mb-1">
                  <h4 className="text-xs font-bold text-outline uppercase tracking-wider">Event Coordination Statistics</h4>
                  <span className="text-[9px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase">Real-Time Ledger</span>
                </div>

                {/* Grid of Key Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="bg-surface-container-low p-3 rounded-2xl border border-outline-variant/10">
                    <p className="text-[9px] uppercase font-black text-outline">Interested Users</p>
                    <p className="text-lg font-black text-on-surface mt-1">
                      {selectedEvent.attendees.filter(a => a.participationLevel === 'Interested' || a.participationLevel === 'Maybe').length}
                    </p>
                    <p className="text-[8px] text-outline mt-0.5">Exploring options</p>
                  </div>

                  <div className="bg-surface-container-low p-3 rounded-2xl border border-outline-variant/10">
                    <p className="text-[9px] uppercase font-black text-outline">Registered Members</p>
                    <p className="text-lg font-black text-primary mt-1">
                      {selectedEvent.attendees.filter(a => a.participationLevel === 'Confirmed' || a.participationLevel === 'Committed').length}
                    </p>
                    <p className="text-[8px] text-outline mt-0.5">Committed spots</p>
                  </div>

                  <div className="bg-surface-container-low p-3 rounded-2xl border border-outline-variant/10 col-span-2 sm:col-span-1">
                    <p className="text-[9px] uppercase font-black text-outline">Verified Checked-In</p>
                    <p className="text-lg font-black text-emerald-700 mt-1">
                      {eventCheckIns.length}
                    </p>
                    <p className="text-[8px] text-emerald-600 mt-0.5">GPS Presence Logged</p>
                  </div>
                </div>

                {/* Attendance Rate Dial & Recap */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center bg-surface-container-low border border-outline-variant/15 p-4 rounded-3xl">
                  <div className="flex flex-col items-center justify-center p-3 text-center border-b md:border-b-0 md:border-r border-outline-variant/10">
                    <div className="relative w-24 h-24 flex items-center justify-center">
                      {/* CSS / Tailwind Circular Indicator */}
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          className="text-surface-container"
                          strokeWidth="3"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        {/* Selected event Attendance % */}
                        {(() => {
                          const regCount = selectedEvent.attendees.filter(a => a.participationLevel === 'Confirmed' || a.participationLevel === 'Committed').length;
                          const checkedCount = eventCheckIns.length;
                          const ratePercent = regCount > 0 ? Math.round((checkedCount / regCount) * 100) : 0;
                          const strokeDash = `${ratePercent}, 100`;
                          return (
                            <path
                              className="text-primary"
                              strokeWidth="3.2"
                              strokeDasharray={strokeDash}
                              strokeLinecap="round"
                              stroke="currentColor"
                              fill="none"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                          );
                        })()}
                      </svg>
                      <div className="absolute flex flex-col items-center">
                        <span className="text-base font-extrabold text-on-surface">
                          {(() => {
                            const regCount = selectedEvent.attendees.filter(a => a.participationLevel === 'Confirmed' || a.participationLevel === 'Committed').length;
                            const checkedCount = eventCheckIns.length;
                            return regCount > 0 ? Math.round((checkedCount / regCount) * 100) : 0;
                          })()}%
                        </span>
                        <span className="text-[7.5px] font-black uppercase text-outline tracking-wider">Attendance</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2.5 p-1">
                    <p className="text-[10px] font-black text-outline uppercase tracking-wider">Group Engagement Metrics</p>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between font-bold text-on-surface-variant">
                        <span>Status:</span>
                        <span className={`text-[10px] uppercase font-black ${selectedEvent.isCompleted ? 'text-emerald-700' : 'text-primary'}`}>
                          {selectedEvent.isCompleted ? '✓ Completed' : '⚡ Upcoming Event'}
                        </span>
                      </div>
                      <div className="flex justify-between font-bold text-on-surface-variant">
                        <span>Discussion Messages:</span>
                        <span className="text-on-surface">{(selectedEvent.discussion || []).length} lines shared</span>
                      </div>
                      <div className="flex justify-between font-bold text-on-surface-variant">
                        <span>Gallery Media Uploads:</span>
                        <span className="text-on-surface">{(selectedEvent.photos || []).length} photos</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Categorical Milestones Accomplished (Depending on Event Category) */}
                <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-3xl space-y-3">
                  <h5 className="text-[10.5px] font-black text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                    🌟 Category Event Milestones Accomplished
                  </h5>
                  <p className="text-[10px] text-emerald-800 leading-relaxed font-medium">
                    This community effort's regional milestones are tailored specifically based on ToGather's target sector rules:
                  </p>

                  {(() => {
                    const categoryLower = (selectedEvent.category || '').toLowerCase();
                    const volunteerHours = selectedEvent.impactReport?.volunteerHours || (eventCheckIns.length * 3) || 12;

                    if (categoryLower.includes('gardening') || categoryLower.includes('green') || categoryLower.includes('tree') || categoryLower.includes('forest') || categoryLower.includes('plant')) {
                      return (
                        <div className="grid grid-cols-2 gap-3.5 text-left pt-1.5 text-[11px]">
                          <div className="bg-white p-2.5 rounded-xl border border-emerald-100 flex flex-col justify-between">
                            <span className="font-extrabold text-emerald-950">Trees Planted / Soil Mulched</span>
                            <span className="text-lg font-black text-emerald-700 mt-1">25 Trees / 350 sq ft</span>
                          </div>
                          <div className="bg-white p-2.5 rounded-xl border border-emerald-100 flex flex-col justify-between">
                            <span className="font-extrabold text-emerald-950">Total Volunteer Hours</span>
                            <span className="text-lg font-black text-emerald-700 mt-1">{volunteerHours} Hours</span>
                          </div>
                        </div>
                      );
                    }

                    if (categoryLower.includes('clean') || categoryLower.includes('waste') || categoryLower.includes('coastal') || categoryLower.includes('beach') || categoryLower.includes('park') || categoryLower.includes('litter')) {
                      return (
                        <div className="grid grid-cols-2 gap-3.5 text-left pt-1.5 text-[11px]">
                          <div className="bg-white p-2.5 rounded-xl border border-emerald-100 flex flex-col justify-between">
                            <span className="font-extrabold text-emerald-950">Waste Collected</span>
                            <span className="text-lg font-black text-emerald-700 mt-1">180 kg (Recyclables Sorted)</span>
                          </div>
                          <div className="bg-white p-2.5 rounded-xl border border-emerald-100 flex flex-col justify-between">
                            <span className="font-extrabold text-emerald-950">Total Volunteer Hours</span>
                            <span className="text-lg font-black text-emerald-700 mt-1">{volunteerHours} Hours</span>
                          </div>
                        </div>
                      );
                    }

                    if (categoryLower.includes('sports') || categoryLower.includes('outdoor') || categoryLower.includes('trail') || categoryLower.includes('hike') || categoryLower.includes('run')) {
                      return (
                        <div className="grid grid-cols-2 gap-3.5 text-left pt-1.5 text-[11px]">
                          <div className="bg-white p-2.5 rounded-xl border border-emerald-100 flex flex-col justify-between">
                            <span className="font-extrabold text-emerald-950">Distance Cleared / Scouted</span>
                            <span className="text-lg font-black text-emerald-700 mt-1">8 km traversed</span>
                          </div>
                          <div className="bg-white p-2.5 rounded-xl border border-emerald-100 flex flex-col justify-between">
                            <span className="font-extrabold text-emerald-950">Total Volunteer Hours</span>
                            <span className="text-lg font-black text-emerald-700 mt-1">{volunteerHours} Hours</span>
                          </div>
                        </div>
                      );
                    }

                    // Default or Shelter/Care/Meal events
                    return (
                      <div className="grid grid-cols-2 gap-3.5 text-left pt-1.5 text-[11px]">
                        <div className="bg-white p-2.5 rounded-xl border border-emerald-100 flex flex-col justify-between">
                          <span className="font-extrabold text-emerald-950">Meals Served / Pets Nursed</span>
                          <span className="text-lg font-black text-emerald-700 mt-1">120 Served / 14 Sheltered</span>
                        </div>
                        <div className="bg-white p-2.5 rounded-xl border border-emerald-100 flex flex-col justify-between">
                          <span className="font-extrabold text-emerald-950">Total Volunteer Hours</span>
                          <span className="text-lg font-black text-emerald-700 mt-1">{volunteerHours} Hours</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}

            {activeExpTab === 'moderation' && (
              <div className="space-y-6 text-xs text-on-surface text-left animate-in fade-in duration-200">
                
                {/* Communication Mode Segment */}
                <div className="bg-surface-container-low border border-outline-variant/15 p-4 rounded-2xl space-y-3 shadow-2xs">
                  <h4 className="text-[11px] font-black uppercase text-outline tracking-wider flex items-center gap-1.5 pb-1 border-b">
                    🧭 General Event Communication settings
                  </h4>
                  
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-extrabold text-on-surface">Event Room Stream Mode</p>
                      <p className="text-[10px] text-outline mt-0.5">Control who can cast messages inside the active event chat channel.</p>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const updated: EventEntity = { ...selectedEvent, communicationMode: 'Discussion' };
                          onUpdateEvent(updated);
                          setSelectedEvent(updated);
                          alert('Room updated to: Discussion Mode (All registered neighbors can chat)');
                        }}
                        className={`px-3 py-1.5 text-[10px] uppercase font-black rounded-lg border transition-all ${
                          (selectedEvent.communicationMode || 'Discussion') === 'Discussion'
                            ? 'bg-primary text-on-primary border-primary'
                            : 'bg-white hover:bg-slate-50 border-outline-variant/30 text-outline'
                        }`}
                      >
                        Discussion Mode
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => {
                          const updated: EventEntity = { ...selectedEvent, communicationMode: 'Announcement' };
                          onUpdateEvent(updated);
                          setSelectedEvent(updated);
                          alert('Room updated to: Announcement-Only Mode (Only organizers/moderators can chat)');
                        }}
                        className={`px-3 py-1.5 text-[10px] uppercase font-black rounded-lg border transition-all ${
                          (selectedEvent.communicationMode || 'Discussion') === 'Announcement'
                            ? 'bg-primary text-on-primary border-primary'
                            : 'bg-white hover:bg-slate-50 border-outline-variant/30 text-outline'
                        }`}
                      >
                        Announcement Mode
                      </button>
                    </div>
                  </div>
                </div>

                {/* Organizer-Only Moderator Appointment Interface */}
                <div className="bg-surface-container-low border border-outline-variant/15 p-4 rounded-2xl space-y-4 shadow-2xs">
                  <div className="flex justify-between items-center pb-1.5 border-b">
                    <h4 className="text-[11px] font-black uppercase text-outline tracking-wider flex items-center gap-1.5">
                      🎖 Assigned Event Assistants ({selectedEvent.moderators?.length || 0} / 5)
                    </h4>
                    {isOrganizer && (selectedEvent.moderators?.length || 0) < 5 && (
                      <span className="text-[10.5px] font-bold text-primary mr-1">Organizer Access ✓</span>
                    )}
                  </div>

                  {/* Show existing moderators */}
                  <div className="space-y-2">
                    {(selectedEvent.moderators || []).map((mod) => (
                      <div key={mod.name} className="bg-white border rounded-xl p-3 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                        <div className="flex items-center gap-2">
                          <img src={mod.avatar || undefined} className="w-6.5 h-6.5 rounded-full object-cover shrink-0" />
                          <div>
                            <p className="font-extrabold text-on-surface">{mod.name}</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {mod.permissions.moderateChat && <span className="text-[8px] bg-sky-50 text-sky-800 px-1 border border-sky-100 rounded">Moderate Chat</span>}
                              {mod.permissions.publishAnnouncements && <span className="text-[8px] bg-amber-50 text-amber-800 px-1 border border-amber-100 rounded">Announce</span>}
                              {mod.permissions.uploadEventImages && <span className="text-[8px] bg-purple-50 text-purple-800 px-1 border border-purple-100 rounded">Uploads</span>}
                              {mod.permissions.publishEventRecap && <span className="text-[8px] bg-emerald-50 text-emerald-800 px-1 border border-emerald-100 rounded">Recaps</span>}
                            </div>
                          </div>
                        </div>

                        {/* Revoke Option */}
                        {isOrganizer && (
                          <button
                            type="button"
                            onClick={() => {
                              const updatedMods = (selectedEvent.moderators || []).filter(m => m.name !== mod.name);
                              const updated: EventEntity = { ...selectedEvent, moderators: updatedMods };
                              onUpdateEvent(updated);
                              setSelectedEvent(updated);
                              alert(`Dismissed ${mod.name} from Event Moderator assignment.`);
                            }}
                            className="text-red-700 bg-red-50 hover:bg-red-100 border border-red-100 px-2.5 py-1 text-[9.5px] font-black uppercase rounded-lg cursor-pointer"
                          >
                            Revoke Role
                          </button>
                        )}
                      </div>
                    ))}
                    {(!selectedEvent.moderators || selectedEvent.moderators.length === 0) && (
                      <p className="text-[10px] text-outline text-center py-4 italic">No Event Assistant moderators nominated yet.</p>
                    )}
                  </div>

                  {/* Add Assistant form (Organizer only) */}
                  {isOrganizer && (
                    <div className="bg-white p-3 border rounded-xl space-y-3.5 text-left">
                      <p className="text-[10px] uppercase font-black text-outline">Nominate New Assistant Moderator (Max 5)</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        <div className="space-y-1">
                          <label className="text-[8.5px] font-bold text-outline uppercase block">Select Attendee</label>
                          <select
                            id="nomin-attendee-select"
                            className="w-full border border-outline-variant/30 rounded-lg text-xs p-1.5 bg-surface text-on-surface"
                          >
                            <option value="">-- Choose Attendee --</option>
                            {selectedEvent.attendees
                              .filter(a => {
                                if (a.name === selectedEvent.organizerName) return false;
                                if ((selectedEvent.moderators || []).some(m => m.name === a.name)) return false;
                                if (selectedEvent.accessMode === 'Approval Required') {
                                  return a.approved === true;
                                }
                                if (selectedEvent.accessMode === 'Invite Only') {
                                  return a.invitedAccepted === true;
                                }
                                return true;
                              })
                              .map(att => (
                                <option key={att.name} value={att.name}>{att.name}</option>
                              ))
                            }
                          </select>
                        </div>

                        <div className="space-y-1.5 text-left font-sans">
                          <label className="text-[8.5px] font-bold text-outline uppercase block mb-1">Specific Permissions Configuration (Explicitly Enable)</label>
                          <div className="grid grid-cols-2 gap-2 text-[9px] font-bold text-on-surface-variant">
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input id="p-mod-announce" type="checkbox" />
                              <span>Publish Updates</span>
                            </label>
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input id="p-mod-chat" type="checkbox" />
                              <span>Moderate Discussions</span>
                            </label>
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input id="p-mod-pin" type="checkbox" />
                              <span>Pin Messages</span>
                            </label>
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input id="p-mod-upload" type="checkbox" />
                              <span>Upload Images</span>
                            </label>
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input id="p-mod-participants" type="checkbox" />
                              <span>Manage Attendees</span>
                            </label>
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input id="p-mod-details" type="checkbox" />
                              <span>Update Details</span>
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="text-right pt-1.5 border-t">
                        <button
                          type="button"
                          onClick={() => {
                            if ((selectedEvent.moderators || []).length >= 5) {
                              alert('Warning: You cannot nominate more than 5 Event Assistant moderators.');
                              return;
                            }
                            const selName = (document.getElementById('nomin-attendee-select') as HTMLSelectElement)?.value;
                            if (!selName) {
                              alert('Please select an active attendee to appoint.');
                              return;
                            }
                            const attObj = selectedEvent.attendees.find(a => a.name === selName);
                            if (!attObj) return;

                            const publishAnnouncementsVal = (document.getElementById('p-mod-announce') as HTMLInputElement)?.checked || false;
                            const moderateChatVal = (document.getElementById('p-mod-chat') as HTMLInputElement)?.checked || false;
                            const pinMessagesVal = (document.getElementById('p-mod-pin') as HTMLInputElement)?.checked || false;
                            const uploadEventImagesVal = (document.getElementById('p-mod-upload') as HTMLInputElement)?.checked || false;
                            const manageParticipantsVal = (document.getElementById('p-mod-participants') as HTMLInputElement)?.checked || false;
                            const editEventDetailsVal = (document.getElementById('p-mod-details') as HTMLInputElement)?.checked || false;

                            const newMod: EventModerator = {
                              name: attObj.name,
                              avatar: attObj.avatar,
                              permissions: {
                                moderateChat: moderateChatVal,
                                publishAnnouncements: publishAnnouncementsVal,
                                uploadEventImages: uploadEventImagesVal,
                                publishEventRecap: editEventDetailsVal,
                                pinMessages: pinMessagesVal,
                                editEventDetails: editEventDetailsVal,
                                updateEventDescription: editEventDetailsVal,
                                updateEventSchedule: editEventDetailsVal,
                                updateEventLocation: editEventDetailsVal,
                                manageParticipants: manageParticipantsVal
                              }
                            };

                            const updatedMods = [...(selectedEvent.moderators || []), newMod];
                            const updated: EventEntity = { ...selectedEvent, moderators: updatedMods };
                            onUpdateEvent(updated);
                            setSelectedEvent(updated);
                            alert(`Appointed ${attObj.name} as Event Assistant Moderator with custom permissions!`);
                          }}
                          className="bg-primary hover:bg-primary-hover text-on-primary text-[10px] font-black uppercase px-4 py-2 rounded-lg cursor-pointer"
                        >
                          Confirm Appointment
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Host Critical Security Actions (Host Only) */}
                {isOrganizer && (
                  <div className="bg-red-50 border border-red-100 p-4 rounded-2xl space-y-4 text-left font-sans animate-in fade-in duration-350">
                    <h4 className="text-[11px] font-black uppercase text-red-900 tracking-wider flex items-center gap-1.5 pb-1 border-b border-red-100">
                      🛡️ Host Critical Security Actions (Host Only)
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Cancel & Delete Controls */}
                      <div className="space-y-2 col-span-1">
                        <p className="font-extrabold text-red-950 text-xs">Event Lifecycle controls</p>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const confirmCancel = confirm("Are you sure you want to cancel this event? This will notify all participants.");
                              if (confirmCancel) {
                                const updated: EventEntity = {
                                  ...selectedEvent,
                                  title: `[CANCELED] ${selectedEvent.title}`,
                                  description: `CRITICAL: This event has been canceled by the organizer. Refer to details or contact organizers.\n\n${selectedEvent.description}`
                                };
                                onUpdateEvent(updated);
                                setSelectedEvent(updated);
                                alert("Event state updated to [CANCELED]!");
                              }
                            }}
                            className="flex-grow py-2 bg-amber-700 hover:bg-amber-800 text-white font-extrabold text-[10px] uppercase rounded-xl cursor-pointer text-center"
                          >
                            Cancel Event
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              const confirmDelete = confirm("CRITICAL: Are you sure you want to delete this event permanently? This cannot be undone.");
                              if (confirmDelete) {
                                onUpdateEvent({
                                  ...selectedEvent,
                                  suspended: true
                                });
                                alert("Event permanently deleted from listings.");
                                closeEventDetail();
                              }
                            }}
                            className="flex-grow py-2 bg-red-700 hover:bg-red-800 text-white font-extrabold text-[10px] uppercase rounded-xl cursor-pointer text-center"
                          >
                            Delete Event
                          </button>
                        </div>
                      </div>

                      {/* Transfer Ownership Control */}
                      <div className="space-y-2 col-span-1">
                        <p className="font-extrabold text-red-950 text-xs">Transfer Ownership</p>
                        <div className="flex gap-2 text-xs">
                          <select
                            id="transfer-owner-select"
                            className="flex-grow border border-red-200 rounded-lg text-xs p-1.5 bg-white text-on-surface focus:outline-none focus:ring-primary"
                          >
                            <option value="">-- Choose New Host --</option>
                            {selectedEvent.attendees
                              .filter(a => a.name !== selectedEvent.organizerName)
                              .map(att => (
                                <option key={att.name} value={att.name}>{att.name}</option>
                              ))
                            }
                          </select>
                          <button
                            type="button"
                            onClick={() => {
                              const targetName = (document.getElementById('transfer-owner-select') as HTMLSelectElement)?.value;
                              if (!targetName) {
                                alert("Identify a valid neighbor attendee from the list to transfer event ownership.");
                                return;
                              }
                              const attObj = selectedEvent.attendees.find(a => a.name === targetName);
                              if (!attObj) return;

                              const confirmTransfer = confirm(`Are you absolutely sure you want to transfer host rights of this event to ${targetName}? This is a permanent security action.`);
                              if (confirmTransfer) {
                                const updated: EventEntity = {
                                  ...selectedEvent,
                                  organizerName: attObj.name,
                                  organizerAvatar: attObj.avatar,
                                  organizerPastEvents: (selectedEvent.organizerPastEvents || 0) + 1,
                                  moderators: selectedEvent.moderators?.filter(m => m.name !== attObj.name) || []
                                };
                                onUpdateEvent(updated);
                                setSelectedEvent(updated);
                                alert(`Ownership successfully transferred to ${targetName}! They are now the official Host of this event.`);
                              }
                            }}
                            className="bg-red-900 hover:bg-red-950 text-white text-[10px] font-black uppercase px-3 py-1.5 rounded-lg shrink-0 cursor-pointer"
                          >
                            Transfer
                          </button>
                        </div>
                        <p className="text-[8.5px] text-red-800 leading-normal italic">Ownership can only be transferred to joined event attendees.</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Attendees and Queue Management Panel */}
                <div className="bg-surface-container-low border border-outline-variant/15 p-4 rounded-2xl space-y-4 shadow-2xs">
                  <h4 className="text-[11px] font-black uppercase text-outline tracking-wider flex items-center gap-1.5 border-b pb-1.5">
                    👥 Attendee & Chat Queue Management
                  </h4>

                  <div className="space-y-3">
                    {selectedEvent.attendees.map((att) => {
                      const isMuted = selectedEvent.mutedParticipants?.includes(att.name);
                      const isRemoved = selectedEvent.removedParticipants?.includes(att.name);
                      const isApproved = att.approved !== false; // default true for open matches
                      
                      const modRecord = selectedEvent.moderators?.find(m => m.name === profileName);
                      const canModerateChat = isOrganizer || (isModerator && modRecord?.permissions.moderateChat);

                      return (
                        <div key={att.name} className="bg-white border text-xs p-3 rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                          <div className="flex items-center gap-2">
                            <img src={att.avatar || undefined} className="w-7 h-7 rounded-full object-cover shrink-0" />
                            <div>
                              <p className="font-extrabold text-on-surface flex items-center gap-1.5">
                                {att.name}
                                {selectedEvent.organizerName === att.name && <span className="bg-secondary/15 text-[6.5px] font-black border border-secondary/10 px-1 rounded uppercase">Organizer</span>}
                                {selectedEvent.moderators?.some(m => m.name === att.name) && <span className="bg-primary/15 text-[6.5px] font-black border border-primary/10 px-1 rounded uppercase">Assistant</span>}
                              </p>
                              
                              <p className="text-[9px] text-outline mt-0.5">
                                Status: <span className="font-extrabold">{isRemoved ? 'BANNED FROM CHAT' : isMuted ? 'MUTED' : 'ACTIVE CHAT MEMBER'}</span>
                                {selectedEvent.accessMode === 'Approval Required' && ` • Approval: ${isApproved ? 'CONFIRMED' : 'PENDING'}`}
                                {selectedEvent.accessMode === 'Invite Only' && ` • Invited: ${att.invited ? (att.invitedAccepted ? 'ACCEPTED' : 'PENDING ACCEPT') : 'NO'}`}
                              </p>
                            </div>
                          </div>

                          {/* Quick Moderation controls if attendee is not root Organizer */}
                          {att.name !== selectedEvent.organizerName && canModerateChat && (
                            <div className="flex flex-wrap gap-1.5 justify-end">
                              {/* Manage approvals if Approval Required Mode */}
                              {selectedEvent.accessMode === 'Approval Required' && !isApproved && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const nextAtts = selectedEvent.attendees.map(a =>
                                      a.name === att.name ? { ...a, approved: true } : a
                                    );
                                    const updated: EventEntity = { ...selectedEvent, attendees: nextAtts };
                                    onUpdateEvent(updated);
                                    setSelectedEvent(updated);
                                    alert(`Approved RSVP participation of ${att.name}.`);
                                  }}
                                  className="text-white bg-emerald-700 hover:bg-emerald-800 text-[8.5px] font-bold px-2.5 py-1 rounded cursor-pointer"
                                >
                                  Approve RSVP
                                </button>
                              )}

                              {/* Mute toggle button */}
                              <button
                                type="button"
                                onClick={() => {
                                  let currentMutes = selectedEvent.mutedParticipants || [];
                                  if (isMuted) {
                                    currentMutes = currentMutes.filter(n => n !== att.name);
                                    alert(`Unmuted ${att.name}.`);
                                  } else {
                                    currentMutes = [...currentMutes, att.name];
                                    alert(`Muted ${att.name} in discussions.`);
                                  }
                                  const updated: EventEntity = { ...selectedEvent, mutedParticipants: currentMutes };
                                  onUpdateEvent(updated);
                                  setSelectedEvent(updated);
                                }}
                                className={`text-[8.5px] font-bold px-2 py-0.5 rounded border cursor-pointer ${
                                  isMuted ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-slate-50 border-slate-200 text-outline'
                                }`}
                              >
                                {isMuted ? '🔇 Unmute' : '🔇 Mute'}
                              </button>

                              {/* Kick/Unkick toggle button */}
                              <button
                                type="button"
                                onClick={() => {
                                  let currentRemoved = selectedEvent.removedParticipants || [];
                                  if (isRemoved) {
                                    currentRemoved = currentRemoved.filter(n => n !== att.name);
                                    alert(`Restored ${att.name} inside chat.`);
                                  } else {
                                    currentRemoved = [...currentRemoved, att.name];
                                    alert(`Removed / banned ${att.name} from chat.`);
                                  }
                                  const updated: EventEntity = { ...selectedEvent, removedParticipants: currentRemoved };
                                  onUpdateEvent(updated);
                                  setSelectedEvent(updated);
                                }}
                                className={`text-[8.5px] font-bold px-2 py-0.5 rounded border cursor-pointer ${
                                  isRemoved ? 'bg-red-50 border-red-200 text-red-800 italic' : 'bg-slate-50 border-slate-200 text-outline'
                                }`}
                              >
                                {isRemoved ? '⚠️ Restore Chat' : '🚫 Ban Chat'}
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Invite Attendee Form if Invite Only Mode */}
                  {selectedEvent.accessMode === 'Invite Only' && (isOrganizer || isModerator) && (
                    <div className="bg-white p-3 border rounded-xl space-y-2 text-left">
                      <p className="text-[10px] uppercase font-black text-outline">✉️ Dispatch invite to Neighbor</p>
                      <div className="flex gap-2 text-xs">
                        <input
                          id="invite-other-name"
                          type="text"
                          placeholder="Type username / neighbor name"
                          className="flex-grow border rounded-lg p-1.5 focus:outline-none focus:ring-1 focus:ring-primary bg-white text-on-surface"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const nameBox = document.getElementById('invite-other-name') as HTMLInputElement;
                            const targetName = nameBox?.value.trim();
                            if (!targetName) {
                              alert('Please input a name.');
                              return;
                            }
                            
                            const nextAttendees = [...selectedEvent.attendees];
                            const exists = nextAttendees.some(a => a.name === targetName);
                            if (exists) {
                              alert('This attendee is already listed or has been invited.');
                              return;
                            }

                            nextAttendees.push({
                              name: targetName,
                              avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
                              participationLevel: 'Interested',
                              invited: true,
                              invitedAccepted: false,
                              approved: true
                            });

                            const updated: EventEntity = {
                              ...selectedEvent,
                              attendees: nextAttendees
                            };

                            onUpdateEvent(updated);
                            setSelectedEvent(updated);
                            if (nameBox) nameBox.value = '';
                            alert(`Sent official neighbor invitation to ${targetName}!`);
                          }}
                          className="bg-primary text-on-primary text-[10px] font-black uppercase px-3.5 py-1.5 rounded-lg shrink-0 cursor-pointer"
                        >
                          Send Invitation
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeExpTab === 'location' && (
              <div className="space-y-4 text-left animate-in duration-300 fade-in">
                {/* Back Button */}
                <div className="flex items-center gap-1.5 pb-4 border-b border-outline-variant/10 mb-2">
                  <button
                    onClick={() => setActiveExpTab('overview')}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-surface-container hover:bg-surface-high border border-outline-variant/20 rounded-xl text-xs font-bold text-primary transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back to Overview Hub
                  </button>
                </div>

                <div className="flex justify-between items-center mb-1">
                  <h4 className="text-xs font-bold text-outline uppercase tracking-wider">Meetup Location &amp; Transport Coordination</h4>
                  <span className="text-[8px] font-black bg-outline/10 text-outline px-2 py-0.5 rounded uppercase font-mono">Coordinates Verified</span>
                </div>

                {/* Map Simulation Panel */}
                <div className="bg-surface-container-low border border-outline-variant/20 rounded-3xl p-4 space-y-4 shadow-xs relative overflow-hidden">
                  <div className="h-44 bg-slate-100 rounded-2xl border border-outline-variant/30 flex items-center justify-center relative overflow-hidden">
                    {/* Simulated Map Background */}
                    <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px]"></div>
                    <div className="absolute inset-0 flex flex-col justify-between p-3.5 text-left">
                      <div className="flex justify-between items-start">
                        <span className="bg-white/80 backdrop-blur-xs text-[8px] font-bold text-slate-800 px-2 py-1 rounded-lg border border-slate-200">
                          ToGather Live Map API (Stub)
                        </span>
                        <span className="bg-primary text-white text-[8px] font-black tracking-wider uppercase px-2 py-1 rounded-lg">
                          🛰️ GPS Active
                        </span>
                      </div>
                      
                      {/* Live Proximity Indicator inside map */}
                      <div className="bg-white/90 backdrop-blur-xs p-2.5 rounded-xl border max-w-xs text-[10px] text-slate-800 space-y-1">
                        <p className="font-extrabold flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span> 
                          You are {simulatedDistance}m from Venue Point
                        </p>
                        <p className="text-[9px] text-slate-500 font-medium">Coordinate: 12.9716° N, 77.5946° E</p>
                      </div>
                    </div>
                    {/* Pointers / Markers */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                      <div className="p-2.5 bg-primary text-white rounded-full shadow-lg ring-4 ring-primary/20 animate-bounce">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <span className="mt-1.5 bg-black/75 px-2 py-0.5 rounded text-white text-[8.5px] font-bold tracking-tight">Meetup Station</span>
                    </div>
                  </div>

                  {/* Direct Address Detail */}
                  <div className="space-y-1.5">
                    <p className="text-[9px] uppercase font-black text-outline">Precise Gathering Address</p>
                    <p className="text-xs font-bold text-on-surface leading-normal bg-white p-3 rounded-xl border border-dashed border-outline-variant/30">
                      📍 {selectedEvent.location}
                    </p>
                  </div>
                </div>

                {/* Transportation Carpool Info Notes */}
                <div className="bg-amber-50/50 border border-amber-100 p-4 rounded-3xl space-y-3">
                  <h5 className="text-[10.5px] font-black text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                    🚗 Sustainable Transit &amp; Carpool Coordination Guidance
                  </h5>
                  <div className="space-y-2 text-xs text-amber-900 leading-relaxed font-semibold">
                    <p>
                      🌿 ToGather encourages using lower-emission transportation channels: public subways, bicycle trails, and coordinate-arranged carpooling.
                    </p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li><strong>Public Transit:</strong> Take Metro Route-4 Line to Sector 12 station, or Bus Loop 10 to Regional Park entrance.</li>
                      <li><strong>Group Carpool Meetup:</strong> Use the Discussions board to cluster and coordinate car rentals/rides with other attendees living near your region!</li>
                      <li><strong>Arrival Safety:</strong> Please check-in within {selectedEvent.attendanceRadiusLimit || 200}m radius on-site to register attendance.</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeExpTab === 'moderators_view' && (
              <div className="space-y-4 text-left animate-in duration-300 fade-in">
                {/* Back Button */}
                <div className="flex items-center gap-1.5 pb-4 border-b border-outline-variant/10 mb-2">
                  <button
                    onClick={() => setActiveExpTab('overview')}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-surface-container hover:bg-surface-high border border-outline-variant/20 rounded-xl text-xs font-bold text-primary transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back to Overview Hub
                  </button>
                </div>

                <div className="flex justify-between items-center mb-1">
                  <h4 className="text-xs font-bold text-outline uppercase tracking-wider">Gathering Host &amp; Assistants</h4>
                  <span className="text-[9px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase">Leadership team</span>
                </div>

                {/* Organizer Info */}
                <div className="bg-surface-container-low p-4 rounded-3xl border border-outline-variant/10">
                  <p className="text-[9px] uppercase font-black text-outline mb-2 tracking-wider">Primary Organizer Host</p>
                  <div className="flex items-center gap-3">
                    <img src={selectedEvent.organizerAvatar || undefined} className="w-10 h-10 rounded-full object-cover border-2 border-primary shrink-0" />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-extrabold text-on-surface hover:underline cursor-pointer" onClick={() => setSelectedProfileUser({
                          name: selectedEvent.organizerName,
                          avatar: selectedEvent.organizerAvatar,
                          verificationStatus: selectedEvent.organizerVerification || 'Identity Verified',
                          bio: selectedEvent.description,
                          location: selectedEvent.location
                        })}>{selectedEvent.organizerName}</p>
                        <span className="text-secondary text-[10px]" title="🛡 Host Badged verified">🛡 Host</span>
                      </div>
                      <p className="text-[9.5px] text-outline mt-0.5 font-medium">
                        Conducted {selectedEvent.organizerPastEvents} events • {selectedEvent.isVerifiedConduct ? '✓ Conducting Verified Events' : 'Student/Citizen Verified'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Moderator Info */}
                <div className="bg-surface-container-low p-4 rounded-3xl border border-outline-variant/10 space-y-3">
                  <div className="flex justify-between items-center">
                    <p className="text-[9.5px] uppercase font-black text-outline tracking-wider">Assistant Moderators (Max 5)</p>
                    <span className="text-[8.5px] text-outline">{(selectedEvent.moderators || []).length} nominated</span>
                  </div>

                  {selectedEvent.moderators && selectedEvent.moderators.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {selectedEvent.moderators.map((mod) => (
                        <div key={mod.name} className="bg-white border rounded-xl p-3 flex flex-col justify-between gap-2 text-left">
                          <div className="flex items-center gap-2.5">
                            <img src={mod.avatar || undefined} className="w-8 h-8 rounded-full object-cover border cursor-pointer shrink-0" onClick={() => setSelectedProfileUser({
                              name: mod.name,
                              avatar: mod.avatar,
                              verificationStatus: 'Identity Verified',
                              bio: `${mod.name} is an appointed Assistant Moderator for this ToGather community gathering.`,
                              location: selectedEvent.location
                            })} />
                            <div>
                              <p className="text-xs font-bold text-on-surface hover:underline cursor-pointer" onClick={() => setSelectedProfileUser({
                                name: mod.name,
                                avatar: mod.avatar,
                                verificationStatus: 'Identity Verified',
                                bio: `${mod.name} is an appointed Assistant Moderator for this ToGather community gathering.`,
                                location: selectedEvent.location
                              })}>{mod.name}</p>
                              <p className="text-[8.5px] text-outline font-medium">Assigned Assistant</p>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-1 border-t pt-2 mt-1 shrink-0">
                            {mod.permissions.publishAnnouncements && <span className="text-[7.5px] bg-amber-50 text-amber-800 px-1 py-0.2 border rounded font-mono font-bold">Announce</span>}
                            {mod.permissions.moderateChat && <span className="text-[7.5px] bg-sky-50 text-sky-800 px-1 py-0.2 border rounded font-mono font-bold">Moderate</span>}
                            {mod.permissions.uploadEventImages && <span className="text-[7.5px] bg-purple-50 text-purple-800 px-1 py-0.2 border rounded font-mono font-bold">Photos</span>}
                            {mod.permissions.manageParticipants && <span className="text-[7.5px] bg-indigo-50 text-indigo-800 px-1 py-0.2 border rounded font-mono font-bold">Attendees</span>}
                            {mod.permissions.editEventDetails && <span className="text-[7.5px] bg-emerald-50 text-emerald-800 px-1 py-0.2 border rounded font-mono font-bold">Details</span>}
                            {mod.permissions.pinMessages && <span className="text-[7.5px] bg-pink-50 text-pink-800 px-1 py-0.2 border rounded font-mono font-bold">Pins</span>}
                          </div>

                          {/* Dismiss Option for Host/Organizer */}
                          {(() => {
                            const isOrganizer = selectedEvent.organizerName === profileName;
                            if (!isOrganizer) return null;
                            return (
                              <button
                                type="button"
                                onClick={() => {
                                  const updatedMods = (selectedEvent.moderators || []).filter(m => m.name !== mod.name);
                                  const updated: EventEntity = { ...selectedEvent, moderators: updatedMods };
                                  onUpdateEvent(updated);
                                  setSelectedEvent(updated);
                                  alert(`Dismissed ${mod.name} from Event Moderator assignment.`);
                                }}
                                className="mt-2 w-full text-center text-red-700 bg-red-50 hover:bg-red-100 border border-red-150 py-1 text-[9px] font-black uppercase rounded-lg cursor-pointer transition-colors"
                              >
                                Revoke Role
                              </button>
                            );
                          })()}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px] text-outline italic py-4 text-center">No assistant moderators assigned yet.</p>
                  )}
                </div>

                {/* Organizer-Only Moderator Appointment Interface inside sub-view (Consolidated here) */}
                {(() => {
                  const isOrganizer = selectedEvent.organizerName === profileName;
                  if (!isOrganizer) return null;

                  return (
                    <div className="bg-surface-container-low border border-outline-variant/15 p-4 rounded-3xl space-y-4 shadow-2xs">
                      <div className="flex justify-between items-center pb-1.5 border-b">
                        <h4 className="text-[10px] font-black uppercase text-outline tracking-wider flex items-center gap-1.5">
                          🎖 Nominate Assistant Moderator ({selectedEvent.moderators?.length || 0} / 5)
                        </h4>
                        <span className="text-[9px] font-bold text-primary">Organizer ✓</span>
                      </div>

                      <div className="bg-white p-3.5 border border-outline-variant/10 rounded-2xl space-y-3 text-left">
                        <p className="text-[9.5px] uppercase font-black text-outline font-sans">Nominate Joined Attendees (Up to 5)</p>
                        
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <label className="text-[8.5px] font-bold text-outline uppercase block">Select Attendee</label>
                            <select
                              id="subpage-add-mod-select"
                              className="w-full border border-outline-variant/30 rounded-lg text-xs p-1.5 bg-surface text-on-surface"
                            >
                              <option value="">-- Choose Attendee --</option>
                              {selectedEvent.attendees
                                .filter(a => {
                                  if (a.name === selectedEvent.organizerName) return false;
                                  if ((selectedEvent.moderators || []).some(m => m.name === a.name)) return false;
                                  return true;
                                })
                                .map(att => (
                                  <option key={att.name} value={att.name}>{att.name}</option>
                                ))
                              }
                            </select>
                          </div>

                          <div className="space-y-1.5 text-left font-sans">
                            <label className="text-[8.5px] font-bold text-outline uppercase block mb-1">Configure Permissions</label>
                            <div className="grid grid-cols-2 gap-2 text-[9px] font-bold text-on-surface-variant">
                              <label className="flex items-center gap-1.5 cursor-pointer">
                                <input id="sub-p-mod-announce" type="checkbox" defaultChecked />
                                <span>Publish Updates</span>
                              </label>
                              <label className="flex items-center gap-1.5 cursor-pointer">
                                <input id="sub-p-mod-chat" type="checkbox" defaultChecked />
                                <span>Moderate Discussions</span>
                              </label>
                              <label className="flex items-center gap-1.5 cursor-pointer">
                                <input id="sub-p-mod-pin" type="checkbox" defaultChecked />
                                <span>Pin Messages</span>
                              </label>
                              <label className="flex items-center gap-1.5 cursor-pointer">
                                <input id="sub-p-mod-upload" type="checkbox" defaultChecked />
                                <span>Upload Images</span>
                              </label>
                            </div>
                          </div>
                        </div>

                        <div className="text-right pt-2 border-t mt-3 flex justify-end">
                          <button
                            type="button"
                            onClick={() => {
                              if ((selectedEvent.moderators || []).length >= 5) {
                                alert('Warning: You cannot nominate more than 5 Event Assistant moderators.');
                                return;
                              }
                              const selName = (document.getElementById('subpage-add-mod-select') as HTMLSelectElement)?.value;
                              if (!selName) {
                                alert('Please select an active attendee to appoint.');
                                return;
                              }
                              const attObj = selectedEvent.attendees.find(a => a.name === selName);
                              if (!attObj) return;

                              const publishAnnouncementsVal = (document.getElementById('sub-p-mod-announce') as HTMLInputElement)?.checked || false;
                              const moderateChatVal = (document.getElementById('sub-p-mod-chat') as HTMLInputElement)?.checked || false;
                              const pinMessagesVal = (document.getElementById('sub-p-mod-pin') as HTMLInputElement)?.checked || false;
                              const uploadEventImagesVal = (document.getElementById('sub-p-mod-upload') as HTMLInputElement)?.checked || false;

                              const newMod = {
                                name: attObj.name,
                                avatar: attObj.avatar,
                                permissions: {
                                  moderateChat: moderateChatVal,
                                  publishAnnouncements: publishAnnouncementsVal,
                                  uploadEventImages: uploadEventImagesVal,
                                  publishEventRecap: false,
                                  pinMessages: pinMessagesVal,
                                  editEventDetails: false,
                                  updateEventDescription: false,
                                  updateEventSchedule: false,
                                  updateEventLocation: false,
                                  manageParticipants: false
                                }
                              };

                              const updatedMods = [...(selectedEvent.moderators || []), newMod];
                              const updated = { ...selectedEvent, moderators: updatedMods };
                              onUpdateEvent(updated);
                              setSelectedEvent(updated);
                              alert(`Successfully appointed ${attObj.name} as Assistant Moderator with configured permissions!`);
                            }}
                            className="bg-primary hover:bg-primary-hover text-[9.5px] text-on-primary font-black uppercase px-4 py-2 rounded-xl cursor-pointer"
                          >
                            Appoint Assistant
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })()}

              </div>
            )}

            {activeExpTab === 'recap' && selectedEvent && (
              <div className="space-y-6 text-xs text-on-surface text-left animate-in fade-in duration-200">
                
                {/* Save forms options */}
                {(!selectedEvent.recap?.isPublished || isEditingRecap) && (isOrganizer || (isModerator && selectedEvent.moderators?.find(m => m.name === profileName)?.permissions.publishEventRecap)) ? (
                  <div className="bg-surface-container-low border border-outline-variant/15 rounded-2xl p-4 space-y-4 shadow-2xs text-left">
                    <h4 className="text-[11px] font-black uppercase text-outline tracking-wider flex items-center gap-1.5 border-b pb-2">
                      📝 Publish Post-Event Recap Portfolio
                    </h4>

                    <div className="space-y-3.5">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-outline">💖 Thank You Notes to Neighbors</label>
                        <textarea
                          id="recap-thankyou"
                          defaultValue={selectedEvent.recap?.thankYouNotes || "Deep gratitude to all our supportive local advocates and neighbors who contributed to this impactful gathering!"}
                          rows={2}
                          className="w-full border rounded-lg text-xs p-2 bg-white text-on-surface focus:ring-1 focus:ring-primary focus:outline-none"
                          placeholder="What would you like to thank neighbors for?"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-outline">📋 Event Summary Detail</label>
                        <textarea
                          id="recap-summary"
                          rows={3}
                          defaultValue={selectedEvent.recap?.summary || `Successfully completed our neighborhood environmental action plan for ${selectedEvent.title}. We worked as a team to restore and safe-guard our sector.`}
                          className="w-full border rounded-lg text-xs p-2 bg-white text-on-surface focus:ring-1 focus:ring-primary focus:outline-none"
                          placeholder="Provide a comprehensive narrative summary..."
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-outline">📈 Event Outcomes / Achievements</label>
                          <input
                            id="recap-outcomes"
                            type="text"
                            defaultValue={selectedEvent.recap?.outcomes || "Cleared over 8 sectors, sorted recycling, and planted seeds."}
                            className="w-full border rounded-lg text-xs p-2 bg-white text-on-surface focus:ring-1 focus:ring-primary focus:outline-none"
                          />
                        </div>
                        
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-outline">🌻 Attendance Statistics</label>
                          <input
                            id="recap-stats"
                            type="text"
                            defaultValue={selectedEvent.recap?.attendanceStats || `${selectedEvent.attendeesCount} Neighbors Active & Accounted For`}
                            className="w-full border rounded-lg text-xs p-2 bg-white text-on-surface focus:ring-1 focus:ring-primary focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-outline">🌳 Community Impact Metrics</label>
                          <input
                            id="recap-impact"
                            type="text"
                            defaultValue={selectedEvent.recap?.communityImpact || "150 lbs debris routed, +30 community points generated."}
                            className="w-full border rounded-lg text-xs p-2 bg-white text-on-surface focus:ring-1 focus:ring-primary focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1 bg-white p-2 border rounded-xl flex flex-col justify-center">
                          <label className="text-[10px] uppercase font-bold text-outline mb-1 block">🔒 Visibility Scope Options</label>
                          <select
                            id="recap-visibility"
                            defaultValue={selectedEvent.recap?.visibility || "Public"}
                            className="border border-outline-variant/30 rounded-lg text-xs p-1 bg-surface text-on-surface focus:outline-none"
                          >
                            <option value="Private">Private: Participant-Only</option>
                            <option value="Public">Public: Publish Community Feed & Dashboard</option>
                          </select>
                        </div>
                      </div>

                      {/* Upload recap photo picker */}
                      <div className="space-y-1 bg-white p-3 border rounded-xl">
                        <label className="text-[10.5px] font-bold text-outline uppercase block mb-1">📸 Recap Photo Attachments</label>
                        <div className="flex gap-2">
                          <input
                            id="recap-photo-url"
                            type="text"
                            placeholder="Paste web photo URL"
                            className="flex-grow border rounded-lg text-xs p-1.5 focus:outline-none focus:ring-1 focus:ring-primary bg-white text-on-surface"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const input = document.getElementById('recap-photo-url') as HTMLInputElement;
                              const val = input?.value.trim() || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80';
                              setRecapPhotosList(prev => [...prev, val].slice(0, 3));
                              if (input) input.value = '';
                            }}
                            className="bg-primary text-on-primary text-[10.5px] font-extrabold px-3 py-1.5 rounded-lg shrink-0 hover:bg-primary-hover transition-all cursor-pointer"
                          >
                            Add Link
                          </button>
                        </div>
                        
                        {/* Display newly added links */}
                        <div className="flex gap-2.5 mt-2.5">
                          {recapPhotosList.map((ph, pi) => (
                            <div key={pi} className="w-16 h-16 rounded border overflow-hidden relative group shrink-0">
                              <img src={ph || undefined} className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => setRecapPhotosList(prev => prev.filter((_, idx) => idx !== pi))}
                                className="absolute inset-0 bg-red-900/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[9.5px] font-bold cursor-pointer"
                              >
                                Delete
                              </button>
                            </div>
                          ))}
                          {recapPhotosList.length === 0 && (
                            <p className="text-[10px] text-outline italic">No photos added yet. Default active catalog will apply.</p>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2 justify-end pt-2 border-t border-outline-variant/10">
                        {isEditingRecap && (
                          <button
                            type="button"
                            onClick={() => setIsEditingRecap(false)}
                            className="px-4 py-2 border rounded-xl text-xs font-bold bg-white text-outline cursor-pointer hover:bg-slate-50"
                          >
                            Cancel
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            const notes = (document.getElementById('recap-thankyou') as HTMLTextAreaElement)?.value || '';
                            const summaryText = (document.getElementById('recap-summary') as HTMLTextAreaElement)?.value || '';
                            const outcomesVal = (document.getElementById('recap-outcomes') as HTMLInputElement)?.value || '';
                            const statsVal = (document.getElementById('recap-stats') as HTMLInputElement)?.value || '';
                            const impactVal = (document.getElementById('recap-impact') as HTMLInputElement)?.value || '';
                            const visVal = (document.getElementById('recap-visibility') as HTMLSelectElement)?.value as 'Private' | 'Public';

                            const photosToPublish = recapPhotosList.length ? recapPhotosList : [selectedEvent.image];

                            const finalRecap: EventRecap = {
                              thankYouNotes: notes,
                              summary: summaryText,
                              outcomes: outcomesVal,
                              photos: photosToPublish,
                              attendanceStats: statsVal,
                              communityImpact: impactVal,
                              visibility: visVal,
                              isPublished: true
                            };

                            const updated: EventEntity = {
                              ...selectedEvent,
                              recap: finalRecap,
                              isCompleted: true
                            };

                            onUpdateEvent(updated);
                            setSelectedEvent(updated);
                            setIsEditingRecap(false);

                            // Publish to Feed if public!
                            if (visVal === 'Public' && onPublishFeedPost) {
                              const feedPostObj: FeedPost = {
                                id: `recap-post-${Date.now()}`,
                                avatar: selectedEvent.organizerAvatar,
                                author: selectedEvent.organizerName,
                                authorVerification: selectedEvent.organizerVerification,
                                subtext: `🎉 Post-Event Community Outcomes Recap`,
                                text: `🏆 OUTCOMES RECAP: "${selectedEvent.title}"\n\n📝 SUMMARY: ${summaryText}\n\n💖 HOST THANK YOU: "${notes}"\n\n🌟 IMPACT DELIVERED: ${impactVal}\n\n👥 ATTENDANCE: ${statsVal}`,
                                tags: [selectedEvent.category, 'Recap', 'CommunityImpact'],
                                image: photosToPublish[0],
                                appreciates: 3,
                                inspirations: 4,
                                participated: 12,
                                commentsCount: 0,
                                isBookmarked: false
                              };
                              onPublishFeedPost(feedPostObj);
                            }

                            alert(`Success: Your post-event outcomes recap was successfully published with "${visVal}" visiblity!`);
                          }}
                          className="px-5 py-2.5 bg-primary text-on-primary rounded-xl text-xs font-black shadow-sm shrink-0 uppercase tracking-wide hover:bg-primary-hover cursor-pointer active:scale-95 transition-all"
                        >
                          Publish Recap Output
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Render beautifully designed public recap presentation of outcomes */
                  <div className="bg-white border rounded-2xl overflow-hidden shadow-2xs">
                    {selectedEvent.recap?.photos?.[0] && (
                      <div className="h-44 w-full relative">
                        <img src={selectedEvent.recap?.photos[0] || undefined} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4">
                          <div>
                            <span className="bg-primary text-on-primary text-[8px] font-extrabold px-2 py-0.5 rounded-full uppercase">Outcome Accomplished</span>
                            <h3 className="text-white text-sm font-black mt-1">{selectedEvent.title}</h3>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="p-4 space-y-4">
                      <div className="flex justify-between items-center pb-2 border-b">
                        <div className="flex items-center gap-2">
                          <img src={selectedEvent.organizerAvatar || undefined} className="w-6.5 h-6.5 rounded-full object-cover border" />
                          <div>
                            <p className="text-[10.5px] font-black">{selectedEvent.organizerName}</p>
                            <p className="text-[8.5px] text-outline">Organizer dispatch • Published Outcomes</p>
                          </div>
                        </div>
                        
                        <div className="flex gap-2.5">
                          <span className={`text-[8.5px] font-black px-2.5 py-0.5 rounded-full border ${
                            selectedEvent.recap?.visibility === 'Public' 
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-150' 
                              : 'bg-slate-50 text-slate-800 border-slate-150'
                          }`}>
                            👁️ {selectedEvent.recap?.visibility} Recap
                          </span>

                          {/* Edit Recap button for organizer / moderator */}
                          {(isOrganizer || (isModerator && selectedEvent.recap && selectedEvent.moderators?.find(m => m.name === profileName)?.permissions.publishEventRecap)) && (
                            <button
                              type="button"
                              onClick={() => {
                                setRecapPhotosList(selectedEvent.recap?.photos || []);
                                setIsEditingRecap(true);
                              }}
                              className="bg-slate-50 border hover:bg-slate-100 text-[9px] font-bold px-2.5 py-1 rounded cursor-pointer"
                            >
                              Edit Portfolio
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="bg-slate-50/50 p-3 rounded-xl border space-y-1 text-xs">
                        <h5 className="font-extrabold text-outline text-[10px] uppercase tracking-wider">💖 Host Thank You Note</h5>
                        <p className="italic text-on-surface-variant leading-relaxed">"{selectedEvent.recap?.thankYouNotes}"</p>
                      </div>

                      <div className="space-y-1.5 text-xs">
                        <h5 className="font-extrabold text-outline text-[10px] uppercase tracking-wider">📋 Narrative Summary</h5>
                        <p className="text-on-surface leading-relaxed">{selectedEvent.recap?.summary}</p>
                      </div>

                      {/* Bento-grid Statistics & Impact Values and Outcomes */}
                      <div className="grid grid-cols-3 gap-2 text-center pt-2">
                        <div className="bg-primary/5 border border-primary/10 p-2.5 rounded-xl">
                          <span className="text-[8px] uppercase font-bold text-outline">Outcomes Realized</span>
                          <p className="text-[10.5px] font-black text-primary mt-1 leading-tight">{selectedEvent.recap?.outcomes}</p>
                        </div>
                        <div className="bg-amber-50 border border-amber-100 p-2.5 rounded-xl">
                          <span className="text-[8px] uppercase font-bold text-outline">Verified Attendance</span>
                          <p className="text-[10.5px] font-black text-amber-900 mt-1 leading-tight">{selectedEvent.recap?.attendanceStats}</p>
                        </div>
                        <div className="bg-emerald-50 border border-emerald-100 p-2.5 rounded-xl">
                          <span className="text-[8px] uppercase font-bold text-outline">Tribe Impact Delivered</span>
                          <p className="text-[10.5px] font-black text-emerald-950 mt-1 leading-tight">{selectedEvent.recap?.communityImpact}</p>
                        </div>
                      </div>

                      {/* Mini Photo Grid for Recap attachments */}
                      {selectedEvent.recap?.photos && selectedEvent.recap.photos.length > 1 && (
                        <div className="space-y-1.5 pt-2 text-left">
                          <h5 className="font-extrabold text-outline text-[10px] uppercase tracking-wider">📸 Event Outcomes Portfolio</h5>
                          <div className="grid grid-cols-3 gap-2">
                            {selectedEvent.recap.photos.map((ph, pi) => (
                              <div key={pi} className="aspect-video rounded-lg overflow-hidden border">
                                <img src={ph || undefined} className="w-full h-full object-cover" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Sticky interaction input bar inside modal */}
          {(activeExpTab === 'discussion' && selectedEvent.isAttending) && (
            <div className="p-3 bg-surface border-t border-outline-variant/10 flex gap-2 shrink-0">
              {/* Photo Upload quick icon for authorized coordinators */}
              {(() => {
                const isOrganizer = selectedEvent.organizerName === profileName;
                const isModerator = selectedEvent.moderators?.some(m => m.name === profileName);
                const modRecord = selectedEvent.moderators?.find(m => m.name === profileName);
                const canUpload = isOrganizer || (isModerator && modRecord?.permissions.uploadEventImages);

                if (canUpload) {
                  return (
                    <button
                      type="button"
                      onClick={() => {
                        const url = prompt('Enter a direct web link for the photo you wish to post in chat:', 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&auto=format&fit=crop');
                        if (url) {
                          handleSendImageChat(url);
                        }
                      }}
                      className="p-2 border border-outline-variant/30 hover:bg-slate-50 text-outline rounded-xl active:scale-95 transition-all text-xs font-semibold shrink-0 cursor-pointer"
                      title="Post a chat photo"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                  );
                }
                return null;
              })()}

              <input
                type="text"
                placeholder="Ask questions or coordinate transport..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-grow border border-outline-variant/25 bg-surface-container-low rounded-xl text-xs px-3 focus:outline-none focus:ring-1 focus:ring-primary text-on-surface"
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <button 
                onClick={handleSendMessage}
                className="p-2 bg-primary text-on-primary rounded-xl active:scale-95 transition-all text-xs font-semibold shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Footer controls for RSVP levels */}
          <div className="p-4 bg-surface-container-low border-t border-outline-variant/10 flex justify-between items-center shrink-0">
            <div className="text-xs">
              <p className="text-on-surface font-semibold">Tribe RSVP Status</p>
              <p className="text-outline text-[11px] mt-0.5">{selectedEvent.isAttending ? `Status: ${selectedEvent.participationLevel || 'Confirmed'}` : 'Not Joined'}</p>
            </div>

            <button 
              onClick={() => executeRSVPToggle(selectedEvent, 'Confirmed')}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold active:scale-95 transition-all cursor-pointer ${selectedEvent.isAttending ? 'bg-surface-container border border-outline-variant/35 text-on-surface hover:bg-surface-container-high' : 'bg-primary text-on-primary shadow-sm hover:bg-primary/95'}`}
            >
              {selectedEvent.isAttending ? 'Withdraw Interest' : '🙌 Interested'}
            </button>
          </div>

        </div>
      ) : viewingFullSection ? (
        /* ==================== SUB-PAGE VIEW (NEW CONTENT INTERFACE) ==================== */
        renderFullSectionView()
      ) : (
        /* ==================== 8-SECTION ORDERED DISCOVER SCREEN ==================== */
          <>
          {/* 1. EVENTS NEAR YOU */}
          <section className="mb-5 bg-slate-50/50 p-4 rounded-2xl border border-outline-variant/10 shadow-3xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-outline-variant/10 pb-3 mb-3 select-none">
              <div>
                <h2 className="text-xs font-black uppercase tracking-wider text-[#2c3e50] flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-secondary animate-bounce" /> 
                  <span>Events Near You</span>
                </h2>
                <p className="text-[9.5px] text-outline font-semibold">
                  Range: <span className="text-secondary font-black">{selectedRadius === 'Custom' ? `${customRadiusValue} km (Custom)` : `${selectedRadius} km`}</span>
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setViewingFullSection('near')}
                  className="px-2.5 py-1 bg-primary/10 border border-primary/20 text-primary hover:bg-primary/15 rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center gap-0.5 transition-all cursor-pointer"
                >
                  <span>View Near You →</span>
                </button>

                {/* Radius Control Trigger */}
                <button
                  type="button"
                  onClick={() => setIsChangingRadius(!isChangingRadius)}
                  className="px-2.5 py-1 bg-white border border-outline-variant/20 text-outline hover:text-on-surface hover:bg-neutral-50 rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer shadow-3xs"
                >
                  <Sliders className="w-3 h-3 text-primary" />
                  <span>Adjust Radius</span>
                </button>
              </div>
            </div>

            {/* Change Radius Inline Selector */}
            {isChangingRadius && (
              <div className="p-3 bg-white border border-outline-variant/20 rounded-xl mb-3 shadow-3xs space-y-2 animate-in slide-in-from-top-1 duration-150">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase text-outline">Select Proximity Range</span>
                  <button 
                    onClick={() => setIsChangingRadius(false)}
                    className="text-primary text-[9px] font-bold uppercase tracking-wider hover:underline"
                  >
                    Close
                  </button>
                </div>

                <div className="flex flex-wrap gap-1">
                  {([5, 10, 25, 50, 100, 'Custom'] as const).map((r) => {
                    const isSelected = selectedRadius === r;
                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setSelectedRadius(r)}
                        className={`px-2.5 py-1 rounded-lg text-[9px] font-black transition-all cursor-pointer ${isSelected ? 'bg-primary border-primary text-white' : 'bg-neutral-50 border-outline-variant/10 text-on-surface-variant hover:bg-neutral-100'}`}
                      >
                        {r === 'Custom' ? 'Custom Range' : `${r} km`}
                      </button>
                    );
                  })}
                </div>

                {selectedRadius === 'Custom' && (
                  <div className="pt-1">
                    <div className="flex justify-between items-center text-[9px] text-outline font-bold mb-1">
                      <span>Radius limit</span>
                      <span className="text-secondary font-black">{customRadiusValue} km</span>
                    </div>
                    <input 
                      type="range" 
                      min="1" 
                      max="150" 
                      value={customRadiusValue} 
                      onChange={(e) => setCustomRadiusValue(Number(e.target.value))}
                      className="w-full accent-primary h-1 bg-neutral-100 rounded cursor-pointer"
                    />
                  </div>
                )}
              </div>
            )}

            {/* List near events */}
            <div className="mt-1">
              {renderSectionScroll(
                nearEvents,
                (evt) => renderEventCard(evt, 'near', true),
                () => setViewingFullSection('near'),
                <div className="p-4 text-center bg-white rounded-xl border border-dashed border-outline-variant/20 select-none">
                  <p className="text-outline text-xs">No active gatherings found within {selectedRadius === 'Custom' ? customRadiusValue : selectedRadius} km.</p>
                  <p className="text-[9px] text-outline-variant mt-0.5 font-semibold">Broaden your neighborhood coverage with "Adjust Radius".</p>
                </div>
              )}
            </div>
          </section>

          {/* 2. HAPPENING TODAY */}
          {(() => {
            const todayEvents = events.filter(e => !e.suspended && !e.isCompleted && String(e.date || '').toLowerCase().includes('today'));
            return (
              <section className="mb-5 bg-slate-50/50 p-4 rounded-xl border border-outline-variant/10 shadow-3xs">
                <div className="flex items-center justify-between mb-3 border-b border-outline-variant/10 pb-3">
                  <h2 className="text-xs font-black uppercase tracking-wider text-[#2c3e50] flex items-center gap-1.5 select-none">
                    <Clock className="w-4 h-4 text-primary" /> 
                    <span>Happening Today</span>
                  </h2>

                  <button
                    type="button"
                    onClick={() => setViewingFullSection('today')}
                    className="px-2.5 py-1 bg-primary/10 border border-primary/20 text-primary hover:bg-primary/15 rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center gap-0.5 transition-all cursor-pointer"
                  >
                    <span>View Today →</span>
                  </button>
                </div>

                <div className="mt-1">
                  {renderSectionScroll(
                    todayEvents,
                    (evt) => renderEventCard(evt, 'today', true),
                    () => setViewingFullSection('today'),
                    <div className="p-4 text-center bg-white rounded-xl border border-dashed border-outline-variant/20">
                      <p className="text-xs text-outline font-semibold">No community events matching today's timeline.</p>
                      <p className="text-[9px] text-outline-variant mt-0.5 font-semibold">Have free coordinates? Host a gather!</p>
                    </div>
                  )}
                </div>
              </section>
            );
          })()}

          {/* 3. THIS WEEKEND */}
          {(() => {
            const weekendEvents = events.filter(e => !e.suspended && !e.isCompleted && (
              String(e.date || '').toLowerCase().includes('weekend') || 
              String(e.date || '').toLowerCase().includes('saturday') || 
              String(e.date || '').toLowerCase().includes('sunday')
            ));
            return (
              <section className="mb-5 bg-slate-50/50 p-4 rounded-xl border border-outline-variant/10 shadow-3xs">
                <div className="flex items-center justify-between mb-3 border-b border-outline-variant/10 pb-3">
                  <h2 className="text-xs font-black uppercase tracking-wider text-[#2c3e50] flex items-center gap-1.5 select-none">
                    <Calendar className="w-4 h-4 text-[#3498db]" /> 
                    <span>This Weekend</span>
                  </h2>

                  <button
                    type="button"
                    onClick={() => setViewingFullSection('weekend')}
                    className="px-2.5 py-1 bg-primary/10 border border-primary/20 text-primary hover:bg-primary/15 rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center gap-0.5 transition-all cursor-pointer animate-none"
                  >
                    <span>View Weekend →</span>
                  </button>
                </div>

                <div className="mt-1">
                  {renderSectionScroll(
                    weekendEvents,
                    (evt) => renderEventCard(evt, 'weekend', true),
                    () => setViewingFullSection('weekend'),
                    <div className="p-4 text-center bg-white rounded-xl border border-dashed border-outline-variant/20">
                      <p className="text-xs text-outline font-semibold">No community gathers scheduled for this weekend yet.</p>
                      <p className="text-[9px] text-outline-variant mt-0.5 font-semibold">Launch a neighborhood gather to rally allies.</p>
                    </div>
                  )}
                </div>
              </section>
            );
          })()}

          {/* 4. YOUR ACTIVITY */}
          {(() => {
            const upcomingRegistered = events.filter(e => !e.suspended && e.isAttending && !e.isCompleted);
            const previouslyCompleted = events.filter(e => !e.suspended && e.isCompleted && e.isAttending);
            const ongoingEvents = upcomingRegistered.filter(e => String(e.date || '').toLowerCase().includes('today') || String(e.date || '').toLowerCase().includes('now'));
            
            const allMyActivityEvents = [...ongoingEvents, ...upcomingRegistered, ...previouslyCompleted];

            return (
              <section className="mb-5 bg-slate-50/50 p-4 rounded-xl border border-outline-variant/10 shadow-3xs">
                <div className="flex items-center justify-between mb-3 border-b border-outline-variant/10 pb-3">
                  <h2 className="text-xs font-black uppercase tracking-wider text-[#2c3e50] flex items-center gap-1.5 select-none">
                    <span className="text-emerald-600">⚡</span>
                    <span>Your Activity</span>
                  </h2>

                  <button
                    type="button"
                    onClick={() => setViewingFullSection('activity')}
                    className="px-2.5 py-1 bg-primary/10 border border-primary/20 text-primary hover:bg-primary/15 rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center gap-0.5 transition-all cursor-pointer animate-none"
                  >
                    <span>View Activity →</span>
                  </button>
                </div>

                <div className="mt-1">
                  {renderSectionScroll(
                    allMyActivityEvents,
                    (evt) => renderEventCard(evt, 'activity', true),
                    () => setViewingFullSection('activity'),
                    <div className="p-4 text-center bg-white rounded-xl border border-dashed border-outline-variant/15 text-outline select-none">
                      <p className="text-xs font-semibold text-on-surface">No local activity logs yet.</p>
                      <p className="text-[9px] text-outline mt-1 max-w-xs mx-auto">Commit to neighborhood opportunities below to make block impacts!</p>
                    </div>
                  )}
                </div>
              </section>
            );
          })()}

          {/* 5. SAVED / INTERESTED EVENTS */}
          {(() => {
            const savedEvents = events.filter(e => !e.suspended && (savedEventIds.includes(e.id) || e.participationLevel === 'Interested' || e.participationLevel === 'Maybe'));
            return (
              <section className="mb-5 bg-pink-50/10 p-4 rounded-xl border border-pink-100/20 shadow-3xs">
                <div className="flex items-center justify-between mb-3 border-b border-pink-100/35 pb-3 select-none">
                  <h2 className="text-xs font-black uppercase tracking-wider text-[#9c27b0] flex items-center gap-1.5">
                    <Heart className="w-5 h-5 text-secondary fill-secondary" />
                    <span>Saved & Interested Gathers ({savedEvents.length})</span>
                  </h2>

                  <button
                    type="button"
                    onClick={() => setViewingFullSection('saved')}
                    className="px-2.5 py-1 bg-primary/10 border border-primary/20 text-primary hover:bg-primary/15 rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center gap-0.5 transition-all cursor-pointer animate-none"
                  >
                    <span>View Saved →</span>
                  </button>
                </div>

                <div className="mt-1">
                  {renderSectionScroll(
                    savedEvents,
                    (evt) => renderEventCard(evt, 'saved', true),
                    () => setViewingFullSection('saved'),
                    <div className="p-4 text-center bg-white rounded-xl border border-dashed border-outline-variant/10 text-outline">
                      <p className="text-xs font-semibold">Your watchlist is empty.</p>
                      <p className="text-[9px] text-outline-variant mt-0.5">Tap the heart on event cards to bookmark coordinates.</p>
                    </div>
                  )}
                </div>
              </section>
            );
          })()}

          {/* 6. SUGGESTED FOR YOU */}
          {(() => {
            const hasSuggestions = suggestedEvents && suggestedEvents.length > 0;
            return (
              <section className="mb-5 bg-indigo-50/10 border border-indigo-100/20 p-4 rounded-xl shadow-3xs">
                <div className="flex items-center justify-between mb-3 border-b border-outline-variant/10 pb-3 select-none">
                  <div className="text-left">
                    <h2 className="text-xs font-black uppercase tracking-wider text-[#2c3e50] flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                      <span>Suggested For You</span>
                    </h2>
                    <p className="text-[9px] text-outline font-semibold mt-0.5">Matching your interests and coordinates.</p>
                  </div>

                  {hasSuggestions && (
                    <button
                      type="button"
                      onClick={() => setViewingFullSection('suggested')}
                      className="px-2.5 py-1 bg-primary/10 border border-primary/20 text-primary hover:bg-primary/15 rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center gap-0.5 transition-all cursor-pointer animate-none"
                    >
                      <span>View Suggested →</span>
                    </button>
                  )}
                </div>

                <div className="mt-1">
                  {renderSectionScroll(
                    suggestedEvents,
                    ({ event: evt, score }) => {
                      const percent = Math.min(99, Math.round(20 + score * 0.7));
                      return (
                        <div key={evt.id} className="relative shrink-0 select-none">
                          <div className="absolute top-2 right-2 z-10 bg-primary/15 border border-primary/25 text-primary text-[8px] font-black px-1.5 py-0.5 rounded shadow-3xs">
                            ✨ {percent}% Match
                          </div>
                          {renderEventCard(evt, 'suggested', true)}
                        </div>
                      );
                    },
                    () => setViewingFullSection('suggested'),
                    <div className="p-4 text-center bg-white rounded-xl border border-dashed border-outline-variant/10 text-outline">
                      <p className="text-xs font-semibold">Refine your Profile Interests to generate custom suggestions.</p>
                    </div>
                  )}
                </div>
              </section>
            );
          })()}

          {/* 7. TRUSTED ORGANIZERS */}
          <section className="mb-5 bg-slate-50/50 p-4 rounded-xl border border-outline-variant/10 shadow-3xs">
            <div className="flex items-center justify-between mb-3 border-b border-outline-variant/10 pb-3 select-none">
              <h2 className="text-xs font-black uppercase tracking-wider text-[#2c3e50] flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-emerald-600" />
                <span>Trusted Organizers</span>
              </h2>

              <button
                type="button"
                onClick={() => setViewingFullSection('organizers')}
                className="px-2.5 py-1 bg-primary/10 border border-primary/20 text-primary hover:bg-primary/15 rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center gap-0.5 transition-all cursor-pointer animate-none"
              >
                <span>View Organizers →</span>
              </button>
            </div>

            <div className="mt-1">
              {renderSectionScroll(
                [
                  {
                    name: 'David Atten',
                    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
                    rank: 'Coastal Bay Sector Lead',
                    conducted: 24,
                    reliability: 97,
                    bio: 'Passionate marine ecology, biodiversity, and coastal cleanups. Spearheading shoreline garbage monitoring and micro-plastic extraction programs.'
                  },
                  {
                    name: 'Elena Rossi',
                    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
                    rank: 'Youth Literacy Moderator',
                    conducted: 8,
                    reliability: 96,
                    bio: 'Educational coordinator. Oversees smart tutoring hubs, homework workshops, and primary curriculum supplements.'
                  },
                  {
                    name: 'Sarah Jenkins',
                    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
                    rank: 'Municipal Cycle Host',
                    conducted: 45,
                    reliability: 98,
                    bio: 'Community cyclist. Leads safe paced pacing groups, mountain bike path restorations, and urban bike safety courses.'
                  }
                ],
                (org) => (
                  <div 
                    key={org.name}
                    className="w-[180px] sm:w-[200px] shrink-0 snap-start bg-white border border-outline-variant/10 hover:shadow-xs rounded-xl p-3 flex flex-col justify-between text-left transition-all select-none min-h-[190px]"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <img src={org.avatar} alt={org.name} className="w-8 h-8 rounded-full object-cover shrink-0 border border-outline-variant/10" />
                        <div className="min-w-0">
                          <h4 className="font-extrabold text-[11px] text-on-surface truncate flex items-center gap-0.5">
                            {org.name} <span className="text-primary text-[8px]">🛡️</span>
                          </h4>
                          <p className="text-[8px] text-outline truncate">{org.rank}</p>
                        </div>
                      </div>
                      <p className="text-[9px] text-outline line-clamp-2 leading-tight mb-2">{org.bio}</p>
                    </div>

                    <div className="border-t border-outline-variant/10 pt-2">
                      <div className="flex justify-between items-center text-[8.5px] text-outline font-bold mb-1">
                        <span>Gathers:</span>
                        <span className="text-on-surface font-extrabold">{org.conducted}</span>
                      </div>
                      <div className="flex justify-between items-center text-[8.5px] text-outline font-bold">
                        <span>Reliability:</span>
                        <span className="text-emerald-700 font-extrabold">{org.reliability}%</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedProfileUser({
                          name: org.name,
                          avatar: org.avatar,
                          verificationStatus: 'Trusted Organizer',
                          bio: org.bio,
                          location: 'Downtown Hubs Area'
                        })}
                        className="w-full mt-2 py-1 bg-neutral-50 hover:bg-neutral-100 border border-outline-variant/10 text-[8px] font-black uppercase text-outline rounded active:scale-95 transition-all text-center select-none cursor-pointer"
                      >
                        Shield Profile
                      </button>
                    </div>
                  </div>
                ),
                () => setViewingFullSection('organizers'),
                null
              )}
            </div>
          </section>

          {/* 8. BROWSE CATEGORIES */}
          <section className="mb-6">
            <div className="flex items-center justify-between mb-3 border-b border-outline-variant/10 pb-2 select-none">
              <h2 className="text-xs font-black uppercase tracking-wider text-outline flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-[#e67e22]" />
                <span>Browse Categories</span>
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { name: 'Volunteering', icon: '🙌', color: 'bg-emerald-50 border-emerald-100 text-emerald-800' },
                { name: 'Environment', icon: '🌱', color: 'bg-green-50 border-green-100 text-green-800' },
                { name: 'Education', icon: '📚', color: 'bg-amber-50 border-amber-100 text-amber-800' },
                { name: 'Cycling', icon: '🚴', color: 'bg-blue-50 border-blue-100 text-blue-800' },
                { name: 'Yoga & Meditation', icon: '🧘', color: 'bg-indigo-50 border-indigo-100 text-indigo-800' },
                { name: 'Reading', icon: '📖', color: 'bg-purple-50 border-purple-100 text-purple-800' },
                { name: 'Photography', icon: '📷', color: 'bg-slate-50 border-slate-100 text-slate-800' },
                { name: 'Technology', icon: '💻', color: 'bg-cyan-50 border-cyan-100 text-cyan-800' },
                { name: 'Pets & Animals', icon: '🐕', color: 'bg-pink-50 border-pink-100 text-pink-800' },
                { name: 'Wellness', icon: '✨', color: 'bg-teal-50 border-teal-100 text-teal-800' },
                { name: 'Social Causes', icon: '✊', color: 'bg-red-50 border-red-100 text-red-800' }
              ].map((cat, ci) => (
                <button
                  key={ci}
                  type="button"
                  onClick={() => {
                    // Activate search overlay and input selected category
                    setSearchQuery(cat.name);
                    const triggerBtn = document.querySelector('[title="Search and filter events/hubs"]');
                    if (triggerBtn) {
                      (triggerBtn as HTMLButtonElement).click();
                    }
                  }}
                  className={`p-2 sm:p-2.5 border rounded-xl flex items-center gap-2 transition-all cursor-pointer active:scale-95 text-left text-[11px] font-bold shadow-3xs hover:shadow-2xs ${cat.color}`}
                >
                  <span className="text-sm shrink-0 select-none">{cat.icon}</span>
                  <span className="truncate">{cat.name}</span>
                </button>
              ))}
            </div>
          </section>
        </>
      )}

      {/* Advanced Search Filter Modal/Bottom Sheet */}
      {showAdvancedSearch && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-55 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200 select-none">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-outline-variant/10 pb-4 mb-5">
              <div className="flex items-center gap-2 text-primary">
                <Sliders className="w-5 h-5 text-primary" />
                <div>
                  <h3 className="font-extrabold text-sm uppercase tracking-wider text-on-surface">Advanced Search Filters</h3>
                  <p className="text-[10px] text-outline font-semibold">Refine matching events list</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAdvancedSearch(false)}
                className="p-1.5 hover:bg-neutral-100 rounded-full cursor-pointer transition-colors"
                type="button"
              >
                <X className="w-5 h-5 text-on-surface" />
              </button>
            </div>

            {/* Content Form Scroll area */}
            <div className="space-y-6">
              
              {/* Location filters */}
              <div>
                <h4 className="text-[10px] uppercase font-black tracking-widest text-outline mb-3">📍 Location Filters</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[9px] font-bold text-outline mb-1 uppercase tracking-wider">Country</label>
                    <input 
                      type="text" 
                      placeholder="e.g. USA" 
                      value={draftCountry} 
                      onChange={(e) => setDraftCountry(e.target.value)} 
                      className="w-full h-10 px-3 bg-neutral-50 border border-outline-variant/20 rounded-xl text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-outline mb-1 uppercase tracking-wider">State</label>
                    <input 
                      type="text" 
                      placeholder="e.g. NY" 
                      value={draftState} 
                      onChange={(e) => setDraftState(e.target.value)} 
                      className="w-full h-10 px-3 bg-neutral-50 border border-outline-variant/20 rounded-xl text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-outline mb-1 uppercase tracking-wider">City</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Eastside" 
                      value={draftCity} 
                      onChange={(e) => setDraftCity(e.target.value)} 
                      className="w-full h-10 px-3 bg-neutral-50 border border-outline-variant/20 rounded-xl text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Proximity / Radius Filter */}
              <div className="bg-neutral-50/50 rounded-2xl p-4 border border-outline-variant/15 space-y-3">
                <div className="flex justify-between items-center select-none">
                  <div>
                    <h4 className="text-[10px] uppercase font-black tracking-widest text-[#2c3e50] flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-secondary animate-bounce" /> Proximity Range Limit
                    </h4>
                    <p className="text-[9px] text-outline font-semibold mt-0.5">
                      Current limit: <span className="text-secondary font-black">{selectedRadius === 'Custom' ? `${customRadiusValue} km (Custom)` : `${selectedRadius} km`}</span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {([5, 10, 25, 50, 100] as const).map((r) => {
                    const isSelected = selectedRadius === r;
                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setSelectedRadius(r)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${isSelected ? 'bg-primary border-primary text-white font-extrabold' : 'bg-white border-outline-variant/25 text-on-surface-variant hover:bg-neutral-100/50'}`}
                      >
                        {r} km
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => setSelectedRadius('Custom')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${selectedRadius === 'Custom' ? 'bg-primary border-primary text-white font-extrabold' : 'bg-white border-outline-variant/25 text-on-surface-variant hover:bg-neutral-100/50'}`}
                  >
                    Custom Range
                  </button>
                </div>

                {selectedRadius === 'Custom' && (
                  <div className="pt-2">
                    <div className="flex justify-between items-center text-xs text-outline font-bold mb-1">
                      <span>Radius limit</span>
                      <span className="text-secondary font-black">{customRadiusValue} km</span>
                    </div>
                    <input 
                      type="range" 
                      min="1" 
                      max="150" 
                      value={customRadiusValue} 
                      onChange={(e) => setCustomRadiusValue(Number(e.target.value))}
                      className="w-full h-1 bg-outline-variant rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>
                )}
              </div>

              {/* Date filters */}
              <div>
                <h4 className="text-[10px] uppercase font-black tracking-widest text-outline mb-3">📅 Date Filters</h4>
                <div className="flex flex-wrap gap-2 mb-3">
                  {(['All', 'Today', 'This Week', 'This Month', 'Custom'] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setDraftDateMode(mode)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${draftDateMode === mode ? 'bg-primary border-primary text-white font-extrabold' : 'bg-neutral-50 border-outline-variant/25 text-on-surface-variant hover:bg-neutral-100'}`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>

                {draftDateMode === 'Custom' && (
                  <div className="grid grid-cols-2 gap-3 p-3 bg-neutral-50 rounded-2xl border border-outline-variant/20">
                    <div>
                      <label className="block text-[9px] font-bold text-outline mb-1 uppercase tracking-wider">Start Date</label>
                      <input 
                        type="date" 
                        value={draftCustomStart}
                        onChange={(e) => setDraftCustomStart(e.target.value)}
                        className="w-full h-9 px-2 bg-white border border-outline-variant/30 rounded-lg text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-outline mb-1 uppercase tracking-wider">End Date</label>
                      <input 
                        type="date" 
                        value={draftCustomEnd}
                        onChange={(e) => setDraftCustomEnd(e.target.value)}
                        className="w-full h-9 px-2 bg-white border border-outline-variant/30 rounded-lg text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Category filters */}
              <div>
                <h4 className="text-[10px] uppercase font-black tracking-widest text-outline mb-3">🏷️ Category Filters</h4>
                <div className="flex flex-wrap gap-1.5">
                  {advancedCategoriesList.map((cat) => {
                    const isSelected = draftCategories.includes(cat);
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => toggleDraftCategory(cat)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${isSelected ? 'bg-secondary border-secondary text-white' : 'bg-neutral-50 border-outline-variant/25 text-on-surface-variant hover:bg-neutral-100'}`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Organizer and Event Access Filters Group */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                <div>
                  <h4 className="text-[10px] uppercase font-black tracking-widest text-outline mb-2.5">🛡️ Organizer Filters</h4>
                  <label className="flex items-center gap-2.5 cursor-pointer py-1 select-none">
                    <input 
                      type="checkbox" 
                      checked={draftVerifiedOnly} 
                      onChange={(e) => setDraftVerifiedOnly(e.target.checked)} 
                      className="w-4 h-4 rounded border-outline-variant/35 text-primary focus:ring-primary"
                    />
                    <span className="text-xs font-semibold text-on-surface">Verified Organizers Only</span>
                  </label>
                </div>

                <div>
                  <h4 className="text-[10px] uppercase font-black tracking-widest text-outline mb-2.5">🔑 Event Access</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {(['All', 'Open', 'Approval Required', 'Invite Only'] as const).map((mode) => {
                      const isSelected = draftAccessFilter === mode;
                      return (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => setDraftAccessFilter(mode)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${isSelected ? 'bg-primary border-primary text-white font-extrabold' : 'bg-neutral-50 border-outline-variant/25 text-on-surface-variant hover:bg-neutral-100'}`}
                        >
                          {mode}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

            </div>

            {/* Bottom Actions footer */}
            <div className="flex gap-3 justify-end mt-7 pt-4 border-t border-outline-variant/10">
              <button 
                type="button"
                onClick={handleResetFilters}
                className="px-4 py-2.5 text-xs font-bold text-outline rounded-xl hover:bg-neutral-100 hover:text-on-surface transition-colors cursor-pointer animate-none"
              >
                Reset Filters
              </button>
              <button 
                type="button"
                onClick={handleApplyFilters}
                className="px-6 py-2.5 bg-primary hover:bg-primary/95 text-on-primary text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md active:scale-95 animate-none"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Flag Report Modal popup */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-surface rounded-2xl w-full max-w-sm p-5 shadow-xl relative select-none">
            <h3 className="font-bold text-sm text-red-600 flex items-center gap-1.5 mb-2">
              <AlertTriangle className="w-5 h-5 animate-pulse" /> Safety Investigation Request
            </h3>
            <p className="text-xs text-on-surface-variant mb-4 leading-relaxed">
              We enforce civil and safety protocols. Immediately flag events featuring matchmaking, non-transparent relationships, spam, or misleading promotional plans.
            </p>

            <div className="space-y-3">
              {[
                'Dating / Matchmaking solicitation',
                'Unrelated network advertising or self-promotion',
                'Fake location, date, or organizer identity',
                'Harassment / Discourtesy violation',
                'Offensive or adult content'
              ].map((opt) => (
                <button
                  key={opt}
                  onClick={() => setReportReason(opt)}
                  className={`w-full text-left p-2.5 rounded-xl text-xs font-semibold border transition-all ${reportReason === opt ? 'bg-primary/5 border-primary text-primary' : 'bg-surface hover:bg-surface-container border-outline-variant/25 text-on-surface-variant'}`}
                >
                  {opt}
                </button>
              ))}
            </div>

            <div className="flex gap-2 justify-end mt-5 pt-3 border-t border-outline-variant/10">
              <button 
                onClick={() => {
                  setShowReportModal(null);
                  setReportReason('');
                }}
                className="px-4 py-2 text-xs font-bold text-outline rounded-xl hover:bg-surface-container"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleReportSubmit(showReportModal)}
                disabled={!reportReason}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all"
              >
                Submit Flag Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Completion Evidence Submission Form modal popup */}
      {showCompletionForm && selectedEvent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-surface rounded-3xl w-full max-w-md p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-200 my-8">
            <button 
              onClick={() => setShowCompletionForm(false)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface p-1 rounded-full cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4 text-emerald-700">
              <Receipt className="w-6 h-6" />
              <h3 className="font-extrabold text-sm uppercase tracking-wider">Event Completion Verification Form</h3>
            </div>
            
            <form onSubmit={submitCompletionWorkflow} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-outline mb-1">Quantity of Attendees Verified *</label>
                <input 
                  type="number" 
                  required
                  value={attendanceCountEv}
                  onChange={(e) => setAttendanceCountEv(Number(e.target.value))}
                  className="w-full h-11 px-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs focus:ring-1 focus:ring-emerald-700" 
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-outline mb-1">Physical Location & GPS Sign-in Proof *</label>
                <input 
                  type="text" 
                  required
                  value={venueProofText}
                  onChange={(e) => setVenueProofText(e.target.value)}
                  className="w-full h-11 px-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs focus:ring-1 focus:ring-emerald-700" 
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-outline mb-1">Photograph Evidence of Completion (URL) *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Photo of volunteer group planting Trees"
                  value={photoSubmissionText}
                  onChange={(e) => setPhotoSubmissionText(e.target.value)}
                  className="w-full h-11 px-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs focus:ring-1 focus:ring-emerald-700" 
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-outline mb-1">Expense Log or Supporting Receipts (Optional)</label>
                <textarea 
                  rows={2}
                  placeholder="e.g. $12.50 spade tool rental list"
                  value={expenseReceipts}
                  onChange={(e) => setExpenseReceipts(e.target.value)}
                  className="w-full p-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs focus:ring-1 focus:ring-emerald-700 resize-none" 
                />
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                <p className="text-[9px] text-emerald-800 leading-normal">
                  By submitting, you certify that the event was conducted with safety, purpose, and community guideline adherence. Misleading credentials will suspend your organizer license.
                </p>
              </div>

              <button 
                type="submit"
                className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition-all shadow-md mt-4"
              >
                Submit Conduct Evidence to Council
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Attendee/Host Profile Details Modal Popup (Standard ToGather Profile Shield) */}
      {selectedProfileUser && (
        <div className="fixed inset-0 z-55 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div 
            id="attendee-profile-popup"
            className="bg-white border border-outline-variant/15 w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
          >
            {/* Header Shield */}
            <div className="bg-primary/5 p-4 border-b border-outline-variant/10 flex justify-between items-center text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase text-primary bg-primary/10 px-2 py-0.5 rounded-full">Community Shield Verified</span>
              </div>
              <button
                onClick={() => setSelectedProfileUser(null)}
                className="p-1 px-2.5 bg-surface-container hover:bg-surface-high border border-outline-variant/20 rounded-xl text-[10px] font-black uppercase text-outline shrink-0 cursor-pointer"
              >
                Close
              </button>
            </div>

            {/* Content card */}
            <div className="p-6 text-center space-y-4 text-left">
              <div className="flex flex-col items-center">
                <img 
                  src={selectedProfileUser.avatar || undefined} 
                  alt={selectedProfileUser.name} 
                  className="w-16 h-16 rounded-full object-cover border-2 border-primary/30 shadow-sm" 
                />
                <h4 className="text-sm font-extrabold text-on-surface mt-3">{selectedProfileUser.name}</h4>
                
                {/* Verification badge display */}
                <div className="mt-1.5 flex items-center gap-1 text-[9.5px] font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                  🛡️ {selectedProfileUser.verificationStatus || 'Community Member'}
                </div>
              </div>

              {/* Bio & Location Details */}
              <div className="space-y-3 pt-2 text-left">
                {selectedProfileUser.bio && (
                  <div className="space-y-1">
                    <span className="text-[8.5px] font-bold text-outline uppercase tracking-wider block">About Neighbor</span>
                    <p className="text-xs text-on-surface-variant leading-relaxed bg-surface-container-low p-3 rounded-2xl border border-outline-variant/5">
                      {selectedProfileUser.bio}
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-2 text-xs text-outline font-semibold bg-surface-container-low/50 p-2.5 rounded-xl border">
                  <span>📍 Primary Station:</span>
                  <span className="text-on-surface-variant font-bold">{selectedProfileUser.location || 'Eco Region A'}</span>
                </div>
              </div>

              {/* ToGather Philosophies Callout */}
              <div className="pt-2 border-t border-outline-variant/10 text-center">
                <p className="text-[8.5px] text-outline leading-normal italic">
                  ❝ ToGather keeps neighborhood communication secure and public. Tapping other participants displays standard badges only. Private direct messaging is disabled to prevent siloed or unmoderated coordination. ❞
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
