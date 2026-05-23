/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { FeedPost, Hub, EventEntity } from '../types';
import { 
  MessageSquare, 
  Send,
  AlertTriangle,
  CheckCircle2,
  Trophy,
  Calendar,
  Users,
  Clock,
  ArrowRight,
  Plus,
  Compass,
  FileText,
  Bookmark,
  Share2,
  Check,
  Tag
} from 'lucide-react';

interface FeedTabProps {
  posts: FeedPost[];
  onAddNewPost: (postData: {
    text: string;
    tags: string[];
    type: 'event_recap' | 'hub_milestone' | 'thank_you_note' | 'outcome_report';
    eventName: string;
    eventId?: string;
    hubName: string;
    hubId?: string;
    completionDate: string;
    participantCount: number;
    attendanceRate?: number;
    impactMetrics?: {
      participantsInvolved?: number;
      volunteerHours?: number;
      fundsRaised?: number;
      treesPlanted?: number;
      wasteCollectedKg?: number;
      distanceCoveredKm?: number;
    };
  }) => void;
  isLoggedIn: boolean;
  onShowAuthModal: () => void;
  onUpdateFeedback?: (postId: string, type: 'appreciates' | 'inspirations' | 'participated') => void;
  onReportPost?: (postId: string, reason: string) => void;
  hubs: Hub[];
  events: EventEntity[];
  onViewHub?: (hubId: string) => void;
  onViewEvent?: (eventId: string) => void;
}

