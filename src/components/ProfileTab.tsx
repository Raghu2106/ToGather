/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserProfile, Hub, EventEntity } from '../types';
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
  CalendarCheck
} from 'lucide-react';

interface ProfileTabProps {
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  joinedHubsCount: number;
  rsvpdEvents: EventEntity[];
  onCancelRSVP: (eventId: string) => void;
  onLogOut: () => void;
}

export default function ProfileTab({ 
  profile, 
  onUpdateProfile, 
  joinedHubsCount,
  rsvpdEvents,
  onCancelRSVP,
  onLogOut
}: ProfileTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(profile.name);
  const [bio, setBio] = useState(profile.bio);
  const [phone, setPhone] = useState(profile.phone);
  const [location, setLocation] = useState(profile.location);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      ...profile,
      name,
      bio,
      phone,
      location
    });
    setIsEditing(false);
    alert('Success: Your profile has been updated!');
  };

  return (
    <div className="pb-16 max-w-xl mx-auto">
      {/* Header Profile Summary */}
      <div className="bg-surface-container-lowest rounded-3xl p-6 border border-outline-variant/20 shadow-xs mb-6 relative">
        {!isEditing ? (
          <>
            <button 
              onClick={() => setIsEditing(true)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors text-primary cursor-pointer flex items-center gap-1 text-xs font-bold"
            >
              <Edit3 className="w-4 h-4" /> Edit
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-primary-container shadow-md mb-3">
                <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
              </div>
              <h3 className="text-xl font-bold text-on-surface">{profile.name}</h3>
              <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-1 justify-center">
                <MapPin className="w-3.5 h-3.5 text-primary" /> {profile.location}
              </p>
              <p className="text-xs text-on-surface-variant max-w-md mt-4 leading-relaxed italic">
                &quot;{profile.bio}&quot;
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-6 border-t border-outline-variant/10 pt-4 text-xs text-on-surface-variant shrink-0">
              <span className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-outline" /> {profile.email}
              </span>
              <span className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-outline" /> {profile.phone}
              </span>
            </div>
          </>
        ) : (
          <form onSubmit={handleSave} className="space-y-4">
            <h4 className="text-sm font-bold text-on-surface">Update Digital Tribe Profile</h4>
            
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-outline mb-1">Your Name</label>
              <input 
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-11 px-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-sm focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-outline mb-1">Community Bio</label>
              <textarea 
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full p-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs focus:ring-1 focus:ring-primary focus:outline-none resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-outline mb-1">Location Handle</label>
                <input 
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full h-11 px-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-outline mb-1">Phone Number</label>
                <input 
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-11 px-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                />
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

      {/* Stats Board (Bento elements) */}
      <h3 className="text-sm font-bold text-on-surface mb-3">Tribe Statistics</h3>
      <div className="grid grid-cols-3 gap-3 mb-6 select-none shrink-0">
        <div className="bg-surface-container-low rounded-2xl p-4 flex flex-col items-center justify-center text-center">
          <Users className="w-5 h-5 text-primary mb-1" />
          <span className="text-xl font-extrabold text-on-surface">{joinedHubsCount}</span>
          <span className="text-[10px] text-on-surface-variant font-medium mt-0.5">Joined Hubs</span>
        </div>

        <div className="bg-surface-container-low rounded-2xl p-4 flex flex-col items-center justify-center text-center">
          <CalendarCheck className="w-5 h-5 text-secondary mb-1" />
          <span className="text-xl font-extrabold text-on-surface">{rsvpdEvents.length}</span>
          <span className="text-[10px] text-on-surface-variant font-medium mt-0.5">Active RSVPs</span>
        </div>

        <div className="bg-surface-container-low rounded-2xl p-4 flex flex-col items-center justify-center text-center">
          <Award className="w-5 h-5 text-tertiary mb-1" />
          <span className="text-xl font-extrabold text-on-surface">360</span>
          <span className="text-[10px] text-on-surface-variant font-medium mt-0.5">Impact Pts</span>
        </div>
      </div>

      {/* RSVP Management List */}
      <h3 className="text-sm font-bold text-on-surface mb-3">Your Upcoming Gatherings</h3>
      {rsvpdEvents.length === 0 ? (
        <div className="p-8 text-center bg-surface-container-low rounded-2xl border border-dashed border-outline-variant/35 mb-6">
          <p className="text-on-surface-variant text-xs">No upcoming event reservations.</p>
          <p className="text-[11px] text-outline mt-1 font-medium">Head over to the Discover tab to register interest in local events!</p>
        </div>
      ) : (
        <div className="space-y-3 mb-6">
          {rsvpdEvents.map((evt) => (
            <div 
              key={evt.id}
              className="flex items-center gap-3 bg-surface-container-low p-3 rounded-2xl relative group hover:bg-surface-container transition-colors"
            >
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-neutral-100 shrink-0">
                <img src={evt.image} alt={evt.title} className="w-full h-full object-cover" />
              </div>
              <div className="flex-grow min-w-0 pr-12">
                <h4 className="font-bold text-xs text-on-surface truncate leading-tight">{evt.title}</h4>
                <p className="text-[10px] text-primary font-bold mt-0.5">{evt.date}</p>
                <p className="text-[10.5px] text-on-surface-variant truncate mt-0.5">{evt.location}</p>
              </div>
              <button 
                onClick={() => {
                  if (confirm(`Do you wish to cancel your interest in ${evt.title}?`)) {
                    onCancelRSVP(evt.id);
                  }
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-primary hover:underline cursor-pointer bg-white px-2.5 py-1.5 rounded-lg shadow-2xs hover:bg-primary hover:text-on-primary transition-all"
              >
                Withdraw
              </button>
            </div>
          ))}
        </div>
      )}

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
