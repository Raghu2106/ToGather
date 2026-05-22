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
  Heart, 
  Hand,
  CheckCircle,
  HelpCircle
} from 'lucide-react';

interface HostTabProps {
  onAddNewEvent: (newEvent: Omit<EventEntity, 'id' | 'attendees' | 'attendeesCount' | 'isAttending'>) => void;
  isLoggedIn: boolean;
  onShowAuthModal: () => void;
}

export default function HostTab({ onAddNewEvent, isLoggedIn, onShowAuthModal }: HostTabProps) {
  const [mode, setMode] = useState<'event' | 'hub'>('event');
  
  // Event state
  const [eventTitle, setEventTitle] = useState('');
  const [category, setCategory] = useState<'Trekking' | 'Volunteer' | 'Book Clubs' | 'Pet Meets'>('Volunteer');
  const [dateStr, setDateStr] = useState('');
  const [location, setLocation] = useState('');
  const [isFree, setIsFree] = useState(true);
  const [coverPreset, setCoverPreset] = useState(0);

  // Hub proposal state
  const [hubName, setHubName] = useState('');
  const [hubDesc, setHubDesc] = useState('');

  // Built-in presets for event background media
  const mediaPresets = [
    { name: 'People Gardening', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBeqMSBjU8mAV5NW7U_cfGG1AQUjZaaqD-yEBPDHexexRgV-N5PVbb6G8jLS4CJ_Ibg9v7LdT35i5YvjGeSH3Io_eDk-rBD8GCvxMt7GBBPCkMzltYslH-IlkPWw8ZASZ_uYLmchVnUFOQ2QdeBtUB3jWVXi1vRjTwIeTIK2Eck39SJC33A5uedcOc2YoUiSud8TothM-1w34XRx7luviHa0L-NWu5-nG2wmey4Ns1_gdghzWgRHL6kPc3TFHyvxKxSFJA1R97Qc54' },
    { name: 'Mountain Hikers', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDUXh1sr0accZwI88RomYh30AZvKt3nMIqAdOzcFi1p-YReVg3HYQISWLXI_DaC3gQruvRhyXkoRpi8qcThGW2fU2i3sPRv2JJd9gEZU_T91yhEi5STb9vGs_sd9IiC14fmqgeM5lTs2OkG1zyUP7S1syook29IQGgrx93e3V3cdw1Hy4KQrC3gnD3lFP0qGNd-pf1su1kAEijpvncecDcv4xRfY1fLZl3RpSgGrZvfj2UvKf3GBmTrS2jGXWYdpJIiJxTQOu9lWyw' },
    { name: 'Cozy Cafe', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD7uOPrrEuo4w_3910fHI0JONMeMUizD_7j3inf1cJY5P_qU0kzNpXTGHvX40h2XfAmGuJIBkJ0wvuvJvMmRZyTQEV9xw8bzqgr-u0VIi5Ga8At8vdkwVP8dbMzpn2U3DbEQGKCAe43S9ODZumjqGIJL6fKM2mqOZnfIImxsCOEpdnw4HG1jkmLQn39rVNsL17CvEURZEXXdzaZp0qQrhP15Hp-0aZcRagA3SQHv128jr6maAZUhM2hBU-lk1luYUyi1eg771YLtBI' },
    { name: 'Joyful Puppies', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuANk67WXfU-sGLlU2nzuctONupq4owWv9vSLQDMmy6hUfFaA3XXHBtfjbMSom9xpM3xvuLN1oV706GnzPzkbOzKFOuEJ2Xr5S2tx42Ay-b0zm7FoTAKGPgEpVRbnqH93FasaR8Mg9d__hXncKLYcNYGlElxXIWD1pk6Qk043Sr9Vj-C0S9PGtuc7f8H4Uco5S4S4GxCSLMuCzum9hbZ4QZh5s0eWB4ZGZLYhC3TRwy05mXkMOiSxy6kzWp5OdsB5b3l7IaGijGPg9k' }
  ];

  const handleHostEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      onShowAuthModal();
      return;
    }

    if (!eventTitle.trim() || !dateStr.trim() || !location.trim()) {
      alert('Kindly complete all fields to publish this local adventure!');
      return;
    }

    onAddNewEvent({
      title: eventTitle,
      category,
      image: mediaPresets[coverPreset].url,
      date: dateStr,
      location,
      isFree
    });

    // Reset fields
    setEventTitle('');
    setDateStr('');
    setLocation('');
    alert('Success: Your event is live! Check the Discover stream to see it posted.');
  };

  const handleProposeHub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      onShowAuthModal();
      return;
    }
    if (!hubName.trim()) return;
    alert(`Proposal Received: Thank you for suggesting "${hubName}". ToGather Community Safety checks will evaluate your request of interest and update you within 48 hours.`);
    setHubName('');
    setHubDesc('');
  };

  return (
    <div className="pb-16 max-w-xl mx-auto">
      {/* Upper Mode Select Segmented Tabs */}
      <div className="bg-surface-container p-1 rounded-2xl flex mb-6 shadow-2xs select-none">
        <button
          onClick={() => setMode('event')}
          className={`flex-1 py-3 text-center text-xs font-bold rounded-xl transition-all cursor-pointer ${
            mode === 'event' 
              ? 'bg-white text-on-surface shadow-xs' 
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          Host Local Event
        </button>
        <button
          onClick={() => setMode('hub')}
          className={`flex-1 py-3 text-center text-xs font-bold rounded-xl transition-all cursor-pointer ${
            mode === 'hub' 
              ? 'bg-white text-on-surface shadow-xs' 
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          Request Community Hub
        </button>
      </div>

      {mode === 'event' ? (
        <div className="bg-surface-container-lowest rounded-3xl p-6 border border-outline-variant/20 shadow-xs">
          <div className="flex items-center gap-3 mb-6">
            <span className="p-2.5 bg-primary/10 rounded-xl text-primary font-bold">
              <Tent className="w-6 h-6" />
            </span>
            <div>
              <h3 className="text-lg font-bold text-on-surface">Publish Local Adventure</h3>
              <p className="text-xs text-on-surface-variant">Your neighborhood gathers with positive intent</p>
            </div>
          </div>

          <form onSubmit={handleHostEventSubmit} className="space-y-4">
            
            {/* Title field */}
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">Adventure Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Sunset Ridge Trek, City Park Cleanup"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                className="w-full h-11 px-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-sm focus:ring-1 focus:ring-primary focus:outline-none placeholder:text-outline text-on-surface focus:bg-white"
              />
            </div>

            {/* Category and Price Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">Tribe Domain</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full h-11 px-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs focus:ring-1 focus:ring-primary text-on-surface focus:outline-none"
                >
                  <option value="Volunteer">Volunteer</option>
                  <option value="Trekking">Trekking</option>
                  <option value="Book Clubs">Book Clubs</option>
                  <option value="Pet Meets">Pet Meets</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">Access Tier</label>
                <select
                  value={isFree ? 'Free' : 'Paid'}
                  onChange={(e) => setIsFree(e.target.value === 'Free')}
                  className="w-full h-11 px-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs focus:ring-1 focus:ring-primary text-on-surface focus:outline-none"
                >
                  <option value="Free">Free Entrance</option>
                  <option value="Paid">Premium Only</option>
                </select>
              </div>
            </div>

            {/* Date & Location Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">Scheduled Date *</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Saturday, 10 AM"
                    value={dateStr}
                    onChange={(e) => setDateStr(e.target.value)}
                    className="w-full h-11 pl-9 pr-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs focus:ring-1 focus:ring-primary focus:outline-none placeholder:text-outline text-on-surface focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">Gathering Map Area *</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. South Park Entrance"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full h-11 pl-9 pr-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs focus:ring-1 focus:ring-primary focus:outline-none placeholder:text-outline text-on-surface focus:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Cover Presets picker */}
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1.5">Cover Image Theme Preset</label>
              <div className="grid grid-cols-4 gap-2">
                {mediaPresets.map((preset, idx) => (
                  <div
                    key={idx}
                    onClick={() => setCoverPreset(idx)}
                    className={`aspect-video rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                      coverPreset === idx ? 'border-primary scale-[1.03] shadow-xs' : 'border-transparent opacity-60 hover:opacity-90'
                    }`}
                  >
                    <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-on-surface-variant mt-1.5 text-right font-medium">Selected: {mediaPresets[coverPreset].name}</p>
            </div>

            {/* Launch button */}
            <button
              type="submit"
              className="mt-6 w-full h-13 bg-primary text-on-primary font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-primary/95 active:scale-95 transition-all text-sm shadow-md cursor-pointer mt-4"
            >
              <Plus className="w-5 h-5" />
              Publish Live Adventure
            </button>

          </form>
        </div>
      ) : (
        <div className="bg-surface-container-lowest rounded-3xl p-6 border border-outline-variant/20 shadow-xs">
          <div className="flex items-center gap-3 mb-6">
            <span className="p-2.5 bg-primary/10 rounded-xl text-primary font-bold">
              <Sparkles className="w-6 h-6" />
            </span>
            <div>
              <h3 className="text-lg font-bold text-on-surface">Propose Community Hub</h3>
              <p className="text-xs text-on-surface-variant">Request a brand new space inside ToGather</p>
            </div>
          </div>

          <form onSubmit={handleProposeHub} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">Proposed Hub Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Amateur Astronomers, Board Game Guild"
                value={hubName}
                onChange={(e) => setHubName(e.target.value)}
                className="w-full h-11 px-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-sm focus:ring-1 focus:ring-primary focus:outline-none placeholder:text-outline text-on-surface"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">Proposal Pitch & Mission</label>
              <textarea
                rows={4}
                placeholder="Give us a detailed summary of your target goals, estimated attendees count, and neighborhood location."
                value={hubDesc}
                onChange={(e) => setHubDesc(e.target.value)}
                className="w-full p-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs focus:ring-1 focus:ring-primary focus:outline-none placeholder:text-outline text-on-surface resize-none"
              />
            </div>

            <button
              type="submit"
              className="mt-4 w-full h-12 bg-primary text-on-primary font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-primary/95 active:scale-95 transition-all text-xs cursor-pointer"
            >
              Submit Hub Request
            </button>
          </form>
        </div>
      )}

      {/* Trust safety segment */}
      <div className="mt-6 p-4 bg-tertiary-container/10 border border-tertiary-container/30 rounded-2xl flex gap-3">
        <Award className="w-5 h-5 text-tertiary shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-bold text-on-tertiary-container">Community Restorations</h4>
          <p className="text-[11px] text-on-tertiary-container/85 mt-1 leading-relaxed">
            All posted events undergo automated proximity geolocation checks to foster safety and security across regional gathering areas.
          </p>
        </div>
      </div>
    </div>
  );
}