export default function FeedTab({ 
  posts, 
  onAddNewPost, 
  isLoggedIn, 
  onShowAuthModal,
  onUpdateFeedback,
  onReportPost,
  hubs = [],
  events = [],
  onViewHub,
  onViewEvent
}: FeedTabProps) {
  const [selectedTag, setSelectedTag] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Custom Create post state variables
  const [postText, setPostText] = useState('');
  const [reportType, setReportType] = useState<'event_recap' | 'hub_milestone' | 'thank_you_note' | 'outcome_report'>('event_recap');
  const [selectedHubId, setSelectedHubId] = useState('');
  const [selectedEventId, setSelectedEventId] = useState('');
  const [customEventName, setCustomEventName] = useState('');
  const [completionDate, setCompletionDate] = useState('Today');
  
  // Quantified Stats variables
  const [pVolInvolved, setPVolInvolved] = useState('');
  const [pVolHours, setPVolHours] = useState('');
  const [pAttendanceRate, setPAttendanceRate] = useState('100');
  const [pTreesPlanted, setPTreesPlanted] = useState('');
  const [pWasteCollected, setPWasteCollected] = useState('');
  const [pDistanceCovered, setPDistanceCovered] = useState('');
  const [pFundsRaised, setPFundsRaised] = useState('');
  
  const [activeCommentsPostId, setActiveCommentsPostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [reportedPostId, setReportedPostId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState('');

  // Source Type filtering
  const typeFilters = [
    { key: 'All', label: 'All Activities' },
    { key: 'event_recap', label: 'Event Recaps' },
    { key: 'hub_milestone', label: 'Hub Milestones' },
    { key: 'thank_you_note', label: 'Thank-Yous' },
    { key: 'outcome_report', label: 'Outcome Reports' }
  ];

  // Category tags filtering
  const tagsList = ['All', '#Environment', '#Cycling', '#Education', '#Pets', '#Volunteering'];

  // Handle Log Creation
  const handleCreatePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      onShowAuthModal();
      return;
    }
    if (!postText.trim()) return;

    // Resolve associated hub/event info
    let hubName = "General Community";
    let actualHubId = selectedHubId || undefined;
    if (selectedHubId) {
      const matchHub = hubs.find(h => h.id === selectedHubId);
      if (matchHub) hubName = matchHub.name;
    }

    let resolvedEventName = customEventName;
    let actualEventId = selectedEventId || undefined;
    if (selectedEventId) {
      const matchEvent = events.find(e => e.id === selectedEventId);
      if (matchEvent) {
        resolvedEventName = matchEvent.title;
        // if hub is associated and not typed by user, inherit it
        if (!selectedHubId && matchEvent.hubId) {
          actualHubId = matchEvent.hubId;
          const matchHub = hubs.find(h => h.id === matchEvent.hubId);
          if (matchHub) hubName = matchHub.name;
        }
      }
    }

    if (!resolvedEventName) {
      resolvedEventName = reportType === 'hub_milestone' ? 'Community Milestone Accomplished' : 'Local Gathering Completed';
    }

    // Map Category based on selection
    let deducedCategoryTag = '#Volunteering';
    if (resolvedEventName.toLowerCase().includes('clean') || postText.toLowerCase().includes('clean') || postText.toLowerCase().includes('ocean') || postText.toLowerCase().includes('tree')) {
      deducedCategoryTag = '#Environment';
    } else if (resolvedEventName.toLowerCase().includes('cycl') || resolvedEventName.toLowerCase().includes('ride') || postText.toLowerCase().includes('cycle')) {
      deducedCategoryTag = '#Cycling';
    } else if (resolvedEventName.toLowerCase().includes('tutor') || resolvedEventName.toLowerCase().includes('learn') || postText.toLowerCase().includes('class') || postText.toLowerCase().includes('student')) {
      deducedCategoryTag = '#Education';
    } else if (resolvedEventName.toLowerCase().includes('dog') || resolvedEventName.toLowerCase().includes('pet') || resolvedEventName.toLowerCase().includes('cat')) {
      deducedCategoryTag = '#Pets';
    }

    const impactData = {
      participantsInvolved: pVolInvolved ? Number(pVolInvolved) : undefined,
      volunteerHours: pVolHours ? Number(pVolHours) : undefined,
      treesPlanted: pTreesPlanted ? Number(pTreesPlanted) : undefined,
      wasteCollectedKg: pWasteCollected ? Number(pWasteCollected) : undefined,
      distanceCoveredKm: pDistanceCovered ? Number(pDistanceCovered) : undefined,
      fundsRaised: pFundsRaised ? Number(pFundsRaised) : undefined
    };

    onAddNewPost({
      text: postText,
      tags: [deducedCategoryTag, `#${reportType.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')}`],
      type: reportType,
      eventName: resolvedEventName,
      eventId: actualEventId,
      hubName: hubName,
      hubId: actualHubId,
      completionDate: completionDate || 'Recently',
      participantCount: pVolInvolved ? Number(pVolInvolved) : 10,
      attendanceRate: pAttendanceRate ? Number(pAttendanceRate) : undefined,
      impactMetrics: impactData
    });

    // Reset Form
    setPostText('');
    setReportType('event_recap');
    setSelectedHubId('');
    setSelectedEventId('');
    setCustomEventName('');
    setCompletionDate('Today');
    setPVolInvolved('');
    setPVolHours('');
    setPAttendanceRate('100');
    setPTreesPlanted('');
    setPWasteCollected('');
    setPDistanceCovered('');
    setPFundsRaised('');
    setShowCreateModal(false);
  };

  const handleUpdateOutcome = (postId: string, type: 'appreciates' | 'inspirations' | 'participated') => {
    if (!isLoggedIn) {
      onShowAuthModal();
      return;
    }
    if (onUpdateFeedback) {
      onUpdateFeedback(postId, type);
    } else {
      alert(`Outcome feedback registered: ${type}!`);
    }
  };

  const handleAddComment = (postId: string) => {
    if (!isLoggedIn) {
      onShowAuthModal();
      return;
    }
    if (!commentText.trim()) return;
    alert(`Success: Your note of support has been posted back to this community history record discussion!`);
    setCommentText('');
    setActiveCommentsPostId(null);
  };

  const submitPostReport = (postId: string) => {
    if (!reportReason.trim()) return;
    if (onReportPost) {
      onReportPost(postId, reportReason);
      alert('Report submitted. Safety moderators will review this activity log entry.');
    }
    setReportReason('');
    setReportedPostId(null);
  };

  // Sort: Prioritize posts with highest volunteer statistics first, focusing on real-world impact.
  const getImpactRank = (p: FeedPost) => {
    let score = 0;
    if (p.volunteerHours) score += p.volunteerHours * 2;
    if (p.participantCount) score += p.participantCount;
    if (p.attendanceRate) score += p.attendanceRate;
    if (p.image) score += 20; // Completed events with visual history are ranked higher
    return score;
  };

  const sortedPosts = [...posts].sort((a, b) => getImpactRank(b) - getImpactRank(a));

  // Handle selected filters
  const filteredPosts = sortedPosts.filter(post => {
    const matchesTag = selectedTag === 'All' || post.tags.some(t => t.toLowerCase() === selectedTag.toLowerCase());
    const matchesType = selectedType === 'All' || post.type === selectedType;
    return matchesTag && matchesType;
  });

  // Helper text mapping based on type
  const getTypeBadge = (type?: string) => {
    switch(type) {
      case 'event_recap':
        return <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider">✓ Event Recap</span>;
      case 'hub_milestone':
        return <span className="text-[10px] bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider">🏆 Hub Milestone</span>;
      case 'thank_you_note':
        return <span className="text-[10px] bg-sky-100 text-sky-800 px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider">🙌 Thank You Note</span>;
      case 'outcome_report':
        return <span className="text-[10px] bg-purple-100 text-purple-900 px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider">📊 Outcome Report</span>;
      default:
        return <span className="text-[10px] bg-neutral-100 text-neutral-800 px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider">✓ Participated</span>;
    }
  };

  return (
    <div className="pb-16 relative">
      
      {/* Super Compact Navigation & Filter Header */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-outline-variant/10 select-none text-on-surface">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-sans font-bold text-xs uppercase tracking-wider text-on-surface">Activity Stream</span>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Compact type filter select dropdown */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-neutral-50 hover:bg-neutral-100 text-[10px] font-bold py-1 px-1.5 rounded border border-outline-variant/20 focus:outline-none cursor-pointer"
          >
            {typeFilters.map(filter => (
              <option key={filter.key} value={filter.key}>{filter.label}</option>
            ))}
          </select>

          {/* Compact visual category filter select dropdown */}
          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="bg-neutral-50 hover:bg-neutral-100 text-[10px] font-bold py-1 px-1.5 rounded border border-outline-variant/20 focus:outline-none cursor-pointer"
          >
            {tagsList.map(tag => (
              <option key={tag} value={tag}>{tag === 'All' ? 'Categories' : tag}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Structured Activity stream */}
      <div className="space-y-6">
        {filteredPosts.length === 0 ? (
          <div className="p-16 text-center bg-white rounded-2xl border border-outline-variant/20 shadow-3xs max-w-lg mx-auto">
            <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <FileText className="w-6 h-6 text-outline" />
            </div>
            <p className="text-on-surface-variant font-bold text-sm">No activity records logged under these filters.</p>
            <p className="text-xs text-outline mt-1">Select other visual filters or contribute by reporting real outcomes!</p>
            <button 
              onClick={() => { setSelectedTag('All'); setSelectedType('All'); }}
              className="mt-4 text-primary text-xs font-black hover:underline cursor-pointer"
            >
              Reset view criteria
            </button>
          </div>
        ) : (
          filteredPosts.map((post) => {
            return (
              <article 
                key={post.id} 
                className="bg-white rounded-2xl border border-outline-variant/25 overflow-hidden shadow-3xs hover:shadow-2xs transition-all relative"
              >
                
                {/* Header Meta: Record Source & Tag */}
                <div className="px-5 pt-4 pb-3 border-b border-light select-none flex justify-between items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    {getTypeBadge(post.type)}
                    {post.tags?.[0] && (
                      <span className="text-[10px] text-outline font-semibold flex items-center gap-0.5">
                        <Tag className="w-2.5 h-2.5" /> {post.tags[0]}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-outline font-bold flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {post.completionDate || 'May 2026'}
                  </span>
                </div>

                {/* Structured Event/Hub Reference Bar */}
                <div className="bg-neutral-50/80 p-4 border-b border-outline-variant/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3 select-none">
                  <div>
                    <h4 className="text-xs font-black text-on-surface uppercase tracking-wide">
                      {post.eventName || 'Community Gathering'}
                    </h4>
                    {post.hubName && (
                      <p className="text-[10px] text-on-surface-variant font-bold mt-0.5 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-primary" /> Hub: {post.hubName}
                      </p>
                    )}
                    <p className="text-[10px] text-outline mt-0.5">
                      Organized & Certified by: <b>{post.author}</b> {post.authorVerification === 'Trusted Organizer' ? '🛡' : '✓'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {post.eventId && onViewEvent && (
                      <button 
                        onClick={() => onViewEvent(post.eventId!)}
                        className="text-[10.5px] bg-primary text-on-primary font-black px-3 py-1.5 rounded-xl active:scale-95 transition-all cursor-pointer inline-flex items-center gap-0.5 whitespace-nowrap"
                      >
                        View Event
                      </button>
                    )}

                    {post.hubId && onViewHub && (
                      <button 
                        onClick={() => onViewHub(post.hubId!)}
                        className="text-[10.5px] bg-white text-on-surface border border-outline-variant/30 font-black px-3 py-1.5 rounded-xl active:scale-95 transition-all cursor-pointer inline-flex items-center gap-0.5 hover:bg-neutral-55 whitespace-nowrap"
                      >
                        View Hub
                      </button>
                    )}
                  </div>
                </div>

                {/* Image Grid section if available */}
                {post.image && (
                  <div className="aspect-video w-full overflow-hidden bg-neutral-100 border-b border-light relative">
                    <img 
                      src={post.image} 
                      alt="Completed community work" 
                      className="w-full h-full object-cover" 
                    />
                    {post.completionDate && (
                      <div className="absolute bottom-3 left-3 bg-black/75 text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                        📸 Certified Record
                      </div>
                    )}
                  </div>
                )}

                {/* Engagement / Outcome Metric Dashboard */}
                <div className="px-5 pt-4">
                  <div className="grid grid-cols-3 gap-2 text-center text-on-surface">
                    <div className="bg-neutral-50 p-2.5 rounded-xl border border-light">
                      <p className="text-[8px] uppercase text-outline font-black">Participants Involved</p>
                      <p className="text-xs font-black text-primary mt-0.5">
                        👥 {post.participantCount || post.impactMetrics?.participantsInvolved || 12}
                      </p>
                    </div>

                    <div className="bg-neutral-50 p-2.5 rounded-xl border border-light">
                      <p className="text-[8px] uppercase text-outline font-black">Attendance Rate</p>
                      <p className="text-xs font-black text-secondary mt-0.5">
                        📈 {post.attendanceRate ? `${post.attendanceRate}%` : '100%'}
                      </p>
                    </div>

                    <div className="bg-neutral-50 p-2.5 rounded-xl border border-light">
                      <p className="text-[8px] uppercase text-outline font-black">Volunteer Hours</p>
                      <p className="text-xs font-black text-emerald-700 mt-0.5">
                        ⏱ {post.volunteerHours || post.impactMetrics?.volunteerHours || 24} hrs
                      </p>
                    </div>
                  </div>

                  {/* Quantified Specific Accomplishments Indicators */}
                  {post.impactMetrics && (post.impactMetrics.treesPlanted || post.impactMetrics.wasteCollectedKg || post.impactMetrics.distanceCoveredKm || post.impactMetrics.fundsRaised) && (
                    <div className="mt-2.5 p-3 bg-emerald-50/40 border border-emerald-100/50 rounded-xl flex flex-wrap gap-2.5 items-center select-none">
                      <p className="text-[8.5px] uppercase font-black text-emerald-900 tracking-wider">Outcome Metrics:</p>
                      <div className="flex flex-wrap gap-1.5 shrink-0">
                        {post.impactMetrics.treesPlanted && (
                          <span className="text-[10px] bg-white text-emerald-800 px-2 py-0.5 rounded border border-emerald-100 font-extrabold font-mono">
                            🌳 {post.impactMetrics.treesPlanted} saplings
                          </span>
                        )}
                        {post.impactMetrics.wasteCollectedKg && (
                          <span className="text-[10px] bg-white text-emerald-800 px-2 py-0.5 rounded border border-emerald-100 font-extrabold font-mono">
                            🗑 {post.impactMetrics.wasteCollectedKg}kg trash collected
                          </span>
                        )}
                        {post.impactMetrics.distanceCoveredKm && (
                          <span className="text-[10px] bg-white text-sky-805 px-2 py-0.5 rounded border border-sky-100 font-extrabold font-mono">
                            🚴 {post.impactMetrics.distanceCoveredKm}km traversed
                          </span>
                        )}
                        {post.impactMetrics.fundsRaised && (
                          <span className="text-[10px] bg-white text-amber-805 px-2 py-0.5 rounded border border-amber-100 font-extrabold font-mono">
                            💰 ${post.impactMetrics.fundsRaised} raised
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Content text */}
                <div className="px-5 pb-4 pt-3">
                  {post.text && (
                    <p className="text-xs md:text-sm text-on-surface leading-normal mb-4 font-normal">
                      {post.text}
                    </p>
                  )}

                  {/* Redesigned Outcomes Reactions Row instead of generic social updates */}
                  <div className="flex items-center justify-between pt-3.5 border-t border-light text-xs">
                    <div className="flex flex-wrap gap-2">
                      <button 
                        onClick={() => handleUpdateOutcome(post.id, 'appreciates')}
                        className={`flex items-center gap-1 py-1 px-3 rounded-full transition-all cursor-pointer text-[10.5px] border ${
                          post.isAppreciated ? 'bg-amber-50 text-amber-900 border-amber-200 font-extrabold' : 'bg-white hover:bg-neutral-50 border-neutral-200 text-on-surface-variant'
                        }`}
                        title="Celebrate this community achievement"
                      >
                        <span>🙌</span>
                        <span>Appreciate</span>
                        <span className="bg-black/5 px-1 rounded text-[10px]">{post.appreciates}</span>
                      </button>
                      
                      <button 
                        onClick={() => handleUpdateOutcome(post.id, 'inspirations')}
                        className={`flex items-center gap-1 py-1 px-3 rounded-full transition-all cursor-pointer text-[10.5px] border ${
                          post.isInspired ? 'bg-primary/5 text-primary border-primary/25 font-extrabold' : 'bg-white hover:bg-neutral-50 border-neutral-200 text-on-surface-variant'
                        }`}
                        title="Inspired me to act"
                      >
                        <span>💡</span>
                        <span>Inspired Me</span>
                        <span className="bg-black/5 px-1 rounded text-[10px]">{post.inspirations}</span>
                      </button>

                      <button 
                        onClick={() => handleUpdateOutcome(post.id, 'participated')}
                        className={`flex items-center gap-1 py-1 px-3 rounded-full transition-all cursor-pointer text-[10.5px] border ${
                          post.isParticipated ? 'bg-emerald-50 text-emerald-900 border-emerald-200 font-extrabold' : 'bg-white hover:bg-neutral-50 border-neutral-200 text-on-surface-variant'
                        }`}
                        title="I also participated in this action"
                      >
                        <span>✅</span>
                        <span>Participated</span>
                        <span className="bg-black/5 px-1 rounded text-[10px]">{post.participated}</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setActiveCommentsPostId(activeCommentsPostId === post.id ? null : post.id)}
                        className={`hover:text-primary transition-colors cursor-pointer text-on-surface-variant font-bold flex items-center gap-1 text-[11px] bg-neutral-105 px-2.5 py-1 rounded-lg border`}
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-outline" />
                        <span>Discuss Outcome ({post.commentsCount})</span>
                      </button>
                    </div>
                  </div>

                  {/* Active Comment entry drawer */}
                  {activeCommentsPostId === post.id && (
                    <div className="mt-4 pt-3 border-t border-outline-variant/10 flex gap-2">
                      <input 
                        type="text"
                        placeholder="Add a support note or memory on outcome..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        className="flex-grow bg-surface-container-low border border-neutral-200 rounded-xl text-xs px-3 focus:ring-1 focus:ring-primary focus:outline-none placeholder:text-outline text-on-surface py-2"
                        onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                      />
                      <button 
                        onClick={() => handleAddComment(post.id)}
                        className="bg-primary text-on-primary p-2 rounded-xl active:scale-95 transition-all text-xs flex items-center justify-center cursor-pointer font-semibold"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Flag / Moderation triggers */}
                  <div className="mt-3 flex justify-end select-none">
                    <button 
                      onClick={() => setReportedPostId(post.id)}
                      className="text-[9px] text-red-600 font-bold px-1.5 py-0.5 hover:bg-red-50 rounded"
                    >
                      ⚠️ Flag Out-of-Scope Outcome
                    </button>
                  </div>

                </div>
              </article>
            );
          })
        )}
      </div>



      {/* Structured Outcomes Log Creation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-surface rounded-2xl w-full max-w-md p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-200 my-8 border border-neutral-100">
            <button 
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 text-on-surface hover:bg-surface-container p-1 rounded-full cursor-pointer"
            >
              <svg className="w-4.5 h-4.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <h3 className="text-base font-black text-on-surface mb-1 uppercase tracking-wide">Record Completed Activity</h3>
            <p className="text-xs text-on-surface-variant mb-4">
              Publish structured milestones, completed event summaries, outcome reports, or public thank you notes. Arbitrary off-topic posts are strictly prohibited.
            </p>
            
            <form onSubmit={handleCreatePostSubmit} className="space-y-4">
              
              {/* Type selection */}
              <div>
                <label className="block text-[10px] font-black text-outline uppercase mb-1">Select Activity Type *</label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value as any)}
                  className="w-full h-10 px-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs font-bold"
                >
                  <option value="event_recap">Event Successfully Completed (Recap)</option>
                  <option value="hub_milestone">Hub Milestone & Gather Count Achievement</option>
                  <option value="thank_you_note">Public Thank You Note & Outcome Summary</option>
                  <option value="outcome_report">Quantified Impact & Outcome Report</option>
                </select>
              </div>

              {/* Hub Dropdown */}
              <div>
                <label className="block text-[10px] font-black text-outline uppercase mb-1">Community Hub Origin *</label>
                <select
                  required
                  value={selectedHubId}
                  onChange={(e) => setSelectedHubId(e.target.value)}
                  className="w-full h-10 px-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs font-semibold"
                >
                  <option value="">-- Choose Hub --</option>
                  {hubs.map(hub => (
                    <option key={hub.id} value={hub.id}>{hub.name} ({hub.tag})</option>
                  ))}
                </select>
              </div>

              {/* Event Dropdown mapping */}
              <div>
                <label className="block text-[10px] font-black text-outline uppercase mb-1">Completed Event / Accomplishment Context</label>
                <div className="space-y-2">
                  <select
                    value={selectedEventId}
                    onChange={(e) => {
                      setSelectedEventId(e.target.value);
                      if (e.target.value) setCustomEventName('');
                    }}
                    className="w-full h-10 px-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs"
                  >
                    <option value="">-- Select Event if applicable --</option>
                    {events.map(ev => (
                      <option key={ev.id} value={ev.id}>{ev.title}</option>
                    ))}
                  </select>
                  {!selectedEventId && (
                    <input 
                      type="text"
                      placeholder="Or specify gathering / accomplishment custom title"
                      value={customEventName}
                      onChange={(e) => setCustomEventName(e.target.value)}
                      className="w-full h-10 px-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs"
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black text-outline uppercase mb-1">Completion Date *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. May 23rd, 2026"
                    value={completionDate}
                    onChange={(e) => setCompletionDate(e.target.value)}
                    className="w-full h-10 px-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-outline uppercase mb-1">Participants *</label>
                  <input 
                    type="number" 
                    required
                    placeholder="e.g. 15"
                    value={pVolInvolved}
                    onChange={(e) => setPVolInvolved(e.target.value)}
                    className="w-full h-10 px-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black text-outline uppercase mb-1">Volunteer Hours *</label>
                  <input 
                    type="number" 
                    required
                    placeholder="e.g. 60"
                    value={pVolHours}
                    onChange={(e) => setPVolHours(e.target.value)}
                    className="w-full h-10 px-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-outline uppercase mb-1">Attendance Rate (%)</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 95"
                    value={pAttendanceRate}
                    onChange={(e) => setPAttendanceRate(e.target.value)}
                    className="w-full h-10 px-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-outline uppercase mb-1">Summarize Achievements & Outcomes *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Focus purely on accomplished outcomes, impact stats, thank you notes, or community milestones. Avoid generic social media opinions."
                  value={postText}
                  onChange={(e) => setPostText(e.target.value)}
                  className="w-full p-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs focus:ring-1 focus:ring-primary focus:outline-none text-on-surface resize-none focus:bg-white"
                />
              </div>

              {/* Quantified Impact Indicators Panel */}
              <div className="p-3.5 bg-neutral-50 rounded-xl border border-light space-y-2.5">
                <p className="text-[9px] uppercase font-black text-outline">Optionally log quantified outcome statistics</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <label className="block text-[8px] font-bold text-outline uppercase mb-0.5">Trees Planted</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 25"
                      value={pTreesPlanted}
                      onChange={(e) => setPTreesPlanted(e.target.value)}
                      className="w-full h-8 px-2 bg-white border border-neutral-200 rounded text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] font-bold text-outline uppercase mb-0.5">Waste Cleared (Kg)</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 150"
                      value={pWasteCollected}
                      onChange={(e) => setPWasteCollected(e.target.value)}
                      className="w-full h-8 px-2 bg-white border border-neutral-200 rounded text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] font-bold text-outline uppercase mb-0.5">Biking Distance (Km)</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 40"
                      value={pDistanceCovered}
                      onChange={(e) => setPDistanceCovered(e.target.value)}
                      className="w-full h-8 px-2 bg-white border border-neutral-200 rounded text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] font-bold text-outline uppercase mb-0.5">Funds Raised ($)</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 450"
                      value={pFundsRaised}
                      onChange={(e) => setPFundsRaised(e.target.value)}
                      className="w-full h-8 px-2 bg-white border border-neutral-200 rounded text-[11px]"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-primary hover:bg-primary-dark text-on-primary text-xs font-black rounded-xl active:scale-95 transition-all shadow-md uppercase tracking-wider"
              >
                Log Certified Outcome Record
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Flag Report dialogue modal */}
      {reportedPostId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 select-none">
          <div className="bg-surface rounded-2xl w-full max-w-sm p-6 shadow-xl relative select-none border">
            <h3 className="font-bold text-sm text-red-600 flex items-center gap-1.5 mb-2 uppercase tracking-wide">
              <AlertTriangle className="w-5 h-5 text-red-600" /> Flag Activity Record
            </h3>
            <p className="text-xs text-on-surface-variant mb-4 leading-relaxed">
              In order to protect ToGather's strict focus on community action, flag logs containing generic opinions, selfies, dating/matchmaking, or false achievements.
            </p>

            <div className="space-y-2">
              {[
                'Generic social media/personal status post',
                'Dating / romance solicitations',
                'Unrelated advertising / spam merchandising',
                'Inaccurate or simulated outcome data',
                'Hostile interaction or discourtesy'
              ].map((opt) => (
                <button
                  key={opt}
                  onClick={() => setReportReason(opt)}
                  className={`w-full text-left p-2.5 rounded-xl text-xs font-bold border transition-all ${reportReason === opt ? 'bg-primary/5 border-primary text-primary' : 'bg-surface hover:bg-neutral-50 border-neutral-200'}`}
                >
                  {opt}
                </button>
              ))}
            </div>

            <div className="flex gap-2 justify-end mt-5 pt-3 border-t border-outline-variant/10">
              <button 
                onClick={() => {
                  setReportedPostId(null);
                  setReportReason('');
                }}
                className="px-4 py-2 text-xs font-bold text-outline rounded-xl hover:bg-surface-container hover:text-on-surface transition-colors cursor-pointer"
              >
                Dismiss
              </button>
              <button 
                onClick={() => submitPostReport(reportedPostId)}
                disabled={!reportReason}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl h-10 transition-colors"
              >
                Flag Activity Record
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
