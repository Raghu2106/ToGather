/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Shield, 
  Users, 
  Compass, 
  X, 
  ShieldAlert, 
  CheckCircle, 
  UserCheck, 
  Flag, 
  Sliders, 
  Trash, 
  Sparkles, 
  TrendingUp, 
  BarChart2, 
  MessageSquare, 
  Award, 
  Lock, 
  FileText, 
  Settings as SettingsIcon, 
  Radio, 
  Activity, 
  AlertTriangle, 
  Check, 
  Ban, 
  Eye, 
  AlertCircle,
  FileCheck,
  MapPin,
  Clock,
  Heart,
  Undo
} from 'lucide-react';
import { Hub, EventEntity, FeedPost, UserProfile, AttendanceRecord } from '../types';

export interface ReportTicket {
  id: string;
  type: 'hub' | 'event' | 'post' | 'comment' | 'organizer';
  targetId: string;
  targetName: string;
  reporterName: string;
  category: 'Spam' | 'Harassment' | 'Misleading Information' | 'Inappropriate Content' | 'Safety Concern' | 'Fake Event' | 'Fake Organizer' | 'Other';
  details: string;
  timestamp: string;
  status: 'Pending' | 'Dismissed' | 'Enforced';
}

export interface VerificationRequest {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  appliedStatus: 'Identity Verified' | 'Trusted Organizer';
  reason: string;
  supportingInfo: string;
  timestamp: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

interface AdminPortalProps {
  onBackToApp: () => void;
  hubs: Hub[];
  events: EventEntity[];
  posts: FeedPost[];
  profile: UserProfile;
  tickets: ReportTicket[];
  verificationRequests: VerificationRequest[];
  onUpdateHubs: (updated: Hub[]) => void;
  onUpdateEvents: (updated: EventEntity[]) => void;
  onUpdatePosts: (updated: FeedPost[]) => void;
  onUpdateTickets: (updated: ReportTicket[]) => void;
  onUpdateVerificationRequests: (updated: VerificationRequest[]) => void;
  onUpdateProfile: (updated: UserProfile) => void;
}

type AdminTab = 
  | 'dashboard' 
  | 'users' 
  | 'communities' 
  | 'events' 
  | 'reports' 
  | 'verifications' 
  | 'event-request' 
  | 'moderation-queue' 
  | 'analytics' 
  | 'settings';

export default function AdminPortal({
  onBackToApp,
  hubs,
  events,
  posts,
  profile,
  tickets,
  verificationRequests,
  onUpdateHubs,
  onUpdateEvents,
  onUpdatePosts,
  onUpdateTickets,
  onUpdateVerificationRequests,
  onUpdateProfile
}: AdminPortalProps) {
  // Authorization State
  const [passkeyInput, setPasskeyInput] = useState('');
  const [usernameInput, setUsernameInput] = useState('');
  const [isAuthorized, setIsAuthorized] = useState<boolean>(() => {
    return localStorage.getItem('togather_admin_authorized') === 'true';
  });
  const [authError, setAuthError] = useState('');

  // Active module state
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [evidenceViewer, setEvidenceViewer] = useState<any | null>(null);

  // Settings mock states
  const [strictConductLevel, setStrictConductLevel] = useState('Balanced');
  const [requirePhotoToComplete, setRequirePhotoToComplete] = useState(true);
  const [allowInstantHubCreation, setAllowInstantHubCreation] = useState(true);

  // Handle staff login
  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      (usernameInput.toLowerCase() === 'admin' && passkeyInput === 'togather2026') || 
      passkeyInput === 'admin'
    ) {
      setIsAuthorized(true);
      setAuthError('');
      localStorage.setItem('togather_admin_authorized', 'true');
    } else {
      setAuthError('Invalid credentials. Staff keys are protected under security protocols.');
    }
  };

  const handleDeauthorize = () => {
    setIsAuthorized(false);
    localStorage.removeItem('togather_admin_authorized');
  };

  // Human Moderator Actions
  const handleApproveUserVerification = (requestId: string) => {
    const request = verificationRequests.find(r => r.id === requestId);
    if (!request) return;

    // Update request status
    onUpdateVerificationRequests(
      verificationRequests.map(r => r.id === requestId ? { ...r, status: 'Approved' } : r)
    );

    // If it's the current user, update their status
    if (request.userName === profile.name || request.userId === 'current-user') {
      onUpdateProfile({
        ...profile,
        verificationStatus: request.appliedStatus,
        isTrustedOrganizer: request.appliedStatus === 'Trusted Organizer'
      });
    }

    alert(`Voluntary request approved! User "${request.userName}" elevated to: ${request.appliedStatus}`);
  };

  const handleRejectUserVerification = (requestId: string) => {
    onUpdateVerificationRequests(
      verificationRequests.map(r => r.id === requestId ? { ...r, status: 'Rejected' } : r)
    );
    alert('User verification request declined. Applicant has been notified.');
  };

  const handleActionReportTicket = (ticketId: string, action: 'Dismiss' | 'Enforce') => {
    const updatedTickets = tickets.map(t => {
      if (t.id === ticketId) {
        return { ...t, status: action === 'Dismiss' ? 'Dismissed' as const : 'Enforced' as const };
      }
      return t;
    });
    onUpdateTickets(updatedTickets);

    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return;

    if (action === 'Dismiss') {
      // Clear reported flag in original content
      if (ticket.type === 'hub') {
        onUpdateHubs(hubs.map(h => h.id === ticket.targetId ? { ...h, reported: false, reportedReason: undefined } : h));
      } else if (ticket.type === 'event') {
        onUpdateEvents(events.map(e => e.id === ticket.targetId ? { ...e, reported: false, reportedReason: undefined } : e));
      } else if (ticket.type === 'post') {
        onUpdatePosts(posts.map(p => p.id === ticket.targetId ? { ...p, reported: false, reportedReason: undefined } : p));
      }
      alert('Report Ticket dismissed. No code violation determined.');
    } else {
      // Suspend / Delete the targeted content
      if (ticket.type === 'hub') {
        onUpdateHubs(hubs.map(h => h.id === ticket.targetId ? { ...h, suspended: true } : h));
        alert(`Safety Enforcement: Hub "${ticket.targetName}" has been suspended.`);
      } else if (ticket.type === 'event') {
        onUpdateEvents(events.map(e => e.id === ticket.targetId ? { ...e, suspended: true } : e));
        alert(`Safety Enforcement: Event "${ticket.targetName}" suspended.`);
      } else if (ticket.type === 'post') {
        onUpdatePosts(posts.filter(p => p.id !== ticket.targetId));
        alert(`Safety Enforcement: Outgoing post text removed from public feeds.`);
      }
    }
  };

  const handleManualUserElevate = (userName: string, status: 'Member' | 'Identity Verified' | 'Trusted Organizer') => {
    if (userName === profile.name) {
      onUpdateProfile({
        ...profile,
        verificationStatus: status,
        isTrustedOrganizer: status === 'Trusted Organizer'
      });
      alert(`Manual upgrade: Your own profile is now set to ${status}.`);
    } else {
      // Elevate organizer/author status across events and posts as well
      onUpdateEvents(events.map(e => e.organizerName === userName ? { ...e, organizerVerification: status } : e));
      onUpdatePosts(posts.map(p => p.author === userName ? { ...p, authorVerification: status } : p));
      alert(`User profile for "${userName}" manually updated to: ${status}`);
    }
  };

  // Event completion submissions manual evaluation
  const handleApproveEventCompletion = (eventId: string) => {
    onUpdateEvents(events.map(evt => {
      if (evt.id === eventId) {
        // Construct Public Outcome Story
        const freshPost: FeedPost = {
          id: `post-auto-${Date.now()}`,
          avatar: evt.organizerAvatar,
          author: evt.organizerName,
          authorVerification: evt.organizerVerification,
          subtext: `Outcome Approved • ${evt.location}`,
          text: `🎯 VERIFIED EVENT COMPLETED: Under voluntary neighborhood coordination, "${evt.title}" has successfully passed thorough GPS and photo logs audit. Our blocks are cleaner and stronger!`,
          tags: [`#${evt.category}`],
          appreciates: 3,
          inspirations: 2,
          participated: evt.attendeesCount || 10,
          commentsCount: 2,
          isBookmarked: false,
          impactMetrics: {
            volunteerHours: evt.capacity ? evt.capacity * 2 : 24,
            participantsInvolved: evt.attendeesCount || 10
          }
        };

        // Prepend fresh post
        onUpdatePosts([freshPost, ...posts]);

        // Dynamically process verified attendance and award +10 Impact points to matching profiles
        try {
          const savedRecs = localStorage.getItem('togather_attendance_records');
          if (savedRecs) {
            const records: AttendanceRecord[] = JSON.parse(savedRecs);
            let updatedSome = false;
            const updatedRecs = records.map(rec => {
              if (rec.eventId === eventId && !rec.impactAwarded) {
                updatedSome = true;
                // Award points if matching current user
                if (rec.userName === profile.name) {
                  onUpdateProfile({
                    ...profile,
                    impactPoints: (profile.impactPoints || 530) + 10
                  });
                }
                return { ...rec, impactAwarded: true };
              }
              return rec;
            });
            if (updatedSome) {
              localStorage.setItem('togather_attendance_records', JSON.stringify(updatedRecs));
            }
          }
        } catch (err) {
          console.error("Failed to process attendance impact award", err);
        }

        return {
          ...evt,
          isCompleted: true,
          isVerifiedConduct: true,
          completionSubmission: evt.completionSubmission ? { ...evt.completionSubmission, status: 'Approved' } : undefined
        };
      }
      return evt;
    }));

    alert('Completion Evidence APPROVED manually! Physical checked-in participants successfully received +10 Impact Scores, and dynamic outcomes are posted to neighborhood feeds.');
  };

  const handleRejectEventCompletion = (eventId: string) => {
    onUpdateEvents(events.map(evt => {
      if (evt.id === eventId) {
        return {
          ...evt,
          isCompleted: false,
          completionSubmission: evt.completionSubmission ? { ...evt.completionSubmission, status: 'Rejected' } : undefined
        };
      }
      return evt;
    }));
    alert('Completion Evidence declined. Host has been notified to re-submit geotag credentials.');
  };

  const handleToggleHubState = (hubId: string) => {
    onUpdateHubs(
      hubs.map(h => h.id === hubId ? { ...h, suspended: !h.suspended } : h)
    );
  };

  const handleToggleEventState = (eventId: string) => {
    onUpdateEvents(
      events.map(e => e.id === eventId ? { ...e, suspended: !e.suspended } : e)
    );
  };

  // Verification request count bubbles
  const pendingRequestsCount = verificationRequests.filter(r => r.status === 'Pending').length;
  const pendingCompletionsCount = events.filter(e => e.completionSubmission && e.completionSubmission.status === 'Pending').length;
  const activeReportsCount = tickets.filter(t => t.status === 'Pending').length;
  const totalModerationQueueCount = pendingRequestsCount + pendingCompletionsCount + activeReportsCount;

  // Render Gate Access Sign-In screen if not authorized
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col justify-between p-6">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-amber-500 to-indigo-600" />
        
        <div className="flex-grow flex items-center justify-center">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl relative">
            <div className="flex justify-center mb-4">
              <span className="p-4 bg-slate-800 text-red-500 rounded-2xl border border-slate-700">
                <Shield className="w-8 h-8" />
              </span>
            </div>

            <h2 className="text-xl font-extrabold text-center uppercase tracking-wider text-slate-100">
              ToGather Staff Gateway
            </h2>
            <p className="text-xs text-center text-slate-400 mt-1 mb-6 leading-relaxed">
              Internal Administrative Security Center. Public access is strictly forbidden. Unauthorized access attempts are monitored and logged.
            </p>

            {authError && (
              <div className="mb-4 bg-red-950/40 border border-red-900 text-red-200 text-[10px] font-semibold py-2.5 px-3 rounded-xl flex items-start gap-2 animate-pulse">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div>
                <label className="block text-[9px] uppercase tracking-wider font-extrabold text-slate-400 mb-1">
                  Operator Username
                </label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. admin"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  className="w-full h-11 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-red-500 focus:bg-slate-950 transition-colors placeholder:text-slate-600"
                />
              </div>

              <div>
                <label className="block text-[9px] uppercase tracking-wider font-extrabold text-slate-400 mb-1">
                  Security Passkey
                </label>
                <input 
                  type="password"
                  required
                  placeholder="Enter administrator passcode"
                  value={passkeyInput}
                  onChange={(e) => setPasskeyInput(e.target.value)}
                  className="w-full h-11 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-red-500 focus:bg-slate-950 transition-colors placeholder:text-slate-600"
                />
              </div>

              <button
                type="submit"
                className="w-full h-12 bg-red-700 hover:bg-red-800 text-white rounded-xl font-bold text-xs active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-red-950/20"
              >
                <Lock className="w-4 h-4" /> Authenticate Terminal
              </button>
            </form>

            <div className="relative flex py-3 items-center mt-6">
              <div className="flex-grow border-t border-slate-800"></div>
              <span className="flex-shrink mx-3 text-[8.5px] uppercase tracking-widest font-extrabold text-slate-600">Verification Guidelines</span>
              <div className="flex-grow border-t border-slate-800"></div>
            </div>

            <p className="text-[9px] text-slate-500 leading-normal text-center">
              Quick demo keys: enter <b>admin</b> as password to fast-track login.
            </p>
          </div>
        </div>

        <div className="flex justify-between items-center text-[10px] text-slate-500 max-w-md mx-auto w-full pt-4 border-t border-slate-900">
          <button 
            onClick={onBackToApp} 
            className="flex items-center gap-1 hover:text-slate-350 cursor-pointer text-[10px]"
          >
            <Undo className="w-3.5 h-3.5" /> Return to Public App
          </button>
          <span>SSL Secure • Port 3000 Active</span>
        </div>
      </div>
    );
  }

  // ACTIVE ADMIN PORTAL PANEL TEMPLATE
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans flex flex-col md:flex-row">
      
      {/* 1. Left Sidebar Navigation Panel */}
      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-850 flex flex-col justify-between shrink-0">
        
        {/* Brand & Stats Area */}
        <div>
          <div className="p-4 border-b border-slate-850 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-red-955/20 text-red-550 border border-red-900/30 rounded-lg">
                <Shield className="w-4 h-4" />
              </span>
              <div>
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-100">ToGather Admin</h2>
                <p className="text-[8px] text-slate-450 font-semibold tracking-widest">OPS PORTAL BACKEND</p>
              </div>
            </div>
            <button 
              onClick={onBackToApp}
              className="py-1 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 font-extrabold text-[9.5px] flex items-center gap-1 cursor-pointer"
            >
              Public App
            </button>
          </div>

          {/* Sidebar Menu Options */}
          <nav className="p-3 space-y-1">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Activity },
              { id: 'users', label: 'Users Manager', icon: Users },
              { id: 'communities', label: 'Communities List', icon: Compass },
              { id: 'events', label: 'Events List', icon: Sliders },
              { 
                id: 'reports', 
                label: 'Report Tickets', 
                icon: Flag, 
                bubble: activeReportsCount 
              },
              { 
                id: 'verifications', 
                label: 'Verifications Queue', 
                icon: UserCheck, 
                bubble: pendingRequestsCount 
              },
              { 
                id: 'event-request', 
                label: 'Event Completions', 
                icon: Award, 
                bubble: pendingCompletionsCount 
              },
              { 
                id: 'moderation-queue', 
                label: 'Moderation Queue', 
                icon: ShieldAlert, 
                bubble: totalModerationQueueCount, 
                alert: true 
              },
              { id: 'analytics', label: 'System Analytics', icon: BarChart2 },
              { id: 'settings', label: 'Regulations Settings', icon: SettingsIcon }
            ].map((m) => {
              const IconComp = m.icon;
              return (
                <button
                  key={m.id}
                  onClick={() => setActiveTab(m.id as AdminTab)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs font-semibold cursor-pointer transition-colors ${
                    activeTab === m.id 
                      ? 'bg-red-700 text-white' 
                      : 'text-slate-400 hover:bg-slate-850 hover:text-slate-200'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <IconComp className="w-4 h-4 shrink-0" />
                    <span>{m.label}</span>
                  </span>
                  {m.bubble && m.bubble > 0 ? (
                    <span className={`text-[8.5px] font-black px-1.5 py-0.5 rounded-full ${m.alert ? 'bg-amber-550 text-slate-950 animate-pulse' : 'bg-slate-800 text-slate-200'}`}>
                      {m.bubble}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Info */}
        <div className="p-4 border-t border-slate-850 space-y-3 bg-slate-905">
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-850 flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <div>
              <p className="text-[8.5px] uppercase font-bold text-slate-400 leading-tight truncate">Operator: {profile.name}</p>
              <p className="text-[8px] text-slate-500 leading-tight">Terminal Root Authorized</p>
            </div>
          </div>
          <button 
            onClick={handleDeauthorize}
            className="w-full py-2 hover:bg-red-950/30 hover:text-red-400 text-slate-500 text-[10px] font-bold rounded-lg border border-slate-800 transition-colors cursor-pointer"
          >
            Lock Admin Console
          </button>
        </div>

      </aside>

      {/* 2. Main Content viewport board */}
      <main className="flex-grow p-4 md:p-6 overflow-y-auto max-w-7xl mx-auto w-full">
        
        {/* Module Header Title Display */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-850 pb-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-slate-400 text-xs">
              <span>OPS TERMINAL</span>
              <span>/</span>
              <span className="capitalize text-red-500 font-bold">{activeTab.replace('-', ' ')}</span>
            </div>
            <h1 className="text-xl font-extrabold text-white mt-1 uppercase tracking-wider">
              {activeTab === 'dashboard' && 'SYSTEM STABILITY CONTROL'}
              {activeTab === 'users' && 'ACCOUNT SECURITY MANAGEMENTS'}
              {activeTab === 'communities' && 'COMMUNITIES STATUS AUDITOR'}
              {activeTab === 'events' && 'EVENTS LOGISTICS OVERSEER'}
              {activeTab === 'reports' && 'ACTIVE REPORT TICKETS'}
              {activeTab === 'verifications' && 'VOLUNTARY CREDENTIAL REQUESTS'}
              {activeTab === 'event-request' && 'EVENT COMPLETION EVIDENCE REVIEW'}
              {activeTab === 'moderation-queue' && 'UNIFIED HUMAN MODERATION QUEUE'}
              {activeTab === 'analytics' && 'ECOSYSTEM ANALYTICS REPORT'}
              {activeTab === 'settings' && 'CIVIC GUIDELINES SETUP'}
            </h1>
            <p className="text-xs text-slate-405 mt-0.5 font-medium">
              {activeTab === 'dashboard' && 'Oversee geocodes, live counters, and active verification logs.'}
              {activeTab === 'users' && 'Verify citizen identities, upgrade organizers, and control account states.'}
              {activeTab === 'communities' && 'Ensure neighbor groups maintain strictly productive non-dating agendas.'}
              {activeTab === 'events' && 'Review schedules, maps, and safety alerts.'}
              {activeTab === 'reports' && 'Manually evaluate spam, harassment, inappropriate content, and spam logs.'}
              {activeTab === 'verifications' && 'Evaluate voluntary submissions for Identity Verified or Trusted Organizer.'}
              {activeTab === 'event-request' && 'Audit venue proofs, attendee logs, and completion photographs.'}
              {activeTab === 'moderation-queue' && 'Human review dashboard of all outstanding action tickets.'}
              {activeTab === 'analytics' && 'Live performance updates of community trust levels.'}
              {activeTab === 'settings' && 'Configure automated switches and enforce search-privacy compliance.'}
            </p>
          </div>

          <div className="text-[10px] bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 flex items-center gap-1">
            <Radio className="w-3.5 h-3.5 text-red-500 animate-pulse" />
            <span className="font-bold text-slate-350">Search Surveillance Policy:</span>
            <span className="text-emerald-500 font-extrabold uppercase">Disabled (Enforced)</span>
          </div>
        </div>

        {/* -------------------- MODULE 1: DASHBOARD MODULE -------------------- */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            
            {/* System Status Indicators Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-md">
                <div>
                  <p className="text-[9px] uppercase font-bold text-slate-450 tracking-wider">Active Local Hubs</p>
                  <p className="text-xl font-extrabold text-slate-100 mt-1">{hubs.length}</p>
                  <span className="text-[8.5px] text-emerald-500 font-bold bg-emerald-950/40 px-1.5 py-0.5 rounded-md border border-emerald-900/30">100% Active</span>
                </div>
                <span className="p-3 bg-slate-800 text-slate-200 rounded-xl"><Compass className="w-6 h-6" /></span>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-md">
                <div>
                  <p className="text-[9px] uppercase font-bold text-slate-450 tracking-wider">Live Active Events</p>
                  <p className="text-xl font-extrabold text-slate-100 mt-1">{events.filter(e => !e.isCompleted && !e.suspended).length}</p>
                  <span className="text-[8.5px] text-slate-400 font-bold">{events.filter(e => e.isCompleted).length} Completed</span>
                </div>
                <span className="p-3 bg-slate-800 text-slate-200 rounded-xl"><Sliders className="w-6 h-6" /></span>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-md">
                <div>
                  <p className="text-[9px] uppercase font-bold text-slate-450 tracking-wider">Open Reports</p>
                  <p className="text-xl font-extrabold text-red-500 mt-1">{activeReportsCount}</p>
                  <span className="text-[8.5px] text-red-400 font-bold bg-red-950/40 px-1.5 py-0.5 rounded-md border border-red-900/30">{activeReportsCount > 0 ? 'Requires Action' : 'Cleared'}</span>
                </div>
                <span className="p-3 bg-slate-800 text-slate-200 rounded-xl"><Flag className="w-6 h-6" /></span>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-md">
                <div>
                  <p className="text-[9px] uppercase font-bold text-slate-450 tracking-wider">Review Queue</p>
                  <p className="text-xl font-extrabold text-amber-500 mt-1">{totalModerationQueueCount}</p>
                  <span className="text-[8.5px] text-amber-500 font-bold bg-amber-950/40 px-1.5 py-0.5 rounded-md border border-amber-900/30">{totalModerationQueueCount} Pending items</span>
                </div>
                <span className="p-3 bg-slate-800 text-slate-200 rounded-xl"><ShieldAlert className="w-6 h-6" /></span>
              </div>
            </div>

            {/* Quick Warning Display detailing core policy */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-start gap-3">
              <span className="p-2 bg-slate-800 text-amber-500 border border-slate-700 rounded-lg"><AlertCircle className="w-5 h-5 shrink-0" /></span>
              <div>
                <h4 className="text-xs font-bold text-slate-200">CORE ENFORCEMENT DIRECTIVE</h4>
                <p className="text-[10.5px] text-slate-400 mt-0.5 leading-relaxed">
                  ToGather is a report-driven, human-reviewed safety platform. Automated search monitoring or automatic account suspensions are strictly forbidden. Users must never be penalized, warned, or blocked simply for what they search. Searching is normal human activity. Every sanction requires an administrative moderator’s manual review of explicit user-submitted evidence.
                </p>
              </div>
            </div>

            {/* Verification & Reports summaries */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Box A: Emergency Moderator Alerts */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <h3 className="font-extrabold text-xs uppercase text-slate-100 flex items-center gap-1.5 border-b border-slate-800 pb-2 mb-3">
                  <Flag className="w-4 h-4 text-red-500" /> ACTIVE REPORT CONSOLE ({tickets.filter(t => t.status === 'Pending').length})
                </h3>
                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                  {tickets.filter(t => t.status === 'Pending').length > 0 ? (
                    tickets.filter(t => t.status === 'Pending').map(t => (
                      <div key={t.id} className="bg-slate-950 rounded-xl p-3 border border-slate-850 flex items-center justify-between text-xs">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="bg-red-950 text-red-400 text-[8.5px] font-black px-2 py-0.5 rounded uppercase border border-red-900/30">
                              {t.category}
                            </span>
                            <span className="text-slate-500 font-semibold">• Flagged: {t.type}</span>
                          </div>
                          <p className="font-bold text-slate-200 mt-1 truncate max-w-[200px]" title={t.targetName}>Target: {t.targetName}</p>
                          <p className="text-[10px] text-slate-450 italic shrink-0 truncate max-w-[200px] mt-0.5">&quot;{t.details}&quot;</p>
                        </div>
                        <button 
                          onClick={() => setActiveTab('reports')}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 text-[10px] font-bold rounded-lg border border-slate-700 cursor-pointer"
                        >
                          Review
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-[11px] text-slate-500">
                      ☺ Zero active report tickets pending. Great community health!
                    </div>
                  )}
                </div>
              </div>

              {/* Box B: Pending Completion Evidence Requests */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <h3 className="font-extrabold text-xs uppercase text-slate-100 flex items-center gap-1.5 border-b border-slate-800 pb-2 mb-3">
                  <Award className="w-4 h-4 text-emerald-500" /> EVENT VERIFICATION REQUESTS ({pendingCompletionsCount})
                </h3>
                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                  {events.some(e => e.completionSubmission && e.completionSubmission.status === 'Pending') ? (
                    events.filter(e => e.completionSubmission && e.completionSubmission.status === 'Pending').map(evt => (
                      <div key={evt.id} className="bg-slate-950 rounded-xl p-3 border border-slate-850 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-bold text-slate-200 truncate max-w-[220px]">{evt.title}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">Host: {evt.organizerName} • Attendance: {evt.completionSubmission?.attendanceEvidence}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[220px]">GPS Lock: {evt.completionSubmission?.venueProof}</p>
                        </div>
                        <button 
                          onClick={() => {
                            setEvidenceViewer(evt);
                            setActiveTab('event-request');
                          }}
                          className="px-3 py-1.5 bg-emerald-950/40 text-emerald-400 hover:bg-emerald-900/30 text-[10px] font-bold rounded-lg border border-emerald-900/30 cursor-pointer"
                        >
                          Audit
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-[11px] text-slate-500">
                      No event completion verifications submitted for review yet.
                    </div>
                  )}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* -------------------- MODULE 2: USERS MANAGER -------------------- */}
        {activeTab === 'users' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-6 space-y-6">
            
            <div className="bg-slate-950 p-4 border border-slate-850 rounded-2xl flex items-start gap-3">
              <span className="p-2 bg-slate-900 text-sky-500 rounded-xl"><UserCheck className="w-5 h-5" /></span>
              <div>
                <h4 className="text-xs font-bold text-slate-200">Voluntary Identity Verification & Organizer Elevating</h4>
                <p className="text-[10px] text-slate-450 leading-relaxed mt-0.5">
                  ToGather promotes trust through voluntary profile verifications. Operators can elevation profiles to ✓ Identity Verified members or 🛡 Trusted Organizers if documents are compliant.
                </p>
              </div>
            </div>

            {/* Simulated Users database directory */}
            <div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-350 mb-3">Citizen Registry Directory</h3>
              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                {[
                  { name: profile.name, email: profile.email, phone: profile.phone, status: profile.verificationStatus, icon: profile.avatar },
                  { name: 'David Atten', email: 'david@greenvolunteers.org', phone: '+1 (555) 303-9000', status: 'Trusted Organizer', icon: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
                  { name: 'Sara Miller', email: 'sara@millercomms.org', phone: '+1 (555) 441-2002', status: 'Identity Verified', icon: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80' },
                  { name: 'Marcus Chen', email: 'marcus@chenforestry.net', phone: '+1 (555) 129-9922', status: 'Identity Verified', icon: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
                  { name: 'Elena Rossi', email: 'elena@rossiplant.it', phone: '+1 (555) 777-3301', status: 'Member', icon: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80' }
                ].map((u, index) => (
                  <div key={index} className="bg-slate-950 p-4 rounded-xl border border-slate-850 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <img src={u.icon || undefined} alt={u.name} className="w-10 h-10 rounded-full object-cover border border-slate-800" />
                      <div>
                        <p className="font-extrabold text-slate-100 flex items-center gap-1">
                          {u.name}
                          {u.status === 'Trusted Organizer' && <span className="text-secondary text-[10px]" title="🛡 Trusted Organizer">🛡</span>}
                          {u.status === 'Identity Verified' && <span className="text-primary text-[10px]" title="✓ Identity Verified Member">✓</span>}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{u.email} • {u.phone}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded border ${
                        u.status === 'Trusted Organizer' 
                          ? 'bg-amber-950 border-amber-900/30 text-amber-400' 
                          : u.status === 'Identity Verified' 
                            ? 'bg-indigo-950 border-indigo-900/30 text-indigo-400' 
                            : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}>
                        Current Status: {u.status}
                      </span>
                      
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => handleManualUserElevate(u.name, 'Identity Verified')}
                          className="px-2.5 py-1 hover:bg-indigo-900/30 border border-slate-800 hover:border-indigo-900/50 text-[10px] font-bold text-indigo-400 rounded-lg transition-colors cursor-pointer"
                        >
                          Verify ID
                        </button>
                        <button 
                          onClick={() => handleManualUserElevate(u.name, 'Trusted Organizer')}
                          className="px-2.5 py-1 hover:bg-amber-900/30 border border-slate-800 hover:border-amber-900/50 text-[10px] font-bold text-amber-400 rounded-lg transition-colors cursor-pointer"
                        >
                          Upgrade Organizer
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* -------------------- MODULE 3: COMMUNITIES MANAGER -------------------- */}
        {activeTab === 'communities' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-6 space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-350">Platform Registered Communities</h3>
            
            <div className="space-y-3">
              {hubs.map(hub => (
                <div key={hub.id} className="bg-slate-950 p-4 border border-slate-850 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-3">
                    <img src={hub.image || undefined} alt={hub.name} className="w-12 h-12 rounded-xl object-cover border border-slate-800 shrink-0" />
                    <div>
                      <h4 className="font-bold text-slate-100 text-sm">{hub.name}</h4>
                      <p className="text-[10px] text-slate-450 mt-0.5">Tag: <span className="text-red-400 font-bold">{hub.tag}</span> • Members: {hub.members} • Rating: {hub.rating} ★</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded ${hub.suspended ? 'bg-red-950 text-red-400 border border-red-900/30' : 'bg-emerald-950 text-emerald-400 border border-emerald-900/30'}`}>
                      {hub.suspended ? 'Suspended' : 'Active / Live'}
                    </span>
                    <button 
                      onClick={() => handleToggleHubState(hub.id)}
                      className={`px-3 py-1.5 font-bold text-[10px] rounded-lg border transition-colors cursor-pointer ${hub.suspended ? 'bg-emerald-950/20 text-emerald-400 border-emerald-900/40 hover:bg-emerald-900/20' : 'bg-red-950/20 text-red-400 border-red-900/40 hover:bg-red-900/20'}`}
                    >
                      {hub.suspended ? 'Restore Community' : 'Suspend community'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* -------------------- MODULE 4: EVENTS MANAGER -------------------- */}
        {activeTab === 'events' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-6 space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-350">Platform Published Events</h3>
            
            <div className="space-y-3">
              {events.map(evt => (
                <div key={evt.id} className="bg-slate-950 p-4 border border-slate-850 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-3">
                    <img src={evt.image || undefined} alt={evt.title} className="w-12 h-12 rounded-xl object-cover border border-slate-800 shrink-0" />
                    <div>
                      <h4 className="font-bold text-slate-100 text-xs">{evt.title}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">{evt.date} • {evt.location} • Host: <span className="font-semibold text-slate-200">{evt.organizerName}</span></p>
                      <p className="text-[9px] text-slate-500 mt-0.5">Capacity limit: {evt.capacity} • RSVPs registered: {evt.attendeesCount} attendees</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded ${evt.suspended ? 'bg-red-950 text-red-400 border border-red-900/30' : 'bg-emerald-950 text-emerald-400 border border-emerald-900/30'}`}>
                      {evt.suspended ? 'Suspended' : 'Active Listing'}
                    </span>
                    <button 
                      onClick={() => handleToggleEventState(evt.id)}
                      className={`px-3 py-1.5 font-bold text-[10px] rounded-lg border transition-colors cursor-pointer ${evt.suspended ? 'bg-emerald-950/20 text-emerald-400 border-emerald-900/40 hover:bg-emerald-900/20' : 'bg-red-950/20 text-red-400 border-red-900/40 hover:bg-red-900/20'}`}
                    >
                      {evt.suspended ? 'Restore Event' : 'Suspend listing'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* -------------------- MODULE 5: ACTIVE REPORT TICKETS -------------------- */}
        {activeTab === 'reports' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-6 space-y-6">
            <div className="bg-slate-950 p-4 border border-slate-850 rounded-xl">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-100 flex items-center gap-1.5 mb-2">
                <Flag className="w-4 h-4 text-red-500" /> Active Citizen Reports Queue
              </h3>
              <p className="text-[10px] text-slate-400 leading-normal">
                Citizen submitted reports based on specific violations (Spam, Harassment, Misleading Information, Inappropriate Content, Safety Concern, Fake Event, Fake Organizer, Other). Review the evidence objectively.
              </p>
            </div>

            <div className="space-y-4 font-sans">
              {tickets.length > 0 ? (
                tickets.map(t => (
                  <div key={t.id} className="bg-slate-950 border border-slate-850 rounded-2xl p-4 flex flex-col justify-between gap-4 text-xs">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="bg-red-950/80 border border-red-900/30 text-red-400 font-black text-[9.5px] px-2.5 py-0.5 rounded">
                            Reason: {t.category}
                          </span>
                          <span className="text-slate-500">• Type:</span>
                          <span className="bg-slate-900 border border-slate-800 text-slate-350 px-2 py-0.5 rounded text-[9.5px] font-bold">
                            {t.type}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500">{t.timestamp}</span>
                      </div>

                      <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-850 space-y-1">
                        <p className="text-slate-400 text-[10px]">Flagged Node Context:</p>
                        <p className="font-extrabold text-slate-100 text-sm">{t.targetName}</p>
                        <p className="text-slate-500 text-[9px]">ID reference: {t.targetId}</p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-slate-400 text-[10px] font-medium">Submitted Reporter Detail & Evidence:</p>
                        <p className="text-slate-200 italic leading-relaxed bg-slate-900/20 p-2.5 border border-dashed border-slate-800 rounded-xl">
                          &quot;{t.details}&quot;
                        </p>
                        <p className="text-[9px] text-slate-500">Reporter profile name: {t.reporterName}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-950 pt-3 flex-wrap gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-500 font-semibold text-[10px]">Ticket Status:</span>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                          t.status === 'Pending' 
                            ? 'bg-amber-950 text-amber-400 border border-amber-900/30' 
                            : t.status === 'Dismissed' 
                              ? 'bg-slate-900 text-slate-400' 
                              : 'bg-red-950 text-red-500'
                        }`}>
                          {t.status}
                        </span>
                      </div>

                      {t.status === 'Pending' && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleActionReportTicket(t.id, 'Dismiss')}
                            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 text-[10.5px] font-bold rounded-xl border border-slate-700 cursor-pointer"
                          >
                            Dismiss Report
                          </button>
                          <button
                            onClick={() => handleActionReportTicket(t.id, 'Enforce')}
                            className="px-3.5 py-1.5 bg-red-700 hover:bg-red-800 text-white text-[10.5px] font-bold rounded-xl cursor-pointer"
                          >
                            Enforce Suspension
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-slate-500 italic">
                  ☺ Great news! No active report tickets found.
                </div>
              )}
            </div>

          </div>
        )}

        {/* -------------------- MODULE 6: VOLUNTARY VERIFICATIONS QUEUE -------------------- */}
        {activeTab === 'verifications' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-6 space-y-6">
            <div className="bg-slate-950 p-4 border border-slate-850 rounded-xl">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-100 flex items-center gap-1.5 mb-2">
                <UserCheck className="w-4 h-4 text-emerald-500" /> Voluntary User Badging Queue
              </h3>
              <p className="text-[10px] text-slate-450 leading-normal">
                Users voluntarily submit verification requests to support safety and accountability within regional gatherings. Evaluate their bio notes, linked sites, and objectives.
              </p>
            </div>

            <div className="space-y-4">
              {verificationRequests.filter(r => r.status === 'Pending').length > 0 ? (
                verificationRequests.filter(r => r.status === 'Pending').map(r => (
                  <div key={r.id} className="bg-slate-950 p-4 border border-slate-850 rounded-2xl flex flex-col justify-between gap-4 text-xs">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-3">
                          <img src={r.userAvatar || undefined} alt={r.userName} className="w-10 h-10 rounded-full object-cover border border-slate-800" />
                          <div>
                            <h4 className="font-extrabold text-slate-150 text-sm leading-tight">{r.userName}</h4>
                            <p className="text-[10px] text-slate-500 mt-0.5">Applied position: <span className="text-emerald-400 font-extrabold underline">{r.appliedStatus}</span></p>
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-500">{r.timestamp}</span>
                      </div>

                      <div className="p-3 bg-slate-900/60 rounded-xl space-y-1.5 border border-slate-850">
                        <p className="text-slate-400 text-[10px] font-bold">Applicant Motivations:</p>
                        <p className="text-slate-100 italic leading-relaxed">&quot;{r.reason}&quot;</p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-slate-400 text-[10px]">Verification Document reference / supporting text links:</p>
                        <p className="font-mono text-[10.5px] text-slate-350 bg-slate-900 p-2 rounded border border-slate-850 leading-relaxed truncate">{r.supportingInfo}</p>
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end border-t border-slate-900/60 pt-3">
                      <button 
                        onClick={() => handleRejectUserVerification(r.id)}
                        className="px-3 py-1.5 text-red-400 hover:bg-red-950/20 border border-slate-800 hover:border-red-900/40 font-bold rounded-xl cursor-pointer text-[10.5px]"
                      >
                        Decline
                      </button>
                      <button 
                        onClick={() => handleApproveUserVerification(r.id)}
                        className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold rounded-xl cursor-pointer text-[10.5px]"
                      >
                        Approve Credentials
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-slate-500 italic bg-slate-950 border border-slate-850 rounded-2xl">
                  ☺ All user identity and badge elevation requests processed.
                </div>
              )}
            </div>

          </div>
        )}

        {/* -------------------- MODULE 7: EVENT VERIFICATION REQUESTS -------------------- */}
        {activeTab === 'event-request' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-6 space-y-6">
            <div className="bg-slate-950 p-4 border border-slate-850 rounded-xl">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-100 flex items-center gap-1.5 mb-2">
                <Award className="w-4 h-4 text-emerald-500" /> Host Completion Evidence Audits
              </h3>
              <p className="text-[10px] text-slate-450 leading-normal">
                Approved outcomes receive a proud <span className="text-emerald-400 font-bold">✓ Verified Event</span> badge publicly, award coordinator credit, and dispatch official automated feed outcome updates.
              </p>
            </div>

            <div className="space-y-4">
              {events.some(e => e.completionSubmission && e.completionSubmission.status === 'Pending') ? (
                events.filter(e => e.completionSubmission && e.completionSubmission.status === 'Pending').map(evt => (
                  <div key={evt.id} className="bg-slate-950 border border-slate-850 rounded-2xl p-4 flex flex-col justify-between gap-4 text-xs font-sans">
                    <div className="space-y-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                        <div>
                          <h4 className="font-extrabold text-slate-100 text-sm leading-tight">{evt.title}</h4>
                          <p className="text-[10px] text-slate-500 mt-0.5">Category: {evt.category} • Organizer: {evt.organizerName}</p>
                        </div>
                        <span className="text-[10px] text-slate-500 font-bold">Pending Evaluation</span>
                      </div>

                      {/* Evidence stats grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="bg-slate-900 p-3 rounded-xl border border-slate-850">
                          <p className="text-slate-450 text-[9px] font-bold uppercase tracking-wider">Attendance Evidence Log</p>
                          <p className="text-slate-100 font-extrabold text-xs mt-1">{evt.completionSubmission?.attendanceEvidence}</p>
                        </div>
                        <div className="bg-slate-900 p-3 rounded-xl border border-slate-850">
                          <p className="text-slate-450 text-[9px] font-bold uppercase tracking-wider">GPS Venue Location Audit Check</p>
                          <p className="text-slate-100 font-mono text-[10.5px] mt-1 truncate">{evt.completionSubmission?.venueProof}</p>
                        </div>
                      </div>

                      {/* Photo evidence render */}
                      <div className="bg-slate-900 p-3 rounded-xl border border-slate-850 space-y-2">
                        <p className="text-slate-450 text-[9px] font-bold uppercase tracking-wider">Uploaded Photograph Evidence</p>
                        {evt.completionSubmission?.supportingDoc ? (
                          <div className="aspect-video max-h-[160px] w-full rounded-lg overflow-hidden bg-slate-950 border border-slate-800">
                            <img src={evt.completionSubmission.supportingDoc || undefined} alt="User submitted event evidence" className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <p className="text-slate-500 text-[10px] italic">No visual uploaded.</p>
                        )}
                        <p className="text-slate-350 text-[10px] italic">Geotag link: <span className="underline truncate max-w-xs">{evt.completionSubmission?.supportingDoc}</span></p>
                      </div>

                      {evt.completionSubmission?.expenses && (
                        <div className="bg-slate-900 p-3 rounded-xl border border-slate-850">
                          <p className="text-slate-450 text-[9px] font-bold uppercase tracking-wider">Resource Allocation notes</p>
                          <p className="text-slate-350 mt-1 italic">{evt.completionSubmission.expenses}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 justify-end border-t border-slate-900/60 pt-3">
                      <button 
                        onClick={() => handleRejectEventCompletion(evt.id)}
                        className="px-3.5 py-1.5 text-red-400 hover:bg-red-955/20 border border-slate-800 hover:border-red-900/40 font-bold rounded-xl cursor-pointer text-[10.5px]"
                      >
                        Decline Completion
                      </button>
                      <button 
                        onClick={() => handleApproveEventCompletion(evt.id)}
                        className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold rounded-xl cursor-pointer text-[10.5px]"
                      >
                        Approve & Issue Certificate
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-slate-500 italic bg-slate-950 border border-slate-850 rounded-2xl">
                  ☺ No pending event completions awaiting review.
                </div>
              )}
            </div>

          </div>
        )}

        {/* -------------------- MODULE 8: UNIFIED MODERATION QUEUE -------------------- */}
        {activeTab === 'moderation-queue' && (
          <div className="space-y-6">
            
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide">Live Dispatch review Queue</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Comprehensive audit ledger of ALL pending items across the network.</p>
              </div>
              <span className="bg-yellow-500 text-slate-950 font-black text-xs px-2.5 py-1 rounded-full animate-pulse flex items-center gap-1 select-none">
                <ShieldAlert className="w-3.5 h-3.5" /> {totalModerationQueueCount} Pending items
              </span>
            </div>

            {totalModerationQueueCount === 0 ? (
              <div className="bg-slate-900 border border-slate-850 rounded-2xl p-12 text-center text-slate-500 italic font-sans">
                ✓ Perfect Stability! The dispatch queue has been entirely evaluated. Outstanding item count is 0.
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Reports lists */}
                <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-4">
                  <h4 className="text-slate-200 font-extrabold text-xs uppercase border-b border-slate-800 pb-2 mb-3 flex justify-between items-center">
                    <span>Reports Queue</span>
                    <span className="bg-slate-850 text-slate-400 text-[10px] px-1.5 py-0.5 rounded-full">{activeReportsCount}</span>
                  </h4>
                  <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
                    {tickets.filter(t => t.status === 'Pending').map(t => (
                      <div key={t.id} className="bg-slate-950 p-3 rounded-xl border border-slate-850 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="bg-red-950 text-red-400 text-[8.5px] px-1.5 py-0.5 border border-red-900/30 font-bold uppercase rounded">{t.category}</span>
                          <span className="text-[8px] text-slate-500">{t.timestamp}</span>
                        </div>
                        <p className="text-[11px] font-bold text-slate-200 truncate">{t.targetName}</p>
                        <p className="text-[10px] text-slate-450 truncate italic">&quot;{t.details}&quot;</p>
                        <div className="pt-1 select-none text-right">
                          <button onClick={() => setActiveTab('reports')} className="text-red-500 hover:underline text-[9.5px] font-black">Audit Report →</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Event completions */}
                <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-4">
                  <h4 className="text-slate-200 font-extrabold text-xs uppercase border-b border-slate-800 pb-2 mb-3 flex justify-between items-center">
                    <span>Evidence Submissions</span>
                    <span className="bg-slate-850 text-slate-400 text-[10px] px-1.5 py-0.5 rounded-full">{pendingCompletionsCount}</span>
                  </h4>
                  <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
                    {events.some(e => e.completionSubmission && e.completionSubmission.status === 'Pending') ? (
                      events.filter(e => e.completionSubmission && e.completionSubmission.status === 'Pending').map(evt => (
                        <div key={evt.id} className="bg-slate-950 p-3 rounded-xl border border-slate-850 space-y-2">
                          <p className="text-[11px] font-black text-slate-200 truncate">{evt.title}</p>
                          <p className="text-[10px] text-slate-400">Attendees: {evt.completionSubmission?.attendanceEvidence}</p>
                          <p className="text-[9.5px] text-slate-500 truncate leading-tight">GPS Lock: {evt.completionSubmission?.venueProof}</p>
                          <div className="pt-1 select-none text-right">
                            <button onClick={() => setActiveTab('event-request')} className="text-emerald-500 hover:underline text-[9.5px] font-black">Audit Evidence →</button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-600 text-[10px] text-center italic py-6">Cleared</p>
                    )}
                  </div>
                </div>

                {/* Identity verifications */}
                <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-4">
                  <h4 className="text-slate-200 font-extrabold text-xs uppercase border-b border-slate-800 pb-2 mb-3 flex justify-between items-center">
                    <span>Voluntary ID Elevator</span>
                    <span className="bg-slate-850 text-slate-400 text-[10px] px-1.5 py-0.5 rounded-full">{pendingRequestsCount}</span>
                  </h4>
                  <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
                    {verificationRequests.filter(r => r.status === 'Pending').map(r => (
                      <div key={r.id} className="bg-slate-950 p-3 rounded-xl border border-slate-850 space-y-2">
                        <p className="text-[11px] font-black text-slate-100 flex items-center gap-1 truncate">
                          {r.userName}
                          <span className="bg-slate-900 text-slate-450 border border-slate-800 text-[8px] font-bold px-1 rounded truncate">{r.appliedStatus}</span>
                        </p>
                        <p className="text-[10px] text-slate-450 italic truncate">&quot;{r.reason}&quot;</p>
                        <div className="pt-1 select-none text-right">
                          <button onClick={() => setActiveTab('verifications')} className="text-indigo-400 hover:underline text-[9.5px] font-black">Verify applicant →</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

          </div>
        )}

        {/* -------------------- MODULE 9: SYSTEM ANALYTICS -------------------- */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            
            {/* Simple Graphic bars representation */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <h4 className="text-xs font-bold uppercase text-slate-400 mb-4 tracking-wider">Top Sector Distributions</h4>
                <div className="space-y-3 text-xs font-semibold text-slate-200">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>☘ Reforestation &amp; Environment</span>
                      <span>45%</span>
                    </div>
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-850">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: '45%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span>👥 Community Volunteering</span>
                      <span>30%</span>
                    </div>
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-850">
                      <div className="bg-primary h-full rounded-full" style={{ width: '30%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span>🚲 Sports &amp; Cycling</span>
                      <span>15%</span>
                    </div>
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-850">
                      <div className="bg-sky-500 h-full rounded-full" style={{ width: '15%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span>🎨 Education &amp; Arts</span>
                      <span>10%</span>
                    </div>
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-850">
                      <div className="bg-violet-500 h-full rounded-full" style={{ width: '10%' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Box 2: Report Categories metrics */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <h4 className="text-xs font-bold uppercase text-slate-400 mb-4 tracking-wider">Historical Incident Categories Share</h4>
                <div className="space-y-3 text-xs font-semibold text-slate-205">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>🚫 Advertising &amp; Spam</span>
                      <span>60%</span>
                    </div>
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-850">
                      <div className="bg-red-500 h-full rounded-full" style={{ width: '60%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span>☣ Misleading / Fake listings</span>
                      <span>25%</span>
                    </div>
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-850">
                      <div className="bg-amber-500 h-full rounded-full" style={{ width: '25%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span>☠ Off-Topic Pitch / Solicitation</span>
                      <span>15%</span>
                    </div>
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-850">
                      <div className="bg-slate-600 h-full rounded-full" style={{ width: '15%' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Box 3: Growth Statistics */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase text-slate-400 mb-2 tracking-wider">Ecosystem Statistics</h4>
                  <p className="text-[10px] text-slate-500 leading-normal">System health is calculated dynamically according to average ratings, completed activities, and rapid dismissed report indices.</p>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-center py-2 text-xs">
                  <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-850">
                    <p className="text-[8.5px] text-slate-500 uppercase font-extrabold tracking-wide">Dynamic Security Health</p>
                    <p className="text-lg font-black text-emerald-500 mt-1">99.8%</p>
                  </div>
                  <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-850">
                    <p className="text-[8.5px] text-slate-500 uppercase font-extrabold tracking-wide">Review Velocity Index</p>
                    <p className="text-lg font-black text-primary mt-1">&lt;10m</p>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* -------------------- MODULE 10: REGULATIONS SETTINGS -------------------- */}
        {activeTab === 'settings' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-6 space-y-6 max-w-2xl font-sans">
            
            {/* Privacy switch */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-850 space-y-2">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-slate-150 text-xs flex items-center gap-1.5 uppercase">
                  <Lock className="w-4 h-4 text-emerald-400" /> Search Privacy Enforcement (GDPR Compliant)
                </h4>
                <span className="bg-emerald-900/50 border border-emerald-700/40 text-emerald-450 font-extrabold font-mono text-[9px] px-2 py-0.5 rounded uppercase">
                  Active
                </span>
              </div>
              <p className="text-[10.5px] text-slate-400 leading-relaxed">
                As part of ToGather's strict privacy framework, search-surveillance rules are completely hardcoded to <b>DISABLED</b>. Inappropriate, unusual, or off-topic keywords entered by citizens in search inputs never trigger warnings, logs, blocks, bans, or flags. Searching is standard, healthy human curiosity.
              </p>
            </div>

            {/* Moderation Controls Configuration */}
            <div className="space-y-4">
              <h3 className="font-extrabold text-xs text-slate-100 uppercase tracking-widest border-b border-slate-850 pb-2">Policy Configuration Settings</h3>
              
              <div className="flex items-center justify-between text-xs font-semibold py-1">
                <div>
                  <p className="text-slate-205">Manual Strictness Level</p>
                  <p className="text-[10px] text-slate-500 font-medium">Configure moderator prompt compliance levels</p>
                </div>
                <select 
                  value={strictConductLevel}
                  onChange={(e) => setStrictConductLevel(e.target.value)}
                  className="bg-slate-950 border border-slate-850 rounded-xl px-2.5 py-1.5 text-slate-200 text-[11px] focus:outline-none focus:ring-1 focus:ring-red-500 h-9 shrink-0 text-right"
                >
                  <option value="Balanced">Balanced Oversight</option>
                  <option value="Rigorous">Rigorous Checklist Checked</option>
                  <option value="Lenient">High Community Autonomy</option>
                </select>
              </div>

              <div className="flex items-center justify-between text-xs font-semibold py-1">
                <div>
                  <p className="text-slate-205">Event Photo Requirement</p>
                  <p className="text-[10px] text-slate-500 font-medium">Require GPS tagged photo upload for outcome verify</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={requirePhotoToComplete}
                  onChange={(e) => setRequirePhotoToComplete(e.target.checked)}
                  className="rounded bg-slate-950 text-red-650 w-4 h-4 focus:ring-slate-900 shrink-0 cursor-pointer" 
                />
              </div>

              <div className="flex items-center justify-between text-xs font-semibold py-1">
                <div>
                  <p className="text-slate-205">Instant Community Hub Active State</p>
                  <p className="text-[10px] text-slate-500 font-medium">Skip admin pre-approval for proposed neighborhood hubs</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={allowInstantHubCreation}
                  onChange={(e) => setAllowInstantHubCreation(e.target.checked)}
                  className="rounded bg-slate-950 text-red-650 w-4 h-4 focus:ring-slate-900 shrink-0 cursor-pointer" 
                />
              </div>

              <div className="p-3 bg-red-950/20 text-red-400 border border-red-900/40 rounded-xl mt-3">
                <p className="text-[10px] leading-normal font-medium flex items-start gap-1">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>Configured guidelines are strictly local to this terminal. System rules are generated securely by administrators and require operator authentication credentials.</span>
                </p>
              </div>
            </div>

          </div>
        )}

      </main>

    </div>
  );
}
