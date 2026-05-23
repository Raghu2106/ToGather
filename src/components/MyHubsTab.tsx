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
  Lock
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
  onClearInitialHubId
}: MyHubsTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
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
  const [activeDetailTab, setActiveDetailTab] = useState<'about' | 'events' | 'past' | 'members' | 'discussion' | 'gallery'>('about');
  const [newMessageText, setNewMessageText] = useState('');
  const [reportReason, setReportReason] = useState('');
  const [showReportModal, setShowReportModal] = useState<string | null>(null);

  // Filter approved categories
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Icon mapper helper
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Bike': return <Bike className="w-5 h-5" />;
      case 'Leaf': return <Leaf className="w-5 h-5 text-emerald-600" />;
      case 'GraduationCap': return <GraduationCap className="w-5 h-5 text-amber-600" />;
      case 'Activity': return <Activity className="w-5 h-5 text-purple-600" />;
      case 'Heart': return <Heart className="w-5 h-5 text-red-600" />;
      default: return <Compass className="w-5 h-5" />;
    }
  };

  // Split hubs into joined and exploring
  const joinedHubs = hubs.filter(h => h.isJoined && !h.suspended);
  const availableHubs = hubs.filter(h => !h.suspended);

  // Filter and search logic
  const filteredHubs = availableHubs.filter(hub => {
    const matchesSearch = hub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          hub.tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          hub.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' ? true : hub.category === categoryFilter;
    return matchesSearch && matchesCategory;
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

          {/* Modern High Contrast Search Bar and category selector */}
          <div className="relative group mb-4">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors">
              <Search className="w-5 h-5 text-outline" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Find your tribe community..."
              className="w-full bg-surface-container-low border-none rounded-2xl py-4 pl-12 pr-4 text-body-md focus:ring-2 focus:ring-primary transition-all placeholder:text-outline/70 focus:outline-none focus:bg-white shadow-2xs text-on-surface-variant"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-primary font-bold hover:underline cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Allowed Categories horizontal strip */}
          <div className="mb-6">
            <p className="text-[11px] font-bold uppercase text-outline tracking-wider mb-2">Approved Purpose Categories</p>
            <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2 shrink-0">
              <button 
                onClick={() => setCategoryFilter('All')}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-semibold cursor-pointer ${categoryFilter === 'All' ? 'bg-primary text-on-primary' : 'bg-surface-container border border-outline-variant/15 text-outline'}`}
              >
                All Domains
              </button>
              {APPROVED_CATEGORIES.map((cat) => (
                <button 
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-semibold cursor-pointer ${categoryFilter === cat ? 'bg-primary text-on-primary' : 'bg-surface-container border border-outline-variant/15 text-outline'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Joined communities Section */}
          {joinedHubs.length > 0 && !searchQuery && categoryFilter === 'All' && (
            <section className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold uppercase text-outline tracking-wider inline-flex items-center gap-1">
                  <Check className="w-4 h-4 text-emerald-600" /> Active Hub Rooms
                </h3>
                <span className="text-[10px] text-outline font-semibold">Joined: {joinedHubs.length}</span>
              </div>

              <div className="space-y-3">
                {joinedHubs.map(hub => {
                  const hasMessagesBadge = hub.id === 'hub-1';
                  return (
                    <div 
                      key={hub.id}
                      onClick={() => setSelectedHub(hub)}
                      className="flex items-center gap-4 bg-white p-4 rounded-2xl cursor-pointer hover:bg-surface-container-low border border-outline-variant/30 transition-all shadow-2xs group"
                    >
                      <div className="w-12 h-12 rounded-xl overflow-hidden shadow-2xs shrink-0 flex items-center justify-center bg-primary/5">
                        {hub.image ? (
                          <img className="w-full h-full object-cover" src={hub.image || undefined} alt={hub.name} />
                        ) : (
                          getIcon(hub.icon)
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h5 className="text-on-surface font-bold text-sm truncate group-hover:text-primary transition-colors">
                            {hub.name}
                          </h5>
                          <span className={`text-[8px] font-extrabold px-1.5 py-0.2 rounded-full border ${getHealthBadgeColor(hub.healthLevel)}`}>
                            {hub.healthLevel}
                          </span>
                        </div>
                        <p className="text-on-surface-variant text-xs truncate mt-0.5">
                          {hub.latestUpdate}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-1 shrink-0">
                        {hasMessagesBadge && (
                          <div className="bg-primary text-on-primary w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold shadow-2xs">
                            Active
                          </div>
                        )}
                        <span className="text-[9px] text-outline font-medium">
                          {hub.latestTime}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Browse communities */}
          <section className="mb-8">
            <h3 className="text-sm font-bold uppercase text-outline tracking-wider mb-3">Browse Purpose Communities ({filteredHubs.length})</h3>
            
            {filteredHubs.length === 0 ? (
              <div className="p-8 text-center bg-surface-container-low rounded-2xl">
                <p className="text-on-surface-variant text-sm">No communities match instructions.</p>
                <button 
                  onClick={() => {
                    setSearchQuery('');
                    setCategoryFilter('All');
                  }}
                  className="mt-2 text-primary font-bold text-xs cursor-pointer hover:underline"
                >
                  Clear filter rules
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {filteredHubs.map(hub => {
                  const upcomingCount = events.filter(e => e.hubId === hub.id && !e.isCompleted && !e.suspended).length;
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
                            {upcomingCount > 0 ? (
                              <span className="text-[8px] font-black px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-full">
                                ● Active
                              </span>
                            ) : (
                              <span className="text-[8px] font-black px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-full">
                                ● Inactive
                              </span>
                            )}
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

                      <div className="space-y-1 my-2 bg-surface-container-neutral-lowest/10 p-2 rounded-xl border border-outline-variant/5">
                        <p className="text-[10px] text-outline font-semibold">
                          📅 Upcoming Gathers: <b className="text-on-surface">{upcomingCount} active</b>
                        </p>
                        <p className="text-[10px] text-outline font-semibold">
                          ⏱ Last Gathering: <b className="text-on-surface">{hub.lastEventDate || "May 16th, 2026"}</b>
                        </p>
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
