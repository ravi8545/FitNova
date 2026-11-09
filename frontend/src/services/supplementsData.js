import wheyImg from '../assets/images/product-whey.jpg';
import creatineImg from '../assets/images/product-creatine.jpg';
import c4Img from '../assets/images/product-c4.jpg';
import viteImg from '../assets/images/product-vite.jpg';
import bcaaImg from '../assets/images/product-bcaa.svg';
import omegaImg from '../assets/images/product-omega.svg';

export const SUPPLEMENT_CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'protein', label: 'Protein' },
  { id: 'creatine', label: 'Creatine' },
  { id: 'pre-workout', label: 'Pre-Workout' },
  { id: 'vitamins', label: 'Vitamins' },
  { id: 'amino-acids', label: 'Amino Acids' },
  { id: 'fat-burners', label: 'Fat Burners' },
  { id: 'post-workout', label: 'Post-Workout' },
  { id: 'misc', label: 'Misc' },
];

export const CATEGORY_CARDS = [
  { id: 'cat-protein', name: 'Protein', description: 'Build & repair muscle', icon: wheyImg },
  { id: 'cat-creatine', name: 'Creatine', description: 'Strength & performance', icon: creatineImg },
  { id: 'cat-preworkout', name: 'Pre-Workout', description: 'Energy & focus', icon: c4Img },
  { id: 'cat-vitamins', name: 'Vitamins', description: 'Overall wellness', icon: viteImg },
  { id: 'cat-amino', name: 'Amino Acids', description: 'Recovery & endurance', icon: bcaaImg },
  { id: 'cat-fatburner', name: 'Fat Burners', description: 'Support metabolism', icon: c4Img },
  { id: 'cat-postworkout', name: 'Post-Workout', description: 'Faster recovery', icon: wheyImg },
  { id: 'cat-misc', name: 'Miscellaneous', description: 'Other supplements', icon: omegaImg },
];

export const FEATURED_SUPPLEMENTS = [
  {
    id: 'supp-1',
    name: 'Optimum Nutrition Gold Standard Whey Protein',
    category: 'protein',
    brand: 'Optimum Nutrition',
    image: wheyImg,
    badge: { text: 'Best Seller', color: 'bg-[#2BAF34] text-black font-semibold' },
    rating: 4.8,
    reviewsCount: '12.4k',
    price: 5499,
    originalPrice: 6999,
  },
  {
    id: 'supp-2',
    name: 'MuscleBlaze Creatine Monohydrate',
    category: 'creatine',
    brand: 'MuscleBlaze',
    image: creatineImg,
    badge: { text: 'Most Popular', color: 'bg-blue-500 text-white font-medium' },
    rating: 4.7,
    reviewsCount: '8.1k',
    price: 1099,
    originalPrice: 1499,
  },
  {
    id: 'supp-3',
    name: 'Cellucor C4 Pre-Workout',
    category: 'pre-workout',
    brand: 'Cellucor',
    image: c4Img,
    badge: { text: 'Trending', color: 'bg-amber-500 text-black font-semibold' },
    rating: 4.6,
    reviewsCount: '6.2k',
    price: 2299,
    originalPrice: 2899,
  },
  {
    id: 'supp-4',
    name: 'MuscleBlaze MB-Vite Multivitamin',
    category: 'vitamins',
    brand: 'MuscleBlaze',
    image: viteImg,
    badge: null,
    rating: 4.6,
    reviewsCount: '4.1k',
    price: 899,
    originalPrice: 1199,
  },
  {
    id: 'supp-5',
    name: 'MyProtein BCAA 8:1:1 Powder',
    category: 'amino-acids',
    brand: 'MyProtein',
    image: bcaaImg,
    badge: null,
    rating: 4.4,
    reviewsCount: '3.8k',
    price: 1499,
    originalPrice: 1999,
  },
];

export const INITIAL_USER_STACK = [
  {
    id: 'stack-1',
    name: 'Gold Standard Whey',
    category: 'Protein',
    image: wheyImg,
    dosage: '1 scoop (30 g)',
    timing: 'Post Workout',
    startDate: '01 Jun 2025',
    status: 'Active',
  },
  {
    id: 'stack-2',
    name: 'Creatine Monohydrate',
    category: 'Creatine',
    image: creatineImg,
    dosage: '5 g',
    timing: 'Post Workout',
    startDate: '01 Jun 2025',
    status: 'Active',
  },
  {
    id: 'stack-3',
    name: 'MB Multivitamin',
    category: 'Vitamins',
    image: viteImg,
    dosage: '1 tablet',
    timing: 'After Breakfast',
    startDate: '03 Jun 2025',
    status: 'Active',
  },
  {
    id: 'stack-4',
    name: 'Omega 3 Fish Oil',
    category: 'Supplements',
    image: omegaImg,
    dosage: '1 softgel',
    timing: 'After Dinner',
    startDate: '05 Jun 2025',
    status: 'Active',
  },
];

export const SUPPLEMENT_OVERVIEW = {
  activeCount: 4,
  completedCount: 2,
  streakDays: 12,
  remindersCount: 3,
};

export const SUPPLEMENT_GOALS = [
  { title: 'Muscle Gain Support', percentage: 80, color: '#2BAF34' },
  { title: 'Recovery & Performance', percentage: 60, color: '#2BAF34' },
  { title: 'Overall Health', percentage: 45, color: '#2BAF34' },
];

export const INITIAL_REMINDERS = [
  { id: 'rem-1', name: 'Whey Protein', dose: '1 scoop', time: '09:00 AM', enabled: true, icon: wheyImg },
  { id: 'rem-2', name: 'Creatine', dose: '5 g', time: 'After Workout', enabled: true, icon: creatineImg },
  { id: 'rem-3', name: 'Multivitamin', dose: '1 tablet', time: 'After Breakfast', enabled: true, icon: viteImg },
  { id: 'rem-4', name: 'Omega 3', dose: '1 softgel', time: '08:00 PM', enabled: true, icon: omegaImg },
];

export const ARTICLES_AND_TIPS = [
  {
    id: 'art-1',
    title: 'Do You Really Need Supplements?',
    subtitle: 'A complete guide for beginners.',
    date: '10 Jun 2025',
    image: wheyImg,
  },
  {
    id: 'art-2',
    title: 'Creatine Benefits Explained',
    subtitle: 'Boost strength and performance.',
    date: '08 Jun 2025',
    image: creatineImg,
  },
  {
    id: 'art-3',
    title: 'Best Supplements for Muscle Gain',
    subtitle: 'Top picks and how to use them.',
    date: '06 Jun 2025',
    image: c4Img,
  },
];
