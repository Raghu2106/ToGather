import { Hub, FeedPost, EventEntity, UserProfile } from './types';

export const APPROVED_CATEGORIES = [
  'Volunteering & Social Causes',
  'Environment & Sustainability',
  'Cycling',
  'Motorcycling',
  'Running & Walking',
  'Trekking & Outdoors',
  'Fitness & Wellness',
  'Yoga & Meditation',
  'Reading & Literature',
  'Technology & Programming',
  'Photography & Videography',
  'Arts & Creativity',
  'Food & Cooking',
  'Pets & Animal Welfare',
  'Entrepreneurship & Startups',
  'Education & Learning',
  'Community Development',
  'Travel & Exploration',
  'Others'
];

export const HUB_CATEGORIES = [
  'Volunteering & Social Causes',
  'Environment & Sustainability',
  'Cycling',
  'Motorcycling',
  'Running & Walking',
  'Trekking & Outdoors',
  'Fitness & Wellness',
  'Yoga & Meditation',
  'Reading & Literature',
  'Technology & Programming',
  'Photography & Videography',
  'Arts & Creativity',
  'Food & Cooking',
  'Pets & Animal Welfare',
  'Entrepreneurship & Startups',
  'Education & Learning',
  'Community Development',
  'Travel & Exploration',
  'Others'
];

