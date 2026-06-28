/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { EventEntity } from '../types';
import { 
  Sparkles, 
  MapPin, 
  Calendar, 
  Plus, 
  Award, 
  Tent, 
  Info,
  ShieldAlert,
  AlertTriangle,
  FileCheck,
  CheckCircle,
  Clock,
  Briefcase
} from 'lucide-react';
import { APPROVED_CATEGORIES, HUB_CATEGORIES } from '../data';

const INTERESTS_BY_CATEGORY: Record<string, string[]> = {
  'Environment & Conservation': ['Environmental Action', 'Beach Cleanup', 'Tree Plantation', 'Gardening', 'Volunteering', 'Social Impact'],
  'Education & Mentorship': ['Education', 'Reading', 'Writing', 'Technology', 'Programming', 'Public Speaking', 'Debate'],
  'Health & Wellness': ['Yoga', 'Meditation', 'Fitness', 'Wellness', 'Nutrition', 'Mental Wellness'],
  'Art & Creative Expression': ['Painting', 'Crafts', 'Photography', 'Videography', 'Music', 'Dance', 'Theatre', 'Movies'],
  'Neighborhood Outings': ['Cycling', 'Motorcycling', 'Running', 'Walking', 'Trekking', 'Camping', 'Travel'],
  'Volunteering & Social Causes': ['Community Service', 'Volunteering', 'Blood Donation', 'Disaster Relief', 'Social Impact'],
  'Pets & Urban Wildlife': ['Pets', 'Animal Welfare', 'Bird Watching']
};

interface HostTabProps {
  onAddNewEvent: (newEvent: Omit<EventEntity, 'id' | 'attendees' | 'attendeesCount' | 'isAttending'>) => void;
  onAddNewHub?: (newHub: { name: string; category: string; description: string; image: string; tag: string }) => void;
  isLoggedIn: boolean;
  onShowAuthModal: () => void;
}

