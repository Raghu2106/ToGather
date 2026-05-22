/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { EventEntity } from '../types';
import { 
  Search, 
  MapPin, 
  ToggleLeft, 
  ToggleRight, 
  Gift, 
  Users, 
  Check, 
  Plus, 
  Award,
  Sparkles
} from 'lucide-react';

interface DiscoverTabProps {
  events: EventEntity[];
  impacts: EventEntity[];
  onToggleRSVP: (eventId: string) => void;
  onNavigateToHost: () => void;
  isLoggedIn: boolean;
  onShowAuthModal: () => void;
}

export default function DiscoverTab({ 
  events, 
  impacts, 
  onToggleRSVP, 
  onNavigateToHost,
  isLoggedIn,
  onShowAuthModal
}: DiscoverTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [nearbyOnly, setNearbyOnly] = useState(true);
  const [activeCategory, setActiveCategory] = useState<'All' | 'Trekking' | 'Volunteer' | 'Book Clubs' | 'Pet Meets'>('All');

  // Categories list
  const categoriesList = ['All', 'Trekking', 'Volunteer', 'Book Clubs', 'Pet Meets'] as const;

  // Handles filtering
  const filteredEvents = events.filter(e => {
    // Search match
    const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          e.location.toLowerCase().includes(searchQuery.toLowerCase());
    // Category match
    const matchesCategory = activeCategory === 'All' ? true : e.category === activeCategory;
    // Nearby filter simulator (Volunteer & Trekking are simulate nearby)
    const matchesNearby = nearbyOnly ? (e.category === 'Volunteer' || e.category === 'Trekking') : true;

    return matchesSearch && matchesCategory && matchesNearby;
  });

  return (
    <div className="pb-16">
      {/* Search Section */}
      <section className="mb-6">
        <div className="relative group">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-outline">
            <Search className="w-5 h-5" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for local adventures..."
            className="w-full h-14 pl-12 pr-4 bg-surface-container-low border-none rounded-xl text-body-md focus:ring-2 focus:ring-primary focus:bg-white text-on-surface focus:outline-none transition-all placeholder:text-outline-variant"
          />
        </div>

        {/* Happening Around and Nearby filter switch */}
        <div className="mt-3 flex items-center justify-between">
          <p className="text-xs font-bold text-on-surface-variant">Happening Around You</p>
          <button 
            onClick={() => setNearbyOnly(!nearbyOnly)}
            className="flex items-center gap-2 px-4 py-1.5 bg-surface-container-high hover:bg-surface-variant rounded-full text-xs font-bold text-on-surface transition-colors cursor-pointer"
          >
            <MapPin className="w-3.5 h-3.5 text-primary" />
            <span>Nearby</span>
            {nearbyOnly ? (
              <ToggleRight className="w-5 h-5 text-primary" />
            ) : (
              <ToggleLeft className="w-5 h-5 text-outline" />
            )}
          </button>
        </div>

        {/* Category Horizontal scroll pills */}
        <div className="mt-4 flex gap-2 overflow-x-auto hide-scrollbar pb-2 shrink-0">
          {categoriesList.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-none px-6 py-2 rounded-full font-semibold text-xs tracking-tight transition-all cursor-pointer ${
                activeCategory === cat
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'bg-tertiary-container/10 text-on-tertiary-container hover:bg-tertiary-container/20'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Recent Impact section (Carousel) */}
      <section className="mb-8">
        <div className="flex justify-between items-end mb-4">
          <h2 className="text-headline-md font-bold text-on-surface flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" /> Recent Impact
          </h2>
          <button 
            onClick={() => alert(`ToGather Success Stories represent over 4,500 hours of synchronized local community service inside urban neighborhood blocks.`)}
            className="text-xs font-bold text-primary hover:underline cursor-pointer"
          >
            Success Stories
          </button>
        </div>

        <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2 shrink-0">
          {impacts.map((imp) => (
            <div 
              key={imp.id} 
              className="flex-none w-72 bg-surface-container-low rounded-3xl overflow-hidden border border-surface-variant hover:shadow-md transition-shadow group relative"
            >
              <div className="h-40 overflow-hidden relative bg-neutral-100">
                <img 
                  src={imp.image} 
                  alt={imp.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute top-3 left-3 bg-tertiary text-on-tertiary px-3 py-1 rounded-full text-[9px] font-extrabold tracking-wider">
                  IMPACT
                </div>
              </div>
              <div className="p-4 flex justify-between items-center bg-white/40">
                <div>
                  <h4 className="font-bold text-sm text-on-surface">{imp.title}</h4>
                  <p className="text-xs text-tertiary font-bold mt-1">{imp.impactValue}</p>
                </div>
                <div className="w-8 h-8 rounded-full border border-outline-variant/30 flex items-center justify-center bg-secondary-container/20 text-on-secondary-container font-extrabold text-[10px]">
                  ✓
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recommended Highlight Section (Bento grid style) */}
      <section className="mb-8">
        <div className="flex justify-between items-end mb-4">
          <h2 className="text-xl md:text-2xl font-bold text-on-surface flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary animate-spin" style={{ animationDuration: '6s' }} />
            Recommended for You
          </h2>
          <button 
            onClick={() => setActiveCategory('All')} 
            className="text-xs font-bold text-primary hover:underline cursor-pointer"
          >
            See All
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Large Highlight Card (Sunset Ridge Trek) */}
          <div className="md:col-span-2 relative h-80 rounded-3xl overflow-hidden shadow-md group border border-outline-variant/20">
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDUXh1sr0accZwI88RomYh30AZvKt3nMIqAdOzcFi1p-YReVg3HYQISWLXI_DaC3gQruvRhyXkoRpi8qcThGW2fU2i3sPRv2JJd9gEZU_T91yhEi5STb9vGs_sd9IiC14fmqgeM5lTs2OkG1zyUP7S1syook29IQGgrx93e3V3cdw1Hy4KQrC3gnD3lFP0qGNd-pf1su1kAEijpvncecDcv4xRfY1fLZl3RpSgGrZvfj2UvKf3GBmTrS2jGXWYdpJIiJxTQOu9lWyw" 
              alt="Sunset mountain line trekking" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
            
            <div className="absolute bottom-0 left-0 p-6 text-white w-full">
              <div className="flex flex-wrap items-center gap-2 mb-2 shrink-0">
                <span className="px-3 py-1 bg-secondary text-white rounded-full text-[10px] font-bold">
                  TREKKING
                </span>
                <span className="text-xs opacity-90 font-medium">Oct 24 • 5:00 PM</span>
              </div>
              <h3 className="text-xl md:text-2xl font-bold tracking-tight">Sunset Ridge Trek</h3>
              <div className="flex items-center gap-1 mt-1 opacity-85 text-xs">
                <MapPin className="w-3.5 h-3.5 text-primary-container" />
                <span>Highland Peaks Trail</span>
              </div>
            </div>
          </div>

          {/* Secondary Mission Card (Community Roots) */}
          <div className="bg-tertiary-container/10 border border-outline-variant/30 rounded-3xl p-6 flex flex-col justify-between shadow-xs">
            <div>
              <div className="w-12 h-12 bg-tertiary rounded-2xl flex items-center justify-center mb-4 text-white font-bold">
                🌱
              </div>
              <h3 className="text-lg font-bold text-on-tertiary-container leading-snug">Community Roots</h3>
              <p className="text-xs text-on-tertiary-container/85 mt-2 leading-relaxed">
                Help us plant 50 new trees in the East District park this weekend. Toolkits and gloves supplied!
              </p>
            </div>
            <button 
              onClick={() => {
                if (!isLoggedIn) {
                  onShowAuthModal();
                  return;
                }
                alert('Success: Mission Joined! See you at East District park 🌱');
              }}
              className="mt-6 w-full py-3 bg-tertiary text-on-tertiary rounded-xl font-bold text-xs hover:bg-tertiary/90 active:scale-95 transition-all cursor-pointer"
            >
              Join Mission
            </button>
          </div>

        </div>
      </section>

      {/* Upcoming Events Grid */}
      <section>
        <h2 className="text-xl font-bold text-on-surface mb-4">Upcoming Events ({filteredEvents.length})</h2>
        {filteredEvents.length === 0 ? (
          <div className="p-8 text-center bg-surface-container-low rounded-3xl border border-outline-variant/35">
            <p className="text-on-surface-variant text-sm">No upcoming adventures currently fit this selection.</p>
            {(nearbyOnly || activeCategory !== 'All') && (
              <button 
                onClick={() => {
                  setNearbyOnly(false);
                  setActiveCategory('All');
                }}
                className="mt-2 text-primary font-bold text-xs hover:underline cursor-pointer"
              >
                Clear search filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredEvents.map((event) => (
              <div 
                key={event.id}
                className="bg-surface-container-lowest rounded-3xl overflow-hidden shadow-xs border border-surface-variant hover:shadow-md transition-shadow group flex flex-col justify-between"
              >
                {/* Visual Header */}
                <div className="h-44 overflow-hidden relative bg-neutral-100 shrink-0">
                  <img 
                    src={event.image} 
                    alt={event.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  {event.isFree && (
                    <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-xs px-3 py-1 rounded-full text-xs font-bold text-primary border border-outline-variant/20 shadow-xs">
                      FREE
                    </div>
                  )}
                </div>

                {/* Content body info */}
                <div className="p-5 flex-grow flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-primary font-bold text-xs uppercase tracking-wider">
                        {event.category}
                      </span>
                      <span className="text-on-surface-variant text-xs font-medium">
                        {event.date}
                      </span>
                    </div>

                    <h4 className="font-bold text-base text-on-surface mb-2 leading-snug group-hover:text-primary transition-colors">
                      {event.title}
                    </h4>

                    <div className="flex items-center text-on-surface-variant text-xs mb-4">
                      <MapPin className="w-3.5 h-3.5 text-outline mr-1 shrink-0" />
                      <span className="truncate">{event.location}</span>
                    </div>
                  </div>

                  {/* Foot action with avatars RSVP state */}
                  <div className="flex items-center justify-between pt-3 border-t border-outline-variant/15 mt-2">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2 shrink-0">
                        {event.attendees.map((att, idx) => (
                          <img 
                            key={idx}
                            src={att.avatar} 
                            alt={att.name} 
                            className="w-7 h-7 rounded-full border-2 border-white object-cover shadow-xs" 
                          />
                        ))}
                        <div className="w-7 h-7 rounded-full border-2 border-white bg-primary-fixed flex items-center justify-center text-[9px] font-extrabold text-on-primary-fixed-variant shadow-xs">
                          +{event.attendeesCount}
                        </div>
                      </div>
                      <span className="text-xs text-on-surface-variant font-medium">Attending</span>
                    </div>

                    <button 
                      onClick={() => {
                        if (!isLoggedIn) {
                          onShowAuthModal();
                          return;
                        }
                        onToggleRSVP(event.id);
                      }}
                      className={`h-9 px-4 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                        event.isAttending 
                          ? 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest border border-outline-variant/35'
                          : 'bg-primary text-on-primary hover:bg-primary/95 shadow-sm'
                      }`}
                    >
                      {event.isAttending ? (
                        <>
                          <Check className="w-4 h-4 text-tertiary" /> Registered
                        </>
                      ) : (
                        <>
                          Interested
                        </>
                      )}
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </section>

      {/* FAB mapping to Host Event tab directly */}
      <button 
        onClick={onNavigateToHost}
        className="fixed bottom-24 right-6 w-14 h-14 bg-primary text-on-primary rounded-2xl shadow-xl flex items-center justify-center active:scale-95 transition-transform z-40 cursor-pointer shadow-primary/20 hover:scale-105"
      >
        <Plus className="w-6 h-6 animate-pulse" />
      </button>
    </div>
  );
}