export const INITIAL_HUBS: Hub[] = [
  {
    id: 'hub-1',
    name: 'Green Earth Volunteers',
    members: 420,
    activeMembers: 195,
    eventsThisMonth: 6,
    attendanceRate: 94,
    verifiedEventsCount: 22,
    rating: 4.9,
    healthScore: 98,
    healthLevel: 'Excellent',
    activeNow: true,
    image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&auto=format&fit=crop&q=60',
    icon: 'Leaf',
    bgColor: 'bg-emerald-50 text-emerald-900 border-emerald-100',
    latestUpdate: 'Active community organizing weekly eco interventions, cleanup logs, and forest preservation.',
    latestTime: '10m ago',
    isJoined: true,
    tag: '#Environment',
    category: 'Environment & Sustainability',
    description: 'A vibrant, long-term volunteer collective dedicated to urban forestry, local beach cleanup drives, and municipal eco auditing. We gather recursively every weekend to drive real environmental impact.',
    lastEventDate: 'May 16th, 2026',
    gallery: [
      'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1618477388954-7852f32655ec?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=600&auto=format&fit=crop&q=80'
    ],
    resources: [
      'Elmwood Plantation Guidelines v2.pdf',
      'Safety and Hydration Protocols.pdf',
      'Local Plant Native Species Catalog'
    ],
    announcements: [
      {
        id: 'ann-1',
        senderName: 'David Atten',
        senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        senderVerification: 'Trusted Organizer',
        content: '🚨 Saturday Beach Cleanup location shifted 100m North of the Main Gate due to high tide alerts. Meet at the Lifeguard Tower.',
        timestamp: '30 mins ago',
        pinned: true
      },
      {
        id: 'ann-2',
        senderName: 'David Atten',
        senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        senderVerification: 'Trusted Organizer',
        content: 'Trash picker sticks and double-layer bags will be supplied. Make sure to wear thick boots!',
        timestamp: '1 day ago'
      }
    ],
    discussionMessages: [
      {
        id: 'dm-1',
        senderName: 'Marcus Chen',
        senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        senderVerification: 'Member',
        content: 'Hi David! Will there be parking space close to the lifeguard tower?',
        timestamp: '15 mins ago'
      },
      {
        id: 'dm-2',
        senderName: 'David Atten',
        senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        senderVerification: 'Trusted Organizer',
        content: 'Yes Marcus, the North Lot has 50 free spaces on weekends.',
        timestamp: '10 mins ago'
      }
    ]
  },
  {
    id: 'hub-2',
    name: 'City Bike Riders',
    members: 1200,
    activeMembers: 540,
    eventsThisMonth: 12,
    attendanceRate: 88,
    verifiedEventsCount: 45,
    rating: 4.7,
    healthScore: 92,
    healthLevel: 'Excellent',
    activeNow: true,
    image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=600&auto=format&fit=crop&q=60',
    icon: 'Bike',
    bgColor: 'bg-sky-50 text-sky-900 border-sky-100',
    latestUpdate: 'Trail riders and gravel cruisers sharing routes, endurance schedules, and coffee meets.',
    latestTime: '45m ago',
    isJoined: false,
    tag: '#Cycling',
    category: 'Cycling',
    description: 'A long-term, welcoming bicyclist tribe. We conduct weekly morning runs, cross-country trails, safety training, and social coffee runs for amateur and pro riders.',
    lastEventDate: 'May 20th, 2026',
    gallery: [
      'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1541614101331-1a5a3a194e92?w=600&auto=format&fit=crop&q=80'
    ],
    resources: [
      'Valley Trail GPX Route Map.gpx',
      'Biking Group Formation Form.pdf'
    ],
    announcements: [
      {
        id: 'ann-bike-1',
        senderName: 'Sarah Jenkins',
        senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        senderVerification: 'Trusted Organizer',
        content: '🌟 Sunday Route features a steep gravel section. Check your tire pressure and bring spare tubes!',
        timestamp: '2 hours ago',
        pinned: true
      }
    ],
    discussionMessages: [
      {
        id: 'dm-bike-1',
        senderName: 'Tom Ryder',
        senderAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        senderVerification: 'Identity Verified',
        content: 'Are gravel bikes suited or do we absolutely need a mountain bike?',
        timestamp: '1 hour ago'
      },
      {
        id: 'dm-bike-2',
        senderName: 'Sarah Jenkins',
        senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        senderVerification: 'Trusted Organizer',
        content: 'Gravel bikes with 38mm+ tires will do great! Anything narrower might skid.',
        timestamp: '45 mins ago'
      }
    ]
  },
  {
    id: 'hub-3',
    name: 'Smart Kids Tutors',
    members: 145,
    activeMembers: 82,
    eventsThisMonth: 4,
    attendanceRate: 96,
    verifiedEventsCount: 9,
    rating: 4.8,
    healthScore: 85,
    healthLevel: 'Active',
    activeNow: false,
    image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&auto=format&fit=crop&q=60',
    icon: 'GraduationCap',
    bgColor: 'bg-amber-50 text-amber-900 border-amber-100',
    latestUpdate: 'Academic supporters conducting recurring classes, quizzes, and distribution sessions.',
    latestTime: '2h ago',
    isJoined: false,
    tag: '#Education',
    category: 'Education & Learning',
    description: 'An ongoing group of compassionate tutors. We teach primary school subjects and mathematical concepts to children from vulnerable neighborhoods on a recurring basis.',
    lastEventDate: 'May 18th, 2026',
    gallery: [
      'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&auto=format&fit=crop&q=80'
    ],
    resources: [
      'Elementary Math Tutor Guidepack.pdf',
      'Behavioral Management Tips.docx'
    ],
    announcements: [
      {
        id: 'ann-ed-1',
        senderName: 'Elena Rossi',
        senderAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
        senderVerification: 'Identity Verified',
        content: 'Primary school tutoring schedules are now synced to Google Meet backups in case of rain.',
        timestamp: 'Yesterday'
      }
    ],
    discussionMessages: []
  },
  {
    id: 'hub-4',
    name: 'Sunrise Yoga Collective',
    members: 310,
    activeMembers: 190,
    eventsThisMonth: 8,
    attendanceRate: 91,
    verifiedEventsCount: 16,
    rating: 4.6,
    healthScore: 89,
    healthLevel: 'Active',
    activeNow: true,
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&auto=format&fit=crop&q=60',
    icon: 'Activity',
    bgColor: 'bg-purple-50 text-purple-900 border-purple-100',
    latestUpdate: 'Vinyasa practitioners and yoga advocates gather weekly in municipal greenery.',
    latestTime: '12m ago',
    isJoined: true,
    tag: '#Wellness',
    category: 'Yoga & Meditation',
    description: 'Our persistent yoga wellness sanctuary. We organize weekly outdoor morning flows, breathing exercises, mindfulness activities, and wellness chats.',
    lastEventDate: 'May 19th, 2026',
    gallery: [
      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&auto=format&fit=crop&q=80'
    ],
    resources: [
      'Pranayama Breathing Sequences.pdf'
    ],
    announcements: [],
    discussionMessages: []
  },
  {
    id: 'hub-5',
    name: 'Paws & Whiskers Rescue',
    members: 240,
    activeMembers: 110,
    eventsThisMonth: 3,
    attendanceRate: 95,
    verifiedEventsCount: 12,
    rating: 4.9,
    healthScore: 94,
    healthLevel: 'Active',
    activeNow: false,
    image: 'https://images.unsplash.com/photo-1489632664607-3477b8ec0d61?w=600&auto=format&fit=crop&q=60',
    icon: 'Heart',
    bgColor: 'bg-red-50 text-red-900 border-red-100',
    latestUpdate: 'Dog walkers and cat adopt organizers managing recurring animal aid and trails walks.',
    latestTime: '3h ago',
    isJoined: false,
    tag: '#AnimalWelfare',
    category: 'Pets & Animal Welfare',
    description: 'An enduring animal care network. We organize recurring volunteer days for shelter exercise walks, foster parent training, and local rescue adoption drives.',
    lastEventDate: 'May 16th, 2026',
    gallery: [
      'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&auto=format&fit=crop&q=80'
    ],
    resources: [
      'Foster Parent Manual.pdf',
      'Shelter Medication Chart.xlsx'
    ],
    announcements: [],
    discussionMessages: []
  }
];