export default function HostTab({ onAddNewEvent, onAddNewHub, isLoggedIn, onShowAuthModal }: HostTabProps) {
  const [mode, setMode] = useState<'event' | 'hub'>('event');
  
  // Event state fields
  const [eventTitle, setEventTitle] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [category, setCategory] = useState('Volunteering & Social Causes');
  const [organizerType, setOrganizerType] = useState<'Individual' | 'Community' | 'NGO' | 'Organization'>('Individual');
  const [dateStr, setDateStr] = useState('');
  const [timeStr, setTimeStr] = useState('');
  const [location, setLocation] = useState('');
  const [capacity, setCapacity] = useState('15');
  const [isFree, setIsFree] = useState(true);
  
  const [safetyNotes, setSafetyNotes] = useState('');
  const [materialsRequired, setMaterialsRequired] = useState('');
  const [whatToBring, setWhatToBring] = useState('');
  const [accessMode, setAccessMode] = useState<'Open' | 'Approval Required' | 'Invite Only'>('Open');
  const [coverPreset, setCoverPreset] = useState(0);
  const [discussionsEnabled, setDiscussionsEnabled] = useState<boolean>(true);

  // Interest tags state and category auto-alignment
  const [primaryInterest, setPrimaryInterest] = useState('');
  const [secondaryInterest, setSecondaryInterest] = useState('');
  const [thirdInterest, setThirdInterest] = useState('');

  React.useEffect(() => {
    const defaultInterests = INTERESTS_BY_CATEGORY[category] || [];
    if (defaultInterests.length > 0) {
      setPrimaryInterest(defaultInterests[0]);
    } else {
      setPrimaryInterest('');
    }
    setSecondaryInterest('');
    setThirdInterest('');
  }, [category]);

  // Agreement and accountability checks
  const [agreedGuidelines, setAgreedGuidelines] = useState(false);
  const [agreedSafety, setAgreedSafety] = useState(false);
  const [agreedConduct, setAgreedConduct] = useState(false);

  // Proposed Hub fields
  const [hubName, setHubName] = useState('');
  const [hubCategory, setHubCategory] = useState('Volunteering & Social Causes');
  const [customCategoryName, setCustomCategoryName] = useState('');
  const [hubDesc, setHubDesc] = useState('');
  const [isRecurring, setIsRecurring] = useState<boolean | null>(null);

  // Preset illustrations & covers
  const mediaPresets = [
    { name: 'People Gardening (Green)', url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&auto=format&fit=crop&q=80' },
    { name: 'Mountain Trekkers (Outdoor)', url: 'https://images.unsplash.com/photo-1551632811-561730d1e4a6?w=600&auto=format&fit=crop&q=80' },
    { name: 'Cozy Library/Classroom (Social)', url: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=600&auto=format&fit=crop&q=80' },
    { name: 'Rescue Shelter Pups (Care)', url: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&auto=format&fit=crop&q=80' }
  ];

  const handleHostEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      onShowAuthModal();
      return;
    }

    if (!agreedGuidelines || !agreedSafety || !agreedConduct) {
      alert('Kindly read and check all agreements to Guidelines, Safety Rules, and Event Conduct Policies before publishing.');
      return;
    }

    if (!eventTitle.trim() || !eventDescription.trim() || !dateStr.trim() || !location.trim()) {
      alert('Fill in all mandatory attributes (*) to activate this event listing.');
      return;
    }

    onAddNewEvent({
      title: eventTitle,
      description: eventDescription,
      category,
      image: mediaPresets[coverPreset].url,
      date: dateStr,
      time: timeStr || '9:00 AM - 1:00 PM',
      location,
      isFree,
      organizerName: 'Marcus Chen', // placeholder for current logged in user
      organizerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      organizerVerification: 'Identity Verified',
      organizerPastEvents: 3,
      capacity: Number(capacity) || 15,
      safetyNotes: safetyNotes || 'Keep within designated safety lanes; follow site coordinates.',
      materialsRequired: materialsRequired || 'None; all essential toolkits supplied.',
      whatToBring: whatToBring || 'Refillable water bottle, athletic clothing, open mind!',
      accessMode,
      discussionsEnabled,
      announcements: [
        {
          id: `ann-${Date.now()}`,
          senderName: 'Marcus Chen',
          senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          senderVerification: 'Identity Verified',
          content: `🌟 Welcome! Thanks for joining "${eventTitle}". Pinned safe coordinates will be posted 1 hour before scheduled starts.`,
          timestamp: 'Just now',
          pinned: true
        }
      ],
      discussion: [],
      photos: [mediaPresets[coverPreset].url],
      primaryInterest,
      secondaryInterest: secondaryInterest || undefined,
      thirdInterest: thirdInterest || undefined
    });

    // Reset forms
    setEventTitle('');
    setEventDescription('');
    setCategory('Volunteering');
    setOrganizerType('Individual');
    setDateStr('');
    setTimeStr('');
    setLocation('');
    setCapacity('15');
    setIsFree(true);
    setSafetyNotes('');
    setMaterialsRequired('');
    setWhatToBring('');
    setAccessMode('Open');
    setAgreedGuidelines(false);
    setAgreedSafety(false);
    setAgreedConduct(false);

    alert('Success: Your event is live! We have verified your profile credentials.');
  };

  const handleProposeHub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      onShowAuthModal();
      return;
    }
    if (isRecurring !== true) {
      alert('Only recurring communities should become Hubs. Kindly confirm recurring status to proceed.');
      return;
    }
    if (!hubName.trim() || !hubDesc.trim()) {
      alert('Hub Name and Community Objectives Description are mandatory.');
      return;
    }

    const calculatedCategory = hubCategory === 'Others' ? customCategoryName.trim() : hubCategory;
    if (hubCategory === 'Others' && !customCategoryName.trim()) {
      alert('Kindly supply a custom category name.');
      return;
    }

    if (onAddNewHub) {
      onAddNewHub({
        name: hubName,
        category: calculatedCategory,
        description: hubDesc,
        image: mediaPresets[coverPreset % mediaPresets.length].url,
        tag: `#${calculatedCategory.replace(/[^a-zA-Z0-9]/g, '')}`
      });
      alert(`Success: Your community hub "${hubName}" is now active! Live members can join immediately.`);
    } else {
      alert(`Tribe Proposed: "${hubName}" submitted for regional moderation safety check. You will receive notification within 48 hours.`);
    }

    // Reset fields
    setHubName('');
    setHubDesc('');
    setCustomCategoryName('');
    setHubCategory('Volunteering & Social Causes');
    setIsRecurring(null);
  };

  return (
    <div className="pb-16 max-w-xl mx-auto">
      {/* Upper Mode Select Segmented Tabs */}
      <div className="bg-surface-container p-1 rounded-2xl flex mb-6 shadow-2xs select-none">
        <button
          onClick={() => setMode('event')}
          className={`flex-1 py-3.5 text-center text-xs font-bold rounded-xl transition-all cursor-pointer ${
            mode === 'event' 
              ? 'bg-white text-on-surface shadow-xs font-extrabold' 
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          Host Purpose Event
        </button>
        <button
          onClick={() => setMode('hub')}
          className={`flex-1 py-3.5 text-center text-xs font-bold rounded-xl transition-all cursor-pointer ${
            mode === 'hub' 
              ? 'bg-white text-on-surface shadow-xs font-extrabold' 
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          Propose Community Hub
        </button>
      </div>

      {mode === 'event' ? (
        <div className="bg-white rounded-3xl p-6 border border-outline-variant/20 shadow-2xs">
          <div className="flex items-center gap-3 mb-6">
            <span className="p-2.5 bg-primary/10 rounded-xl text-primary font-bold">
              <Tent className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-black text-on-surface">Publish Local Purpose Event</h3>
              <p className="text-xs text-outline font-medium">Create transparent activities with zero dating background</p>
            </div>
          </div>

          <form onSubmit={handleHostEventSubmit} className="space-y-4">
            
            {/* Title & Description fields */}
            <div>
              <label className="block text-[10px] font-extrabold text-outline uppercase tracking-wider mb-1">Event Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Saturday Botanical Planting Drive"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                className="w-full h-11 px-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs focus:ring-1 focus:ring-primary focus:outline-none placeholder:text-outline text-on-surface focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-[10px] font-extrabold text-outline uppercase tracking-wider mb-1">Event Purpose & Description *</label>
              <textarea
                rows={3}
                required
                placeholder="Describe your goals, activities, and why this contributes to public or wellness sectors..."
                value={eventDescription}
                onChange={(e) => setEventDescription(e.target.value)}
                className="w-full p-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs focus:ring-1 focus:ring-primary focus:outline-none placeholder:text-outline text-on-surface resize-none focus:bg-white"
              />
            </div>

            {/* Approved Categories & Organizer Type */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-extrabold text-outline uppercase tracking-wider mb-1">Purpose Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-11 px-2.5 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs focus:ring-1 focus:ring-primary"
                >
                  {APPROVED_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-outline uppercase tracking-wider mb-1">Organizer Type *</label>
                <select
                  value={organizerType}
                  onChange={(e) => setOrganizerType(e.target.value as any)}
                  className="w-full h-11 px-2.5 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs focus:ring-1 focus:ring-primary"
                >
                  <option value="Individual">Individual Creator</option>
                  <option value="Community">Community Group</option>
                  <option value="NGO">NGO / Charity Institute</option>
                  <option value="Organization">Public Organization</option>
                </select>
              </div>
            </div>

            {/* Interest Tagging and Anti-Spam Control */}
            <div className="bg-primary/5 p-4 rounded-2xl border border-primary/20 space-y-3">
              <div className="space-y-0.5">
                <span className="block text-[10px] font-black text-primary uppercase tracking-widest">🛡️ Interest Tagging System</span>
                <span className="block text-[8.5px] text-outline leading-tight font-semibold">
                  Select 1 to 3 focus tags. Max 3 tags. Target options align with your chosen category to maintain search authenticity and block social popularity exploits.
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[9px] font-bold text-outline uppercase mb-0.5">Primary (Required) *</label>
                  <select
                    className="w-full h-9 px-1.5 bg-white border border-outline-variant/30 rounded-lg text-[10.5px] focus:ring-1 focus:ring-primary font-bold text-primary focus:outline-none"
                    value={primaryInterest}
                    onChange={(e) => setPrimaryInterest(e.target.value)}
                    required
                  >
                    {(INTERESTS_BY_CATEGORY[category] || []).map((interest) => (
                      <option key={interest} value={interest}>{interest}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-outline uppercase mb-0.5">Secondary (Optional)</label>
                  <select
                    className="w-full h-9 px-1.5 bg-white border border-outline-variant/30 rounded-lg text-[10.5px] focus:ring-1 focus:ring-primary text-on-surface focus:outline-none"
                    value={secondaryInterest}
                    onChange={(e) => setSecondaryInterest(e.target.value)}
                  >
                    <option value="">-- None --</option>
                    {(INTERESTS_BY_CATEGORY[category] || []).filter(item => item !== primaryInterest).map((interest) => (
                      <option key={interest} value={interest}>{interest}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-outline uppercase mb-0.5">Third (Optional)</label>
                  <select
                    className="w-full h-9 px-1.5 bg-white border border-outline-variant/30 rounded-lg text-[10.5px] focus:ring-1 focus:ring-primary text-on-surface focus:outline-none"
                    value={thirdInterest}
                    onChange={(e) => setThirdInterest(e.target.value)}
                  >
                    <option value="">-- None --</option>
                    {(INTERESTS_BY_CATEGORY[category] || [])
                      .filter(item => item !== primaryInterest && item !== secondaryInterest)
                      .map((interest) => (
                        <option key={interest} value={interest}>{interest}</option>
                      ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Access Mode and Capacity */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-extrabold text-outline uppercase tracking-wider mb-1">Access Mode *</label>
                <select
                  value={accessMode}
                  onChange={(e) => setAccessMode(e.target.value as any)}
                  className="w-full h-11 px-2.5 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs focus:ring-1 focus:ring-primary"
                >
                  <option value="Open">Open Event (Direct RSVP)</option>
                  <option value="Approval Required">Approval Required (Verified list)</option>
                  <option value="Invite Only">Invite Only</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-outline uppercase tracking-wider mb-1">Participant Capacity limit *</label>
                <input 
                  type="number" 
                  required
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  className="w-full h-11 px-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </div>
            </div>

            {/* Discussions Enabled Option */}
            <div className="bg-surface-container-low p-3.5 rounded-2xl border border-outline-variant/15 flex items-center justify-between gap-4">
              <div className="text-left">
                <p className="text-xs font-extrabold text-on-surface">Enable Discussions</p>
                <p className="text-[10px] text-outline mt-0.5">Allow approved participants to post and chat in the Discussions tab.</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setDiscussionsEnabled(true)}
                  className={`px-4 h-9 text-[10px] uppercase font-black rounded-lg border transition-all cursor-pointer ${
                    discussionsEnabled
                      ? 'bg-primary text-on-primary border-primary'
                      : 'bg-white hover:bg-slate-50 border-outline-variant/30 text-outline'
                  }`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setDiscussionsEnabled(false)}
                  className={`px-4 h-9 text-[10px] uppercase font-black rounded-lg border transition-all cursor-pointer ${
                    !discussionsEnabled
                      ? 'bg-primary text-on-primary border-primary'
                      : 'bg-white hover:bg-slate-50 border-outline-variant/30 text-outline'
                  }`}
                >
                  No
                </button>
              </div>
            </div>

            {/* Date, Time and Map Location */}
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-1">
                <label className="block text-[10px] font-extrabold text-outline uppercase tracking-wider mb-1">Scheduled Date *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sat May 30th"
                  value={dateStr}
                  onChange={(e) => setDateStr(e.target.value)}
                  className="w-full h-11 px-2.5 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs"
                />
              </div>

              <div className="col-span-1">
                <label className="block text-[10px] font-extrabold text-outline uppercase tracking-wider mb-1">Timings (Range)</label>
                <input
                  type="text"
                  placeholder="e.g. 9 AM - 1 PM"
                  value={timeStr}
                  onChange={(e) => setTimeStr(e.target.value)}
                  className="w-full h-11 px-2.5 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs"
                />
              </div>

              <div className="col-span-1">
                <label className="block text-[10px] font-extrabold text-outline uppercase tracking-wider mb-1">Entrance Access Fee</label>
                <select
                  value={isFree ? 'Free' : 'Paid'}
                  onChange={(e) => setIsFree(e.target.value === 'Free')}
                  className="w-full h-11 px-2 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs"
                >
                  <option value="Free">No Entrance Fee</option>
                  <option value="Paid">Requires Fee</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-extrabold text-outline uppercase tracking-wider mb-1">Specific Gathering location Area Map *</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Northern Wood Forestry Entrance"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full h-11 pl-9 pr-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs focus:ring-1 focus:ring-primary text-on-surface"
                />
              </div>
            </div>

            {/* Logistics & Safety Details */}
            <div className="space-y-3.5 pt-2">
              <div>
                <label className="block text-[10px] font-extrabold text-outline uppercase tracking-wider mb-1">Safety Notes & Risks guidelines *</label>
                <input
                  type="text"
                  placeholder="e.g. Wear thick boots to guard against nails; high water advisory."
                  value={safetyNotes}
                  onChange={(e) => setSafetyNotes(e.target.value)}
                  className="w-full h-10 px-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-extrabold text-outline uppercase tracking-wider mb-1">Materials Provided</label>
                  <input
                    type="text"
                    placeholder="e.g. Bags, pickers, stationery"
                    value={materialsRequired}
                    onChange={(e) => setMaterialsRequired(e.target.value)}
                    className="w-full h-10 px-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-outline uppercase tracking-wider mb-1">What Participants Bring *</label>
                  <input
                    type="text"
                    placeholder="e.g. Water container, sturdy gloves"
                    value={whatToBring}
                    onChange={(e) => setWhatToBring(e.target.value)}
                    className="w-full h-10 px-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Cover presets */}
            <div>
              <label className="block text-[10px] font-extrabold text-outline uppercase mb-1.5">Event Banner Concept Theme Preset</label>
              <div className="grid grid-cols-4 gap-2">
                {mediaPresets.map((preset, idx) => (
                  <div
                    key={idx}
                    onClick={() => setCoverPreset(idx)}
                    className={`aspect-video rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                      coverPreset === idx ? 'border-primary scale-[1.03] shadow-xs' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={preset.url || undefined} alt={preset.name} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-outline text-right mt-1 font-semibold">Selected Theme: {mediaPresets[coverPreset].name}</p>
            </div>

            {/* Agreements Checklist - Enforces Accountability */}
            <div className="p-4 bg-tertiary-container/10 border border-outline-variant/20 rounded-2xl space-y-2.5">
              <p className="text-[10px] font-extrabold text-on-surface uppercase tracking-wider flex items-center gap-1">
                <FileCheck className="w-4 h-4 text-primary" /> Event Sponsor Accountability Checklist
              </p>
              
              <label className="flex items-start gap-2.5 text-xs text-on-surface-variant cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={agreedGuidelines} 
                  onChange={(e) => setAgreedGuidelines(e.target.checked)}
                  className="mt-0.5 rounded text-primary focus:ring-primary w-4 h-4 shrink-0" 
                />
                <span>I agree to <b>Community Guidelines</b> (Civil cooperation, zero commercial pitch, zero direct matchmaking).</span>
              </label>

              <label className="flex items-start gap-2.5 text-xs text-on-surface-variant cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={agreedSafety} 
                  onChange={(e) => setAgreedSafety(e.target.checked)}
                  className="mt-0.5 rounded text-primary focus:ring-primary w-4 h-4 shrink-0" 
                />
                <span>I agree to ToGather <b>Safety Rules</b> (GPS proximity verification, clear threat disclosures).</span>
              </label>

              <label className="flex items-start gap-2.5 text-xs text-on-surface-variant cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={agreedConduct} 
                  onChange={(e) => setAgreedConduct(e.target.checked)}
                  className="mt-0.5 rounded text-primary focus:ring-primary w-4 h-4 shrink-0" 
                />
                <span>I agree to ToGather <b>Event Conduct Policies</b> (True identity verification validation, transparent discussion environments).</span>
              </label>
            </div>

            {/* Action buttons */}
            <button
              type="submit"
              disabled={!agreedGuidelines || !agreedSafety || !agreedConduct}
              className="w-full h-13 bg-primary text-on-primary font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-primary/95 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm shadow-md cursor-pointer mt-4"
            >
              <Plus className="w-5 h-5" />
              Publish Live Adventure
            </button>

          </form>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-6 border border-outline-variant/20 shadow-2xs">
          <div className="flex items-center gap-3 mb-6">
            <span className="p-2.5 bg-primary/10 rounded-xl text-primary font-bold">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-black text-on-surface">Propose Regional Community Hub</h3>
              <p className="text-xs text-outline font-medium">Add a dedicated domain inside ToGather authorized list</p>
            </div>
          </div>

          <form onSubmit={handleProposeHub} className="space-y-5">
            {/* Recurrence Question */}
            <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/15">
              <label className="block text-[11px] font-extrabold text-on-surface uppercase tracking-wider mb-2">
                Will this community organize recurring gatherings? *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setIsRecurring(true)}
                  className={`py-2.5 text-xs font-bold rounded-xl border transition-all ${
                    isRecurring === true
                      ? 'bg-primary text-on-primary border-primary shadow-xs'
                      : 'bg-white text-on-surface border-outline-variant/40 hover:bg-surface-container'
                  }`}
                >
                  Yes, regularly
                </button>
                <button
                  type="button"
                  onClick={() => setIsRecurring(false)}
                  className={`py-2.5 text-xs font-bold rounded-xl border transition-all ${
                    isRecurring === false
                      ? 'bg-red-500 text-white border-red-500 shadow-xs'
                      : 'bg-white text-on-surface border-outline-variant/40 hover:bg-surface-container'
                  }`}
                >
                  No, just one event
                </button>
              </div>

              {/* Recommendation message if No is chosen */}
              {isRecurring === false && (
                <div className="mt-4 p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs animate-fadeIn">
                  <p className="font-extrabold flex items-center gap-1.5 mb-1 text-amber-950">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    Recommendation: Create an Event instead of a Hub
                  </p>
                  <p className="leading-relaxed mb-3 font-medium">
                    A Hub represents an ongoing community that organizes multiple gatherings over time. Individual gatherings should be managed as Events.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('event');
                      setIsRecurring(null);
                    }}
                    className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl transition-all cursor-pointer shadow-2xs"
                  >
                    Switch to Host Event Mode
                  </button>
                </div>
              )}
            </div>

            {/* Fields are disabled or hidden unless verified recurrence */}
            <div className={`space-y-4 transition-opacity duration-300 ${isRecurring === true ? 'opacity-100Pointer' : 'opacity-40 pointer-events-none'}`}>
              <div>
                <label className="block text-[10px] font-extrabold text-outline uppercase tracking-wider mb-1">Proposed Hub Name *</label>
                <input
                  type="text"
                  required={isRecurring === true}
                  placeholder="e.g. Bangalore Cycling Club, Eastside Yoga Collective"
                  value={hubName}
                  onChange={(e) => setHubName(e.target.value)}
                  className="w-full h-11 px-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs focus:ring-1 focus:ring-primary focus:outline-none placeholder:text-outline text-on-surface"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-outline uppercase tracking-wider mb-1">Select Domain Category *</label>
                <select
                  value={hubCategory}
                  onChange={(e) => setHubCategory(e.target.value)}
                  className="w-full h-11 px-2.5 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs text-on-surface"
                >
                  {HUB_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Optional Custom Category Field if "Others" is toggled */}
              {hubCategory === 'Others' && (
                <div className="animate-slideDown">
                  <label className="block text-[10px] font-extrabold text-outline uppercase tracking-wider mb-1">Enter Customized Category Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Amateur Astronomy, Board Game Guild"
                    value={customCategoryName}
                    onChange={(e) => setCustomCategoryName(e.target.value)}
                    className="w-full h-11 px-3 bg-white border border-outline-variant/50 rounded-xl text-xs focus:ring-1 focus:ring-primary focus:outline-none text-on-surface"
                  />
                </div>
              )}

              <div>
                <label className="block text-[10px] font-extrabold text-outline uppercase tracking-wider mb-1">Community Objectives & Description *</label>
                <textarea
                  rows={4}
                  required={isRecurring === true}
                  placeholder="Tell us what this community represents. Explain some of your expected upcoming recursive gatherings..."
                  value={hubDesc}
                  onChange={(e) => setHubDesc(e.target.value)}
                  className="w-full p-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs focus:ring-1 focus:ring-primary focus:outline-none placeholder:text-outline text-on-surface resize-none focus:bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={!hubName || !hubDesc || isRecurring !== true}
                className="w-full h-12 bg-primary text-on-primary font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-primary/95 disabled:opacity-45 h-12 transition-all text-xs cursor-pointer shadow-sm"
              >
                Propose Community Hub Unit
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Safety info summary footer element */}
      <div className="mt-6 p-4 bg-tertiary-container/10 border border-outline-variant/25 rounded-2xl flex gap-3">
        <Info className="w-5 h-5 text-tertiary shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-bold text-on-tertiary-container">Trust & Verification Policy</h4>
          <p className="text-[11px] text-on-tertiary-container/85 mt-1 leading-relaxed">
            All proposed hubs and published events go to regional Safety Councils for active monitoring. Unrelated dating, commercial pitches, or anonymous listings will be removed.
          </p>
        </div>
      </div>
    </div>
  );
}
