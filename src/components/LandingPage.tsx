/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { UserPlus, Sparkles, Globe, ShieldCheck } from 'lucide-react';

interface LandingPageProps {
  onSignUp: () => void;
  onLogIn: () => void;
  onStaffPortalAccess?: () => void;
}

export default function LandingPage({ onSignUp, onLogIn, onStaffPortalAccess }: LandingPageProps) {
  return (
    <div className="relative min-h-screen bg-surface overflow-hidden flex flex-col justify-between">
      {/* Decorative Orbs */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-container/20 rounded-full blur-3xl z-0" />
      <div className="absolute top-1/2 -left-32 w-80 h-80 bg-tertiary-container/20 rounded-full blur-3xl z-0" />

      {/* Top Header BRAND */}
      <header className="z-10 px-6 pt-6 flex justify-between items-center max-w-6xl mx-auto w-full">
        <span className="text-headline-md font-bold text-primary tracking-tight text-2xl">ToGather</span>
        <button
          onClick={onLogIn}
          className="text-label-md text-primary font-bold hover:underline transition-all cursor-pointer"
        >
          Log In
        </button>
      </header>

      {/* Hero Section Container */}
      <div className="z-10 flex-grow flex flex-col justify-center px-6 py-6 md:grid md:grid-cols-2 md:items-center md:gap-12 md:max-w-6xl md:mx-auto overflow-hidden">
        {/* Visual Showcase (Asymmetric layout) */}
        <motion.div 
          className="md:order-2 flex-shrink min-h-0"
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="relative w-full aspect-[4/3] overflow-hidden shadow-xl rounded-3xl transition-transform duration-500 hover:rotate-0 rotate-1">
            <img 
              alt="Diverse local community gardening together" 
              className="w-full h-full object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDkgxUW3J_pY2mRV_I1ItXFKEyRrViA0CMbT7xdgyRMimMkiH95wag-PN5H5_MIu-cKpdSJuiUs5ufx2cVPe-wP4e_6-kw38DbeH5sMNdWREG-SI4ox1hs_XPTbNowZuE9ld2SXTLq44aNF_0JdtdI6QvZc4X3KZfTQIdCSAG2tpEIpt7ke5hQRU-3dhqxe0rHjWZXmDLdUh6eVh3DModYxjMOePPjD6egR5DLUFhFAwFSWyN-X2EbBc_Cq0Ep4lfLmOOARuWrbXpU"
            />
            
            {/* Glassmorphic Badge */}
            <div className="absolute bottom-4 left-4 bg-white/75 backdrop-blur-md px-3 py-2 rounded-xl flex items-center gap-2 border border-white/40 shadow-lg">
              <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-white font-bold text-sm">
                ♥
              </div>
              <div>
                <p className="text-xs font-bold leading-tight text-on-surface">Join 2k+ locals</p>
                <p className="text-[10px] leading-tight text-on-surface-variant">Connecting for change</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Narrative Copy */}
        <motion.div 
          className="flex flex-col mt-6 md:mt-0 md:order-1 shrink-0"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1 className="text-4xl md:text-5xl font-extrabold text-on-surface tracking-tight leading-tight">
            Where connection <br />
            meets <span className="text-primary italic font-serif">purpose.</span>
          </h1>
          
          <p className="text-body-md text-on-surface-variant max-w-sm mt-3 leading-relaxed">
            ToGather is the community platform built to help you find your tribe, share updates, host events, and convert collective intent into real-world local impact.
          </p>

          {/* Core Values */}
          <div className="flex flex-wrap gap-2 mt-5">
            <span className="bg-tertiary-container/20 text-on-tertiary-container px-3 py-1 rounded-full text-label-sm font-medium flex items-center gap-1 border border-tertiary-container/30">
              <Globe className="w-3.5 h-3.5 text-tertiary" /> Local Hubs
            </span>
            <span className="bg-secondary-container/20 text-on-secondary-container px-3 py-1 rounded-full text-label-sm font-medium flex items-center gap-1 border border-secondary-container/30">
              <Sparkles className="w-3.5 h-3.5 text-secondary" /> Instant Impact
            </span>
            <span className="bg-primary-container/20 text-on-primary-container px-3 py-1 rounded-full text-label-sm font-medium flex items-center gap-1 border border-primary-container/30">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" /> Trusted Safety
            </span>
          </div>
        </motion.div>
      </div>

      {/* Landing CTA Footer */}
      <motion.div 
        className="z-10 px-6 max-w-6xl mx-auto w-full shrink-0 pb-12 mt-6 md:mt-0"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <div className="flex flex-col gap-4 md:max-w-sm">
          <button
            onClick={onSignUp}
            className="h-14 bg-primary text-on-primary rounded-xl flex items-center justify-center gap-3 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all duration-200 w-full group font-medium cursor-pointer"
          >
            <UserPlus className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            Join ToGather Today
          </button>
        </div>

        <p className="text-left text-label-sm text-on-surface-variant mt-4">
          Already part of a hub?{' '}
          <button onClick={onLogIn} className="text-primary font-bold hover:underline cursor-pointer">
            Log in
          </button>
        </p>

        {/* Brand Legal Disclaimers */}
        <p className="text-[10px] text-outline max-w-xs md:max-w-lg leading-relaxed mt-6 opacity-70">
          By signing up, you agree to our <span className="underline cursor-pointer hover:text-primary">Terms of Service</span> and{' '}
          <span className="underline cursor-pointer hover:text-primary">Privacy Policy</span>. We prioritize community safety and user-first privacy.
        </p>

        {/* Staff Portal entry trigger */}
        <div className="mt-8 pt-4 border-t border-outline-variant/10 flex justify-between items-center text-[10px] text-outline opacity-85">
          <span>ToGather © 2026. Neighborhood safety first architecture.</span>
          {onStaffPortalAccess && (
            <button 
              onClick={onStaffPortalAccess} 
              className="hover:text-primary transition-colors hover:underline cursor-pointer font-bold uppercase tracking-wider"
            >
              Staff Portal Access
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
