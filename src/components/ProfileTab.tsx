/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserProfile, EventEntity, Hub, AttendanceRecord, MessageEntity } from '../types';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Edit3, 
  Save, 
  LogOut, 
  CheckCircle,
  Award,
  Users,
  CalendarCheck,
  Zap,
  Clock,
  CheckCircle2,
  Lock,
  Plus,
  ArrowLeft,
  Search,
  MessageSquare,
  Eye,
  Check,
  Info,
  Sliders,
  QrCode,
  ChevronRight
} from 'lucide-react';

const ALL_INTEREST_GROUPS = [
  {
    category: 'Outdoor Activities',
    items: ['Cycling', 'Motorcycling', 'Running', 'Walking', 'Trekking', 'Camping', 'Travel']
  },
  {
    category: 'Learning & Creativity',
    items: ['Reading', 'Writing', 'Technology', 'Programming', 'Artificial Intelligence', 'Startups', 'Entrepreneurship', 'Education', 'Public Speaking', 'Debate']
  },
  {
    category: 'Arts & Culture',
    items: ['Photography', 'Videography', 'Painting', 'Crafts', 'Music', 'Dance', 'Theatre', 'Movies', 'History & Heritage', 'Cultural Activities']
  },
  {
    category: 'Lifestyle & Wellness',
    items: ['Yoga', 'Meditation', 'Fitness', 'Wellness', 'Nutrition', 'Mental Wellness']
  },
  {
    category: 'Community & Causes',
    items: ['Community Service', 'Volunteering', 'Environmental Action', 'Beach Cleanup', 'Tree Plantation', 'Blood Donation', 'Disaster Relief', 'Social Impact']
  },
  {
    category: 'Animals & Nature',
    items: ['Pets', 'Animal Welfare', 'Bird Watching', 'Gardening']
  },
  {
    category: 'Hobbies & Recreation',
    items: ['Chess', 'Board Games', 'Food & Cooking', 'Baking']
  },
  {
    category: 'Other',
    items: ['Custom Interest']
  }
];

const ALL_CAUSES = [
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
];

const ALL_PARTICIPATION_PREFS = [
  'Attend Events',
  'Volunteer',
  'Organize Events',
  'Join Communities',
  'Learning Activities',
  'Outdoor Activities',
  'Professional Networking'
];

interface ProfileTabProps {
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  joinedHubCount: number;
  rsvpdEvents: EventEntity[];
  allEvents: EventEntity[];
  hubs: Hub[];
  onUpdateEvents: (updated: EventEntity[]) => void;
  onCancelRSVP: (eventId: string) => void;
  onLogOut: () => void;
  onRequestVerification?: (appliedStatus: 'Identity Verified' | 'Trusted Organizer', reason: string, details: string) => void;
}