export const INITIAL_POSTS: FeedPost[] = [
  {
    id: 'post-1',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    author: 'David Atten',
    authorVerification: 'Trusted Organizer',
    subtext: 'Completed Event • May 16th, 2026',
    image: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=600&auto=format&fit=crop&q=80',
    text: "So proud of our volunteering group! We spent 4 hours removing plastic wrappers, micro-plastics, and ghost nets from the northern coastal lines. This outcome-focused action cleared ecosystems for local marine biology. Sincere thanks to everyone who came!",
    tags: ['#Environment', '#CleanOcean', '#Sustainability'],
    appreciates: 38,
    inspirations: 42,
    participated: 24,
    commentsCount: 9,
    isBookmarked: false,
    type: 'event_recap',
    eventName: 'Coastal Bay Plastic Cleanup',
    eventId: 'event-1',
    hubName: 'Eco-Restoration Coalition',
    hubId: 'hub-1',
    hostName: 'David Atten',
    completionDate: 'May 16th, 2026',
    participantCount: 42,
    attendanceRate: 88,
    volunteerHours: 168,
    wasteCollectedKg: 310,
    impactMetrics: {
      participantsInvolved: 42,
      volunteerHours: 168,
      wasteCollectedKg: 310,
      generalMetric: "310kg waste collected"
    }
  },
  {
    id: 'post-2',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    author: 'Sarah Jenkins',
    authorVerification: 'Trusted Organizer',
    subtext: 'Hub Milestone • May 20th, 2026',
    image: 'https://images.unsplash.com/photo-1541614101331-1a5a3a194e92?w=600&auto=format&fit=crop&q=80',
    text: "Milestone achieved! Our community has officially completed 50 successful group gathers on roads and bike trails, clocking over 2,250 collective kilometers clean of safety incidents! We build true recurring community connections rather than virtual popularity.",
    tags: ['#Cycling', '#Milestone', '#ActiveTribe'],
    appreciates: 54,
    inspirations: 70,
    participated: 15,
    commentsCount: 6,
    isBookmarked: true,
    type: 'hub_milestone',
    eventName: '50 Recurring Gathers Milestones',
    hubName: 'Bangalore Cyclists Hub',
    hubId: 'hub-2',
    hostName: 'Sarah Jenkins',
    completionDate: 'May 20th, 2026',
    participantCount: 2400,
    attendanceRate: 92,
    volunteerHours: 7200,
    impactMetrics: {
      participantsInvolved: 2400,
      volunteerHours: 7200,
      generalMetric: "50 events completed"
    }
  },
  {
    id: 'post-3',
    avatar: 'https://images.unsplash.com/photo-1544256718-3bcf237f3974?w=150&auto=format&fit=crop&q=80',
    author: 'Elena Rossi',
    authorVerification: 'Identity Verified',
    subtext: 'Public Thank You Note • May 15th, 2026',
    image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&auto=format&fit=crop&q=80',
    text: "A heartfelt thank you to all student tutors who planned math homework sheets and interactive algebra puzzles for youngsters from underprivileged centers last week. Seeing children master new geometry logic was the ultimate outcome!",
    tags: ['#Education', '#Learning', '#YouthAid'],
    appreciates: 32,
    inspirations: 12,
    participated: 22,
    commentsCount: 3,
    isBookmarked: false,
    type: 'thank_you_note',
    eventName: 'Algebra and Logic Tutoring Drive',
    eventId: 'event-2',
    hubName: 'Education Guild',
    hubId: 'hub-3',
    hostName: 'Elena Rossi',
    completionDate: 'May 15th, 2026',
    participantCount: 10,
    attendanceRate: 100,
    volunteerHours: 30,
    impactMetrics: {
      participantsInvolved: 10,
      volunteerHours: 30,
      generalMetric: "10 children tutored"
    }
  },
  {
    id: 'post-4',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    author: 'Rescue Admin',
    authorVerification: 'Trusted Organizer',
    subtext: 'Event Outcome Report • May 16th, 2026',
    image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&auto=format&fit=crop&q=80',
    text: "Our municipal pet welfare day was completely successful! We walked 12 shelter dogs on forest loops. Multiple animal socialization goals completed, and 2 foster matching interviews scheduled successfully! Helping those with no voice.",
    tags: ['#Pets', '#AnimalWelfare', '#SocialRescue'],
    appreciates: 44,
    inspirations: 39,
    participated: 12,
    commentsCount: 5,
    isBookmarked: false,
    type: 'outcome_report',
    eventName: 'Shelter Dog Walk Social',
    eventId: 'event-4',
    hubName: 'Paws & Whiskers Rescue',
    hubId: 'hub-5',
    hostName: 'Paws Rescue Admin',
    completionDate: 'May 16th, 2026',
    participantCount: 12,
    attendanceRate: 100,
    volunteerHours: 36,
    impactMetrics: {
      participantsInvolved: 12,
      volunteerHours: 36,
      generalMetric: "12 shelter dogs walked"
    }
  }
];

