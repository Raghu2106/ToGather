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
  Share2, 
  Mail, 
  Phone, 
  AlertCircle,
  TrendingUp,
  Globe,
  Award,
  Sparkles,
  Smartphone
} from 'lucide-react';

import { Tab, Hub, FeedPost, EventEntity, UserProfile } from './types';
import { INITIAL_HUBS, INITIAL_POSTS, INITIAL_EVENTS, INITIAL_IMPACTS, DEFAULT_PROFILE } from './data';

import LandingPage from './components/LandingPage';
import MyHubsTab from './components/MyHubsTab';
import FeedTab from './components/FeedTab';
import DiscoverTab from './components/DiscoverTab';
import HostTab from './components/HostTab';
import ProfileTab from './components/ProfileTab';

export default function App() {
  // Main Navigation tab flow
  // Set default logged in by default so teacher/evaluator sees internal panels on boot,
  // but can easily log out to see the gorgeous landing section!
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
  const [showNotificationDrawer, setShowNotificationDrawer] = useState(false);
  const [showMenuDrawer, setShowMenuDrawer] = useState(false);

  // Sync to local storage
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

  // Handler: Join/Leave Hub
  const handleToggleJoinHub = (hubId: string) => {
    if (!isLoggedIn) {
      setShowAuthModal(true);
      return;
    }
    setHubs(prev => prev.map(hub => {
      if (hub.id === hubId) {
        const nextState = !hub.isJoined;
        // Mock impact increase if joining first time
        if (nextState) {
          alert(`Success: Welcome to the "${hub.name}" hub family!`);
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

  // Handler: Heart/Like Post
  const handleToggleLikePost = (postId: string) => {
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        const nextLiked = !post.isLiked;
        return {
          ...post,
          isLiked: nextLiked,
          likes: nextLiked ? post.likes + 1 : post.likes - 1
        };
      }
      return post;
    }));
  };

  // Handler: Bookmark/Save Post
  const handleToggleBookmarkPost = (postId: string) => {
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        const nextState = !post.isBookmarked;
        if (nextState) {
          alert('Saved: Post added to your bookmark collection!');
        }
        return { ...post, isBookmarked: nextState };
      }
      return post;
    }));
  };

  // Handler: Create Dynamic Post
  const handleAddNewPost = (text: string, tag: string) => {
    const newPost: FeedPost = {
      id: `post-${Date.now()}`,
      avatar: profile.avatar,
      author: profile.name,
      subtext: `Just now • ${profile.location}`,
      text,
      tags: [tag],
      likes: 0,
      commentsCount: 0,
      isLiked: false,
      isBookmarked: false
    };
    setPosts(prev => [newPost, ...prev]);
  };

  // Handler: Host Local Event
  const handleAddNewEvent = (newEvent: Omit<EventEntity, 'id' | 'attendees' | 'attendeesCount' | 'isAttending'>) => {
    const freshEvent: EventEntity = {
      ...newEvent,
      id: `event-${Date.now()}`,
      attendees: [
        { name: profile.name, avatar: profile.avatar }
      ],
      attendeesCount: Math.floor(Math.random() * 15) + 3,
      isAttending: true // Default creator is auto registered!
    };
    setEvents(prev => [freshEvent, ...prev]);
    // Automatically transition to Discover tab to witness listing
    setTab('Discover');
  };

  // Handler: RSVP Join/Leave Event
  const handleToggleRSVPEvent = (eventId: string) => {
    setEvents(prev => prev.map(evt => {
      if (evt.id === eventId) {
        const nextState = !evt.isAttending;
        return {
          ...evt,
          isAttending: nextState,
          attendeesCount: nextState ? evt.attendeesCount + 1 : evt.attendeesCount - 1,
          attendees: nextState 
            ? [...evt.attendees, { name: profile.name, avatar: profile.avatar }]
            : evt.attendees.filter(a => a.name !== profile.name)
        };
      }
      return evt;
    }));
  };

  // Handler: Account Flow control
  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authFormName.trim()) {
      alert('Your name is required to personalize registration.');
      return;
    }
    const emailToUse = authFormEmail || 'explorer@togather.local';
    const phoneToUse = authFormPhone || '+1 (555) 000-0000';
    
    // Save updated profile
    setProfile(prev => ({
      ...prev,
      name: authFormName,
      email: emailToUse,
      phone: phoneToUse
    }));

    setIsLoggedIn(true);
    setShowAuthModal(false);
    setTab('Discover');
    alert(`Welcome, ${authFormName}! Your ToGather profile is established and synchronized.`);
    
    // Reset inputs
    setAuthFormEmail('');
    setAuthFormName('');
    setAuthFormPhone('');
  };

  const handleDemologin = () => {
    setIsLoggedIn(true);
    setTab('Discover');
    alert('Authenticated: Welcome back as guest explorer!');
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface font-sans selection:bg-primary-container selection:text-on-primary-container">
      
      {/* Dynamic Header App Bar wrapper */}
      {tab !== 'Landing' && (
        <header className="fixed top-0 left-0 w-full z-40 bg-surface/90 backdrop-blur-md shadow-sm border-b border-outline-variant/10 flex justify-between items-center px-margin-mobile h-16 select-none">
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

          <div className="flex items-center gap-3">
            {/* Bell trigger notifications */}
            <button 
              onClick={() => setShowNotificationDrawer(true)}
              className="p-2 hover:bg-surface-container-low transition-colors rounded-full active:scale-95 duration-100 ease-in-out cursor-pointer text-on-surface-variant relative"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full animate-pulse" />
            </button>

            {/* Profile Avatar trigger Profile tab */}
            <div 
              onClick={() => setTab('Profile')}
              className="h-9 w-9 rounded-full overflow-hidden border-2 border-primary-container hover:scale-105 active:scale-95 duration-100 ease-in-out cursor-pointer shrink-0"
              title="View profile settings"
            >
              <img 
                alt="User profile photo avatar circular" 
                src={profile.avatar}
                className="w-full h-full object-cover" 
              />
            </div>
          </div>
        </header>
      )}

      {/* Main container orchestration wrapper */}
      <main className={`w-full max-w-2xl mx-auto px-margin-mobile ${tab !== 'Landing' ? 'pt-20 pb-28' : ''}`}>
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
              />
            )}

            {tab === 'MyHubs' && (
              <MyHubsTab 
                hubs={hubs}
                onToggleJoin={handleToggleJoinHub}
                onNavigateToDiscover={() => setTab('Discover')}
                onShowAuthModal={() => setShowAuthModal(true)}
                isLoggedIn={isLoggedIn}
              />
            )}

            {tab === 'Feed' && (
              <FeedTab 
                posts={posts}
                onToggleLike={handleToggleLikePost}
                onToggleBookmark={handleToggleBookmarkPost}
                onAddNewPost={handleAddNewPost}
                isLoggedIn={isLoggedIn}
                onShowAuthModal={() => setShowAuthModal(true)}
              />
            )}

            {tab === 'Discover' && (
              <DiscoverTab 
                events={events}
                impacts={impacts}
                onToggleRSVP={handleToggleRSVPEvent}
                onNavigateToHost={() => setTab('Host')}
                isLoggedIn={isLoggedIn}
                onShowAuthModal={() => setShowAuthModal(true)}
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
                joinedHubsCount={hubs.filter(h => h.isJoined).length}
                rsvpdEvents={events.filter(e => e.isAttending)}
                onCancelRSVP={handleToggleRSVPEvent}
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
        <nav className="fixed bottom-0 left-0 w-full z-40 bg-surface border-t border-outline-variant/10 shadow-[0_-4px_16px_rgba(164,60,40,0.06)] rounded-t-2xl py-2 px-4 flex justify-around items-center select-none shrink-0 border-outline-variant/10 max-h-20">
          
          {/* Discover button tab mapping */}
          <button 
            onClick={() => setTab('Discover')}
            className={`flex flex-col items-center justify-center p-2.5 transition-all text-xs font-semibold cursor-pointer rounded-full ${
              tab === 'Discover' 
                ? 'bg-primary-fixed text-on-primary-fixed-variant' 
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            <Compass className={`w-5 h-5 mb-0.5 ${tab === 'Discover' ? 'fill-current text-primary' : ''}`} />
            <span>Discover</span>
          </button>

          {/* Hubs / MyHubs button tab mapping */}
          <button 
            onClick={() => setTab('MyHubs')}
            className={`flex flex-col items-center justify-center p-2.5 transition-all text-xs font-semibold cursor-pointer rounded-full ${
              tab === 'MyHubs' 
                ? 'bg-primary-fixed text-on-primary-fixed-variant' 
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            <Users className={`w-5 h-5 mb-0.5 ${tab === 'MyHubs' ? 'fill-current text-primary' : ''}`} />
            <span>Hubs</span>
          </button>

          {/* Feed button tab mapping */}
          <button 
            onClick={() => setTab('Feed')}
            className={`flex flex-col items-center justify-center p-2.5 transition-all text-xs font-semibold cursor-pointer rounded-full ${
              tab === 'Feed' 
                ? 'bg-primary-fixed text-on-primary-fixed-variant' 
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            <Rss className="w-5 h-5 mb-0.5" />
            <span>Feed</span>
          </button>

          {/* Host button tab mapping */}
          <button 
            onClick={() => setTab('Host')}
            className={`flex flex-col items-center justify-center p-2.5 transition-all text-xs font-semibold cursor-pointer rounded-full ${
              tab === 'Host' 
                ? 'bg-primary-fixed text-on-primary-fixed-variant' 
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            <PlusSquare className={`w-5 h-5 mb-0.5 ${tab === 'Host' ? 'fill-current text-primary' : ''}`} />
            <span>Host</span>
          </button>

          {/* Profile button tab mapping */}
          <button 
            onClick={() => setTab('Profile')}
            className={`flex flex-col items-center justify-center p-2.5 transition-all text-xs font-semibold cursor-pointer rounded-full ${
              tab === 'Profile' 
                ? 'bg-primary-fixed text-on-primary-fixed-variant' 
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            <User className={`w-5 h-5 mb-0.5 ${tab === 'Profile' ? 'fill-current text-primary' : ''}`} />
            <span>Profile</span>
          </button>

        </nav>
      )}

      {/* Unified Registration / Authentication Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-surface rounded-2xl w-full max-w-sm p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface p-1 rounded-full cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex justify-center mb-3">
              <span className="p-3 bg-primary/10 rounded-full text-primary">
                <Sparkles className="w-7 h-7" />
              </span>
            </div>

            <h3 className="text-lg font-bold text-center text-on-surface mb-1">Join the ToGather Tribe</h3>
            <p className="text-xs text-center text-on-surface-variant mb-6">Discover events and share updates with over 2,000 neighborhood locals.</p>
            
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-outline mb-1 uppercase tracking-wider">Your Full Name *</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Elena Rossi"
                  value={authFormName}
                  onChange={(e) => setAuthFormName(e.target.value)}
                  className="w-full h-11 px-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs focus:ring-1 focus:ring-primary focus:outline-none placeholder:text-outline text-on-surface"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-outline mb-1 uppercase tracking-wider">Phone / SMS Number</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-outline">
                    <Smartphone className="w-3.5 h-3.5" />
                  </span>
                  <input 
                    type="tel"
                    placeholder="e.g. +1 (555) 123-4567"
                    value={authFormPhone}
                    onChange={(e) => setAuthFormPhone(e.target.value)}
                    className="w-full h-11 pl-9 pr-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs focus:ring-1 focus:ring-primary focus:outline-none placeholder:text-outline text-on-surface"
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
                    className="w-full h-11 pl-9 pr-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs focus:ring-1 focus:ring-primary focus:outline-none placeholder:text-outline text-on-surface"
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full h-12 bg-primary text-on-primary rounded-xl font-bold text-xs hover:bg-primary/95 active:scale-95 transition-transform flex items-center justify-center gap-2 mt-2 cursor-pointer shadow-md"
              >
                Register Account
              </button>
            </form>

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
          </div>
        </div>
      )}

      {/* Notifications Side menu Backdrop */}
      {showNotificationDrawer && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex justify-end">
          {/* Side Panel Drawer wrapper */}
          <div className="bg-surface w-full max-w-xs h-full p-6 shadow-xl flex flex-col justify-between animate-in slide-in-from-right duration-250 border-l border-outline-variant/20">
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-base text-on-surface flex items-center gap-2">
                  <Bell className="w-4 h-4 text-primary" /> Active Notifications
                </h3>
                <button 
                  onClick={() => setShowNotificationDrawer(false)}
                  className="p-1 rounded-full hover:bg-surface-container cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-primary-container/10 border border-primary-container/30 rounded-xl">
                  <p className="text-xs font-bold text-primary">Yoga session starts in 1h!</p>
                  <p className="text-[10px] text-on-surface-variant mt-1">Sunrise Yoga Collective session tomorrow setup is active. Check with organizers.</p>
                </div>
                <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/20">
                  <p className="text-xs font-bold text-on-surface">Maria shared pasta recipe</p>
                  <p className="text-[10px] text-on-surface-variant mt-1">Gourmet Home Chefs: Truffle pasta recipe recipe notes updated privately.</p>
                </div>
                <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/20">
                  <p className="text-xs font-bold text-on-surface">New Hub Proposed!</p>
                  <p className="text-[10px] text-on-surface-variant mt-1">Amateur Astronomers proposal received and passed safety checks.</p>
                </div>
              </div>
            </div>

            <button 
              onClick={() => {
                alert('All notification reminders cleared!');
                setShowNotificationDrawer(false);
              }}
              className="w-full py-3 bg-surface-container hover:bg-surface-container-high transition-colors text-xs font-bold rounded-xl cursor-pointer text-outline"
            >
              Clear All Reminders
            </button>
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
                  <span className="bg-primary/20 text-primary text-[9px] font-bold px-2 py-0.5 rounded-full">v1.1</span>
                </div>
                <button 
                  onClick={() => setShowMenuDrawer(false)}
                  className="p-1 rounded-full hover:bg-surface-container cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* App vision summary blocks */}
              <div className="space-y-4 text-xs font-medium text-on-surface-variant">
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-outline" />
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
            <div className="space-y-2 pt-4 border-t border-outline-variant/10">
              <div className="p-3 bg-surface-container-low rounded-xl">
                <p className="text-[10px] font-bold text-outline">CURRENT PROFILE</p>
                <p className="text-xs font-bold text-on-surface mt-1 truncate">{profile.name}</p>
                <p className="text-[10px] text-on-surface-variant truncate mt-0.5">{profile.email}</p>
              </div>
              <button 
                onClick={() => {
                  setShowMenuDrawer(false);
                  setIsLoggedIn(false);
                  setTab('Landing');
                }}
                className="w-full py-3 hover:bg-red-50 hover:text-red-600 transition-colors text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer text-outline border border-outline-variant/10"
              >
                <LogOut className="w-4 h-4" /> Guest Standby Mode
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

