/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Hub, MessageEntity, EventEntity } from '../types';
import { 
  Search, 
  Bike, 
  Flame, 
  Plus, 
  Compass, 
  Check, 
  ArrowRight,
  TrendingUp,
  UserPlus,
  Shield,
  Activity,
  Award,
  Users,
  Leaf,
  GraduationCap,
  Heart,
  Calendar,
  Layers,
  X,
  Send,
  Pin,
  FileText,
  AlertTriangle,
  Lock,
  SlidersHorizontal,
  Sliders,
  ArrowLeft,
  MapPin,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { APPROVED_CATEGORIES } from '../data';

interface MyHubsTabProps {
  hubs: Hub[];
  onToggleJoin: (hubId: string) => void;
  onNavigateToDiscover: () => void;
  onShowAuthModal: () => void;
  isLoggedIn: boolean;
  onReportHub?: (hubId: string, reason: string) => void;
  events: EventEntity[];
  onAddHubMessage?: (hubId: string, type: 'announcements' | 'discussionMessages', text: string) => void;
  initialHubId?: string;
  onClearInitialHubId?: () => void;
  onPublishHubUpdate?: (hubId: string, updateData: { text: string; updateType: string; isFeedUpdate: boolean; photoUrl?: string }) => void;
  isSearchOverlayOpen?: boolean;
  onCloseSearchOverlay?: () => void;
  searchQuery?: string;
  onSearchQueryChange?: (query: string) => void;
}

export default function MyHubsTab({ 
  hubs, 
  onToggleJoin, 
  onNavigateToDiscover, 
  onShowAuthModal,
  isLoggedIn,
  onReportHub,
  events,
  onAddHubMessage,
  initialHubId,
  onClearInitialHubId,
  onPublishHubUpdate,
  isSearchOverlayOpen = false,
  onCloseSearchOverlay,
  searchQuery = '',
  onSearchQueryChange
}: MyHubsTabProps) {
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const activeSearchQuery = searchQuery !== undefined ? searchQuery : localSearchQuery;
  
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

  React.useEffect(() => {
    localStorage.setItem('togather_nearby_radius', String(selectedRadius));
  }, [selectedRadius]);

  React.useEffect(() => {
    localStorage.setItem('togather_custom_radius_value', String(customRadiusValue));
  }, [customRadiusValue]);

  const [selectedHub, setSelectedHub] = useState<Hub | null>(null);

  React.useEffect(() => {
    if (initialHubId) {
      const hub = hubs.find(h => h.id === initialHubId);
      if (hub) {
        setSelectedHub(hub);
        if (onClearInitialHubId) {
          onClearInitialHubId();
        }
      }
    }
  }, [initialHubId, hubs, onClearInitialHubId]);

  // Keep selectedHub synchronized with latest hubs prop records
  React.useEffect(() => {
    if (selectedHub) {
      const latest = hubs.find(h => h.id === selectedHub.id);
      if (latest) {
        setSelectedHub(latest);
      }
    }
  }, [hubs]);

  const [activeDetailTab, setActiveDetailTab] = useState<'about' | 'events' | 'past' | 'members' | 'discussion' | 'gallery' | 'announcements'>('about');
  const [newMessageText, setNewMessageText] = useState('');
  const [reportReason, setReportReason] = useState('');
  const [showReportModal, setShowReportModal] = useState<string | null>(null);

  // Form states for creating Announcements/Bulletins
  const [announcementText, setAnnouncementText] = useState('');
  const [announcementType, setAnnouncementType] = useState('Challenge Announcement');
  const [isFeedBroadcast, setIsFeedBroadcast] = useState(true);
  const [announcementPhotoUrl, setAnnouncementPhotoUrl] = useState('');

  // Expandable filters section state
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);

  // Advanced filters local controls
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterAccessType, setFilterAccessType] = useState('All');
  const [filterActivity, setFilterActivity] = useState('All');
  const [filterCountry, setFilterCountry] = useState('');
  const [filterState, setFilterState] = useState('');
  const [filterCity, setFilterCity] = useState('');

  // Applied filters checked state
  const [appliedFilters, setAppliedFilters] = useState({
    category: 'All',
    accessType: 'All',
    activity: 'All',
    country: '',
    state: '',
    city: ''
  });

  // Icon mapper helper
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Bike': return <Bike className="w-5 h-5 text-sky-600" />;
      case 'Leaf': return <Leaf className="w-5 h-5 text-emerald-600" />;
      case 'GraduationCap': return <GraduationCap className="w-5 h-5 text-amber-600" />;
      case 'Activity': return <Activity className="w-5 h-5 text-purple-600" />;
      case 'Heart': return <Heart className="w-5 h-5 text-red-600" />;
      default: return <Compass className="w-5 h-5 text-slate-500" />;
    }
  };

  const getHubAccessType = (hub: Hub) => {
    if (hub.id === 'hub-2' || hub.id === 'hub-5') return 'Approval Required';
    return 'Open to Join';
  };

  const getHubSizeClass = (hub: Hub) => {
    if (hub.members < 250) return 'Small';
    if (hub.members <= 500) return 'Medium';
    return 'Large';
  };

  const getHubLocation = (hubId: string) => {
    switch (hubId) {
      case 'hub-1': return { country: 'USA', state: 'California', city: 'San Francisco' };
      case 'hub-2': return { country: 'USA', state: 'California', city: 'Oakland' };
      case 'hub-3': return { country: 'Canada', state: 'Ontario', city: 'Toronto' };
      case 'hub-4': return { country: 'USA', state: 'New York', city: 'New York' };
      case 'hub-5': return { country: 'UK', state: 'England', city: 'London' };
      default: return { country: 'USA', state: 'California', city: 'San Francisco' };
    }
  };

  // Split hubs into joined and exploring
  const joinedHubs = hubs.filter(h => h.isJoined && !h.suspended);
  const availableHubs = hubs.filter(h => !h.suspended);

  const getHubProximityKm = (hubId: string) => {
    const { country, state, city } = getHubLocation(hubId);
    const combined = `${city}, ${state}, ${country}`;
    const charSum = combined.split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
    // Standardized mathematical spread between 1.0 km and 59.8 km
    const kmScale = 1.2 + (charSum % 14) * 4.1;
    return Number(kmScale.toFixed(1));
  };

  // Advanced search filtration logic
  const searchResults = availableHubs.filter(hub => {
    // Proximity range filter
    const distanceVal = getHubProximityKm(hub.id);
    const activeRadius = selectedRadius === 'Custom' ? customRadiusValue : selectedRadius;
    const matchesRadius = distanceVal <= activeRadius;

    // Word query match
    const query = activeSearchQuery.trim().toLowerCase();
    const matchesSearch = query === '' || 
                          String(hub.name || '').toLowerCase().includes(query) ||
                          String(hub.description || '').toLowerCase().includes(query) ||
                          String(hub.category || '').toLowerCase().includes(query) ||
                          String(hub.tag || '').toLowerCase().includes(query);

    // Advanced Filter properties matches
    const matchesCategory = appliedFilters.category === 'All' || hub.category === appliedFilters.category;
    
    const hubAccessType = getHubAccessType(hub);
    const matchesAccessType = appliedFilters.accessType === 'All' || hubAccessType === appliedFilters.accessType;
    
    let matchesActivity = true;
    if (appliedFilters.activity !== 'All') {
      if (appliedFilters.activity === 'Active This Week') {
        matchesActivity = hub.healthScore >= 90 || hub.activeNow;
      } else if (appliedFilters.activity === 'Active This Month') {
        matchesActivity = hub.healthScore >= 70;
      } else if (appliedFilters.activity === 'Highly Active') {
        matchesActivity = hub.attendanceRate >= 90;
      }
    }

    const { country, state, city } = getHubLocation(hub.id);
    const matchesCountry = appliedFilters.country === '' || String(country || '').toLowerCase().includes(String(appliedFilters.country || '').toLowerCase());
    const matchesState = appliedFilters.state === '' || String(state || '').toLowerCase().includes(String(appliedFilters.state || '').toLowerCase());
    const matchesCity = appliedFilters.city === '' || String(city || '').toLowerCase().includes(String(appliedFilters.city || '').toLowerCase());

    return matchesRadius && matchesSearch && matchesCategory && matchesAccessType && matchesActivity && matchesCountry && matchesState && matchesCity;
  });

  const handleSendMessage = () => {
    if (!selectedHub || !newMessageText.trim()) return;
    if (!isLoggedIn) {
      onShowAuthModal();
      return;
    }
    if (!selectedHub.isJoined) {
      alert('You must join this community hub before participating in the discussion.');
      return;
    }

    if (onAddHubMessage) {
      onAddHubMessage(selectedHub.id, activeDetailTab === 'announcements' ? 'announcements' : 'discussionMessages', newMessageText);
      
      // Update selected hub reference with new message locally
      const updatedHub = hubs.find(h => h.id === selectedHub.id);
      if (updatedHub) {
        setSelectedHub(updatedHub);
      }
    } else {
      // Mock action
      alert('Message sent successfully!');
    }
    setNewMessageText('');
  };

  const handleReportSubmit = (hubId: string) => {
    if (!reportReason.trim()) return;
    if (onReportHub) {
      onReportHub(hubId, reportReason);
    } else {
      alert(`Report submitted successfully for investigation: "${reportReason}"`);
    }
    setReportReason('');
    setShowReportModal(null);
  };

  const getHealthBadgeColor = (level: string) => {
    switch (level) {
      case 'Excellent': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Active': return 'bg-sky-100 text-sky-800 border-sky-200';
      case 'Growing': return 'bg-amber-100 text-amber-800 border-amber-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="pb-8">
      {/* If a community hub detail view is selected */}
      {selectedHub ? (
        <div className="bg-surface rounded-3xl border border-outline-variant/20 overflow-hidden shadow-md animate-in fade-in zoom-in-95 duration-200">
          {/* Hub Cover photo */}
          <div className="h-44 relative bg-neutral-100">
            {selectedHub.image ? (
              <img src={selectedHub.image || undefined} alt={selectedHub.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-surface-container-high flex items-center justify-center text-outline">
                {getIcon(selectedHub.icon)}
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <button 
              onClick={() => setSelectedHub(null)}
              className="absolute top-4 left-4 p-2 bg-black/40 text-white hover:bg-black/60 rounded-full cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <button 
              onClick={() => setShowReportModal(selectedHub.id)}
              className="absolute top-4 right-4 px-3 py-1 bg-red-600/90 text-white hover:bg-red-700/95 rounded-full text-[10px] font-bold cursor-pointer transition-colors flex items-center gap-1"
            >
              <AlertTriangle className="w-3.5 h-3.5" /> Report
            </button>

            <div className="absolute bottom-4 left-4 text-white">
              <span className="text-[9px] uppercase font-bold tracking-wider bg-primary px-2.5 py-0.5 rounded-full mb-1 inline-block">
                {selectedHub.category}
              </span>
              <h3 className="text-xl font-bold tracking-tight">{selectedHub.name}</h3>
              <p className="text-[11px] opacity-90">{selectedHub.members} members • Rating: {selectedHub.rating} ★</p>
            </div>
          </div>

          {/* Community Health Stats Board */}
          <div className="bg-surface-container-low p-4 border-b border-outline-variant/10">
            <h4 className="text-[10px] uppercase font-bold text-outline tracking-wider mb-2">Community Health Metrics</h4>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="bg-surface rounded-xl p-2 border border-outline-variant/10">
                <p className="text-[9px] text-outline font-medium">Health score</p>
                <p className="text-xs font-bold text-on-surface mt-0.5">{selectedHub.healthScore}/100</p>
                <span className={`text-[8px] font-extrabold px-1.5 py-0.2 rounded-full inline-block mt-1 border ${getHealthBadgeColor(selectedHub.healthLevel)}`}>
                  {selectedHub.healthLevel}
                </span>
              </div>
              <div className="bg-surface rounded-xl p-2 border border-outline-variant/10">
                <p className="text-[9px] text-outline font-medium">Active now</p>
                <p className="text-sm font-bold text-on-surface mt-0.5">{selectedHub.activeMembers}</p>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[8px] text-emerald-600 font-bold">Online</span>
                </div>
              </div>
              <div className="bg-surface rounded-xl p-2 border border-outline-variant/10">
                <p className="text-[9px] text-outline font-medium">Events Mthly</p>
                <p className="text-sm font-bold text-on-surface mt-0.5">{selectedHub.eventsThisMonth}</p>
                <p className="text-[8px] text-outline font-bold mt-1">Scheduled</p>
              </div>
              <div className="bg-surface rounded-xl p-2 border border-outline-variant/10">
                <p className="text-[9px] text-outline font-medium">Attendance</p>
                <p className="text-sm font-bold text-on-surface mt-0.5">{selectedHub.attendanceRate}%</p>
                <p className="text-[8px] text-tertiary font-bold mt-1">✓ Verified Count: {selectedHub.verifiedEventsCount}</p>
              </div>
            </div>
          </div>

          {/* Inactive Banner warning if applicable */}
          {(!events.some(e => e.hubId === selectedHub.id && !e.isCompleted && !e.suspended)) && (
            <div className="mx-4 mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <div>
                <p className="font-extrabold text-amber-950">Hub Inactive (Scheduling Gap)</p>
                <p className="leading-relaxed font-semibold">
                  No upcoming events are scheduled. Hubs are required to host regular gatherings to remain active.
                </p>
              </div>
            </div>
          )}

          {/* Tab Selection */}
          <div className="border-b border-outline-variant/10 flex text-[11px] font-semibold overflow-x-auto hide-scrollbar bg-surface-container-lowest">
            <button 
              onClick={() => setActiveDetailTab('about')}
              className={`px-4 py-3 text-center border-b-2 transition-all cursor-pointer whitespace-nowrap ${activeDetailTab === 'about' ? 'border-primary text-primary' : 'border-transparent text-outline hover:text-on-surface-variant'}`}
            >
              About
            </button>
            <button 
              onClick={() => setActiveDetailTab('events')}
              className={`px-4 py-3 text-center border-b-2 transition-all cursor-pointer whitespace-nowrap ${activeDetailTab === 'events' ? 'border-primary text-primary' : 'border-transparent text-outline hover:text-on-surface-variant'}`}
            >
              Upcoming ({events.filter(e => e.hubId === selectedHub.id && !e.isCompleted && !e.suspended).length})
            </button>
            <button 
              onClick={() => setActiveDetailTab('past')}
              className={`px-4 py-3 text-center border-b-2 transition-all cursor-pointer whitespace-nowrap ${activeDetailTab === 'past' ? 'border-primary text-primary' : 'border-transparent text-outline hover:text-on-surface-variant'}`}
            >
              Past Gathers ({events.filter(e => e.hubId === selectedHub.id && (e.isCompleted || e.id === 'event-4')).length})
            </button>
            <button 
              onClick={() => setActiveDetailTab('discussion')}
              className={`px-4 py-3 text-center border-b-2 transition-all cursor-pointer whitespace-nowrap ${activeDetailTab === 'discussion' ? 'border-primary text-primary' : 'border-transparent text-outline hover:text-on-surface-variant'}`}
            >
              Discussions Room
            </button>
            <button 
              onClick={() => setActiveDetailTab('announcements')}
              className={`px-4 py-3 text-center border-b-2 transition-all cursor-pointer whitespace-nowrap ${activeDetailTab === 'announcements' ? 'border-primary text-primary' : 'border-transparent text-outline hover:text-on-surface-variant'}`}
            >
              Announcements & Updates ({selectedHub.announcements?.length || 0})
            </button>
            <button 
              onClick={() => setActiveDetailTab('members')}
              className={`px-4 py-3 text-center border-b-2 transition-all cursor-pointer whitespace-nowrap ${activeDetailTab === 'members' ? 'border-primary text-primary' : 'border-transparent text-outline hover:text-on-surface-variant'}`}
            >
              Members
            </button>
            <button 
              onClick={() => setActiveDetailTab('gallery')}
              className={`px-4 py-3 text-center border-b-2 transition-all cursor-pointer whitespace-nowrap ${activeDetailTab === 'gallery' ? 'border-primary text-primary' : 'border-transparent text-outline hover:text-on-surface-variant'}`}
            >
              Gallery
            </button>
          </div>

          {/* Tab Content Panels */}
          <div className="p-4 min-h-[250px] max-h-[380px] overflow-y-auto bg-surface">
            
            {activeDetailTab === 'about' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/20">
                  <h4 className="text-xs font-black text-on-surface mb-1">Tribe Mission</h4>
                  <p className="text-xs text-on-surface-variant leading-relaxed font-semibold text-justify">
                    {selectedHub.description || "A cohesive persistent community organizing regular outdoor and civic outcomes-oriented gathers."}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/15">
                    <p className="text-[9px] text-outline font-bold uppercase tracking-wider">Sector Domain</p>
                    <p className="text-xs font-black text-on-surface mt-1 truncate">{selectedHub.category}</p>
                  </div>
                  <div className="bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/15">
                    <p className="text-[9px] text-outline font-bold uppercase tracking-wider">Last Gathering</p>
                    <p className="text-xs font-black text-on-surface mt-1 truncate">{selectedHub.lastEventDate || "May 16th, 2026"}</p>
                  </div>
                </div>

                {selectedHub.gallery && selectedHub.gallery.length > 0 && (
                  <div>
                    <h4 className="text-xs font-black text-on-surface mb-2">Featured Moments</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {selectedHub.gallery.slice(0, 3).map((imgUrl, idx) => (
                        <div key={idx} className="aspect-square rounded-xl overflow-hidden bg-surface-container-high border border-outline-variant/10">
                          <img src={imgUrl} alt="Gallery visual" className="w-full h-full object-cover shrink-0" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeDetailTab === 'events' && (
              <div className="space-y-3 animate-fadeIn">
                <h4 className="text-xs font-black text-on-surface mb-1">Scheduled Gathers</h4>
                {events.filter(e => e.hubId === selectedHub.id && !e.isCompleted && !e.suspended).length > 0 ? (
                  events.filter(e => e.hubId === selectedHub.id && !e.isCompleted && !e.suspended).map((evt) => (
                    <div key={evt.id} className="flex items-center gap-3 bg-surface-container-low p-3 rounded-xl hover:bg-surface-container transition-colors">
                      <img src={evt.image || undefined} alt={evt.title} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                      <div className="flex-grow min-w-0">
                        <h5 className="font-bold text-xs text-on-surface truncate">{evt.title}</h5>
                        <p className="text-[9px] text-primary font-bold mt-0.5">{evt.date}</p>
                        <p className="text-[9px] text-outline truncate">{evt.location}</p>
                      </div>
                      <button 
                        onClick={() => {
                          setSelectedHub(null);
                          onNavigateToDiscover();
                        }}
                        className="text-[10px] font-extrabold text-white bg-primary px-3 py-1.5 rounded-lg shrink-0 cursor-pointer shadow-2xs hover:bg-primary/95"
                      >
                        Attend
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 bg-surface-container-lowest rounded-2xl border border-dashed border-outline-variant/30">
                    <p className="text-xs text-outline font-bold">No active events in schedule</p>
                    <p className="text-[10px] text-outline mt-1 leading-relaxed">Regular events are necessary to keep community listings active.</p>
                  </div>
                )}
              </div>
            )}

            {activeDetailTab === 'past' && (
              <div className="space-y-3 animate-fadeIn">
                <h4 className="text-xs font-black text-on-surface mb-1">Completed Community Actions</h4>
                {events.filter(e => e.hubId === selectedHub.id && (e.isCompleted || e.id === 'event-4')).length > 0 ? (
                  events.filter(e => e.hubId === selectedHub.id && (e.isCompleted || e.id === 'event-4')).map((evt) => (
                    <div key={evt.id} className="bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/10">
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="font-black text-xs text-on-surface leading-tight">{evt.title}</h5>
                        <span className="text-[8px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">✓ Completed</span>
                      </div>
                      <p className="text-[11px] text-on-surface-variant font-medium leading-relaxed">{evt.description}</p>
                      {evt.impactReport && (
                        <div className="mt-2.5 p-2 bg-emerald-50 rounded-lg border border-emerald-100 text-[10px] text-emerald-950 font-medium">
                          📊 <b>Impact Outcomes:</b> {evt.impactReport.summary}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-xs text-outline font-medium">No past actions saved on record register.</p>
                  </div>
                )}
              </div>
            )}

            {activeDetailTab === 'discussion' && (
              <div className="space-y-3 flex flex-col justify-between h-full">
                {!selectedHub.isJoined ? (
                  <div className="p-6 text-center bg-surface-container-low rounded-2xl border border-dashed border-outline-variant">
                    <Lock className="w-8 h-8 text-outline mx-auto mb-2" />
                    <p className="text-xs font-bold text-on-surface">Community Chat Locked</p>
                    <p className="text-[11px] text-outline mt-1 mb-3">You must join this hub to interact in transparent public rooms.</p>
                    <button 
                      onClick={() => onToggleJoin(selectedHub.id)}
                      className="px-4 py-2 bg-primary text-on-primary text-xs font-bold rounded-xl cursor-pointer hover:bg-primary/95 transition-all"
                    >
                      Join Community Hub
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 pb-12">
                    {selectedHub.discussionMessages && selectedHub.discussionMessages.length > 0 ? (
                      selectedHub.discussionMessages.map((msg) => (
                        <div key={msg.id} className="flex gap-2.5 items-start">
                          <img src={msg.senderAvatar || undefined} alt={msg.senderName} className="w-7 h-7 rounded-full object-cover shadow-2xs mt-0.5" />
                          <div className="bg-surface-container-low p-2.5 rounded-xl flex-1 max-w-xs">
                            <div className="flex justify-between items-start">
                              <span className="text-[10px] font-bold text-on-surface flex items-center gap-1">
                                {msg.senderName}
                                {msg.senderVerification === 'Trusted Organizer' && <span className="text-secondary">🛡</span>}
                                {msg.senderVerification === 'Identity Verified' && <span className="text-primary">✓</span>}
                              </span>
                              <span className="text-[8px] text-outline font-medium">{msg.timestamp}</span>
                            </div>
                            <p className="text-xs text-on-surface-variant mt-1">{msg.content}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-center text-outline py-8">Begin the discussion! Be supportive and outcomes-driven.</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeDetailTab === 'members' && (
              <div className="space-y-3 animate-fadeIn">
                <h4 className="text-xs font-black text-on-surface mb-2">Verified Members ({selectedHub.members} total)</h4>
                <div className="space-y-2">
                  {[
                    { name: 'Sarah Jenkins', role: 'Trusted Organizer', rating: '4.9 ★', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80' },
                    { name: 'Marcus Chen', role: 'Regional Member', rating: '4.8 ★', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80' },
                    { name: 'David Atten', role: 'Safety Liaison', rating: '5.0 ★', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80' },
                    { name: 'Elena Rossi', role: 'Member', rating: '4.7 ★', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80' }
                  ].map((m, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 bg-surface-container-low rounded-xl">
                      <img src={m.avatar} alt={m.name} className="w-8 h-8 rounded-full object-cover shrink-0 shadow-3xs" />
                      <div className="flex-grow min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-on-surface leading-tight truncate">{m.name}</span>
                          <span className="text-[8px] bg-primary/10 text-primary font-bold px-1.5 py-0.2 rounded-full shrink-0">{m.role}</span>
                        </div>
                        <p className="text-[9px] text-outline leading-tight mt-0.5">Reputation rating: {m.rating} • Identity Verified</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeDetailTab === 'announcements' && (
              <div className="animate-fadeIn space-y-4 pb-8">
                {/* Creator/Administrator Tooling Panel */}
                {selectedHub.isJoined && (
                  <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100/50">
                    <h4 className="text-xs font-black text-indigo-950 uppercase tracking-wide flex items-center gap-1.5 mb-2">
                      <Shield className="w-4 h-4 text-indigo-700" /> Admin/Moderator Bulletin Console
                    </h4>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold text-indigo-900 uppercase tracking-wider mb-1">
                          Bulletin Type / Topic
                        </label>
                        <select
                          value={announcementType}
                          onChange={(e) => setAnnouncementType(e.target.value)}
                          className="w-full bg-white text-xs font-semibold py-2 px-2.5 rounded-lg border border-indigo-250 focus:outline-none text-on-surface"
                        >
                          <option value="Challenge Announcement">🏆 Challenge Announcement</option>
                          <option value="Community Milestone">⭐ Community Milestone</option>
                          <option value="Important Notice">⚠️ Important Notice</option>
                          <option value="Community Achievement">📈 Community Achievement</option>
                          <option value="Gallery Update">🖼️ Gallery Update</option>
                          <option value="Summary Update">📋 Summary Update</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-indigo-900 uppercase tracking-wider mb-1">
                          Bulletin Details
                        </label>
                        <textarea
                          rows={3}
                          placeholder="Compose official updates regarding schedule changes, community progress milestones, new resource uploads or outcomes..."
                          value={announcementText}
                          onChange={(e) => setAnnouncementText(e.target.value)}
                          className="w-full bg-white text-xs p-2.5 rounded-lg border border-indigo-250 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-on-surface"
                        />
                      </div>

                      {/* Photo Url preset picker */}
                      <div>
                        <label className="block text-[10px] font-bold text-indigo-900 uppercase tracking-wider mb-1">
                          Cover Illustration (Optional URL or click preset)
                        </label>
                        <input
                          type="text"
                          placeholder="https://images.unsplash.com/... or click a preset below"
                          value={announcementPhotoUrl}
                          onChange={(e) => setAnnouncementPhotoUrl(e.target.value)}
                          className="w-full bg-white text-xs p-2 rounded-lg border border-indigo-250 focus:outline-none text-on-surface"
                        />
                        <div className="flex gap-1.5 mt-1.5 overflow-x-auto py-0.5 hide-scrollbar">
                          {[
                            { label: '🚴 Cycling/Active', url: 'https://images.unsplash.com/photo-1541614101331-1a5a3a194e92?w=600&auto=format&fit=crop&q=80' },
                            { label: '🌿 Eco/Cleanup', url: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=600&auto=format&fit=crop&q=80' },
                            { label: '🧘 Yoga/Zen', url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&auto=format&fit=crop&q=80' },
                            { label: '📚 Study/Tutor', url: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=600&auto=format&fit=crop&q=80' },
                            { label: '🐾 Pets/DogWalk', url: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&auto=format&fit=crop&q=80' }
                          ].map((preset, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setAnnouncementPhotoUrl(preset.url)}
                              className={`text-[9px] font-bold px-2 py-1 rounded-md border shrink-0 transition-all cursor-pointer ${
                                announcementPhotoUrl === preset.url
                                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-3xs'
                                  : 'bg-white text-indigo-900 border-indigo-150 hover:bg-indigo-50'
                              }`}
                            >
                              {preset.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Publication Type Selector */}
                      <div className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-indigo-150">
                        <div className="min-w-0 pr-2">
                          <p className="text-[10px] font-bold text-indigo-950 uppercase tracking-wide">
                            Feed Broadcast
                          </p>
                          <p className="text-[9px] text-indigo-850 mt-0.5 leading-snug">
                            Publish to the general <b>Activity Feed</b> for all joined members. Unchecking keeps it local.
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={isFeedBroadcast}
                            onChange={(e) => setIsFeedBroadcast(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                      </div>

                      <button
                        onClick={() => {
                          if (!announcementText.trim()) return;
                          if (onPublishHubUpdate) {
                            onPublishHubUpdate(selectedHub.id, {
                              text: announcementText,
                              updateType: announcementType,
                              isFeedUpdate: isFeedBroadcast,
                              photoUrl: announcementPhotoUrl || undefined
                            });
                            
                            // Visual success transition
                            alert(`Excellent! "${announcementType}" successfully published! ${isFeedBroadcast ? 'Broadcasted to public activity feed.' : 'Logged on community board.'}`);
                            
                            // Reset state
                            setAnnouncementText('');
                            setAnnouncementPhotoUrl('');
                            
                            // Update selected reference local sync
                            setTimeout(() => {
                              const updated = hubs.find(h => h.id === selectedHub.id);
                              if (updated) setSelectedHub(updated);
                            }, 100);
                          } else {
                            alert('Update logged successfully on Mock hub panel!');
                          }
                        }}
                        disabled={!announcementText.trim()}
                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white disabled:bg-neutral-200 disabled:text-neutral-400 font-bold rounded-xl text-xs active:scale-95 transition-all text-center cursor-pointer"
                      >
                        🚀 Publish Official Announcement
                      </button>
                    </div>
                  </div>
                )}

                {/* List of existing bulletins/announcements */}
                <h4 className="text-xs font-black text-on-surface uppercase tracking-wider">
                  Community Bulletin Board ({selectedHub.announcements?.length || 0})
                </h4>

                {selectedHub.announcements && selectedHub.announcements.length > 0 ? (
                  <div className="space-y-3 pb-8">
                    {selectedHub.announcements.map((bulletin) => (
                      <div key={bulletin.id} className="p-3.5 rounded-xl border border-outline-variant/15 bg-white shadow-3xs hover:shadow-2xs transition-all relative">
                        {bulletin.pinned && (
                          <span className="absolute top-3 right-3 text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider">
                            📌 PINNED BULLETIN
                          </span>
                        )}
                        <div className="flex gap-2.5 items-center mb-2">
                          <img src={bulletin.senderAvatar} alt={bulletin.senderName} className="w-7 h-7 rounded-full object-cover shrink-0 border border-outline-variant/10 shadow-3xs" />
                          <div>
                            <span className="text-[10px] font-black text-on-surface flex items-center gap-1">
                              {bulletin.senderName}
                              {bulletin.senderVerification === 'Trusted Organizer' && <span className="text-secondary">🛡 Shield Admin</span>}
                            </span>
                            <span className="text-[8px] text-outline font-medium block">{bulletin.timestamp}</span>
                          </div>
                        </div>

                        <p className="text-xs text-on-surface-variant leading-relaxed font-semibold">
                          {bulletin.content}
                        </p>

                        {bulletin.image && (
                          <div className="aspect-video w-full rounded-lg overflow-hidden border border-outline-variant/10 mt-2 bg-neutral-50">
                            <img src={bulletin.image} alt="Official Bulletin visual" className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-center text-outline py-8 font-semibold">
                    No official announcements posted on this community Board yet.
                  </p>
                )}
              </div>
            )}

            {activeDetailTab === 'gallery' && (
              <div className="animate-fadeIn">
                <h4 className="text-xs font-black text-on-surface mb-3">Tribe Record Gallery</h4>
                {selectedHub.gallery && selectedHub.gallery.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3 pb-8">
                    {selectedHub.gallery.map((imgUrl, idx) => (
                      <div key={idx} className="aspect-video rounded-xl overflow-hidden bg-neutral-100 border border-outline-variant/15 relative">
                        <img src={imgUrl} alt="Gallery moment" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-center text-outline py-8 font-medium">No photos uploaded to this community gallery yet.</p>
                )}
              </div>
            )}

          </div>

          {/* Sticky input bar inside modals only if discussion is active and joined */}
          {activeDetailTab === 'discussion' && selectedHub.isJoined && (
            <div className="p-3 bg-surface border-t border-outline-variant/10 flex gap-2">
              <input
                type="text"
                placeholder="Participate in community room..."
                value={newMessageText}
                onChange={(e) => setNewMessageText(e.target.value)}
                className="flex-grow border border-outline-variant/20 bg-surface-container-low rounded-xl text-xs px-3 focus:outline-none focus:ring-1 focus:ring-primary text-on-surface"
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

          {/* Join / Leave Footer indicator */}
          <div className="p-4 bg-surface-container-high/20 border-t border-outline-variant/10 flex justify-between items-center shrink-0">
            <span className="text-xs font-bold text-on-surface-variant">Tribe Status</span>
            <button 
              onClick={() => {
                onToggleJoin(selectedHub.id);
                // Update select reference trigger re-render
                setTimeout(() => {
                  const updated = hubs.find(h => h.id === selectedHub.id);
                  if (updated) setSelectedHub(updated);
                }, 50);
              }}
              className={`px-5 py-2 rounded-xl text-xs font-bold active:scale-95 transition-transform cursor-pointer ${selectedHub.isJoined ? 'bg-surface-container text-on-surface hover:bg-surface-container-high border border-outline-variant/25' : 'bg-primary text-on-primary hover:bg-primary/95 shadow-sm'}`}
            >
              {selectedHub.isJoined ? '✓ Member (Leave)' : 'Join Community'}
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Upper Invite Banner if not logged in */}
          {!isLoggedIn && (
            <div className="mb-6 animate-in fade-in slide-in-from-top-4 duration-200">
              <button 
                onClick={onShowAuthModal}
                className="w-full h-14 bg-primary text-on-primary rounded-xl flex items-center justify-center gap-3 shadow-md hover:scale-[1.01] transition-all cursor-pointer font-medium"
              >
                <UserPlus className="w-5 h-5 flex-shrink-0" />
                <span>Sign up with Phone or Email</span>
              </button>
            </div>
          )}

          {isSearchOverlayOpen ? (
            /* Dedicated Hub Search Experience */
            <section className="mb-8 animate-fadeIn space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-black uppercase text-outline tracking-wider inline-flex items-center gap-1.5">
                  <Search className="w-4 h-4 text-primary" /> Tribe Search Results
                </h3>
                <span className="text-[10px] text-outline font-extrabold px-2.5 py-0.5 bg-surface-container rounded-full">Found: {searchResults.length}</span>
              </div>

              {/* Integrated Proximity & Advanced Filters Bar */}
              <div className="bg-white rounded-2xl p-3 border border-outline-variant/15 shadow-3xs flex flex-wrap items-center justify-between gap-2 select-none">
                {/* Left side: Range information indicator */}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-secondary animate-bounce" />
                  </div>
                  <div className="flex flex-col text-left">
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
                      setIsFiltersExpanded(false); // keep it solitary & clean
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
                      setIsFiltersExpanded(!isFiltersExpanded);
                      setIsSearchChangingRadius(false); // keep it solitary & clean
                    }}
                    className={`px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all ${
                      isFiltersExpanded 
                        ? 'bg-primary border-primary text-white font-extrabold' 
                        : 'bg-neutral-50 hover:bg-neutral-100 border-outline-variant/20 text-outline font-black'
                    }`}
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>FILTERS</span>
                    {(appliedFilters.category !== 'All' || appliedFilters.accessType !== 'All' || appliedFilters.activity !== 'All' || appliedFilters.country !== '' || appliedFilters.state !== '' || appliedFilters.city !== '') && (
                      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                    )}
                    <span className="text-[9px] opacity-75">{isFiltersExpanded ? '▲' : '▼'}</span>
                  </button>

                  {/* Clear button */}
                  {((appliedFilters.category !== 'All' || appliedFilters.accessType !== 'All' || appliedFilters.activity !== 'All' || appliedFilters.country !== '' || appliedFilters.state !== '' || appliedFilters.city !== '') || selectedRadius !== 25) && (
                    <button
                      type="button"
                      onClick={() => {
                        setFilterCategory('All');
                        setFilterAccessType('All');
                        setFilterActivity('All');
                        setFilterCountry('');
                        setFilterState('');
                        setFilterCity('');
                        setAppliedFilters({
                          category: 'All',
                          accessType: 'All',
                          activity: 'All',
                          country: '',
                          state: '',
                          city: ''
                        });
                        setSelectedRadius(25);
                        setIsSearchChangingRadius(false);
                        setIsFiltersExpanded(false);
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
                    <div className="pt-2 text-left">
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
              {isFiltersExpanded && (
                <div className="bg-surface-container border border-outline-variant/20 rounded-2xl p-4 mb-5 transition-all animate-in fade-in duration-200 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    
                    {/* Category Dropdown */}
                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-wider text-outline mb-1.5">Category</label>
                      <select 
                        value={filterCategory} 
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="w-full border border-outline-variant/30 rounded-xl bg-surface p-2 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        <option value="All">All Categories</option>
                        {[
                          'Volunteering & Social Causes',
                          'Environment & Sustainability',
                          'Cycling',
                          'Motorcycling',
                          'Running & Walking',
                          'Trekking & Outdoors',
                          'Fitness & Wellness',
                          'Yoga & Meditation',
                          'Reading & Literature',
                          'Technology & Programming',
                          'Photography & Videography',
                          'Arts & Creativity',
                          'Food & Cooking',
                          'Pets & Animal Welfare',
                          'Entrepreneurship & Startups',
                          'Education & Learning',
                          'Community Development',
                          'Travel & Exploration',
                          'Others'
                        ].map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    {/* Hub Access Type */}
                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-wider text-outline mb-1.5">Hub Access Type</label>
                      <div className="flex gap-2.5">
                        {['All', 'Open to Join', 'Approval Required'].map(type => (
                          <button
                            type="button"
                            key={type}
                            onClick={() => setFilterAccessType(type)}
                            className={`px-3 py-1.5 rounded-xl border font-bold text-[11px] transition-all cursor-pointer ${filterAccessType === type ? 'bg-primary text-on-primary border-primary' : 'bg-surface border-outline-variant/20 text-on-surface-variant hover:bg-neutral-50'}`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Activity Level */}
                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-wider text-outline mb-1.5">Activity Level</label>
                      <div className="flex gap-2.5 flex-wrap">
                        {['All', 'Active This Week', 'Active This Month', 'Highly Active'].map(act => (
                          <button
                            type="button"
                            key={act}
                            onClick={() => setFilterActivity(act)}
                            className={`px-3 py-1.5 rounded-xl border font-bold text-[11px] transition-all cursor-pointer ${filterActivity === act ? 'bg-primary text-on-primary border-primary' : 'bg-surface border-outline-variant/20 text-on-surface-variant hover:bg-neutral-50'}`}
                          >
                            {act}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Proximity Range Limit Filter */}
                    <div className="md:col-span-2 bg-neutral-50/50 rounded-2xl p-4 border border-outline-variant/15 space-y-3">
                      <div className="flex justify-between items-center select-none">
                        <div>
                          <label className="block text-[11px] font-black uppercase tracking-wider text-outline mb-1 flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-secondary animate-bounce" /> Proximity Range Limit
                          </label>
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

                    {/* Location Filters */}
                    <div className="md:col-span-2 grid grid-cols-3 gap-2 mt-1">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-outline mb-1 flex items-center gap-0.5">
                          <MapPin className="w-3 h-3 text-secondary animate-bounce" /> Country
                        </label>
                        <input 
                          type="text" 
                          placeholder="e.g. USA" 
                          value={filterCountry}
                          onChange={(e) => setFilterCountry(e.target.value)}
                          className="w-full border border-outline-variant/30 rounded-xl bg-surface p-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary text-on-surface"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-outline mb-1">State</label>
                        <input 
                          type="text" 
                          placeholder="e.g. California" 
                          value={filterState}
                          onChange={(e) => setFilterState(e.target.value)}
                          className="w-full border border-outline-variant/30 rounded-xl bg-surface p-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary text-on-surface"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-outline mb-1">City</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Oakland" 
                          value={filterCity}
                          onChange={(e) => setFilterCity(e.target.value)}
                          className="w-full border border-outline-variant/30 rounded-xl bg-surface p-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary text-on-surface"
                        />
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="md:col-span-2 flex justify-end gap-2 pt-3 border-t border-outline-variant/10 mt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setFilterCategory('All');
                          setFilterAccessType('All');
                          setFilterActivity('All');
                          setFilterCountry('');
                          setFilterState('');
                          setFilterCity('');
                          setAppliedFilters({
                            category: 'All',
                            accessType: 'All',
                            activity: 'All',
                            country: '',
                            state: '',
                            city: ''
                          });
                        }}
                        className="px-4 py-2 hover:bg-surface-container border border-outline-variant/20 text-outline rounded-xl font-bold text-xs cursor-pointer flex items-center gap-1 transition-all"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Reset Filters
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAppliedFilters({
                            category: filterCategory,
                            accessType: filterAccessType,
                            activity: filterActivity,
                            country: filterCountry,
                            state: filterState,
                            city: filterCity
                          });
                          setIsFiltersExpanded(false);
                        }}
                        className="px-5 py-2 bg-primary text-on-primary hover:bg-primary/95 shadow-sm rounded-xl font-bold text-xs cursor-pointer transition-all"
                      >
                        Apply Filters
                      </button>
                    </div>
                    
                  </div>
                )}

              {/* Search results rendering */}
              {searchResults.length === 0 ? (
                <div className="p-10 text-center bg-surface-container-low rounded-2xl border border-dashed border-outline-variant/30 flex flex-col items-center">
                  <p className="text-on-surface-variant font-medium text-sm">No communities match your active search terms or advanced filter parameters.</p>
                  <button 
                    onClick={() => {
                      if (onSearchQueryChange) onSearchQueryChange('');
                      setLocalSearchQuery('');
                      setFilterCategory('All');
                      setFilterAccessType('All');
                      setFilterActivity('All');
                      setFilterCountry('');
                      setFilterState('');
                      setFilterCity('');
                      setAppliedFilters({
                        category: 'All',
                        accessType: 'All',
                        activity: 'All',
                        country: '',
                        state: '',
                        city: ''
                      });
                    }}
                    className="mt-3 px-4 py-2 bg-primary/10 text-primary font-bold text-xs cursor-pointer hover:bg-primary/20 transition-all rounded-xl"
                  >
                    Clear Active Filters & Search
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {searchResults.map(hub => {
                    const upcomingCount = events.filter(e => e.hubId === hub.id && !e.isCompleted && !e.suspended).length;
                    const loc = getHubLocation(hub.id);
                    return (
                      <div 
                        key={hub.id} 
                        className="bg-surface-container-lowest border border-outline-variant/20 rounded-2xl p-4 flex flex-col justify-between hover:shadow-xs hover:border-primary-container transition-all group cursor-pointer"
                        onClick={() => setSelectedHub(hub)}
                      >
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-primary border border-outline-variant/10 shrink-0">
                              {getIcon(hub.icon)}
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <span className={`text-[8px] font-extrabold px-2 py-0.5 rounded-full border ${getHealthBadgeColor(hub.healthLevel)}`}>
                                H: {hub.healthScore}/100
                              </span>
                              <span className="text-[8px] font-semibold px-2 py-0.5 bg-neutral-100/50 text-outline border border-outline-variant/10 rounded-full">
                                🏡 {loc.city}, {loc.state}
                              </span>
                              <span className="text-[8px] font-bold px-2 py-0.5 bg-indigo-50 text-indigo-800 border border-indigo-100 rounded-full">
                                📍 {getHubProximityKm(hub.id)} km
                              </span>
                            </div>
                          </div>

                          <span className="text-[9px] uppercase font-bold tracking-wider text-primary bg-primary/10 px-2.5 py-0.5 rounded-full mb-1.5 inline-block">
                            {hub.category}
                          </span>

                          <h4 className="text-on-surface font-black text-sm tracking-tight leading-snug group-hover:text-primary transition-colors mb-1 truncate">{hub.name}</h4>
                          <p className="text-on-surface-variant text-[11px] leading-relaxed line-clamp-2 mb-2 font-medium">
                            {hub.description || hub.latestUpdate}
                          </p>
                        </div>

                        <div className="space-y-1 my-2 bg-slate-50 p-2.5 rounded-xl border border-outline-variant/10">
                          <div className="flex justify-between text-[10px] text-outline font-semibold">
                            <span>Upcoming Gathers:</span>
                            <span className="text-on-surface font-bold">{upcomingCount} active</span>
                          </div>
                          <div className="flex justify-between text-[10px] text-outline font-semibold">
                            <span>Access Status:</span>
                            <span className="text-on-surface font-bold">{getHubAccessType(hub)}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-outline-variant/10 mt-2 text-xs">
                          <span className="text-on-surface-variant font-bold">👥 {hub.members} members</span>
                          <span className="text-primary font-bold inline-flex items-center gap-0.5 hover:underline">
                            Tribe Room <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          ) : (
            /* Tribes Dashboard with no search bars or category chips occupying vertical space initially */
            <div className="animate-fadeIn">
              
              {/* My Hubs (Communities the active user has already joined) */}
              {joinedHubs.length > 0 ? (
                <section className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-black uppercase text-outline tracking-wider inline-flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400" /> My Hubs
                    </h3>
                    <span className="text-[10px] text-outline font-extrabold px-2.5 py-0.5 bg-surface-container rounded-full">Joined: {joinedHubs.length}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {joinedHubs.map(hub => {
                      const hasMessagesBadge = hub.id === 'hub-1';
                      return (
                        <div 
                          key={hub.id}
                          onClick={() => setSelectedHub(hub)}
                          className="flex items-center gap-4 bg-white p-4 rounded-2xl cursor-pointer hover:bg-slate-50 border border-outline-variant/20 hover:border-outline-variant transition-all hover:shadow-xs group"
                        >
                          <div className="w-12 h-12 rounded-xl overflow-hidden shadow-2xs shrink-0 flex items-center justify-center bg-primary/5">
                            {hub.image ? (
                              <img className="w-full h-full object-cover" src={hub.image || undefined} alt={hub.name} />
                            ) : (
                              getIcon(hub.icon)
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <h5 className="text-on-surface font-bold text-sm truncate group-hover:text-primary transition-colors">
                                {hub.name}
                              </h5>
                              <span className={`text-[8px] font-extrabold px-1.5 py-0.2 rounded-full border ${getHealthBadgeColor(hub.healthLevel)}`}>
                                {hub.healthLevel}
                              </span>
                            </div>
                            <p className="text-on-surface-variant text-xs truncate mt-0.5 font-medium">
                              {hub.latestUpdate}
                            </p>
                          </div>

                          <div className="flex flex-col items-end gap-1 shrink-0">
                            {hasMessagesBadge && (
                              <div className="bg-primary text-on-primary px-1.5 py-0.5 rounded-full text-[8.5px] font-bold shadow-2xs">
                                Active
                              </div>
                            )}
                            <span className="text-[9px] text-outline font-bold">
                              {hub.latestTime}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              ) : (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-outline-variant/20 mb-8 flex flex-col items-center">
                  <p className="text-on-surface-variant text-xs font-semibold">You have not joined any community hubs yet.</p>
                  <p className="text-[10px] text-outline mt-1 font-medium">Tap the search icon in the top header to discover and search recurring interest groups!</p>
                </div>
              )}

              {/* Recently Active Hubs */}
              <section className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-black uppercase text-outline tracking-wider inline-flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-purple-600 animate-pulse" /> Recently Active Hubs
                  </h3>
                  <span className="text-[10px] text-outline font-semibold">Live Activity Metrics</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {availableHubs
                    .slice()
                    .sort((a, b) => b.healthScore - a.healthScore)
                    .slice(0, 2)
                    .map(hub => {
                      const loc = getHubLocation(hub.id);
                      return (
                        <div 
                          key={hub.id}
                          onClick={() => setSelectedHub(hub)}
                          className="bg-white p-4 rounded-2xl cursor-pointer hover:bg-slate-50 border border-outline-variant/20 hover:border-outline-variant transition-all hover:shadow-xs flex flex-col justify-between h-36 group"
                        >
                          <div>
                            <div className="flex justify-between items-center mb-1.5">
                              <span className="text-[9px] font-bold uppercase tracking-wider text-primary px-2 py-0.5 bg-primary/10 rounded-full">
                                {hub.category}
                              </span>
                              <span className="text-[9px] text-outline font-extrabold flex items-center gap-0.5">
                                <MapPin className="w-3 h-3 text-secondary" /> {loc.city}
                              </span>
                            </div>
                            <h4 className="text-on-surface font-black text-sm group-hover:text-primary transition-colors truncate">{hub.name}</h4>
                            <p className="text-on-surface-variant text-xs line-clamp-2 mt-1 leading-relaxed font-semibold">
                              {hub.description || hub.latestUpdate}
                            </p>
                          </div>
                          <div className="flex items-center justify-between pt-2 border-t border-outline-variant/10 text-[10px] font-bold text-outline">
                            <span>⚡ {hub.members} active members</span>
                            <span className="text-primary hover:underline inline-flex items-center gap-0.5 font-black">Enter Room <ArrowRight className="w-3 h-3" /></span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </section>

              {/* Popular Hubs */}
              <section className="mb-8 font-medium">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-black uppercase text-outline tracking-wider inline-flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-sky-600" /> Popular Communities
                  </h3>
                  <span className="text-[10px] text-outline font-semibold">High Member Engagement</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {availableHubs
                    .slice()
                    .sort((a, b) => b.members - a.members)
                    .slice(0, 2)
                    .map(hub => {
                      const loc = getHubLocation(hub.id);
                      return (
                        <div 
                          key={hub.id}
                          onClick={() => setSelectedHub(hub)}
                          className="bg-white p-4 rounded-2xl cursor-pointer hover:bg-slate-50 border border-outline-variant/20 hover:border-outline-variant transition-all hover:shadow-xs flex flex-col justify-between h-36 group"
                        >
                          <div>
                            <div className="flex justify-between items-center mb-1.5">
                              <span className="text-[9px] font-bold uppercase tracking-wider text-secondary px-2 py-0.5 bg-secondary/10 rounded-full">
                                {hub.category}
                              </span>
                              <span className="text-[8px] font-black px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full">
                                🔥 Popular
                              </span>
                            </div>
                            <h4 className="text-on-surface font-black text-sm group-hover:text-primary transition-colors truncate">{hub.name}</h4>
                            <p className="text-on-surface-variant text-xs line-clamp-2 mt-1 leading-relaxed font-semibold">
                              {hub.description || hub.latestUpdate}
                            </p>
                          </div>
                          <div className="flex items-center justify-between pt-2 border-t border-outline-variant/10 text-[10px] font-bold text-outline">
                            <span>👥 {hub.members} members</span>
                            <span className="text-primary hover:underline inline-flex items-center gap-0.5 font-black">Explore <ArrowRight className="w-3 h-3" /></span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </section>

              {/* Newly Created Hubs */}
              <section className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-black uppercase text-outline tracking-wider inline-flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600" /> Newly Created Hubs
                  </h3>
                  <span className="text-[10px] text-outline font-semibold">Fresh Gathering Places</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                  {availableHubs
                    .filter(h => h.id === 'hub-3' || h.id === 'hub-5')
                    .map(hub => {
                      return (
                        <div 
                          key={hub.id}
                          onClick={() => setSelectedHub(hub)}
                          className="bg-white p-4 rounded-2xl cursor-pointer hover:bg-slate-50 border border-outline-variant/20 hover:border-outline-variant transition-all hover:shadow-xs flex items-center justify-between group"
                        >
                          <div className="min-w-0 pr-2">
                            <span className="text-[8px] font-extrabold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full inline-block">
                              New
                            </span>
                            <h4 className="text-on-surface font-black text-sm group-hover:text-primary transition-colors truncate mt-1">{hub.name}</h4>
                            <p className="text-outline text-[10px] truncate leading-normal">{hub.category}</p>
                          </div>
                          <div className="shrink-0 flex items-center gap-1 bg-surface-container-low px-3 py-1.5 rounded-xl border border-outline-variant/10 text-[10px] font-bold text-on-surface-variant group-hover:text-primary transition-colors">
                            <span>Join</span>
                            <ArrowRight className="w-3 h-3 text-primary" />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </section>

            </div>
          )}
        </>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-surface rounded-2xl w-full max-w-sm p-5 shadow-xl relative animate-in fade-in zoom-in-95 duration-200">
            <h3 className="font-bold text-sm text-on-surface flex items-center gap-1.5 text-red-600 mb-2">
              <AlertTriangle className="w-5 h-5" /> Report Investigation Request
            </h3>
            <p className="text-xs text-on-surface-variant mb-4 leading-relaxed">
              ToGather Safety Councils enforce civil, transparent activities. Request moderation on content violates or dating solicitation.
            </p>

            <div className="space-y-3">
              {[
                'Dating / Matchmaking solicitation',
                'Harassment / Discourtesy',
                'Spam / Unrelated commercial promotion',
                'Misleading and Fake community description',
                'Adult content / Offensive language'
              ].map((opt) => (
                <button
                  key={opt}
                  onClick={() => setReportReason(opt)}
                  className={`w-full text-left p-2.5 rounded-xl text-xs font-semibold border transition-all ${reportReason === opt ? 'bg-primary/5 border-primary text-primary' : 'bg-surface hover:bg-surface-container border-outline-variant/20 text-on-surface-variant'}`}
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
                Dismiss
              </button>
              <button 
                onClick={() => handleReportSubmit(showReportModal)}
                disabled={!reportReason}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all"
              >
                Submit Report Form
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