export const INITIAL_EVENTS: EventEntity[] = [
  {
    id: 'event-1',
    hubId: 'hub-1',
    title: 'Beach Pollution Cleanup',
    description: 'Help us clean the northern coastal lines from micro-plastics, abandoned fishing nets, and trash. Bags, gloves, and pickers will be distributed.',
    category: 'Environment & Sustainability',
    image: 'https://images.unsplash.com/photo-1618477388954-7852f32655ec?w=600&auto=format&fit=crop&q=80',
    date: 'Tomorrow, May 24th',
    time: '9:00 AM - 1:00 PM',
    location: 'Lifeguard Tower #4, North Beach Lot',
    isFree: true,
    organizerName: 'David Atten',
    organizerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    organizerVerification: 'Trusted Organizer',
    organizerPastEvents: 24,
    capacity: 50,
    safetyNotes: 'Wear tough, thick-soled shoes to guard against glass. Stay near designated safety perimeters. Emergency kit on site.',
    materialsRequired: 'Stops & bags provided.',
    whatToBring: 'Thick boots, water canteen, hat, sun-block.',
    accessMode: 'Open',
    participationLevel: 'Confirmed',
    attendeesCount: 28,
    attendees: [
      { avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80', name: 'John Doe', participationLevel: 'Confirmed' },
      { avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80', name: 'Sara Miller', participationLevel: 'Committed' },
      { avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', name: 'Marcus Chen', participationLevel: 'Confirmed' }
    ],
    isAttending: true,
    announcements: [
      {
        id: 'ann-ev-1',
        senderName: 'David Atten',
        senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        senderVerification: 'Trusted Organizer',
        content: '⚠️ Urgent: High tide predicted at 1 PM. We will finalize pick-up and weigh bags by 12:45 to stay absolutely safe.',
        timestamp: '1 hour ago',
        pinned: true
      }
    ],
    discussion: [
      {
        id: 'ev-d-1',
        senderName: 'Sara Miller',
        senderAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80',
        senderVerification: 'Member',
        content: 'Will we separate plastics and organic driftwoods?',
        timestamp: '2 hours ago'
      },
      {
        id: 'ev-d-2',
        senderName: 'David Atten',
        senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        senderVerification: 'Trusted Organizer',
        content: 'Only collect plastics, aluminum cans, glass, and cordages. Wood drift stays as part of natural coastal biology.',
        timestamp: '1.5 hours ago'
      }
    ],
    photos: [
      'https://images.unsplash.com/photo-1618477388954-7852f32655ec?w=600&auto=format&fit=crop&q=80'
    ]
  },
  {
    id: 'event-2',
    hubId: 'hub-3',
    title: 'Algebra and Logic Tutoring',
    description: 'A focused teaching workshop for children from local underprivileged community centers. We will map modules, play interactive math puzzles, and guide homework sheets.',
    category: 'Education & Learning',
    image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&auto=format&fit=crop&q=80',
    date: 'Saturday, May 30th',
    time: '2:00 PM - 5:00 PM',
    location: 'Community Center room 204, Eastside Avenue',
    isFree: true,
    organizerName: 'Elena Rossi',
    organizerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    organizerVerification: 'Identity Verified',
    organizerPastEvents: 8,
    capacity: 10,
    safetyNotes: 'All background checks passed for volunteers. Tutoring conducted in open halls.',
    materialsRequired: 'Workbooks and stationery kits will be distributed',
    whatToBring: 'Your laptop, notebooks, positive attitude, patience!',
    accessMode: 'Approval Required',
    participationLevel: 'Maybe',
    attendeesCount: 5,
    attendees: [
      { avatar: 'https://images.unsplash.com/photo-1544256718-3bcf237f3974?w=120&auto=format&fit=crop&q=80', name: 'Chris Evans', participationLevel: 'Confirmed' }
    ],
    isAttending: false,
    announcements: [
      {
        id: 'ann-ev-2',
        senderName: 'Elena Rossi',
        senderAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
        senderVerification: 'Identity Verified',
        content: 'Welcome! First session focuses on linear equations helper sheets. Review algebraic basics before arriving.',
        timestamp: '12 hours ago'
      }
    ],
    discussion: []
  },
  {
    id: 'event-3',
    hubId: 'hub-2',
    title: 'Valley Hill Cycle Ascent',
    description: 'An endurance cycling run climbing the north summit trail. Not suitable for beginners. Full helmet is mandatory.',
    category: 'Cycling',
    image: 'https://images.unsplash.com/photo-1541614101331-1a5a3a194e92?w=600&auto=format&fit=crop&q=80',
    date: 'Friday, May 29th',
    time: '6:30 AM - 10:00 AM',
    location: 'Valley National Park West Gate',
    isFree: true,
    organizerName: 'Sarah Jenkins',
    organizerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    organizerVerification: 'Trusted Organizer',
    organizerPastEvents: 45,
    capacity: 25,
    safetyNotes: 'Extreme descents require proper brakes. Keep 5 meters distance in paceline. Hydrate at checkpoints.',
    materialsRequired: 'No equipment provided. Must have fully checked geared bicycle.',
    whatToBring: 'Premium helmet, 2 water canteens, energy gels, spare inner tubes, portable air pump.',
    accessMode: 'Invite Only',
    participationLevel: 'Interested',
    attendeesCount: 15,
    attendees: [
      { avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80', name: 'Gary B', participationLevel: 'Confirmed' }
    ],
    isAttending: false,
    announcements: []
  },
  {
    id: 'event-4',
    hubId: 'hub-5',
    title: 'Shelter Dog Walk Social',
    description: 'Provide company and exercise to paws waiting for adoption at the municipal pet welfare. Learn animal care and help walk energetic and affectionate dogs.',
    category: 'Pets & Animal Welfare',
    image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&auto=format&fit=crop&q=80',
    date: 'Completed Event (✓ Event Successfully Conducted)',
    time: 'Last Saturday, May 16th',
    location: 'District Canine Welfare Shelter',
    isFree: true,
    organizerName: 'Paws Rescue Admin',
    organizerAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
    organizerVerification: 'Trusted Organizer',
    organizerPastEvents: 18,
    capacity: 20,
    safetyNotes: 'Always handle leashes with both hands, keep dogs separated by at least 2 meters. Instructors nearby.',
    materialsRequired: 'Leashes and treats supplied',
    whatToBring: 'Athletic wear, closed shoes, active energy!',
    accessMode: 'Open',
    attendeesCount: 12,
    attendees: [
      { avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', name: 'Marcus Chen', participationLevel: 'Committed' }
    ],
    isAttending: true,
    isCompleted: true,
    isVerifiedConduct: true,
    impactReport: {
      volunteerHours: 36,
      metrics: '12 shelter dogs walked and socialized',
      summary: 'Volunteers walked 12 rescue dogs on 3km forest trails. 2 dogs were matching for foster interest interviews!'
    },
    photos: [
      'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&auto=format&fit=crop&q=80'
    ]
  }
];

export const INITIAL_IMPACTS: EventEntity[] = INITIAL_EVENTS.filter(e => e.isCompleted || e.isImpact);

export const DEFAULT_PROFILE: UserProfile = {
  name: 'Marcus Chen',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  email: 'reachraghuhere14@gmail.com',
  phone: '+1 (555) 234-5678',
  bio: 'Pristine trail biker, tree planter, and math tutor volunteer. Dedicated to local ecological service and community enrichment.',
  location: 'Downtown Hubs Area',
  
  // Verification labels & reputation
  verificationStatus: 'Identity Verified',
  isTrustedOrganizer: false,
  eventsAttendedCount: 14,
  eventsHostedCount: 3,
  attendanceRate: 98,
  volunteerHours: 48,
  impactPoints: 320,
  verifiedEventsConducted: 2,
  communityContributions: [
    'Planted 15 saplings at Elmwood Forest Drive',
    'Tutored elementary arithmetic for room 204 kids',
    'Conducted trail sweep on Sunday gravel cycles'
  ],
  organizerRating: 4.8,
  earnedBadges: [
    'Community Builder',
    'Environmental Contributor',
    'Education Volunteer'
  ],
  interests: ['Cycling', 'Environmental Action', 'Volunteering', 'Tree Plantation'],
  causes: ['Environmental Protection', 'Education', 'Community Development'],
  participationPreferences: ['Attend Events', 'Volunteer'],
  discoveryRadius: 25,
  customRadiusValue: 25,
  interestNotificationsEnabled: true,
  feedInterestsSettingEnabled: false
};
