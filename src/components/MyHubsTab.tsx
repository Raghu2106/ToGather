/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Hub } from '../types';
import { 
  Search, 
  Bike, 
  Car, 
  Palette, 
  Flame, 
  Utensils, 
  Coffee, 
  Plus, 
  Compass, 
  Check, 
  ArrowRight,
  TrendingUp,
  UserPlus
} from 'lucide-react';

interface MyHubsTabProps {
  hubs: Hub[];
  onToggleJoin: (hubId: string) => void;
  onNavigateToDiscover: () => void;
  onShowAuthModal: () => void;
  isLoggedIn: boolean;
}

export default function MyHubsTab({ 
  hubs, 
  onToggleJoin, 
  onNavigateToDiscover, 
  onShowAuthModal,
  isLoggedIn 
}: MyHubsTabProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Icon mapper helper
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Bike': return <Bike className="w-6 h-6" />;
      case 'Car': return <Car className="w-6 h-6" />;
      case 'Palette': return <Palette className="w-6 h-6" />;
      case 'Flame': return <Flame className="w-6 h-6 text-primary" />;
      case 'Utensils': return <Utensils className="w-6 h-6" />;
      case 'Coffee': return <Coffee className="w-6 h-6" />;
      default: return <Compass className="w-6 h-6" />;
    }
  };

  // Split hubs into featured and joined
  // Featured list
  const featuredHubs = hubs.filter(h => h.id === 'hub-1' || h.id === 'hub-2' || h.id === 'hub-3');
  // Joined list
  const joinedHubs = hubs.filter(h => h.isJoined);

  // Search filtered
  const filteredHubs = hubs.filter(h => 
    h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.tag.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="pb-8">
      {/* Upper Invite Banner if not logged in */}
      {!isLoggedIn && (
        <div className="mb-6">
          <button 
            onClick={onShowAuthModal}
            className="w-full h-14 bg-primary text-on-primary rounded-xl flex items-center justify-center gap-3 shadow-md hover:scale-[1.01] transition-all cursor-pointer font-medium"
          >
            <UserPlus className="w-5 h-5" />
            <span>Sign up with Phone or Email</span>
          </button>
        </div>
      )}

      {/* Modern High Contrast Search Bar */}
      <div className="relative group mb-6">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors">
          <Search className="w-5 h-5 text-outline" />
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Find your tribe..."
          className="w-full bg-surface-container-low border-none rounded-2xl py-4 pl-12 pr-4 text-body-md focus:ring-2 focus:ring-primary transition-all placeholder:text-outline/70 focus:outline-none focus:bg-white shadow-xs text-on-surface"
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

      {/* Render Filtered Results if searching */}
      {searchQuery ? (
        <div className="mb-6">
          <h3 className="text-lg font-bold text-on-surface mb-3">Search Results ({filteredHubs.length})</h3>
          {filteredHubs.length === 0 ? (
            <div className="p-8 text-center bg-surface-container-low rounded-2xl">
              <p className="text-on-surface-variant text-sm">No communities match &quot;{searchQuery}&quot;</p>
              <button 
                onClick={onNavigateToDiscover}
                className="mt-3 text-primary font-bold text-sm hover:underline cursor-pointer"
              >
                Browse upcoming events instead
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredHubs.map(hub => (
                <div 
                  key={hub.id} 
                  className="flex items-center gap-4 bg-surface-container-low p-4 rounded-2xl hover:bg-surface-container transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 overflow-hidden flex items-center justify-center text-primary font-bold shadow-xs shrink-0">
                    {hub.image ? (
                      <img src={hub.image} alt={hub.name} className="w-full h-full object-cover" />
                    ) : (
                      getIcon(hub.icon)
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h5 className="text-on-surface font-semibold text-sm truncate">{hub.name}</h5>
                      <span className="text-[10px] text-tertiary bg-tertiary-container/20 px-2 py-0.5 rounded-full font-medium shrink-0">
                        {hub.tag}
                      </span>
                    </div>
                    <p className="text-on-surface-variant text-xs truncate mt-0.5">{hub.members} members • {hub.latestUpdate}</p>
                  </div>
                  <button
                    onClick={() => onToggleJoin(hub.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      hub.isJoined 
                        ? 'bg-surface-container-high text-on-surface' 
                        : 'bg-primary text-on-primary hover:bg-primary/90'
                    }`}
                  >
                    {hub.isJoined ? 'Joined' : 'Join'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Featured Groups Section */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-headline-md font-bold text-on-surface">Featured Groups</h3>
              <button 
                onClick={onNavigateToDiscover}
                className="text-primary font-semibold text-label-md hover:underline cursor-pointer"
              >
                View all
              </button>
            </div>

            {/* Asymmetric grid layout */}
            <div className="grid grid-cols-2 gap-4">
              
              {/* Large Featured Card (City Bike Riders) */}
              {featuredHubs.find(h => h.id === 'hub-1') && (
                (() => {
                  const rider = featuredHubs.find(h => h.id === 'hub-1')!;
                  return (
                    <div 
                      key={rider.id}
                      onClick={() => onToggleJoin(rider.id)}
                      className="col-span-2 relative h-64 rounded-3xl overflow-hidden shadow-md group cursor-pointer active:scale-[0.99] transition-transform"
                    >
                      <img 
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                        src={rider.image} 
                        alt="City cyclists in sun-drenched park" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                      
                      <div className="absolute bottom-0 p-6 w-full text-white">
                        <div className="flex justify-between items-end">
                          <div>
                            <span className="text-[10px] uppercase font-bold tracking-wider bg-primary px-2.5 py-1 rounded-full mb-2 inline-block">
                              Featured Hub
                            </span>
                            <h4 className="text-xl md:text-2xl font-bold tracking-tight mb-1">{rider.name}</h4>
                            <div className="flex items-center gap-3">
                              <span className="flex items-center gap-1 text-white/90 text-xs">
                                👥 {rider.members >= 1000 ? `${(rider.members/1000).toFixed(1)}k` : rider.members} members
                              </span>
                              <span className="w-1.5 h-1.5 bg-white/40 rounded-full" />
                              <span className="text-tertiary-fixed text-xs font-semibold">Active now</span>
                            </div>
                          </div>
                          
                          <button className="bg-white/20 backdrop-blur-md text-white p-3 rounded-full border border-white/30 hover:bg-white/40 transition-all shrink-0">
                            {rider.isJoined ? (
                              <Check className="w-5 h-5 text-tertiary-fixed" />
                            ) : (
                              <ArrowRight className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })()
              )}

              {/* Small Card 1 (Vintage Car Lovers) */}
              {featuredHubs.find(h => h.id === 'hub-2') && (
                (() => {
                  const cars = featuredHubs.find(h => h.id === 'hub-2')!;
                  return (
                    <div 
                      onClick={() => onToggleJoin(cars.id)}
                      className="col-span-1 bg-surface-container-highest rounded-3xl p-5 shadow-xs border border-outline-variant/20 flex flex-col justify-between h-48 group cursor-pointer hover:shadow-md transition-all active:scale-[0.98]"
                    >
                      <div>
                        <div className="w-12 h-12 bg-secondary-container text-on-secondary-container rounded-2xl flex items-center justify-center mb-3">
                          {getIcon(cars.icon)}
                        </div>
                        <h4 className="text-on-surface font-bold text-sm leading-tight">{cars.name}</h4>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-on-surface-variant text-xs">{cars.members} members</span>
                        {cars.isJoined ? (
                          <span className="text-primary text-[10px] font-bold bg-primary/10 px-2 py-0.5 rounded-full">Joined</span>
                        ) : (
                          <span className="text-secondary flex items-center group-hover:translate-x-1 transition-transform">
                            <TrendingUp className="w-5 h-5" />
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })()
              )}

              {/* Small Card 2 (Urban Sketchers) */}
              {featuredHubs.find(h => h.id === 'hub-3') && (
                (() => {
                  const sketch = featuredHubs.find(h => h.id === 'hub-3')!;
                  return (
                    <div 
                      onClick={() => onToggleJoin(sketch.id)}
                      className="col-span-1 bg-tertiary-container/10 border border-tertiary-container/20 rounded-3xl p-5 shadow-xs flex flex-col justify-between h-48 group cursor-pointer hover:shadow-md transition-all active:scale-[0.98]"
                    >
                      <div>
                        <div className="w-12 h-12 bg-tertiary-container text-on-tertiary-container rounded-2xl flex items-center justify-center mb-3">
                          {getIcon(sketch.icon)}
                        </div>
                        <h4 className="text-on-surface font-bold text-sm leading-tight">{sketch.name}</h4>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-on-surface-variant text-xs">{sketch.members} members</span>
                        {sketch.isJoined ? (
                          <span className="text-tertiary text-[10px] font-bold bg-tertiary/10 px-2 py-0.5 rounded-full">Joined</span>
                        ) : (
                          <div className="flex -space-x-1.5 shrink-0">
                            <div className="w-6 h-6 rounded-full border border-surface bg-sky-200" />
                            <div className="w-6 h-6 rounded-full border border-surface bg-amber-200" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()
              )}

            </div>
          </section>

          {/* Joined communities Section */}
          <section className="mb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-headline-md font-bold text-on-surface">My Hubs</h3>
              <span className="bg-primary-fixed text-on-primary-fixed-variant px-3 py-1 rounded-full text-xs font-bold leading-none">
                {joinedHubs.length} Joined
              </span>
            </div>

            {joinedHubs.length === 0 ? (
              <div className="p-8 text-center bg-surface-container-low rounded-2xl border border-dashed border-outline-variant">
                <p className="text-on-surface-variant text-sm">You haven&apos;t joined any communities yet.</p>
                <p className="text-xs text-outline mt-1 mb-4">Join communities to see personalized updates here.</p>
                <button 
                  onClick={() => onToggleJoin('hub-1')}
                  className="bg-primary hover:bg-primary/95 text-on-primary text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 mx-auto cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Join City Bike Riders
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {joinedHubs.map(hub => {
                  // Special logic for Tech & Coffee messages badge
                  const hasMessagesBadge = hub.id === 'hub-6';
                  
                  return (
                    <div 
                      key={hub.id}
                      className="flex items-center gap-4 bg-surface-container-low p-4 rounded-2xl hover:bg-surface-container-high transition-all cursor-pointer group"
                    >
                      {/* Image Thumbnail */}
                      <div className="w-14 h-14 rounded-xl overflow-hidden shadow-xs shrink-0 bg-primary/5 flex items-center justify-center">
                        {hub.image ? (
                          <img className="w-full h-full object-cover" src={hub.image} alt={hub.name} />
                        ) : (
                          <div className="w-14 h-14 bg-secondary-container/10 flex items-center justify-center text-secondary shrink-0">
                            {getIcon(hub.icon)}
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h5 className="text-on-surface font-semibold text-sm truncate group-hover:text-primary transition-colors">
                          {hub.name}
                        </h5>
                        <p className="text-on-surface-variant text-xs truncate mt-1">
                          {hub.latestUpdate}
                        </p>
                      </div>

                      {/* Indicators and time badge */}
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        {hub.id === 'hub-4' && (
                          <span className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse" />
                        )}
                        {hasMessagesBadge && (
                          <div className="bg-primary text-on-primary w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shadow-xs">
                            12
                          </div>
                        )}
                        <span className="text-outline text-[10px] uppercase font-bold tracking-tight">
                          {hub.latestTime}
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
    </div>
  );
}
