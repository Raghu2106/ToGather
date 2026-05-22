import { Hub, FeedPost, EventEntity, UserProfile } from './types';

export const INITIAL_HUBS: Hub[] = [
  {
    id: 'hub-1',
    name: 'City Bike Riders',
    members: 1200,
    activeNow: true,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDmS2uu7hRSmio2nicARqazHAN_5gDxbJ562bWmzC8fa6589u2ignoHXV7LZCj4REu5GOSu7DQSiKaglf5F7n7XjCQkI7dwGZlEp8vz6uxHoIaU4rwUpx-0ulQ4-h-zUr6zyweoEPI2VcErfOUpAnXwz46BXk_RyWdKo0ZovNUBQ9zWCIDPoTxlZst-YoLbVQwEga7xHk3-UbEfjsItHWdjLEL5cfCcwJMIHfl9SEMvHSkeRAy0Ot_yHYwC_QLGPnnGnFdW3CeXfRk',
    icon: 'Bike',
    bgColor: 'bg-primary-container',
    latestUpdate: 'Latest: Rides schedule for Saturday morning trail runs',
    latestTime: '10m ago',
    isJoined: false,
    tag: '#Hiking'
  },
  {
    id: 'hub-2',
    name: 'Vintage Car Lovers',
    members: 842,
    activeNow: false,
    image: '',
    icon: 'Car',
    bgColor: 'bg-secondary-container',
    latestUpdate: 'Latest: Classics meet up scheduled on 5th Avenue',
    latestTime: '45m ago',
    isJoined: false,
    tag: '#Cars'
  },
  {
    id: 'hub-3',
    name: 'Urban Sketchers',
    members: 310,
    activeNow: false,
    image: '',
    icon: 'Palette',
    bgColor: 'bg-tertiary-container',
    latestUpdate: 'Latest: Sketch walk gallery posted!',
    latestTime: '2h ago',
    isJoined: false,
    tag: '#Pottery'
  },
  {
    id: 'hub-4',
    name: 'Sunrise Yoga Collective',
    members: 420,
    activeNow: true,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAT3lWjznU1uV8peg9pUzlJx4byt3gTCUnPZjs3eFunbitcrH_DuDzmMDf5KxFLMXi0eDuL185dT_eLT8rNzxeo8_1a9Dgc9xWlB1YJirHKAWnO4XKVXTIFvV1rpy1pJ_4QvyHnBHbOd0dJHab80dESPvCWa2cqbCdVnnAFBLt-RdovMY60P44g23tqasoXnWgE3m6F_fiXTOIwf3WdiiqC2Mf31WyoGK2FXHftHUlvp1ckq1rBXSIw78DmVEB_GTCS57RipeFC9Go',
    icon: 'Flame',
    bgColor: 'bg-primary-container',
    latestUpdate: 'Latest: New session tomorrow @ 6AM',
    latestTime: '2m ago',
    isJoined: true,
    tag: '#Yoga'
  },
  {
    id: 'hub-5',
    name: 'Gourmet Home Chefs',
    members: 650,
    activeNow: false,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCONuAVr7BaWfkpwqMk4NBQwltHt5NP0dkps2T5CbndkZrpX2Ylbb6a6x07KnhVMamIRYiUBlHqqclTj5HK-6iy8XbJOKmCZew4VGzL0TNDFSRWL_EfEim7FESOZ2sfm5pwXk12qJweFFgATR8L1xHySYOtkD6hx-k8EBQLa6hOSFjv-6Kygb_Z4ty2NQdUrgsVkv4ZoYM7OGlJw4Hp1VRAgPVti_HzE7KVjzVBxOkmugD2hMAD0Yf6-nEQyh7uWMWsqWV4a8OzyFA',
    icon: 'Utensils',
    bgColor: 'bg-secondary-container',
    latestUpdate: 'Latest: Maria shared a recipe for Truffle Pasta',
    latestTime: '1h ago',
    isJoined: true,
    tag: '#Cooking'
  },
  {
    id: 'hub-6',
    name: 'Tech & Coffee',
    members: 1250,
    activeNow: true,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBkEpJh99bcV1fkzsj0Kn738f6eqaKsMicHyUCVI6S8iiVkruj8Q8yKFwwGnKY0bou4pOoLHlFF5l533M6qUs9i3lGm8xuNTLwo8zUagtDllvoZ-xfTXY48v-RQqMjDW3BLvyFVIiy2L14a4fBKntIm5Ihp2cwi1mnSMq_R4dPGuC21XjOsc0nm-l354W3qCqM3EB-8dmlnj86ahT1B3w3rZ4tMGW1dENqzACdtIFrQ-dMiGJZPcIw-CX8YXrdsS4PwQbYSvonAOX4',
    icon: 'Coffee',
    bgColor: 'bg-tertiary-container',
    latestUpdate: 'Latest: 12 new messages',
    latestTime: '3h ago',
    isJoined: true,
    tag: '#Tech'
  }
];