export default function ProfileTab({ 
  profile, 
  onUpdateProfile, 
  joinedHubCount,
  rsvpdEvents,
  allEvents,
  hubs,
  onUpdateEvents,
  onCancelRSVP,
  onLogOut,
  onRequestVerification
}: ProfileTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(profile.name);
  const [bio, setBio] = useState(profile.bio);
  const [phone, setPhone] = useState(profile.phone);
  const [location, setLocation] = useState(profile.location);

  // Interest System states
  const [selectedInterests, setSelectedInterests] = useState<string[]>(profile.interests || []);
  const [selectedCauses, setSelectedCauses] = useState<string[]>(profile.causes || []);
  const [selectedPrefs, setSelectedPrefs] = useState<string[]>(profile.participationPreferences || []);
  const [radiusPref, setRadiusPref] = useState<number | 'Custom'>(profile.discoveryRadius || 25);
  const [customRadius, setCustomRadius] = useState<number>(profile.customRadiusValue || 25);
  const [interestNotifications, setInterestNotifications] = useState<boolean>(profile.interestNotificationsEnabled ?? true);
  const [feedInterestsSetting, setFeedInterestsSetting] = useState<boolean>(profile.feedInterestsSettingEnabled ?? false);

  React.useEffect(() => {
    setName(profile.name || '');
    setBio(profile.bio || '');
    setPhone(profile.phone || '');
    setLocation(profile.location || '');
    setSelectedInterests(profile.interests || []);
    setSelectedCauses(profile.causes || []);
    setSelectedPrefs(profile.participationPreferences || []);
    setRadiusPref(profile.discoveryRadius || 25);
    setCustomRadius(profile.customRadiusValue || 25);
    setInterestNotifications(profile.interestNotificationsEnabled ?? true);
    setFeedInterestsSetting(profile.feedInterestsSettingEnabled ?? false);
  }, [profile.name, profile.bio, profile.phone, profile.location, isEditing]);

  // My Events Navigation & Dashboard states
  const [activeSubView, setActiveSubView] = useState<'my-events' | 'my-communities' | null>(null);
  const [myEventsTab, setMyEventsTab] = useState<'participating' | 'hosting'>('participating');
  const [myEventsFilter, setMyEventsFilter] = useState<'all' | 'upcoming' | 'ongoing' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEventDetail, setSelectedEventDetail] = useState<EventEntity | null>(null);
  const [activeDetailTab, setActiveDetailTab] = useState<'overview' | 'discussion' | 'checkin'>('overview');
  const [newDetailComment, setNewDetailComment] = useState('');
  const [qrTimeLeft, setQrTimeLeft] = useState(30 - (Math.floor(Date.now() / 1000) % 30));

  // Simulation GPS states for user checking in to ongoing events from ProfileTab details
  const [simulatedDistance, setSimulatedDistance] = useState<number>(5);
  const [simulatedLocationServices, setSimulatedLocationServices] = useState<boolean>(true);
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);

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

  const handleAddDiscussionComment = (eventId: string) => {
    if (!newDetailComment.trim()) return;
    const targetEvent = allEvents.find(e => e.id === eventId);
    if (targetEvent) {
      if (targetEvent.removedParticipants?.includes(profile.name)) {
        alert("You have been removed from this event's discussions by an Event Moderator.");
        return;
      }
      if (targetEvent.mutedParticipants?.includes(profile.name)) {
        alert("You are muted in this event's discussions by an Event Moderator.");
        return;
      }
      const isOrganizer = targetEvent.organizerName === profile.name;
      const isModerator = targetEvent.moderators?.some(m => m.name === profile.name);
      if (targetEvent.communicationMode === 'Announcement' && !isOrganizer && !isModerator) {
        alert("This discussions space is in Announcement-Only Mode.");
        return;
      }
    }

    const comment: MessageEntity = {
      id: `comment-${Date.now()}`,
      senderName: profile.name,
      senderAvatar: profile.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      senderVerification: 'Identity Verified',
      content: newDetailComment.trim(),
      timestamp: 'Just now',
      pinned: false
    };
    const updatedEvents = allEvents.map(evt => {
      if (evt.id === eventId) {
        return {
          ...evt,
          discussion: [...(evt.discussion || []), comment]
        };
      }
      return evt;
    });
    onUpdateEvents(updatedEvents);
    const matched = updatedEvents.find(e => e.id === eventId);
    if (matched) setSelectedEventDetail(matched);
    setNewDetailComment('');
  };

  const handleHostStartCheckIn = (eventId: string) => {
    const updatedEvents = allEvents.map(evt => {
      if (evt.id === eventId) {
        return {
          ...evt,
          isStarted: true,
          attendanceRadiusLimit: evt.attendanceRadiusLimit || 200,
          attendanceCoordinates: evt.attendanceCoordinates || { lat: 40.785091, lng: -73.968285 }
        };
      }
      return evt;
    });
    onUpdateEvents(updatedEvents);
    const matched = updatedEvents.find(e => e.id === eventId);
    if (matched) setSelectedEventDetail(matched);
    
    try {
      const savedLogs = localStorage.getItem('togather_attendance_audit_logs');
      const logs = savedLogs ? JSON.parse(savedLogs) : [];
      const newLog = {
        id: `audit-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        action: 'Event Started',
        details: `Organizer started check-in session for hosted event via Personal Dashboard. Initial radius 200m.`,
        operator: profile.name,
        status: 'Success'
      };
      localStorage.setItem('togather_attendance_audit_logs', JSON.stringify([newLog, ...logs]));
    } catch (err) {
      console.error(err);
    }
  };

  const handleHostChangeRadiusLimit = (eventId: string, limit: number) => {
    const updatedEvents = allEvents.map(evt => {
      if (evt.id === eventId) {
        return {
          ...evt,
          attendanceRadiusLimit: limit
        };
      }
      return evt;
    });
    onUpdateEvents(updatedEvents);
    const matched = updatedEvents.find(e => e.id === eventId);
    if (matched) setSelectedEventDetail(matched);

    try {
      const savedLogs = localStorage.getItem('togather_attendance_audit_logs');
      const logs = savedLogs ? JSON.parse(savedLogs) : [];
      const newLog = {
        id: `audit-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        action: 'Event Radius Changed',
        details: `Radius limit for event "${matched?.title}" changed to ${limit}m.`,
        operator: profile.name,
        status: 'Info'
      };
      localStorage.setItem('togather_attendance_audit_logs', JSON.stringify([newLog, ...logs]));
    } catch (err) {
      console.error(err);
    }
  };

  const handleUserCheckInProximity = (event: EventEntity) => {
    setIsScanning(true);
    setScanResult(null);

    setTimeout(() => {
      setIsScanning(false);
      
      if (!simulatedLocationServices) {
        setScanResult({ success: false, message: "Attendance Verification Failed: Device location services disabled." });
        return;
      }

      if (!event.isStarted) {
        setScanResult({ success: false, message: "Attendance Verification Failed: Organized check-in session has not started." });
        return;
      }

      const allowedRadius = event.attendanceRadiusLimit || 200;
      if (simulatedDistance > allowedRadius) {
        setScanResult({ success: false, message: `Attendance Verification Failed: Outside boundary (${simulatedDistance}m / threshold: ${allowedRadius}m).` });
        return;
      }

      const successMsg = `Attendance Verified ✓. Physical presence within ${simulatedDistance}m validated safely under anti-fraud checks.`;
      setScanResult({ success: true, message: successMsg });

      try {
        const savedRecs = localStorage.getItem('togather_attendance_records');
        const records = savedRecs ? JSON.parse(savedRecs) : [];
        const isAlreadyUploaded = records.some((r: any) => r.eventId === event.id && r.userName === profile.name);
        
        if (!isAlreadyUploaded) {
          const newRecord: AttendanceRecord = {
            id: `att-rec-${Date.now()}`,
            userId: 'current-user',
            userName: profile.name,
            userAvatar: profile.avatar,
            eventId: event.id,
            eventTitle: event.title,
            timestamp: new Date().toLocaleTimeString(),
            coords: { lat: 40.785091, lng: -73.968285 },
            radiusLimit: allowedRadius,
            distanceMeters: simulatedDistance,
            impactAwarded: false
          };
          const updatedRecs = [...records, newRecord];
          localStorage.setItem('togather_attendance_records', JSON.stringify(updatedRecs));
          
          // Trigger state sync on applet if we want, or rely on live local storage read
          // Dispatch simple custom event so other components refresh as well
          window.dispatchEvent(new Event('storage'));
        }
      } catch (err) {
        console.error(err);
      }
    }, 1200);
  };

  // Voluntary verification ticket state variables
  const [appliedType, setAppliedType] = useState<'Identity Verified' | 'Trusted Organizer'>('Identity Verified');
  const [verifReason, setVerifReason] = useState('');
  const [verifDetails, setVerifDetails] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const handleRequestSubmit = () => {
    if (onRequestVerification && verifReason.trim()) {
      onRequestVerification(appliedType, verifReason, verifDetails || 'Linked ID record');
      setHasSubmitted(true);
      alert('Verification request submitted successfully! Reviewed securely under administrator portal review queues.');
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      ...profile,
      name,
      bio,
      phone,
      location,
      interests: selectedInterests,
      causes: selectedCauses,
      participationPreferences: selectedPrefs,
      discoveryRadius: radiusPref,
      customRadiusValue: customRadius,
      interestNotificationsEnabled: interestNotifications,
      feedInterestsSettingEnabled: feedInterestsSetting
    });
    setIsEditing(false);
    alert('Success: Profile updated with interests, causes, and discovery preferences!');
  };

  const getFilteredCount = (f: 'all' | 'upcoming' | 'ongoing' | 'completed') => {
    let eventsList = myEventsTab === 'participating' 
      ? allEvents.filter(e => e.isAttending) 
      : allEvents.filter(e => e.organizerName === profile.name);
    
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      eventsList = eventsList.filter(e => 
        e.title.toLowerCase().includes(q) || 
        (e.category && e.category.toLowerCase().includes(q)) || 
        e.location.toLowerCase().includes(q)
      );
    }

    if (f === 'all') return eventsList.length;
    if (f === 'upcoming') return eventsList.filter(e => !e.isCompleted && !e.isStarted).length;
    if (f === 'ongoing') return eventsList.filter(e => e.isStarted && !e.isCompleted).length;
    if (f === 'completed') return eventsList.filter(e => e.isCompleted).length;
    return 0;
  };

  const renderStatusBadge = (evt: EventEntity) => {
    let isVerified = false;
    let isAwarded = false;
    try {
      const savedRecs = localStorage.getItem('togather_attendance_records');
      if (savedRecs) {
        const records = JSON.parse(savedRecs);
        const matched = records.find((r: any) => r.eventId === evt.id && r.userName === profile.name);
        if (matched) {
          isVerified = true;
          isAwarded = !!matched.impactAwarded;
        }
      }
    } catch (err) {
      console.error(err);
    }

    if (evt.isCompleted) {
      if (myEventsTab === 'participating') {
        if (isVerified) {
          return (
            <span className="bg-emerald-100 text-emerald-800 text-[9px] font-extrabold px-2.5 py-1 rounded-full border border-emerald-200">
              ✓ Attendance Verified (+10 Points)
            </span>
          );
        } else {
          return (
            <span className="bg-slate-100 text-slate-705 text-[9px] font-bold px-2.5 py-1 rounded-full border border-outline-variant/30">
              Completed (Absent)
            </span>
          );
        }
      } else {
        return (
          <span className="bg-emerald-100 text-emerald-800 text-[9px] font-extrabold px-2.5 py-1 rounded-full border border-emerald-200">
            ✓ Hosted Successfully (+90 Points)
          </span>
        );
      }
    }

    if (evt.isStarted) {
      if (myEventsTab === 'participating') {
        if (isVerified) {
          return (
            <span className="bg-blue-100 text-blue-800 text-[9px] font-bold px-2.5 py-1 rounded-full border border-blue-200 animate-pulse">
              ✓ Checked-In (Pending End)
            </span>
          );
        } else {
          return (
            <span className="bg-rose-50 text-rose-700 text-[9px] font-bold px-2.5 py-1 rounded-full border border-rose-150 animate-bounce">
              ⚡ Live (Check-In Active!)
            </span>
          );
        }
      } else {
        return (
          <span className="bg-emerald-500/10 text-emerald-700 text-[9px] font-bold px-2.5 py-1 rounded-full border border-emerald-300 animate-pulse">
            ● Session Live
          </span>
        );
      }
    }

    return (
      <span className="bg-surface-container text-on-surface-variant text-[9px] font-bold px-2.5 py-1 rounded-full border border-outline-variant/20">
        Upcoming RSVP
      </span>
    );
  };

  const renderMyEventsDashboard = () => {
    const participatingEvents = allEvents.filter(e => e.isAttending);
    const hostingEvents = allEvents.filter(e => e.organizerName === profile.name);

    let activeStream = myEventsTab === 'participating' ? participatingEvents : hostingEvents;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      activeStream = activeStream.filter(e => 
        e.title.toLowerCase().includes(q) || 
        (e.category && e.category.toLowerCase().includes(q)) || 
        e.location.toLowerCase().includes(q)
      );
    }

    let filteredEvents = activeStream;
    if (myEventsFilter === 'upcoming') {
      filteredEvents = activeStream.filter(e => !e.isCompleted && !e.isStarted);
    } else if (myEventsFilter === 'ongoing') {
      filteredEvents = activeStream.filter(e => e.isStarted && !e.isCompleted);
    } else if (myEventsFilter === 'completed') {
      filteredEvents = activeStream.filter(e => e.isCompleted);
    }

    return (
      <div className="animate-in fade-in duration-300 pb-16 max-w-xl mx-auto space-y-4">
        <div className="flex items-center justify-between pb-2">
          <button 
            onClick={() => setActiveSubView(null)}
            className="flex items-center gap-1.5 text-xs font-bold text-primary hover:underline cursor-pointer bg-white px-3 py-1.5 rounded-xl border border-outline-variant/20 shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Profile
          </button>
          <span className="text-[10px] text-outline font-mono">ToGather Private Ledger</span>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-outline-variant/20 shadow-2xs">
          <h2 className="text-xl font-black text-on-surface tracking-tight">My Events Personal Dashboard</h2>
          <p className="text-xs text-on-surface-variant mt-1 font-medium">
            Track participating registrations, dynamic live attendance status, and hosting logs in real-time.
          </p>

          <div className="relative mt-4">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-outline w-4 h-4" />
            <input
              type="text"
              placeholder="Search by event title, community sector, or venue..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low border border-outline-variant/30 rounded-2xl text-xs focus:outline-none focus:ring-1 focus:ring-primary text-on-surface"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 p-1.5 bg-surface-container-low rounded-2xl border border-outline-variant/15 select-none animate-in slide-in-from-bottom-1 duration-200">
          <button
            onClick={() => { setMyEventsTab('participating'); setMyEventsFilter('all'); }}
            className={`py-2 px-3 text-xs font-bold rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1.5 ${myEventsTab === 'participating' ? 'bg-primary text-on-primary font-extrabold shadow-sm' : 'text-outline hover:bg-surface-container'}`}
          >
            <User className="w-4 h-4" /> Participating ({participatingEvents.length})
          </button>
          <button
            onClick={() => { setMyEventsTab('hosting'); setMyEventsFilter('all'); }}
            className={`py-2 px-3 text-xs font-bold rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1.5 ${myEventsTab === 'hosting' ? 'bg-primary text-on-primary font-extrabold shadow-sm' : 'text-outline hover:bg-surface-container'}`}
          >
            <QrCode className="w-4 h-4" /> Hosting ({hostingEvents.length})
          </button>
        </div>

        <div className="flex gap-1.5 overflow-x-auto py-1 scrollbar-none select-none">
          {(['all', 'upcoming', 'ongoing', 'completed'] as const).map((filter) => {
            const count = getFilteredCount(filter);
            return (
              <button
                key={filter}
                onClick={() => setMyEventsFilter(filter)}
                className={`px-3.5 py-1.5 rounded-full text-[10.5px] font-bold border transition-all shrink-0 capitalize cursor-pointer ${
                  myEventsFilter === filter
                    ? 'bg-secondary text-on-secondary border-secondary font-extrabold shadow-2xs'
                    : 'bg-white border-outline-variant/20 text-outline hover:bg-surface-container-low'
                }`}
              >
                {filter} ({count})
              </button>
            );
          })}
        </div>

        <div className="space-y-3">
          {filteredEvents.length === 0 ? (
            <div className="p-12 text-center bg-white border border-dashed border-outline-variant/25 rounded-3xl animate-in fade-in duration-300">
              <CalendarCheck className="w-10 h-10 text-outline mx-auto mb-2 animate-pulse" />
              <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider">No Events Found</h4>
              <p className="text-[11px] text-outline mt-1.5 max-w-xs mx-auto font-medium">
                No events fit this query. Register as a participant or host an exciting neighborhood workshop!
              </p>
            </div>
          ) : (
            filteredEvents.map(evt => {
              const isUpcoming = !evt.isCompleted && !evt.isStarted;
              const isOngoing = evt.isStarted && !evt.isCompleted;
              const isCompleted = evt.isCompleted === true;

              return (
                <div
                  key={evt.id}
                  onClick={() => {
                    setSelectedEventDetail(evt);
                    setActiveDetailTab('overview');
                  }}
                  className="bg-white border border-outline-variant/25 rounded-3xl p-4 flex gap-4 hover:shadow-sm cursor-pointer hover:bg-surface-container-lowest transition-all group animate-in slide-in-from-bottom-2 duration-300"
                >
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden bg-neutral-100 shrink-0 relative">
                    <img 
                      src={evt.image || undefined} 
                      alt={evt.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                    {isOngoing && (
                      <div className="absolute top-1.5 left-1.5 bg-rose-600 text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded-md animate-pulse">
                        LIVE
                      </div>
                    )}
                  </div>

                  <div className="flex-grow min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary">
                          {evt.category}
                        </span>
                        {renderStatusBadge(evt)}
                      </div>
                      <h4 className="font-extrabold text-xs md:text-sm text-on-surface mt-1 group-hover:text-primary transition-colors line-clamp-1">
                        {evt.title}
                      </h4>
                      <p className="text-[10px] text-on-surface-variant font-semibold mt-0.5 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-outline shrink-0" /> {evt.date} • {evt.time}
                      </p>
                      <p className="text-[10px] text-outline truncate mt-0.5 flex items-center gap-0.5">
                        <MapPin className="w-3 h-3 text-outline shrink-0" /> {evt.location}
                      </p>
                    </div>

                    <div className="border-t border-outline-variant/10 pt-2 mt-2 flex justify-between items-center text-[10px] text-on-surface-variant font-semibold">
                      {myEventsTab === 'participating' ? (
                        <>
                          {isUpcoming && (
                            <span className="text-secondary font-bold flex items-center gap-1">
                              👤 Host: {evt.organizerName} • Registered
                            </span>
                          )}
                          {isOngoing && (
                            <span className="text-emerald-700 font-extrabold flex items-center gap-1 animate-pulse">
                              💬 Chat Active &amp; Proximity Scanners Enabled
                            </span>
                          )}
                          {isCompleted && (
                            <span className="text-primary font-bold">
                              {evt.materialsRequired ? `Brought: ${evt.materialsRequired.slice(0, 18)}...` : 'Impact logs updated ✓'}
                            </span>
                          )}
                        </>
                      ) : (
                        <>
                          {isUpcoming && (
                            <span className="text-secondary font-bold">
                              🎟 {evt.attendeesCount || evt.attendees?.length || 0} Registered • Status: {evt.accessMode || 'Public'}
                            </span>
                          )}
                          {isOngoing && (
                            <span className="text-emerald-700 font-bold flex items-center gap-1 animate-pulse">
                              🧭 {evt.attendeesCount || 2} Live Participants • Broadcast QR
                            </span>
                          )}
                          {isCompleted && (
                            <span className="text-primary font-extrabold">
                              🏆 Verified Attendance: {evt.id === 'evt-1' ? '92%' : '100%'}
                            </span>
                          )}
                        </>
                      )}
                      <span className="text-primary font-extrabold flex items-center gap-0.5 text-[9px] group-hover:underline">
                        Manage <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  const renderMyCommunitiesDashboard = () => {
    const joinedHubs = hubs.filter(h => h.isJoined);

    return (
      <div className="animate-in fade-in duration-300 pb-16 max-w-xl mx-auto space-y-4">
        <div className="flex items-center justify-between pb-2">
          <button 
            onClick={() => setActiveSubView(null)}
            className="flex items-center gap-1.5 text-xs font-bold text-primary hover:underline cursor-pointer bg-white px-3 py-1.5 rounded-xl border border-outline-variant/20 shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Profile
          </button>
          <span className="text-[10px] text-outline font-mono">ToGather Sectors</span>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-outline-variant/20 shadow-2xs">
          <h2 className="text-xl font-black text-on-surface tracking-tight">My Communities Joined</h2>
          <p className="text-xs text-on-surface-variant mt-1 font-medium">
            Track sectors and community chapters you are registered with to keep coordination robust.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {joinedHubs.length === 0 ? (
            <div className="p-12 text-center bg-white border border-dashed border-outline-variant/25 rounded-3xl">
              <Users className="w-10 h-10 text-outline mx-auto mb-2 animate-pulse" />
              <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider">No Joined Communities</h4>
              <p className="text-[11px] text-outline mt-1 max-w-xs mx-auto font-medium">
                Explore local community sectors under Discover to participate in green restoration chapters!
              </p>
            </div>
          ) : (
            joinedHubs.map(hub => (
              <div 
                key={hub.id}
                className="bg-white border border-outline-variant/25 rounded-3xl p-4 flex gap-4 shadow-2xs animate-in slide-in-from-bottom-2 duration-300"
              >
                <div className="w-14 h-14 rounded-2xl overflow-hidden bg-neutral-100 shrink-0">
                  <img src={hub.image || undefined} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-on-surface">{hub.name}</h4>
                  <p className="text-[10.5px] text-on-surface-variant mt-0.5 line-clamp-2 leading-relaxed font-semibold">
                    Coordinate restoration events and localized action plans within the {hub.category} sector of our municipal hub.
                  </p>
                  <div className="mt-2.5 flex gap-2 items-center text-[9px] font-bold text-primary">
                    <span className="bg-primary/10 px-2 py-0.5 rounded-lg font-extrabold">✓ Joined Member</span>
                    <span className="text-outline">•</span>
                    <span className="text-outline">{hub.members} active neighbors</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  const renderEventDetailsPanel = (evt: EventEntity) => {
    let logs: any[] = [];
    try {
      const savedLogs = localStorage.getItem('togather_attendance_audit_logs');
      if (savedLogs) {
        logs = JSON.parse(savedLogs).filter((l: any) => l.details.includes(evt.id) || l.details.includes(evt.title));
      }
    } catch (_) {}

    let localRecs: any[] = [];
    try {
      const saved = localStorage.getItem('togather_attendance_records');
      if (saved) {
        localRecs = JSON.parse(saved).filter((r: any) => r.eventId === evt.id);
      }
    } catch (_) {}

    const isOrganizer = evt.organizerName === profile.name;
    const isUserCheckedInLocal = localRecs.some(r => r.userName === profile.name);

    return (
      <div className="animate-in zoom-in-95 duration-200 pb-16 max-w-xl mx-auto space-y-4">
        <div className="flex items-center justify-between pb-1">
          <button 
            onClick={() => setSelectedEventDetail(null)}
            className="flex items-center gap-1 text-xs font-bold text-primary hover:underline cursor-pointer bg-white px-3 py-1.5 rounded-xl border border-outline-variant/20 shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>
          <span className="text-[10px] bg-slate-100 text-outline border px-2.5 py-1 rounded-full font-bold">
            ID: {evt.id}
          </span>
        </div>

        <div className="bg-white rounded-3xl border border-outline-variant/25 overflow-hidden shadow-2xs">
          <div className="h-44 w-full bg-neutral-100 relative">
            <img src={evt.image || undefined} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            <span className="absolute bottom-3 left-3 bg-black/60 text-white font-extrabold text-[9.5px] uppercase tracking-wider px-3 py-1 rounded-lg backdrop-blur-xs select-none">
              {evt.category}
            </span>
          </div>

          <div className="p-5">
            <h3 className="text-lg font-black text-on-surface leading-tight tracking-tight">
              {evt.title}
            </h3>
            <div className="mt-2.5 grid grid-cols-2 gap-2 text-xs text-on-surface-variant font-semibold">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-primary shrink-0" /> {evt.date} • {evt.time}
              </span>
              <span className="flex items-center gap-1.5 truncate">
                <MapPin className="w-4 h-4 text-primary shrink-0" /> {evt.location}
              </span>
            </div>
          </div>
        </div>

        <div className="flex bg-surface-container-low p-1 border border-outline-variant/20 rounded-2xl select-none">
          {(['overview', 'discussion', 'checkin'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => {
                setActiveDetailTab(tab);
                setScanResult(null);
              }}
              className={`flex-1 py-1.5 text-center text-xs font-bold rounded-xl capitalize transition-all cursor-pointer ${
                activeDetailTab === tab 
                  ? 'bg-primary text-on-primary font-extrabold shadow-sm' 
                  : 'text-outline hover:bg-surface-container'
              }`}
            >
              {tab === 'checkin' ? (isOrganizer ? 'Organizer Session' : 'Presence Check-In') : tab}
            </button>
          ))}
        </div>

        {activeDetailTab === 'overview' && (
          <div className="bg-white border border-outline-variant/25 rounded-3xl p-5 space-y-4 text-xs animate-in fade-in duration-200">
            <div>
              <h4 className="text-[10px] font-bold uppercase text-outline tracking-wider mb-1">Event Description</h4>
              <p className="text-on-surface-variant leading-relaxed font-semibold">
                {evt.description || "Join us in our neighborhood effort to improve our municipal assets."}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2.5 border-t border-outline-variant/10">
              <div>
                <h4 className="text-[10px] font-bold uppercase text-outline tracking-wider mb-1">What to Bring</h4>
                <p className="text-on-surface-variant font-semibold">{evt.whatToBring || "Sturdy shoes, Smile, Water bottle"}</p>
              </div>
              <div>
                <h4 className="text-[10px] font-bold uppercase text-outline tracking-wider mb-1">Registration Level</h4>
                <p className="text-on-surface-variant font-semibold">Confirmed Member ({evt.participationLevel || "Committed"})</p>
              </div>
            </div>

            <div className="pt-2.5 border-t border-outline-variant/10 space-y-1">
              <h4 className="text-[10px] font-bold uppercase text-outline tracking-wider">Safety Conduct Statement</h4>
              <p className="text-on-surface-variant leading-relaxed font-medium">
                {evt.safetyNotes || "Safety first. Work coordination operates strictly inside verified GPS geofenced tracks to protect fraud conduct."}
              </p>
            </div>
          </div>
        )}

        {activeDetailTab === 'discussion' && (
          <div className="bg-white border border-outline-variant/25 rounded-3xl p-5 space-y-4 animate-in fade-in duration-200">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-outline">Interactive Neighbor Discussion Chats</h4>
            
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {(!evt.discussion || evt.discussion.length === 0) ? (
                <p className="text-xs text-outline text-center py-6 italic font-medium">No messages sent yet. Ask organizers or fellow neighbors a question!</p>
              ) : (
                evt.discussion.map((msg, i) => (
                  <div key={msg.id || i} className="flex gap-2.5 items-start p-2.5 bg-surface-container-low rounded-2xl border border-outline-variant/15 text-xs">
                    <img src={msg.senderAvatar || undefined} className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5" />
                    <div>
                      <div className="flex gap-2 items-center">
                        <span className="font-extrabold text-on-surface">{msg.senderName}</span>
                        <span className="text-[9px] text-outline">{msg.timestamp || 'Just now'}</span>
                      </div>
                      <p className="text-on-surface-variant mt-0.5 leading-relaxed font-semibold">{msg.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex gap-2 border-t border-outline-variant/10 pt-3">
              <input
                type="text"
                value={newDetailComment}
                onChange={(e) => setNewDetailComment(e.target.value)}
                placeholder="Ask a question or offer materials..."
                className="flex-grow h-10 px-3.5 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs focus:ring-1 focus:ring-primary focus:outline-none"
              />
              <button
                onClick={() => handleAddDiscussionComment(evt.id)}
                className="px-4 py-2 bg-primary text-on-primary text-xs font-bold rounded-xl hover:bg-primary-hover active:scale-95 transition-all outline-none"
              >
                Send Chat
              </button>
            </div>
          </div>
        )}

        {activeDetailTab === 'checkin' && (
          <div className="bg-white border border-outline-variant/25 rounded-3xl p-5 space-y-5 animate-in fade-in duration-200">
            {isOrganizer ? (
              <div className="space-y-4">
                {!evt.isStarted ? (
                  <div className="text-center p-6 space-y-3">
                    <QrCode className="w-12 h-12 text-primary mx-auto animate-pulse" />
                    <h4 className="text-sm font-extrabold text-on-surface">Start Attendance Verification Sync</h4>
                    <p className="text-xs text-on-surface-variant max-w-xs mx-auto leading-relaxed font-medium">
                      Initialize coordinates sync and broadcast rotated check-in keys to checked-in neighbors.
                    </p>
                    <button
                      onClick={() => handleHostStartCheckIn(evt.id)}
                      className="px-5 py-2.5 bg-primary text-on-primary text-xs font-bold rounded-xl flex items-center gap-1.5 mx-auto hover:bg-primary-hover shadow-2xs cursor-pointer"
                    >
                      <Clock className="w-4 h-4" /> Start Live Check-In
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4 text-xs">
                    <div className="grid grid-cols-2 gap-2 text-center text-xs">
                      <div className="bg-emerald-50 border border-emerald-100 p-2.5 rounded-xl">
                        <span className="text-[9px] font-bold text-emerald-800 uppercase block">Dynamic Beacon Status</span>
                        <span className="font-extrabold text-emerald-950 flex justify-center items-center gap-1 mt-0.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" /> Active Broadcast
                        </span>
                      </div>
                      <div className="bg-primary-container/30 border border-outline-variant/10 p-2.5 rounded-xl">
                        <span className="text-[9px] font-bold text-primary uppercase block">Proximity Radius Limit</span>
                        <span className="font-extrabold text-on-primary-container block mt-0.5">
                          {evt.attendanceRadiusLimit || 200} meters radius
                        </span>
                      </div>
                    </div>

                    <div className="p-3 bg-surface-container-low border border-outline-variant/15 rounded-2xl">
                      <span className="text-[9px] uppercase font-bold text-outline block mb-1.5">Adjust physical Geofence proximity</span>
                      <div className="grid grid-cols-4 gap-1">
                        {[50, 100, 200, 300].map(rad => (
                          <button
                            key={rad}
                            onClick={() => handleHostChangeRadiusLimit(evt.id, rad)}
                            className={`py-1 text-center text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                              (evt.attendanceRadiusLimit || 200) === rad 
                                ? 'bg-primary text-on-primary font-extrabold shadow-2xs' 
                                : 'bg-white border text-outline hover:bg-slate-50'
                            }`}
                          >
                            {rad}m
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-850 text-white rounded-2xl p-4 text-center space-y-2 max-w-xs mx-auto">
                      <p className="text-[9px] uppercase font-bold text-emerald-400 tracking-wider">Dynamic Geofence Verification Token</p>
                      
                      <div className="bg-white p-2.5 rounded-xl inline-block shadow-inner">
                        <QrCode className="w-24 h-24 text-slate-800" />
                      </div>

                      <div className="space-y-0.5 pt-1">
                        <p className="font-mono text-lg font-black text-emerald-300 tracking-widest">
                          {getActiveToken(evt.id)}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          Rotates in <strong className="text-emerald-300 font-extrabold font-mono">{qrTimeLeft}s</strong> to block screenshot safety leaks
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h5 className="font-extrabold text-xs text-outline uppercase tracking-wider">Neighbors Checked In ({localRecs.length})</h5>
                      {localRecs.length === 0 ? (
                        <p className="p-3 text-center border border-dashed rounded-xl bg-surface text-[11px] text-outline font-medium">Awaiting participant scanning coordinate markers...</p>
                      ) : (
                        localRecs.map(rec => (
                          <div key={rec.id} className="flex justify-between items-center bg-white border p-2.5 rounded-xl">
                            <div className="flex items-center gap-2">
                              <img src={rec.userAvatar || undefined} className="w-5.5 h-5.5 rounded-full object-cover" />
                              <div>
                                <h6 className="font-bold text-on-surface text-[11px]">{rec.userName}</h6>
                                <p className="text-[9px] text-outline">Distance: {rec.distanceMeters}m (verified {rec.timestamp})</p>
                              </div>
                            </div>
                            <span className="text-[9px] font-bold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-100">
                              ✓ Verified Conduct
                            </span>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <h5 className="font-extrabold text-xs text-outline uppercase tracking-wider">Presence Security Logs ({logs.length})</h5>
                      <div className="bg-slate-950 text-white p-2.5 rounded-xl max-h-36 overflow-y-auto font-mono text-[9px] space-y-1.5 shadow-inner">
                        {logs.length === 0 ? (
                          <p className="text-center text-slate-500 py-3">Audit logs empty. Beacon online.</p>
                        ) : (
                          logs.map((log, index) => (
                            <div key={log.id || index} className="p-2 border border-slate-850 rounded bg-slate-900 leading-normal">
                              <div className="flex justify-between text-[8px] text-slate-400 font-bold mb-0.5">
                                <span className={log.status === 'Success' ? 'text-emerald-400' : 'text-amber-400'}>
                                  [{log.action}]
                                </span>
                                <span>{log.timestamp}</span>
                              </div>
                              <p className="text-[9.5px] leading-relaxed text-slate-200">{log.details}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4 text-xs text-left">
                {!evt.isStarted ? (
                  <div className="text-center p-6 space-y-2">
                    <Clock className="w-12 h-12 text-outline mx-auto animate-pulse" />
                    <h4 className="text-sm font-bold text-outline uppercase tracking-widest">Attendance Verification Offline</h4>
                    <p className="text-xs text-on-surface-variant max-w-xs leading-relaxed mx-auto font-medium">
                      Wait for organizer to broadcast presence tracking session coordinates.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-200">
                    <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/15 space-y-3">
                      <h4 className="text-[10px] font-bold uppercase tracking-wider text-outline">Geofencing Compliance Checklist</h4>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-on-surface-variant">👤 Account Profile login checks</span>
                          <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">Verified ✓</span>
                        </div>

                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-on-surface-variant">🎟 Event RSVP enrollment check</span>
                          <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">Attendee ✓</span>
                        </div>

                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-on-surface-variant">🧭 GPS location services permission</span>
                          <div className="flex items-center gap-1.5">
                            <label className="relative inline-flex items-center cursor-pointer select-none">
                              <input 
                                type="checkbox"
                                checked={simulatedLocationServices}
                                onChange={(e) => setSimulatedLocationServices(e.target.checked)}
                                className="sr-only peer" 
                              />
                              <div className="w-8 h-4.5 bg-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-primary"></div>
                            </label>
                            <span className={`text-[10px] font-bold ${simulatedLocationServices ? 'text-emerald-700' : 'text-rose-700'}`}>
                              {simulatedLocationServices ? 'GPS OK ✓' : 'GPS Offline X'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-white border border-outline-variant/20 rounded-2xl space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-outline block">Configure physical proximity from hub</span>
                      
                      <div className="grid grid-cols-4 gap-1.5">
                        {[
                          { l: 'Immediate', d: 5 },
                          { l: 'Venue Hall', d: 80 },
                          { l: 'Street Range', d: 180 },
                          { l: 'Offbound', d: 450 }
                        ].map(pos => (
                          <button
                            key={pos.d}
                            onClick={() => setSimulatedDistance(pos.d)}
                            className={`py-1.5 text-center text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                              simulatedDistance === pos.d 
                                ? 'bg-secondary text-on-secondary font-extrabold shadow-2xs' 
                                : 'bg-surface-container hover:bg-surface-container-high'
                            }`}
                          >
                            {pos.l} ({pos.d}m)
                          </button>
                        ))}
                      </div>

                      <div className="flex justify-between items-center text-xs pt-1 font-semibold">
                        <span className="text-on-surface-variant">Configured range:</span>
                        <span className={`font-extrabold ${simulatedDistance <= (evt.attendanceRadiusLimit || 200) ? 'text-emerald-700' : 'text-rose-700 font-black'}`}>
                          {simulatedDistance} meters
                        </span>
                      </div>

                      {simulatedDistance > (evt.attendanceRadiusLimit || 200) && (
                        <div className="p-2.5 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 text-[10px] font-medium leading-relaxed">
                          ⚠️ Range exceeds organizers beacon boundary limit of {evt.attendanceRadiusLimit || 200}m. Change proximity closer to verify presence!
                        </div>
                      )}
                    </div>

                    {isUserCheckedInLocal ? (
                      <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-center space-y-1.5 animate-in fade-in duration-300">
                        <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
                        <h4 className="font-extrabold text-emerald-950 text-xs text-center">Your attendance verification is successful!</h4>
                        <p className="text-[10.5px] text-emerald-800 leading-relaxed text-center font-semibold">
                          Physical coordinate check within {simulatedDistance}m succeeded on {new Date().toLocaleDateString()}. Your Impact Points are now logged!
                        </p>
                        <div className="text-left bg-white/40 border border-dashed border-emerald-200 p-2.5 rounded-xl font-mono text-[9px] text-emerald-900 mt-2 space-y-0.5">
                          <p>📌 <strong>Participant:</strong> {profile.name}</p>
                          <p>🧭 <strong>Audit coordinates:</strong> {simulatedDistance}m distance marker</p>
                          <p>🌟 <strong>Impact Awards:</strong> +10 Score Earned &amp; Logged</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="relative w-40 h-40 mx-auto border-2 border-dashed border-primary bg-slate-50 rounded-2xl flex flex-col items-center justify-center overflow-hidden">
                          {isScanning ? (
                            <div className="flex flex-col items-center text-center p-2.5">
                              <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
                              <p className="text-[9.5px] text-primary font-bold mt-2">Checking GPS Coordinate tokens...</p>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center text-center p-2.5 animate-pulse">
                              <QrCode className="w-10 h-10 text-outline mb-1.5" />
                              <p className="text-[9.5px] text-outline font-extrabold">Ready to evaluate dynamic security code keys...</p>
                            </div>
                          )}
                          <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-primary"></div>
                          <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-primary"></div>
                          <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-primary"></div>
                          <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-primary"></div>
                          <div className="absolute top-0 left-0 w-full h-[2px] bg-red-400 animate-bounce" />
                        </div>

                        {scanResult && (
                          <div className={`p-3 rounded-xl border leading-relaxed text-[10.5px] text-left transition-all ${
                            scanResult.success 
                              ? 'bg-emerald-50 border-emerald-150 text-emerald-950 font-medium' 
                              : 'bg-rose-50 border-rose-150 text-rose-950 font-medium'
                          }`}>
                            <p className="font-extrabold mb-0.5">{scanResult.success ? '✓ Presence Validated' : '🚨 Boundary Enforcement Violation'}</p>
                            <p>{scanResult.message}</p>
                          </div>
                        )}

                        <button
                          onClick={() => handleUserCheckInProximity(evt)}
                          disabled={isScanning}
                          className="w-full py-2.5 bg-primary hover:bg-primary-hover text-on-primary text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <QrCode className="w-4 h-4" /> Scan Dynamic Presence Proof QR
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  if (selectedEventDetail) {
    return renderEventDetailsPanel(selectedEventDetail);
  }

  if (activeSubView === 'my-events') {
    return renderMyEventsDashboard();
  }

  if (activeSubView === 'my-communities') {
    return renderMyCommunitiesDashboard();
  }

  return (
    <div className="pb-16 max-w-xl mx-auto">
      {/* Header Profile Summary with focus on purpose biography */}
      <div className="bg-white rounded-3xl p-6 border border-outline-variant/20 shadow-2xs mb-6 relative">
        {!isEditing ? (
          <>
            <button 
              onClick={() => setIsEditing(true)}
              className="absolute top-4 right-4 py-2 px-3.5 rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors text-primary cursor-pointer flex items-center gap-1.5 text-xs font-bold"
            >
              <Edit3 className="w-3.5 h-3.5" /> Edit Profile
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-primary-container shadow-md mb-3 relative group">
                <img src={profile.avatar || undefined} alt={profile.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold">
                  Change photo
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <h3 className="text-lg font-extrabold text-on-surface">{profile.name}</h3>
                <span className="text-secondary text-[11px]" title="🛡 Trusted Organizer Verified">🛡</span>
              </div>
              
              <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-1 justify-center font-semibold">
                <MapPin className="w-3.5 h-3.5 text-primary" /> {profile.location}
              </p>

              {/* Badges / Verification status badges display */}
              <div className="mt-3 flex gap-2 shrink-0 select-none">
                <span className="bg-primary/10 text-primary border border-primary/20 text-[9px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  ✓ Identity Verified
                </span>
                <span className="bg-secondary/15 text-on-secondary-container border border-secondary/15 text-[9px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  🛡 Trusted Organizer (NGO Sponsor)
                </span>
              </div>

              {/* Anti-matchmaking biography focus */}
              <p className="text-xs text-on-surface-variant max-w-md mt-4 leading-relaxed italic bg-surface-container-lowest p-3 border border-dashed border-outline-variant/20 rounded-xl w-full">
                &quot;{profile.bio || 'Coordinating community logistics. Passionate about green sector restoration and education outreach.'}&quot;
              </p>
            </div>

            {/* Account Info - Marked Private for Anti-dating Safety protection */}
            <div className="mt-5 border-t border-outline-variant/10 pt-4 bg-tertiary-container/5 rounded-2xl p-4">
              <p className="text-[9px] uppercase font-bold text-outline tracking-wider flex items-center gap-1 mb-2">
                <Lock className="w-3.5 h-3.5" /> Private Account Credentials (Private to you)
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs text-on-surface-variant">
                <span className="flex items-center gap-2 truncate">
                  <Mail className="w-3.5 h-3.5 text-outline shrink-0" /> {profile.email}
                </span>
                <span className="flex items-center gap-2 truncate">
                  <Phone className="w-3.5 h-3.5 text-outline shrink-0" /> {profile.phone}
                </span>
              </div>
            </div>

            {/* Interests & Discovery Profile Summary */}
            <div className="mt-5 border-t border-outline-variant/10 pt-4 space-y-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-outline block mb-2 select-none">🎯 My Selected Interests</span>
                <div className="flex flex-wrap gap-1.5">
                  {profile.interests && profile.interests.length > 0 ? (
                    profile.interests.map(interest => (
                      <span key={interest} className="px-2.5 py-1 bg-primary/5 text-primary border border-primary/15 text-[11px] font-medium rounded-lg">
                        {interest}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-outline italic">No interests selected. Click Edit Profile to setup yours.</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-outline block mb-2 select-none">🎗 Selected Causes</span>
                  <div className="flex flex-wrap gap-1">
                    {profile.causes && profile.causes.length > 0 ? (
                      profile.causes.map(cause => (
                        <span key={cause} className="px-2 py-0.5 bg-secondary/10 text-on-secondary-container text-[10px] font-bold rounded-md">
                          {cause}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-outline italic">No causes selected.</span>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-outline block mb-2 select-none">🗺 Discovery Radius</span>
                  <div className="text-xs font-semibold text-on-surface flex items-center gap-1.5 bg-surface-container-low p-2 rounded-xl">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shrink-0" />
                    <span>
                      {profile.discoveryRadius === 'Custom' 
                        ? `${profile.customRadiusValue || 25} km` 
                        : `${profile.discoveryRadius || 25} km`} Preferred Discovery Radius
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-outline block mb-1.5 select-none">⚙ Engagement Preferences</span>
                <div className="flex flex-wrap gap-1">
                  {profile.participationPreferences && profile.participationPreferences.length > 0 ? (
                    profile.participationPreferences.map(pref => (
                      <span key={pref} className="px-2 py-0.5 bg-teal-50 text-teal-950 border border-teal-150 text-[10px] font-bold rounded-md flex items-center gap-1">
                        ✓ {pref}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-outline italic">No engagement preferences selected.</span>
                  )}
                </div>
              </div>

              <div className="p-3 bg-surface-container-lowest border border-outline-variant/20 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between text-[11px] text-on-surface-variant gap-2 leading-tight">
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${profile.interestNotificationsEnabled !== false ? 'bg-emerald-500' : 'bg-outline'} shrink-0`} />
                  <span>Interests Alert Notifications: <strong>{profile.interestNotificationsEnabled !== false ? 'On' : 'Off'}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${profile.feedInterestsSettingEnabled ? 'bg-emerald-500' : 'bg-outline'} shrink-0`} />
                  <span>Feed Interests Booster: <strong>{profile.feedInterestsSettingEnabled ? 'Enabled' : 'Disabled'}</strong></span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <form onSubmit={handleSave} className="space-y-4">
            <h4 className="text-sm font-bold text-on-surface">Update Community Profile</h4>
            
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-outline mb-1">Your Full Name</label>
              <input 
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-11 px-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs focus:ring-1 focus:ring-primary focus:outline-none text-on-surface"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-outline mb-1">Purpose Bio (Hobbies, Learning interests, Skills)</label>
              <textarea 
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full p-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs focus:ring-1 focus:ring-primary focus:outline-none resize-none text-on-surface"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-outline mb-1">Location Region</label>
                <input 
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full h-11 px-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-outline mb-1">Contact Phone</label>
                <input 
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-11 px-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </div>
            </div>

            {/* INTERESTS SELECTION (ONBOARDING & EDITING FLOW) */}
            <div className="border-t border-outline-variant/10 pt-4 space-y-4">
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-outline mb-1">🎯 Select My Interests</span>
                <p className="text-[10px] text-on-surface-variant mb-2">Select multiple interests to discover local gatherings relevant to you.</p>
                
                <div className="space-y-3 max-h-72 overflow-y-auto border border-outline-variant/20 rounded-xl p-3 bg-surface-container-lowest">
                  {ALL_INTEREST_GROUPS.map((group) => (
                    <div key={group.category} className="space-y-1">
                      <span className="text-[9.5px] font-extrabold text-primary uppercase tracking-wider block">{group.category}</span>
                      <div className="flex flex-wrap gap-1.5 pb-2 border-b border-dashed border-outline-variant/10 last:border-b-0 mb-2 last:mb-0">
                        {group.items.map((item) => {
                          const isSelected = selectedInterests.includes(item);
                          return (
                            <button
                              type="button"
                              key={item}
                              onClick={() => {
                                if (isSelected) {
                                  setSelectedInterests(selectedInterests.filter(i => i !== item));
                                } else {
                                  setSelectedInterests([...selectedInterests, item]);
                                }
                              }}
                              className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                                isSelected 
                                  ? 'bg-primary text-on-primary font-bold shadow-xs' 
                                  : 'bg-surface-container hover:bg-surface-container-high text-on-surface border border-outline-variant/20'
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
              </div>

              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-outline mb-1">🎗 Causes I Care About</span>
                <p className="text-[10px] text-on-surface-variant mb-2">Select the causes you are passionate about to guide personalized event suggestions.</p>
                <div className="flex flex-wrap gap-1.5 border border-outline-variant/20 rounded-xl p-3 bg-surface-container-lowest">
                  {ALL_CAUSES.map((cause) => {
                    const isSelected = selectedCauses.includes(cause);
                    return (
                      <button
                        type="button"
                        key={cause}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedCauses(selectedCauses.filter(c => c !== cause));
                          } else {
                            setSelectedCauses([...selectedCauses, cause]);
                          }
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[10.5px] font-medium transition-all cursor-pointer ${
                          isSelected 
                            ? 'bg-secondary text-on-secondary font-bold shadow-xs' 
                            : 'bg-surface-container hover:bg-surface-container-high text-on-surface border border-outline-variant/20'
                        }`}
                      >
                        {isSelected ? `✓ ${cause}` : cause}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-outline mb-1">⚙ Typical Participation Preferences</span>
                <p className="text-[10px] text-on-surface-variant mb-2">How do you usually collaborate and engage within neighborhood gatherings?</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 border border-outline-variant/20 rounded-xl p-3 bg-surface-container-lowest">
                  {ALL_PARTICIPATION_PREFS.map((pref) => {
                    const isSelected = selectedPrefs.includes(pref);
                    return (
                      <label 
                        key={pref} 
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold cursor-pointer select-none transition-colors ${
                          isSelected 
                            ? 'bg-teal-50 border-teal-200 text-teal-950' 
                            : 'bg-surface border-outline-variant/15 text-on-surface-variant hover:bg-surface-container-low'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {
                            if (isSelected) {
                              setSelectedPrefs(selectedPrefs.filter(p => p !== pref));
                            } else {
                              setSelectedPrefs([...selectedPrefs, pref]);
                            }
                          }}
                          className="w-3.5 h-3.5 accent-teal-600 rounded bg-surface text-teal-600 cursor-pointer"
                        />
                        <span>{pref}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-outline mb-1">🗺 Event Discovery Radius Limit</span>
                  <select
                    value={radiusPref}
                    onChange={(e) => {
                      const val = e.target.value;
                      setRadiusPref(val === 'Custom' ? 'Custom' : Number(val));
                    }}
                    className="w-full h-11 px-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                  >
                    <option value={5}>5 km</option>
                    <option value={10}>10 km</option>
                    <option value={25}>25 km</option>
                    <option value={50}>50 km</option>
                    <option value={100}>100 km</option>
                    <option value="Custom">Custom Radius</option>
                  </select>
                </div>

                {radiusPref === 'Custom' && (
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-outline mb-1">Custom Radius Value (km)</span>
                    <input 
                      type="number"
                      min={1}
                      max={500}
                      value={customRadius}
                      onChange={(e) => setCustomRadius(Number(e.target.value))}
                      className="w-full h-11 px-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2 border border-outline-variant/20 rounded-xl p-3 bg-surface-container-lowest">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-outline mb-1">🔔 Preferences & Feeds Settings</span>
                
                <label className="flex items-center justify-between p-2 rounded-lg hover:bg-surface-container-low cursor-pointer">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-on-surface block">Interests Alert Notifications</span>
                    <span className="text-[10px] text-outline block">Notify me when relevant events in my radius are published.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={interestNotifications}
                    onChange={(e) => setInterestNotifications(e.target.checked)}
                    className="w-4 h-4 accent-primary rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-2 rounded-lg hover:bg-surface-container-low cursor-pointer">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-on-surface block">Feed Interests Discovery Booster</span>
                    <span className="text-[10px] text-outline block">Allow feed to occasionally suggest upcoming events based on interests.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={feedInterestsSetting}
                    onChange={(e) => setFeedInterestsSetting(e.target.checked)}
                    className="w-4 h-4 accent-primary rounded cursor-pointer"
                  />
                </label>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-3">
              <button 
                type="button" 
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-xs font-bold text-outline rounded-xl hover:bg-surface-container"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-4 py-2 bg-primary text-on-primary text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer"
              >
                <Save className="w-4 h-4" /> Save
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Profile Metrics Board matching specifications */}
      <h3 className="text-xs font-extrabold uppercase tracking-wider text-outline mb-3">Profile Metrics Portfolio</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6 select-none shrink-0">
        <div className="bg-surface-container-low rounded-2xl p-4 flex flex-col items-center justify-center text-center border border-outline-variant/10 shadow-3xs">
          <Award className="w-5 h-5 text-primary mb-1" />
          <span className="text-xl font-extrabold text-on-surface">530</span>
          <span className="text-[10px] text-on-surface-variant font-bold mt-0.5">Impact Score</span>
        </div>

        <div className="bg-surface-container-low rounded-2xl p-4 flex flex-col items-center justify-center text-center border border-outline-variant/10 shadow-3xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 mb-1" />
          <span className="text-xl font-extrabold text-on-surface">98%</span>
          <span className="text-[10px] text-on-surface-variant font-bold mt-0.5">Attendance Rate</span>
        </div>

        <div className="bg-surface-container-low rounded-2xl p-4 flex flex-col items-center justify-center text-center border border-outline-variant/10 shadow-3xs">
          <CalendarCheck className="w-5 h-5 text-secondary mb-1" />
          <span className="text-xl font-extrabold text-on-surface">14</span>
          <span className="text-[10px] text-on-surface-variant font-bold mt-0.5">Events Attended</span>
        </div>

        <div className="bg-surface-container-low rounded-2xl p-4 flex flex-col items-center justify-center text-center border border-outline-variant/10 shadow-3xs">
          <QrCode className="w-5 h-5 text-purple-600 mb-1" />
          <span className="text-xl font-extrabold text-on-surface">4</span>
          <span className="text-[10px] text-on-surface-variant font-bold mt-0.5">Events Hosted</span>
        </div>

        <div className="bg-surface-container-low rounded-2xl p-4 flex flex-col items-center justify-center text-center border border-outline-variant/10 shadow-3xs col-span-2 md:col-span-1">
          <Users className="w-5 h-5 text-primary mb-1" />
          <span className="text-xl font-extrabold text-on-surface">{joinedHubCount}</span>
          <span className="text-[10px] text-on-surface-variant font-bold mt-0.5">Communities Joined</span>
        </div>
      </div>

      {/* Prominent Quick Actions dashboard buttons */}
      <h3 className="text-xs font-extrabold uppercase tracking-wider text-outline mb-3">Quick Actions</h3>
      <div className="grid grid-cols-3 gap-3 mb-6">
        <button 
          id="btn-my-events"
          onClick={() => {
            setActiveSubView('my-events');
            setMyEventsFilter('all');
          }}
          className="flex flex-col items-center justify-center p-4 bg-white hover:bg-surface-container-low border border-outline-variant/25 rounded-2xl shadow-2xs transition-all active:scale-95 cursor-pointer text-center group font-semibold"
        >
          <CalendarCheck className="w-5 h-5 text-primary mb-1 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-extrabold text-on-surface">My Events</span>
          <span className="text-[9px] text-outline mt-0.5">Personal dashboard</span>
        </button>

        <button 
          id="btn-my-communities"
          onClick={() => setActiveSubView('my-communities')}
          className="flex flex-col items-center justify-center p-4 bg-white hover:bg-surface-container-low border border-outline-variant/25 rounded-2xl shadow-2xs transition-all active:scale-95 cursor-pointer text-center group font-semibold"
        >
          <Users className="w-5 h-5 text-secondary mb-1 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-extrabold text-on-surface">My Communities</span>
          <span className="text-[9px] text-outline mt-0.5">Joined sub-sectors</span>
        </button>

        <button 
          id="btn-verification-status"
          onClick={() => {
            const el = document.getElementById('voluntary-verification-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          className="flex flex-col items-center justify-center p-4 bg-white hover:bg-surface-container-low border border-outline-variant/25 rounded-2xl shadow-2xs transition-all active:scale-95 cursor-pointer text-center group font-semibold"
        >
          <Award className="w-5 h-5 text-amber-600 mb-1 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-extrabold text-on-surface">Verification Status</span>
          <span className="text-[9px] text-outline mt-0.5">Sponsor trust</span>
        </button>
      </div>

      {/* Past Contributions portfolio list */}
      <h3 className="text-xs font-extrabold uppercase tracking-wider text-outline mb-3">Past Contributions Logs Portfolio</h3>
      <div className="space-y-2.5 mb-6">
        {[
          { title: 'Central Park West Litter Sweeps', role: 'Team organizer', date: 'May 16th', outcome: '✓ 125kg Plastic cleared' },
          { title: 'Animal Rescue Veterinary Aid Prep', role: 'Support volunteer', date: 'April 28th', outcome: '✓ 15 puppies sheltered' },
          { title: 'Senior Technology Education Classes', role: 'Lecturer', date: 'March 14th', outcome: '✓ Approved certificate issued' },
        ].map((item, i) => (
          <div key={i} className="flex items-center justify-between p-3.5 bg-white border border-outline-variant/25 rounded-2xl shadow-2xs hover:bg-surface-container-low transition-colors">
            <div>
              <h5 className="text-xs font-bold text-on-surface">{item.title}</h5>
              <p className="text-[10px] text-outline mt-0.5">{item.role} • {item.date}</p>
            </div>
            <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
              {item.outcome}
            </span>
          </div>
        ))}
      </div>

      {/* Your Upcoming Gatherings */}
      <h3 className="text-xs font-extrabold uppercase tracking-wider text-outline mb-3">Your Upcoming Gatherings</h3>
      {rsvpdEvents.length === 0 ? (
        <div className="p-8 text-center bg-surface-container-low rounded-2xl border border-dashed border-outline-variant/35 mb-6">
          <p className="text-on-surface-variant text-xs">No upcoming event reservations.</p>
          <p className="text-[11px] text-outline mt-1 font-medium">Head over to the Discover tab to register interest in local events!</p>
        </div>
      ) : (
        <div className="space-y-3 mb-6">
          {rsvpdEvents.map((evt) => {
            let isVerified = false;
            let isAwarded = false;
            try {
              const savedRecs = localStorage.getItem('togather_attendance_records');
              if (savedRecs) {
                const records = JSON.parse(savedRecs);
                const matched = records.find((r: any) => r.eventId === evt.id && r.userName === profile.name);
                if (matched) {
                  isVerified = true;
                  isAwarded = !!matched.impactAwarded;
                }
              }
            } catch (err) {
              console.error(err);
            }

            return (
              <div 
                key={evt.id}
                className="flex items-center gap-3 bg-white p-3 rounded-2xl relative group border border-outline-variant/25 hover:bg-surface-container-low transition-colors shadow-2xs"
              >
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-neutral-100 shrink-0">
                  <img src={evt.image || undefined} alt={evt.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-grow min-w-0 pr-24">
                  <h4 className="font-extrabold text-xs text-on-surface truncate leading-tight">{evt.title}</h4>
                  <p className="text-[10px] text-primary font-bold mt-0.5">{evt.date}</p>
                  <p className="text-[10.5px] text-on-surface-variant truncate mt-0.5">{evt.location}</p>
                  
                  {/* Attendance status decoration */}
                  <div className="mt-1.5 flex gap-1.5 items-center select-none">
                    {isVerified ? (
                      isAwarded ? (
                        <span className="bg-emerald-50 text-emerald-800 border border-emerald-100 text-[9px] font-bold px-2 py-0.5 rounded-md">
                          ✓ Verified Attendance (+10 Impact Points Awarded)
                        </span>
                      ) : (
                        <span className="bg-blue-50 text-blue-800 border border-blue-105 text-[9px] font-bold px-2 py-0.5 rounded-md">
                          ✓ Presence Checked-In (+10 Points Pending Completion)
                        </span>
                      )
                    ) : (
                      <span className="bg-slate-100 text-slate-700 border border-outline-variant/20 text-[9px] font-bold px-2 py-0.5 rounded-md">
                        📍 Presence Check-In Active
                      </span>
                    )}
                  </div>
                </div>
                <button 
                  onClick={() => {
                    if (confirm(`Do you wish to cancel your interest in ${evt.title}?`)) {
                      onCancelRSVP(evt.id);
                    }
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-primary hover:underline cursor-pointer bg-white px-2.5 py-1.5 rounded-lg shadow-2xs hover:bg-primary hover:text-on-primary transition-all border border-outline-variant/20"
                >
                  Withdraw
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Voluntary Verification Request Box */}
      <h3 id="voluntary-verification-section" className="text-xs font-extrabold uppercase tracking-wider text-outline mb-3">Voluntary Trust Verification</h3>
      <div className="bg-white rounded-3xl p-5 border border-outline-variant/20 shadow-2xs mb-6">
        <p className="text-xs text-on-surface-variant leading-relaxed">
          Voluntarily apply for account elevations to show neighbor sincerity and host trusted community events.
        </p>

        {hasSubmitted ? (
          <div className="mt-4 p-3.5 bg-emerald-50 text-emerald-850 rounded-xl border border-emerald-100 flex items-start gap-2.5 text-xs animate-in fade-in duration-300">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Verification Request Submitted!</p>
              <p className="text-[10px] text-emerald-700 leading-normal mt-0.5">ToGather administrators will manually evaluate your credentials in the backend portal.</p>
            </div>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAppliedType('Identity Verified')}
                className={`py-2 text-center text-[10.5px] font-bold rounded-xl border cursor-pointer transition-all ${
                  appliedType === 'Identity Verified' 
                    ? 'bg-primary/10 text-primary border-primary font-extrabold shadow-2xs' 
                    : 'bg-surface border-outline-variant/25 text-on-surface-variant hover:bg-surface-container-low'
                }`}
              >
                ✓ Identity Verified
              </button>
              <button
                type="button"
                onClick={() => setAppliedType('Trusted Organizer')}
                className={`py-2 text-center text-[10.5px] font-bold rounded-xl border cursor-pointer transition-all ${
                  appliedType === 'Trusted Organizer' 
                    ? 'bg-secondary/15 text-on-secondary-container border-secondary/50 font-extrabold shadow-2xs' 
                    : 'bg-surface border-outline-variant/25 text-on-surface-variant hover:bg-surface-container-low'
                }`}
              >
                🛡 Trusted Organizer
              </button>
            </div>

            <div>
              <input 
                type="text"
                placeholder="Support Details (e.g. Reference links, ID catalog ref...)"
                value={verifDetails}
                onChange={(e) => setVerifDetails(e.target.value)}
                className="w-full h-10 px-3 bg-surface border border-outline-variant/30 rounded-xl text-xs placeholder:text-outline text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            
            <div>
              <textarea 
                rows={2}
                placeholder="Applicant's statement / motivating goals..."
                value={verifReason}
                onChange={(e) => setVerifReason(e.target.value)}
                className="w-full p-2.5 bg-surface border border-outline-variant/30 rounded-xl text-xs placeholder:text-outline text-on-surface resize-none focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <button
              onClick={handleRequestSubmit}
              disabled={!verifReason.trim()}
              className="w-full py-2.5 bg-primary text-on-primary text-[11px] font-bold rounded-xl active:scale-95 transition-all outline-none cursor-pointer disabled:opacity-50"
            >
              Submit Voluntary Assessment
            </button>
          </div>
        )}
      </div>

      {/* Account Control */}
      <div className="pt-4 border-t border-outline-variant/10">
        <button 
          onClick={onLogOut}
          className="w-full py-4 text-xs font-bold text-primary border border-primary/20 rounded-xl hover:bg-primary/5 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer bg-white"
        >
          <LogOut className="w-4 h-4" /> Log Out / Switch User State
        </button>
      </div>
    </div>
  );
}