export const INITIAL_POSTS: FeedPost[] = [
  {
    id: 'post-1',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDewz-nkslebqg8xu6GQSQD5eU0ekstdYVOcmpAtTey6dszSya4qwsNNa6a8X-GQ0luEOPRznRNtiJ9Z-cEiSVYCT7zGOu_y6h9vN-DpAMXVlzspk4n_iAyAraYVV1CHoPvNMav8pcZCtneSUSP-D2UB-T16GSGQwh8iLHPgcQ7OrjJ3ycgIHEV166fwAv8V6MsoSrlqiwgiKcVjGdEcp9c8QZ__I7Dor3VwaARQHUrE-B48HeVfSyrk1B2V9TTTKJ5_hodLWuNBDk',
    author: 'Sarah Jenkins',
    subtext: '2 hours ago • Sunset Peaks Trail',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDg428cZ5c6XVbvzKYep2-mJL60zpGdsbyIxoBGNSqGl0wuKGrcPmBYDb8D0XCPNwmjTUg9HzfyeB6Z0ICbUnbLHdqAh0jqoRXwMPa7W2lEC8nric0Qb8ucRTn5gHhHToXyJYIr8oLcQlGCRkw09O8vIA_9TZHYjjYZ8HF_IJsRZbJEhGmaKsHjgxXSZGciJZPUM3DrHpdrC7rrYiGNp5LFGPLS4MLhEFrrnImXGseo9Chw8Gjc1tkk9Eg0GBcXdh7tUiojsk6tX78',
    text: "Conquered the Peaks today! ⛰️ Such an amazing group of people from the Saturday Hikers Hub. Can't wait for the next one!",
    tags: ['#Hiking', '#Outdoors', '#Community'],
    likes: 124,
    commentsCount: 18,
    isLiked: false,
    isBookmarked: false
  },
  {
    id: 'post-2',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDffY8P3e_1Assdzypx5kLcV7xM9sldIogHMsCo11xdXPgDiPRdbjzeOSzF4B81Zg02B-I6X8Du8G5riNnz78gjcQWJVNLu48bfTozIzsOX9FBwunSuHe5T4fTkXAg2dgTqkLtkxE5BeLH0asviGBAnGjPnyW-APQFCeMjMsc5C-H1dv4UlF0jjITPg4d6TQ0_TiLl0-gE9luEQCcOMaoUIfFYG6kE1d6CJg-gxVZyP5-63jywfYtl2QGqzCFL9bwwIdhRE7lOuS8',
    author: 'Marcus Chen',
    subtext: '5 hours ago • The Clay Studio',
    image: 'POTTERY_GRID', // Special tag handled by layout
    text: 'Finally finished my first set! Big thanks to the instructors at the Wheel Hub for the patience. 🏺',
    tags: ['#Pottery', '#Creativity'],
    likes: 86,
    commentsCount: 12,
    isLiked: false,
    isBookmarked: false
  },
  {
    id: 'post-3',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD1bfPerMD_S4fDVajCjk8AfGjrm5KFz-K9iV9B06fP5_0Ika1gxqUrKLfKJb8mR8tViLcq66s6Jsd3p71PebP57xUaIlaThqthHOqYsEcaOGH1f3cuBNrcDMBDwFlDl6BzJm-qmWCiTQFXgMN8fAg_WBAr4Lp3SJUynCDTKQLT0_qpyetBK5k7P5T0kyUzbDhO6rAZGhxc9hiXmQjEbbeTmBpOqqWXhVS7EUZVBulOuMt1wJ3K-q-9Ri1jC7rG-9T_CU7omECnx2U',
    author: 'Elena Rossi',
    subtext: 'Yesterday • City Park',
    text: '',
    tags: [],
    likes: 212,
    commentsCount: 45,
    isLiked: false,
    isBookmarked: false,
    quote: {
      text: '"The best way to find yourself is to lose yourself in the service of others." — Finding a lot of truth in this lately with the ToGather volunteer groups.',
      author: 'Elena Rossi'
    }
  }
];

export const INITIAL_EVENTS: EventEntity[] = [
  {
    id: 'event-1',
    title: 'City Park Cleanup',
    category: 'Volunteer',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBeqMSBjU8mAV5NW7U_cfGG1AQUjZaaqD-yEBPDHexexRgV-N5PVbb6G8jLS4CJ_Ibg9v7LdT35i5YvjGeSH3Io_eDk-rBD8GCvxMt7GBBPCkMzltYslH-IlkPWw8ZASZ_uYLmchVnUFOQ2QdeBtUB3jWVXi1vRjTwIeTIK2Eck39SJC33A5uedcOc2YoUiSud8TothM-1w34XRx7luviHa0L-NWu5-nG2wmey4Ns1_gdghzWgRHL6kPc3TFHyvxKxSFJA1R97Qc54',
    date: 'Tomorrow, 9 AM',
    location: 'Central Park South Entrance',
    isFree: true,
    attendees: [
      { avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCHcqkB3Nx9T6yi53sXplv9y1bOzQKulDuBIGr86pe0-SWjXtAmFrpkXcpudbeFsmA7VxP98FrOaX3vlrqVjs_OrcgnRzDpJowVMMgwrSxzkKtIATvtCDFrcX17zLdu0RwlZiBGNVXMoN8Ruhdzd4T-ukmRCLzXAz2tVJJM2XTukLCLa1BxgGfpQruIItFgWaXm7JBVUyXtHlLJTgOQcRNS45dpZaKvzdNpZr9VmvtGuIKH1PwHsZA62duqjsB6NoHh_kMlVK94a8I', name: 'John' },
      { avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDewz-nkslebqg8xu6GQSQD5eU0ekstdYVOcmpAtTey6dszSya4qwsNNa6a8X-GQ0luEOPRznRNtiJ9Z-cEiSVYCT7zGOu_y6h9vN-DpAMXVlzspk4n_iAyAraYVV1CHoPvNMav8pcZCtneSUSP-D2UB-T16GSGQwh8iLHPgcQ7OrjJ3ycgIHEV166fwAv8V6MsoSrlqiwgiKcVjGdEcp9c8QZ__I7Dor3VwaARQHUrE-B48HeVfSyrk1B2V9TTTKJ5_hodLWuNBDk', name: 'Sarah' }
    ],
    attendeesCount: 12,
    isAttending: false
  },
  {
    id: 'event-2',
    title: 'Cozy Classics Club',
    category: 'Book Clubs',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD7uOPrrEuo4w_3910fHI0JONMeMUizD_7j3inf1cJY5P_qU0kzNpXTGHvX40h2XfAmGuJIBkJ0wvuvJvMmRZyTQEV9xw8bzqgr-u0VIi5Ga8At8vdkwVP8dbMzpn2U3DbEQGKCAe43S9ODZumjqGIJL6fKM2mqOZnfIImxsCOEpdnw4HG1jkmLQn39rVNsL17CvEURZEXXdzaZp0qQrhP15Hp-0aZcRagA3SQHv128jr6maAZUhM2hBU-lk1luYUyi1eg771YLtBI',
    date: 'Friday, 7 PM',
    location: 'The Brew & Bindery Cafe',
    isFree: true,
    attendees: [
      { avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDffY8P3e_1Assdzypx5kLcV7xM9sldIogHMsCo11xdXPgDiPRdbjzeOSzF4B81Zg02B-I6X8Du8G5riNnz78gjcQWJVNLu48bfTozIzsOX9FBwunSuHe5T4fTkXAg2dgTqkLtkxE5BeLH0asviGBAnGjPnyW-APQFCeMjMsc5C-H1dv4UlF0jjITPg4d6TQ0_TiLl0-gE9luEQCcOMaoUIWfFYG6kE1d6CJg-gxVZyP5-63jywfYtl2QGqzCFL9bwwIdhRE7lOuS8', name: 'Marcus' }
    ],
    attendeesCount: 8,
    isAttending: false
  },
  {
    id: 'event-3',
    title: 'Morning Puppy Social',
    category: 'Pet Meets',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuANk67WXfU-sGLlU2nzuctONupq4owWv9vSLQDMmy6hUfFaA3XXHBtfjbMSom9xpM3xvuLN1oV706GnzPzkbOzKFOuEJ2Xr5S2tx42Ay-b0zm7FoTAKGPgEpVRbnqH93FasaR8Mg9d__hXncKLYcNYGlElxXIWD1pk6Qk043Sr9Vj-C0S9PGtuc7f8H4Uco5S4S4GxCSLMuCzum9hbZ4QZh5s0eWB4ZGZLYhC3TRwy05mXkMOiSxy6kzWp5OdsB5b3l7IaGijGPg9k',
    date: 'Saturday, 10 AM',
    location: 'Bark Lane Dog Park',
    isFree: true,
    attendees: [
      { avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD1bfPerMD_S4fDVajCjk8AfGjrm5KFz-K9iV9B06fP5_0Ika1gxqUrKLfKJb8mR8tViLcq66s6Jsd3p71PebP57xUaIlaThqthHOqYsEcaOGH1f3cuBNrcDMBDwFlDl6BzJm-qmWCiTQFXgMN8fAg_WBAr4Lp3SJUynCDTKQLT0_qpyetBK5k7P5T0kyUzbDhO6rAZGhxc9hiXmQjEbbeTmBpOqqWXhVS7EUZVBulOuMt1wJ3K-q-9Ri1jC7rG-9T_CU7omECnx2U', name: 'Elena' }
    ],
    attendeesCount: 24,
    isAttending: false
  }
];

export const INITIAL_IMPACTS: EventEntity[] = [
  {
    id: 'impact-1',
    title: 'Central Park Restoration',
    category: 'Volunteer',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBeqMSBjU8mAV5NW7U_cfGG1AQUjZaaqD-yEBPDHexexRgV-N5PVbb6G8jLS4CJ_Ibg9v7LdT35i5YvjGeSH3Io_eDk-rBD8GCvxMt7GBBPCkMzltYslH-IlkPWw8ZASZ_uYLmchVnUFOQ2QdeBtUB3jWVXi1vRjTwIeTIK2Eck39SJC33A5uedcOc2YoUiSud8TothM-1w34XRx7luviHa0L-NWu5-nG2wmey4Ns1_gdghzWgRHL6kPc3TFHyvxKxSFJA1R97Qc54',
    date: '',
    location: '',
    isFree: false,
    attendees: [],
    attendeesCount: 0,
    isAttending: false,
    isImpact: true,
    impactValue: '150 trees planted'
  },
  {
    id: 'impact-2',
    title: 'Sunset Charity Run',
    category: 'Trekking',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDUXh1sr0accZwI88RomYh30AZvKt3nMIqAdOzcFi1p-YReVg3HYQISWLXI_DaC3gQruvRhyXkoRpi8qcThGW2fU2i3sPRv2JJd9gEZU_T91yhEi5STb9vGs_sd9IiC14fmqgeM5lTs2OkG1zyUP7S1syook29IQGgrx93e3V3cdw1Hy4KQrC3gnD3lFP0qGNd-pf1su1kAEijpvncecDcv4xRfY1fLZl3RpSgGrZvfj2UvKf3GBmTrS2jGXWYdpJIiJxTQOu9lWyw',
    date: '',
    location: '',
    isFree: false,
    attendees: [],
    attendeesCount: 0,
    isAttending: false,
    isImpact: true,
    impactValue: '$2,000 raised'
  },
  {
    id: 'impact-3',
    title: 'Coastal Cleanup Day',
    category: 'Volunteer',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA24JdbOq_lJu_8kkX842CGebXpjRHbflt07vfDKTsFv5jWp4CE4POjXGThqKKu3kT7gFwEYAU8ribkG5dPnKxxxPnk9qVTbCJO53AHkyBq36PRnEXbHTrlPGFylFNR1eb7TsLkrv2dDFAQqT9M0XgDqM_CXPo6oXcnmxOGJUrs5OyUy2BDqSb-5JLLE_YSdlhaRDTYGhj8ZvTYendTc97pV6jtTLng1roce71vrdPeRqU89Anogw0R5KP9Nh9GDtx_KS3OLMBz72c',
    date: '',
    location: '',
    isFree: false,
    attendees: [],
    attendeesCount: 0,
    isAttending: false,
    isImpact: true,
    impactValue: '500kg trash removed'
  }
];

export const DEFAULT_PROFILE: UserProfile = {
  name: 'Marcus Chen',
  avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCHcqkB3Nx9T6yi53sXplv9y1bOzQKulDuBIGr86pe0-SWjXtAmFrpkXcpudbeFsmA7VxP98FrOaX3vlrqVjs_OrcgnRzDpJowVMMgwrSxzkKtIATvtCDFrcX17zLdu0RwlZiBGNVXMoN8Ruhdzd4T-ukmRCLzXAz2tVJJM2XTukLCLa1BxgGfpQruIItFgWaXm7JBVUyXtHlLJTgOQcRNS45dpZaKvzdNpZr9VmvtGuIKH1PwHsZA62duqjsB6NoHh_kMlVK94a8I',
  email: 'reachraghuhere14@gmail.com',
  phone: '+1 (555) 234-5678',
  bio: 'Artisan, community builder, and hobby chef. Passionate about bringing creative minds together over warm clay, hot coffee, and outdoor trails.',
  location: 'Downtown Hubs'
};
