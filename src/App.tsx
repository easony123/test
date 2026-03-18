/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Navigation, Calendar, Star, ChevronRight, Utensils, Search, Loader2, Footprints, Car, Video, ArrowLeft, Plus, Minus, ShoppingCart, PlayCircle, Image as ImageIcon, Flame, DollarSign, Target, Sparkles, PlaySquare, Heart, Share2, Compass } from 'lucide-react';

// --- Types ---
type Screen = 'auth' | 'mode_select' | 'hunger' | 'main' | 'loading' | 'results' | 'feed' | 'menu';

interface Recommendation {
  id: string;
  name: string;
  rating: number;
  analysis: string;
  cuisine: string;
  price: string;
  imageUrl: string;
  videoUrl: string;
  distance: number;
  matchPercentage: number;
  lat?: number;
  lng?: number;
}

// --- Utils ---
function getDistanceFromLatLonInM(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3; // Radius of the earth in m
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in m
  return d;
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

// --- Mock Data & API ---
const cuisineImageMap: Record<string, string> = {
  'Chinese': 'https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=600&h=800&auto=format&fit=crop',
  'Korean': 'https://images.unsplash.com/photo-1580651315530-69c8e0026377?q=80&w=600&h=800&auto=format&fit=crop',
  'Western': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600&h=800&auto=format&fit=crop',
  'Japanese': 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=600&h=800&auto=format&fit=crop',
  'Local': 'https://images.unsplash.com/photo-1626804475297-41609ea0af49?q=80&w=600&h=800&auto=format&fit=crop',
  'Halal': 'https://images.unsplash.com/photo-1528736235302-52922df5c122?q=80&w=600&h=800&auto=format&fit=crop',
  'Default': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=600&h=800&auto=format&fit=crop'
};

const getCuisineImage = (cuisine: string) => {
  const normalized = cuisine.toLowerCase();
  if (normalized.includes('chinese') || normalized.includes('dim sum')) return cuisineImageMap['Chinese'];
  if (normalized.includes('korean') || normalized.includes('bbq')) return cuisineImageMap['Korean'];
  if (normalized.includes('western') || normalized.includes('burger') || normalized.includes('pizza') || normalized.includes('steak')) return cuisineImageMap['Western'];
  if (normalized.includes('japanese') || normalized.includes('sushi') || normalized.includes('ramen')) return cuisineImageMap['Japanese'];
  if (normalized.includes('halal') || normalized.includes('middle eastern')) return cuisineImageMap['Halal'];
  if (normalized.includes('local') || normalized.includes('malaysian') || normalized.includes('thai')) return cuisineImageMap['Local'];
  return cuisineImageMap['Default'];
};

const restaurantDb = [
  // Chinese
  { id: '1', name: 'Din Tai Fung', rating: 4.8, cuisine: 'Chinese', price: '$$', imageUrl: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?q=80&w=600&h=800&auto=format&fit=crop', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' },
  { id: '5', name: 'Hai Di Lao', rating: 4.9, cuisine: 'Chinese', price: '$$$', imageUrl: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?q=80&w=600&h=800&auto=format&fit=crop', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4' },
  { id: '13', name: 'Crystal Jade', rating: 4.5, cuisine: 'Chinese', price: '$$', imageUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=600&h=800&auto=format&fit=crop', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4' },
  { id: '14', name: 'Canton Paradise', rating: 4.6, cuisine: 'Chinese', price: '$$', imageUrl: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=600&h=800&auto=format&fit=crop', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' },
  
  // Western
  { id: '2', name: 'Shake Shack', rating: 4.6, cuisine: 'Western', price: '$$', imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600&h=800&auto=format&fit=crop', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4' },
  { id: '4', name: 'Gordon Ramsay Steak', rating: 4.7, cuisine: 'Western', price: '$$$$', imageUrl: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?q=80&w=600&h=800&auto=format&fit=crop', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' },
  { id: '9', name: 'Pizzeria Mozza', rating: 4.6, cuisine: 'Western', price: '$$$', imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=600&h=800&auto=format&fit=crop', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4' },
  { id: '15', name: 'Texas Roadhouse', rating: 4.5, cuisine: 'Western', price: '$$', imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=600&h=800&auto=format&fit=crop', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4' },

  // Japanese
  { id: '3', name: 'Nobu', rating: 4.9, cuisine: 'Japanese', price: '$$$$', imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=600&h=800&auto=format&fit=crop', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4' },
  { id: '12', name: 'Sushi Zanmai', rating: 4.3, cuisine: 'Japanese', price: '$$', imageUrl: 'https://images.unsplash.com/photo-1553621042-f6e147245754?q=80&w=600&h=800&auto=format&fit=crop', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' },
  { id: '16', name: 'Ippudo Ramen', rating: 4.7, cuisine: 'Japanese', price: '$$', imageUrl: 'https://images.unsplash.com/photo-1552611052-33e04de081de?q=80&w=600&h=800&auto=format&fit=crop', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4' },
  { id: '17', name: 'Kyoto Sushi', rating: 4.5, cuisine: 'Japanese', price: '$$', imageUrl: 'https://images.unsplash.com/photo-1583623025817-d180a2221d0a?q=80&w=600&h=800&auto=format&fit=crop', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4' },

  // Korean
  { id: '10', name: 'Seoul Garden', rating: 4.3, cuisine: 'Korean', price: '$$', imageUrl: 'https://images.unsplash.com/photo-1580651315530-69c8e0026377?q=80&w=600&h=800&auto=format&fit=crop', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' },
  { id: '11', name: 'Kyochon 1991', rating: 4.6, cuisine: 'Korean', price: '$$', imageUrl: 'https://images.unsplash.com/photo-1606356942255-8bf8e13a614f?q=80&w=600&h=800&auto=format&fit=crop', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4' },
  { id: '18', name: 'Daorae BBQ', rating: 4.5, cuisine: 'Korean', price: '$$$', imageUrl: 'https://images.unsplash.com/photo-1558030006-450675393462?q=80&w=600&h=800&auto=format&fit=crop', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4' },
  { id: '19', name: 'Palsaik Korean BBQ', rating: 4.4, cuisine: 'Korean', price: '$$', imageUrl: 'https://images.unsplash.com/photo-1544928147-79a2dbc1f389?q=80&w=600&h=800&auto=format&fit=crop', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' },

  // Local & Halal
  { id: '7', name: 'The Halal Guys', rating: 4.4, cuisine: 'Halal', price: '$', imageUrl: 'https://images.unsplash.com/photo-1528736235302-52922df5c122?q=80&w=600&h=800&auto=format&fit=crop', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' },
  { id: '8', name: 'Village Nasi Lemak', rating: 4.7, cuisine: 'Local', price: '$', imageUrl: 'https://images.unsplash.com/photo-1626804475297-41609ea0af49?q=80&w=600&h=800&auto=format&fit=crop', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4' },
  { id: '20', name: 'Madam Kwan\'s', rating: 4.6, cuisine: 'Local', price: '$$', imageUrl: 'https://images.unsplash.com/photo-1555126634-323283e090fa?q=80&w=600&h=800&auto=format&fit=crop', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4' },
  { id: '21', name: 'Zam Zam Restaurant', rating: 4.5, cuisine: 'Halal', price: '$', imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=600&h=800&auto=format&fit=crop', videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' }
];

const mockFetchRecommendations = async (
  hunger: number,
  cuisines: string[],
  price: string,
  purpose: string[],
  location: string,
  userCoords: {lat: number, lng: number} | null
): Promise<Recommendation[]> => {
  let results: Recommendation[] = [];

  if (userCoords) {
    try {
      const radius = 3000;
      const query = `
        [out:json];
        (
          node["amenity"="restaurant"](around:${radius},${userCoords.lat},${userCoords.lng});
          node["amenity"="cafe"](around:${radius},${userCoords.lat},${userCoords.lng});
          node["amenity"="fast_food"](around:${radius},${userCoords.lat},${userCoords.lng});
        );
        out 15;
      `;
      const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
      const data = await response.json();

      if (data && data.elements && data.elements.length > 0) {
        const validElements = data.elements.filter((e: any) => e.tags && e.tags.name);
        
        results = validElements.slice(0, 10).map((e: any) => {
          const dist = getDistanceFromLatLonInM(userCoords.lat, userCoords.lng, e.lat, e.lon);
          const cuisineTag = e.tags.cuisine ? e.tags.cuisine.split(';')[0].replace(/_/g, ' ') : 'Local';
          const capitalizedCuisine = cuisineTag.charAt(0).toUpperCase() + cuisineTag.slice(1);
          
          let matchScore = 0;
          if (cuisines.includes(capitalizedCuisine)) {
            matchScore += 70;
          } else if (cuisines.length === 0) {
            matchScore += 60;
          } else {
            matchScore += 30;
          }
          
          return {
            id: e.id.toString(),
            name: e.tags.name,
            rating: Number((4.0 + Math.random()).toFixed(1)),
            cuisine: capitalizedCuisine,
            price: price || '$$',
            imageUrl: getCuisineImage(capitalizedCuisine),
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
            distance: Math.round(dist),
            matchPercentage: Math.min(99, Math.round(matchScore + Math.random() * 20)),
            lat: e.lat,
            lng: e.lon,
            analysis: `Perfect for your "${purpose.join(', ') || 'casual'}" vibe. Hits the spot for ${capitalizedCuisine} cravings.`
          };
        });
      }
    } catch (err) {
      console.error("Overpass API failed, falling back to mock data", err);
    }
  }

  if (results.length === 0) {
    // Fallback to mock data
    let filtered = restaurantDb;
    
    if (cuisines.length > 0) {
      filtered = filtered.filter(r => cuisines.includes(r.cuisine));
    }
    
    // Better shuffle to ensure varied results
    const shuffled = [...filtered].sort(() => 0.5 - Math.random()).slice(0, 5);
    
    results = shuffled.map(r => {
      let matchScore = 0;
      if (cuisines.includes(r.cuisine)) {
        matchScore += 70;
      } else if (cuisines.length === 0) {
        matchScore += 60;
      } else {
        matchScore += 30;
      }
      
      if (price === r.price) {
        matchScore += 15;
      } else {
        matchScore += 5;
      }
      
      matchScore += Math.floor(Math.random() * 14); // 0-14 random factor
      
      return {
        ...r,
        distance: Math.floor(Math.random() * 2500) + 100, // 100m to 2600m
        matchPercentage: Math.min(99, Math.round(matchScore)),
        analysis: `Perfect for your "${purpose.join(', ') || 'casual'}" vibe. Hits the spot for ${r.cuisine} cravings at a ${r.price} budget.`
      };
    });
  }

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(results.sort((a, b) => b.matchPercentage - a.matchPercentage).slice(0, 3));
    }, 2000); // Simulate network delay
  });
};

// --- Components ---

const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center sm:p-8">
      <div 
        className="w-full h-[100dvh] sm:h-[800px] sm:max-h-[90vh] sm:aspect-[9/16] max-w-[400px] bg-[var(--color-offwhite)] overflow-hidden relative flex flex-col sm:rounded-[48px] sm:shadow-[0_0_0_12px_#1c1c1e,0_0_0_14px_#3a3a3c]"
        style={{ transform: 'translateZ(0)' }}
      >
        {children}
      </div>
    </div>
  );
};

const AuthScreen: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[var(--color-offwhite)]"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ delay: 0.2, type: 'spring', bounce: 0.5 }}
        className="mb-12"
      >
        <motion.div 
          animate={{ y: [0, -10, 0] }} 
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          className="w-28 h-28 bg-gradient-to-b from-[#FF6B55] to-[#E63E26] rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-[0_15px_30px_rgba(255,75,51,0.4),inset_0_4px_0_rgba(255,255,255,0.4)] border-b-[6px] border-[#C22E15]"
        >
          <Utensils className="w-14 h-14 text-white drop-shadow-md" />
        </motion.div>
        <h1 className="font-semibold text-4xl text-[var(--color-charcoal)] mb-3 tracking-tight">
          Eat Whattt
        </h1>
        <p className="text-[var(--color-charcoal-light)] text-[17px]">
          Solve your decision fatigue.
        </p>
      </motion.div>

      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={onLogin}
        className="w-full max-w-sm bg-white text-[var(--color-charcoal)] font-semibold py-4 px-6 rounded-2xl shadow-sm flex items-center justify-center gap-3 transition-all text-[17px]"
      >
        <svg className="w-6 h-6" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        Sign in with Google
      </motion.button>
    </motion.div>
  );
};

const HungerSlider: React.FC<{ value: number; onChange: (val: number) => void }> = ({ value, onChange }) => {
  const getLabel = (val: number) => {
    if (val <= 20) return "Just a light snack";
    if (val <= 50) return "Feeling hungry";
    if (val <= 80) return "Feed me now!";
    return "RAVENOUS";
  };

  const getColor = (val: number) => {
    if (val <= 20) return "#34C759"; // iOS Green
    if (val <= 50) return "#FFCC00"; // iOS Yellow
    if (val <= 80) return "#FF9500"; // iOS Orange
    return "var(--color-coral)"; // iOS Red
  };

  return (
    <div className="mb-4">
      <div className="flex justify-between items-end mb-4">
        <h3 className="font-semibold text-[17px] text-[var(--color-charcoal)]">Hunger Level</h3>
        <motion.span 
          key={getLabel(value)}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[13px] font-medium px-2.5 py-1 rounded-full"
          style={{ backgroundColor: `${getColor(value)}20`, color: getColor(value) }}
        >
          {getLabel(value)}
        </motion.span>
      </div>
      
      <div className="relative h-10 flex items-center">
        {/* Track */}
        <div className="absolute w-full h-2 bg-[var(--color-border)] rounded-full overflow-hidden">
          <motion.div 
            className="h-full rounded-full"
            style={{ width: `${value}%`, backgroundColor: getColor(value) }}
            layout
          />
        </div>
        
        {/* Thumb */}
        <input
          type="range"
          min="1"
          max="100"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="absolute w-full h-full opacity-0 cursor-pointer z-10"
        />
        <motion.div 
          className="absolute w-7 h-7 bg-white rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.15)] pointer-events-none flex items-center justify-center"
          style={{ 
            left: `calc(${value}% - 14px)`,
          }}
          animate={{ scale: value > 80 ? [1, 1.1, 1] : 1 }}
          transition={{ repeat: value > 80 ? Infinity : 0, duration: 0.5 }}
        />
      </div>
    </div>
  );
};

const ChipGroup: React.FC<{ 
  options: string[]; 
  selected: string[]; 
  onChange: (selected: string[]) => void;
  multi?: boolean;
}> = ({ options, selected, onChange, multi = true }) => {
  const toggle = (option: string) => {
    if (multi) {
      if (selected.includes(option)) {
        onChange(selected.filter(item => item !== option));
      } else {
        onChange([...selected, option]);
      }
    } else {
      onChange([option]);
    }
  };

  return (
    <motion.div 
      className="flex flex-wrap gap-2"
      variants={{
        hidden: { opacity: 0 },
        show: {
          opacity: 1,
          transition: { staggerChildren: 0.05 }
        }
      }}
      initial="hidden"
      animate="show"
    >
      {options.map(option => {
        const isSelected = selected.includes(option);
        return (
          <motion.button
            key={option}
            variants={{
              hidden: { opacity: 0, scale: 0.8, y: 10 },
              show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", bounce: 0.5 } }
            }}
            whileTap={{ scale: 0.9 }}
            onClick={() => toggle(option)}
            className={`px-4 py-2 rounded-full text-[15px] font-medium transition-all ${
              isSelected 
                ? 'bg-[var(--color-coral)] text-white shadow-md scale-105' 
                : 'bg-white text-[var(--color-charcoal)] border border-[var(--color-border)] hover:border-[var(--color-charcoal-light)]'
            }`}
          >
            {option}
          </motion.button>
        );
      })}
    </motion.div>
  );
};

const ModeSelectionScreen: React.FC<{ onSelect: (mode: 'eat' | 'browse') => void; onBack: () => void }> = ({ onSelect, onBack }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex-1 flex flex-col h-full bg-[var(--color-offwhite)] relative overflow-hidden"
    >
      {/* Background Floating Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.15] z-0">
        <motion.div animate={{ y: [0, -20, 0], rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }} className="absolute top-[20%] left-[10%] text-4xl">🔍</motion.div>
        <motion.div animate={{ y: [0, 20, 0], rotate: [0, -15, 15, 0] }} transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }} className="absolute top-[30%] right-[15%] text-5xl">🧭</motion.div>
        <motion.div animate={{ y: [0, -15, 0], rotate: [0, 20, -20, 0] }} transition={{ repeat: Infinity, duration: 7, ease: "easeInOut" }} className="absolute top-[60%] left-[15%] text-4xl">🎬</motion.div>
        <motion.div animate={{ y: [0, 15, 0], rotate: [0, -10, 10, 0] }} transition={{ repeat: Infinity, duration: 5.5, ease: "easeInOut" }} className="absolute top-[75%] right-[10%] text-3xl">🍿</motion.div>
      </div>

      <div className="px-4 pt-12 pb-4 bg-[var(--color-offwhite)]/80 backdrop-blur-xl z-10 sticky top-0 flex items-center justify-center">
        <button onClick={onBack} className="absolute left-4 p-2 text-[var(--color-ios-blue)] flex items-center gap-1">
          <ArrowLeft className="w-5 h-5" />
          <span className="text-[17px]">Back</span>
        </button>
        <h2 className="font-semibold text-[17px] text-[var(--color-charcoal)]">
          Choose Path
        </h2>
      </div>

      <motion.div 
        className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-4 justify-center pb-12 relative z-10"
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: { staggerChildren: 0.15, delayChildren: 0.1 }
          }
        }}
        initial="hidden"
        animate="show"
      >
        <motion.button
          variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: "spring", bounce: 0.4 } } }}
          whileTap={{ scale: 0.96 }}
          onClick={() => onSelect('eat')}
          className="bg-white p-6 rounded-3xl shadow-sm flex flex-col items-center text-center gap-4 relative overflow-hidden group border border-[var(--color-border)] hover:border-[var(--color-coral)]/30 transition-colors"
        >
          <motion.div 
            animate={{ y: [0, -5, 0] }} 
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="w-16 h-16 bg-[var(--color-coral)]/10 rounded-full flex items-center justify-center group-hover:bg-[var(--color-coral)]/20 transition-colors duration-300"
          >
            <Search className="w-8 h-8 text-[var(--color-coral)]" />
          </motion.div>
          <div>
            <h3 className="font-semibold text-[20px] text-[var(--color-charcoal)] mb-1">Find Food Now</h3>
            <p className="text-[var(--color-charcoal-light)] text-[15px]">Answer a few quick questions and let us pick the perfect spot for your current vibe.</p>
          </div>
        </motion.button>

        <motion.button
          variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: "spring", bounce: 0.4 } } }}
          whileTap={{ scale: 0.96 }}
          onClick={() => onSelect('browse')}
          className="bg-white p-6 rounded-3xl shadow-sm flex flex-col items-center text-center gap-4 relative overflow-hidden group border border-[var(--color-border)] hover:border-[var(--color-ios-blue)]/30 transition-colors"
        >
          <motion.div 
            animate={{ scale: [1, 1.1, 1] }} 
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="w-16 h-16 bg-[var(--color-ios-blue)]/10 rounded-full flex items-center justify-center group-hover:bg-[var(--color-ios-blue)]/20 transition-colors duration-300"
          >
            <PlaySquare className="w-8 h-8 text-[var(--color-ios-blue)]" />
          </motion.div>
          <div>
            <h3 className="font-semibold text-[20px] text-[var(--color-charcoal)] mb-1">Get Inspired</h3>
            <p className="text-[var(--color-charcoal-light)] text-[15px]">Not sure what you want? Scroll through mouth-watering videos to find your craving.</p>
          </div>
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

const HungerScreen: React.FC<{ value: number; onChange: (val: number) => void; onNext: () => void; onBack: () => void }> = ({ value, onChange, onNext, onBack }) => {
  let label = "";
  let emoji = "";
  let color = "";
  let subtext = "";

  if (value < 33) {
    label = "Just a Nibble";
    emoji = "🥨";
    color = "text-yellow-600";
    subtext = "Looking for a light snack or drink.";
  } else if (value < 66) {
    label = "Ready to Eat";
    emoji = "😋";
    color = "text-orange-500";
    subtext = "A standard meal sounds perfect right now.";
  } else {
    label = "Starving!";
    emoji = "🤤";
    color = "text-red-500";
    subtext = "I need food NOW. Give me everything.";
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex-1 flex flex-col h-full bg-[var(--color-offwhite)] relative overflow-hidden"
    >
      {/* Background Floating Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30 z-0">
        <motion.div animate={{ y: [0, -15, 0], rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }} className="absolute top-[30%] left-[5%] text-4xl drop-shadow-sm">🍔</motion.div>
        <motion.div animate={{ y: [0, 20, 0], rotate: [0, -15, 15, 0] }} transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }} className="absolute top-[40%] right-[5%] text-5xl drop-shadow-sm">🍕</motion.div>
        <motion.div animate={{ y: [0, -20, 0], rotate: [0, 20, -20, 0] }} transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }} className="absolute top-[70%] left-[8%] text-4xl drop-shadow-sm">🍜</motion.div>
        <motion.div animate={{ y: [0, 15, 0], rotate: [0, -10, 10, 0] }} transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }} className="absolute top-[80%] right-[8%] text-4xl drop-shadow-sm">🍟</motion.div>
        <motion.div animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }} transition={{ repeat: Infinity, duration: 5.5, ease: "easeInOut" }} className="absolute top-[55%] left-[20%] text-3xl drop-shadow-sm opacity-50">🍣</motion.div>
        <motion.div animate={{ y: [0, 20, 0], rotate: [0, -12, 12, 0] }} transition={{ repeat: Infinity, duration: 4.8, ease: "easeInOut" }} className="absolute top-[48%] right-[20%] text-3xl drop-shadow-sm opacity-50">🍦</motion.div>
      </div>

      <div className="px-4 pt-12 pb-4 bg-[var(--color-offwhite)]/80 backdrop-blur-xl z-10 sticky top-0 flex items-center justify-center border-b border-[var(--color-border)]">
        <button onClick={onBack} className="absolute left-4 p-2 text-[var(--color-ios-blue)] flex items-center gap-1">
          <ArrowLeft className="w-5 h-5" />
          <span className="text-[17px]">Back</span>
        </button>
        <h2 className="font-semibold text-[17px] text-[var(--color-charcoal)]">
          How hungry are you?
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col justify-center items-center pb-24 relative z-10">
        
        <motion.div
          key={emoji}
          initial={{ scale: 0.5, opacity: 0, rotate: -20 }}
          animate={{ 
            scale: [1, 1.1, 1], 
            opacity: 1, 
            rotate: [0, 5, -5, 0] 
          }}
          transition={{ 
            type: "spring", bounce: 0.6,
            scale: { repeat: Infinity, duration: 2 },
            rotate: { repeat: Infinity, duration: 2 }
          }}
          className="text-[100px] mt-12 mb-6 drop-shadow-2xl"
        >
          {emoji}
        </motion.div>
        
        <h3 className={`font-semibold text-[28px] mb-2 ${color} transition-colors duration-300`}>
          {label}
        </h3>
        <p className="text-[var(--color-charcoal-light)] text-center mb-8 text-[17px]">
          {subtext}
        </p>

        <div className="w-full bg-white p-6 rounded-3xl shadow-sm border border-[var(--color-border)]">
          <HungerSlider value={value} onChange={onChange} />
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[var(--color-offwhite)] via-[var(--color-offwhite)]/90 to-transparent pt-12 z-20">
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={onNext}
          className="w-full bg-gradient-to-b from-[#FF6B55] to-[#E63E26] text-white font-bold py-4 px-6 rounded-2xl shadow-[0_10px_20px_rgba(255,75,51,0.4),inset_0_2px_0_rgba(255,255,255,0.4)] border-b-[4px] border-[#C22E15] active:border-b-[0px] active:translate-y-[4px] flex items-center justify-center gap-2 text-[17px] transition-all"
        >
          <span className="drop-shadow-sm">Next</span>
          <ChevronRight className="w-5 h-5 drop-shadow-sm" />
        </motion.button>
      </div>
    </motion.div>
  );
};

const MainScreen: React.FC<{ initialValues: any; onSubmit: (data: any) => void; onBack: () => void }> = ({ initialValues, onSubmit, onBack }) => {
  const [cuisines, setCuisines] = useState<string[]>(initialValues.cuisines || []);
  const [price, setPrice] = useState<string[]>(initialValues.price ? [initialValues.price] : ['$$']);
  const [purposes, setPurposes] = useState<string[]>(initialValues.purposes || []);
  const [location, setLocation] = useState(initialValues.location || '');
  const [isLocating, setIsLocating] = useState(false);
  const [userCoords, setUserCoords] = useState<{lat: number, lng: number} | null>(initialValues.userCoords || null);

  const cuisineOptions = ['Chinese', 'Korean', 'Western', 'Japanese', 'Local', 'Halal'];
  const priceOptions = ['$', '$$', '$$$', '$$$$'];
  const purposeOptions = ['Quick Bite', 'Romantic Date', '打卡为目的 (Instagrammable)', 'Comfort Food'];

  const handleGetLocation = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserCoords({ lat: position.coords.latitude, lng: position.coords.longitude });
          setLocation('Current Location (Accuracy: High)');
          setIsLocating(false);
        },
        (error) => {
          console.error(error);
          setIsLocating(false);
          alert('Could not get location. Please enter manually.');
        }
      );
    } else {
      setIsLocating(false);
      alert('Geolocation not supported.');
    }
  };

  const handleSubmit = () => {
    onSubmit({
      cuisines,
      price: price[0],
      purposes,
      location: location || 'Nearby',
      userCoords
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex-1 flex flex-col h-full bg-[var(--color-offwhite)] relative"
    >
      <div className="px-4 pt-12 pb-4 bg-[var(--color-offwhite)]/80 backdrop-blur-xl z-10 sticky top-0 flex items-center justify-center border-b border-[var(--color-border)]">
        <button onClick={onBack} className="absolute left-4 p-2 text-[var(--color-ios-blue)] flex items-center gap-1">
          <ArrowLeft className="w-5 h-5" />
          <span className="text-[17px]">Back</span>
        </button>
        <h2 className="font-semibold text-[17px] text-[var(--color-charcoal)]">
          What's the vibe?
        </h2>
      </div>

      {/* Background Floating Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.15] z-0">
        <motion.div animate={{ y: [0, -20, 0], rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }} className="absolute top-[15%] right-[10%] text-4xl">✨</motion.div>
        <motion.div animate={{ y: [0, 20, 0], rotate: [0, -15, 15, 0] }} transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }} className="absolute top-[40%] left-[5%] text-5xl">🔥</motion.div>
        <motion.div animate={{ y: [0, -15, 0], rotate: [0, 20, -20, 0] }} transition={{ repeat: Infinity, duration: 7, ease: "easeInOut" }} className="absolute top-[70%] right-[15%] text-4xl">🎉</motion.div>
        <motion.div animate={{ y: [0, 15, 0], rotate: [0, -10, 10, 0] }} transition={{ repeat: Infinity, duration: 5.5, ease: "easeInOut" }} className="absolute top-[85%] left-[10%] text-3xl">📍</motion.div>
      </div>

      <motion.div 
        className="flex-1 overflow-y-auto px-6 py-6 space-y-8 pb-40 relative z-10"
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: { staggerChildren: 0.15, delayChildren: 0.1 }
          }
        }}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={{ hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0, transition: { type: "spring" } } }}>
          <h3 className="font-semibold text-[17px] text-[var(--color-charcoal)] mb-3 flex items-center gap-2">
            <motion.div animate={{ rotate: [0, 15, -15, 0] }} transition={{ repeat: Infinity, duration: 2 }}><Utensils className="w-5 h-5 text-[var(--color-ios-blue)]" /></motion.div>
            Cuisine
          </h3>
          <ChipGroup options={cuisineOptions} selected={cuisines} onChange={setCuisines} />
        </motion.div>

        <motion.div variants={{ hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0, transition: { type: "spring" } } }}>
          <h3 className="font-semibold text-[17px] text-[var(--color-charcoal)] mb-3 flex items-center gap-2">
            <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}><DollarSign className="w-5 h-5 text-[#34C759]" /></motion.div>
            Price Range
          </h3>
          <ChipGroup options={priceOptions} selected={price} onChange={setPrice} multi={false} />
        </motion.div>

        <motion.div variants={{ hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0, transition: { type: "spring" } } }}>
          <h3 className="font-semibold text-[17px] text-[var(--color-charcoal)] mb-3 flex items-center gap-2">
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }}><Target className="w-5 h-5 text-[#AF52DE]" /></motion.div>
            Purpose
          </h3>
          <ChipGroup options={purposeOptions} selected={purposes} onChange={setPurposes} />
        </motion.div>

        <motion.div variants={{ hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0, transition: { type: "spring" } } }}>
          <h3 className="font-semibold text-[17px] text-[var(--color-charcoal)] mb-3 flex items-center gap-2">
            <motion.div animate={{ y: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}><MapPin className="w-5 h-5 text-[var(--color-coral)]" /></motion.div>
            Location
          </h3>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="text" 
                placeholder="Enter manually..." 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-[var(--color-border)] rounded-xl text-[17px] text-[var(--color-charcoal)] focus:outline-none focus:ring-2 focus:ring-[var(--color-ios-blue)] transition-all shadow-sm"
              />
            </div>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={handleGetLocation}
              disabled={isLocating}
              className="px-4 py-3 bg-white text-[var(--color-ios-blue)] rounded-xl border border-[var(--color-border)] flex items-center justify-center disabled:opacity-50 transition-all shadow-sm"
            >
              {isLocating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Navigation className="w-5 h-5" />}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>

      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[var(--color-offwhite)] via-[var(--color-offwhite)]/90 to-transparent pt-12 z-20">
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={handleSubmit}
          className="w-full bg-gradient-to-b from-[#FF6B55] to-[#E63E26] text-white font-bold py-4 px-6 rounded-2xl shadow-[0_10px_20px_rgba(255,75,51,0.4),inset_0_2px_0_rgba(255,255,255,0.4)] border-b-[4px] border-[#C22E15] active:border-b-[0px] active:translate-y-[4px] flex items-center justify-center gap-2 text-[17px] transition-all"
        >
          <Search className="w-5 h-5 drop-shadow-sm" />
          <span className="drop-shadow-sm">Find Food</span>
        </motion.button>
      </div>
    </motion.div>
  );
};

const LoadingScreen: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-[#FF6B55] via-[#E63E26] to-[#991b1b] text-white overflow-hidden rounded-[inherit]"
    >
      {/* Floating Elements */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-white/20"
          initial={{ 
            x: (Math.random() - 0.5) * 400, 
            y: (Math.random() - 0.5) * 800,
            scale: Math.random() * 0.5 + 0.5,
            rotate: 0
          }}
          animate={{ 
            y: [null, (Math.random() - 0.5) * 800 - 200],
            rotate: 360
          }}
          transition={{ 
            duration: Math.random() * 5 + 5,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          {i % 3 === 0 ? <Utensils size={48} /> : i % 3 === 1 ? <Star size={48} /> : <Search size={48} />}
        </motion.div>
      ))}

      <motion.div
        animate={{ 
          y: [0, -20, 0],
          scale: [1, 1.05, 1]
        }}
        transition={{ 
          repeat: Infinity, 
          duration: 2,
          ease: "easeInOut"
        }}
        className="relative mb-10 z-10"
      >
        <div className="absolute inset-0 bg-white/40 blur-3xl rounded-full animate-pulse" />
        <div className="relative w-32 h-32 bg-gradient-to-b from-white to-gray-100 rounded-full flex items-center justify-center mx-auto shadow-[0_20px_40px_rgba(0,0,0,0.3),inset_0_4px_0_rgba(255,255,255,1)] border-b-[6px] border-gray-200">
          <Utensils className="w-14 h-14 text-[var(--color-coral)] drop-shadow-md" />
        </div>
      </motion.div>
      <h2 className="font-semibold text-[28px] mb-4 drop-shadow-lg z-10">
        Consulting the Foodie Gods...
      </h2>
      <p className="text-white/90 text-[17px] font-medium drop-shadow-md z-10">
        Finding the perfect match for your vibe.
      </p>
    </motion.div>
  );
};

const RestaurantCard: React.FC<{ rec: Recommendation; onSelect: () => void; index?: number }> = ({ rec, onSelect, index = 0 }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showVideo, setShowVideo] = useState(false);

  const toggleMedia = () => {
    if (!scrollRef.current) return;
    const newShowVideo = !showVideo;
    setShowVideo(newShowVideo);
    if (newShowVideo) {
      scrollRef.current.scrollTo({ left: scrollRef.current.offsetWidth, behavior: 'smooth' });
    } else {
      scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
  };

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const scrollLeft = scrollRef.current.scrollLeft;
    const width = scrollRef.current.offsetWidth;
    if (scrollLeft > width / 2 && !showVideo) {
      setShowVideo(true);
    } else if (scrollLeft <= width / 2 && showVideo) {
      setShowVideo(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.15, type: 'spring', bounce: 0.4 }}
      className="bg-white rounded-3xl p-5 shadow-sm border border-[var(--color-border)] overflow-hidden relative"
    >
      <div className="relative h-[300px] -mx-5 -mt-5 mb-4 group overflow-hidden">
        <div 
          ref={scrollRef} 
          onScroll={handleScroll}
          className="flex w-full h-full overflow-x-auto snap-x snap-mandatory scrollbar-hide" 
          style={{ scrollBehavior: 'smooth' }}
        >
          <div className="w-full shrink-0 h-full snap-center relative">
            <img src={rec.imageUrl} alt={rec.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" crossOrigin="anonymous" />
          </div>
          <div className="w-full shrink-0 h-full snap-center relative bg-black">
            <video src={rec.videoUrl} autoPlay loop muted playsInline className="w-full h-full object-cover opacity-90" crossOrigin="anonymous" />
          </div>
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
        
        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end pointer-events-none">
          <button onClick={onSelect} className="text-left group pointer-events-auto">
            <h3 className="font-semibold text-[22px] text-white leading-tight flex items-center gap-1">
              {rec.name} <ChevronRight className="w-5 h-5" />
            </h3>
            <span className="text-[13px] text-white/90 font-medium">Tap to view menu & order</span>
          </button>
          <div className="flex items-center gap-1 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg pointer-events-auto">
            <Star className="w-3.5 h-3.5 fill-[#FF9500] text-[#FF9500]" />
            <span className="font-semibold text-[13px] text-[var(--color-charcoal)]">{rec.rating}</span>
          </div>
        </div>

        <button onClick={toggleMedia} className="absolute top-4 right-4 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-[13px] font-medium flex items-center gap-1.5 z-10 pointer-events-auto">
          {showVideo ? <><ImageIcon className="w-3.5 h-3.5" /> Photo</> : <><PlayCircle className="w-3.5 h-3.5" /> Video</>}
        </button>

        {/* Swipe Hint */}
        <div className="absolute top-1/2 right-2 -translate-y-1/2 bg-black/30 backdrop-blur-sm rounded-full p-1 pointer-events-none animate-pulse">
          <ChevronRight className="w-4 h-4 text-white" />
        </div>
      </div>
      
      <div className="flex gap-2 mb-4 flex-wrap">
        <span className="text-[13px] font-medium px-2.5 py-1 bg-[#34C759]/10 text-[#34C759] rounded-lg flex items-center gap-1">
          <Target className="w-3.5 h-3.5" /> {rec.matchPercentage}% Match
        </span>
        <span className="text-[13px] font-medium px-2.5 py-1 bg-[var(--color-ios-blue)]/10 text-[var(--color-ios-blue)] rounded-lg flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5" /> {rec.distance < 1000 ? `${rec.distance}m` : `${(rec.distance / 1000).toFixed(1)}km`}
        </span>
        <span className="text-[13px] font-medium px-2.5 py-1 bg-gray-100 text-[var(--color-charcoal)] rounded-lg">{rec.cuisine}</span>
        <span className="text-[13px] font-medium px-2.5 py-1 bg-gray-100 text-[var(--color-charcoal)] rounded-lg">{rec.price}</span>
      </div>

      <div className="bg-[var(--color-offwhite)] p-4 rounded-2xl mb-5">
        <p className="text-[15px] text-[var(--color-charcoal)] leading-relaxed">
          <span className="font-semibold text-[var(--color-ios-blue)] mr-1">Why it fits:</span>
          {rec.analysis}
        </p>
      </div>

      <div className="flex gap-2">
        <a href={`https://www.google.com/maps/dir/?api=1&destination=${rec.lat && rec.lng ? `${rec.lat},${rec.lng}` : encodeURIComponent(rec.name)}&travelmode=walking`} target="_blank" rel="noopener noreferrer" className="flex-1 bg-gray-100 text-[var(--color-charcoal)] font-medium py-2.5 px-2 rounded-xl flex flex-col items-center justify-center gap-1 text-[13px]">
          <Footprints className="w-4 h-4" /> Walk
        </a>
        <a href={`https://www.google.com/maps/dir/?api=1&destination=${rec.lat && rec.lng ? `${rec.lat},${rec.lng}` : encodeURIComponent(rec.name)}&travelmode=driving`} target="_blank" rel="noopener noreferrer" className="flex-1 bg-gray-100 text-[var(--color-charcoal)] font-medium py-2.5 px-2 rounded-xl flex flex-col items-center justify-center gap-1 text-[13px]">
          <Car className="w-4 h-4" /> Drive
        </a>
        <a href={`https://www.google.com/search?q=${encodeURIComponent(rec.name + ' booking')}`} target="_blank" rel="noopener noreferrer" className="flex-1 bg-[var(--color-ios-blue)] text-white font-medium py-2.5 px-2 rounded-xl flex flex-col items-center justify-center gap-1 text-[13px]">
          <Calendar className="w-4 h-4" /> Book
        </a>
      </div>
    </motion.div>
  );
};

const mockMenu = [
  { id: 'm1', name: 'Signature Dish', description: 'Chef\'s special preparation with local ingredients', price: 24.99 },
  { id: 'm2', name: 'Classic Appetizer', description: 'Perfect for sharing, served with house dip', price: 12.99 },
  { id: 'm3', name: 'House Salad', description: 'Fresh local greens with vinaigrette', price: 9.99 },
  { id: 'm4', name: 'Premium Main', description: 'High quality ingredients, cooked to perfection', price: 34.99 },
  { id: 'm5', name: 'Craft Beverage', description: 'Refreshing house-made drink', price: 6.99 },
];

const MenuScreen: React.FC<{ restaurant: Recommendation; onBack: () => void }> = ({ restaurant, onBack }) => {
  const [cart, setCart] = useState<Record<string, number>>({});
  const [isOrdering, setIsOrdering] = useState(false);
  
  const addToCart = (id: string) => setCart(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  const removeFromCart = (id: string) => setCart(prev => {
    const newCart = { ...prev };
    if (newCart[id] > 1) newCart[id]--;
    else delete newCart[id];
    return newCart;
  });

  const total = mockMenu.reduce((sum, item) => sum + (cart[item.id] || 0) * item.price, 0);
  const itemCount = Object.values(cart).reduce((sum, count) => sum + count, 0);

  const handleOrder = () => {
    setIsOrdering(true);
    setTimeout(() => {
      alert('Order placed successfully! Your food will be ready for pickup in 20 minutes.');
      setIsOrdering(false);
      setCart({});
      onBack();
    }, 1500);
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 flex flex-col h-full bg-[var(--color-offwhite)] relative">
      <div className="px-4 pt-12 pb-4 bg-[var(--color-offwhite)]/80 backdrop-blur-xl z-10 sticky top-0 flex items-center justify-center border-b border-[var(--color-border)]">
        <button onClick={onBack} className="absolute left-4 p-2 text-[var(--color-ios-blue)] flex items-center gap-1">
          <ArrowLeft className="w-5 h-5" />
          <span className="text-[17px]">Back</span>
        </button>
        <div className="text-center">
          <h2 className="font-semibold text-[17px] text-[var(--color-charcoal)] leading-tight">{restaurant.name}</h2>
          <p className="text-[11px] font-medium text-[var(--color-charcoal-light)]">Pickup Order</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-4 pb-32">
        {mockMenu.map(item => (
          <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border border-[var(--color-border)] flex justify-between items-center gap-4">
            <div className="flex-1">
              <h4 className="font-semibold text-[17px] text-[var(--color-charcoal)]">{item.name}</h4>
              <p className="text-[13px] text-[var(--color-charcoal-light)] mt-1 mb-2 line-clamp-2">{item.description}</p>
              <span className="font-semibold text-[15px] text-[var(--color-charcoal)]">${item.price.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-3 bg-[var(--color-offwhite)] rounded-full p-1 border border-[var(--color-border)]">
              {cart[item.id] ? (
                <>
                  <button onClick={() => removeFromCart(item.id)} className="w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-sm text-[var(--color-charcoal)] hover:text-[var(--color-coral)] transition-colors"><Minus className="w-4 h-4" /></button>
                  <span className="font-semibold text-[15px] w-4 text-center">{cart[item.id]}</span>
                  <button onClick={() => addToCart(item.id)} className="w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-sm text-[var(--color-charcoal)] hover:text-[#34C759] transition-colors"><Plus className="w-4 h-4" /></button>
                </>
              ) : (
                <button onClick={() => addToCart(item.id)} className="px-4 py-1.5 font-semibold text-[15px] text-[var(--color-ios-blue)] hover:bg-[var(--color-ios-blue)]/10 rounded-full transition-colors">Add</button>
              )}
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {total > 0 && (
          <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[var(--color-offwhite)] via-[var(--color-offwhite)]/90 to-transparent pt-12 z-20">
            <button onClick={handleOrder} disabled={isOrdering} className="w-full bg-gradient-to-b from-[#FF6B55] to-[#E63E26] text-white font-bold py-4 px-6 rounded-2xl shadow-[0_10px_20px_rgba(255,75,51,0.4),inset_0_2px_0_rgba(255,255,255,0.4)] border-b-[4px] border-[#C22E15] active:border-b-[0px] active:translate-y-[4px] flex items-center justify-between text-[17px] transition-all disabled:opacity-70">
              <div className="flex items-center gap-2 drop-shadow-sm">
                {isOrdering ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShoppingCart className="w-5 h-5" />}
                <span>{isOrdering ? 'Processing...' : `Place Order (${itemCount})`}</span>
              </div>
              <span className="drop-shadow-sm">${total.toFixed(2)}</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const RecommendationsScreen: React.FC<{ 
  recommendations: Recommendation[];
  onBack: () => void;
  onStartOver: () => void;
  onSelectRestaurant: (rec: Recommendation) => void;
}> = ({ recommendations, onBack, onStartOver, onSelectRestaurant }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex-1 flex flex-col h-full bg-[var(--color-offwhite)]"
    >
      <div className="px-4 pt-12 pb-4 bg-[var(--color-offwhite)]/80 backdrop-blur-xl z-10 sticky top-0 flex items-center justify-center border-b border-[var(--color-border)]">
        <button onClick={onBack} className="absolute left-4 p-2 text-[var(--color-ios-blue)] flex items-center gap-1">
          <ArrowLeft className="w-5 h-5" />
          <span className="text-[17px]">Back</span>
        </button>
        <h2 className="font-semibold text-[17px] text-[var(--color-charcoal)]">
          Your Matches
        </h2>
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={onStartOver} 
          className="absolute right-4 text-[17px] font-medium text-[var(--color-ios-blue)]"
        >
          Restart
        </motion.button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6 pb-12">
        {recommendations.map((rec, index) => (
          <RestaurantCard 
            key={rec.id} 
            rec={rec} 
            index={index} 
            onSelect={() => onSelectRestaurant(rec)} 
          />
        ))}
      </div>
    </motion.div>
  );
};

const FeedItem: React.FC<{ rec: Recommendation; onOrder: () => void }> = ({ rec, onOrder }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        videoRef.current?.play().catch(() => {});
      } else {
        videoRef.current?.pause();
      }
    }, { threshold: 0.6 });
    
    if (videoRef.current) observer.observe(videoRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="w-full h-full snap-start relative bg-black flex-shrink-0">
      <video 
        ref={videoRef} 
        src={rec.videoUrl} 
        loop 
        muted 
        playsInline 
        crossOrigin="anonymous" 
        className="w-full h-full object-cover opacity-90" 
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/40 pointer-events-none" />
      
      {/* Right Action Bar */}
      <div className="absolute right-4 bottom-24 flex flex-col items-center gap-6 z-10">
        <button onClick={() => setIsLiked(!isLiked)} className="flex flex-col items-center gap-1 group">
          <div className="w-12 h-12 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 group-active:scale-90 transition-all">
            <Heart className={`w-6 h-6 ${isLiked ? 'fill-[#FF3B30] text-[#FF3B30]' : 'text-white'}`} />
          </div>
          <span className="text-white text-[11px] font-semibold drop-shadow-md">{isLiked ? '12.4k' : '12.3k'}</span>
        </button>
        <button className="flex flex-col items-center gap-1 group">
          <div className="w-12 h-12 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 group-active:scale-90 transition-all">
            <Share2 className="w-6 h-6 text-white" />
          </div>
          <span className="text-white text-[11px] font-semibold drop-shadow-md">Share</span>
        </button>
        <button onClick={onOrder} className="flex flex-col items-center gap-1 group mt-4">
          <div className="w-14 h-14 bg-gradient-to-br from-[#FF6B55] to-[#E63E26] rounded-full flex items-center justify-center shadow-[0_4px_15px_rgba(255,107,85,0.5)] border-2 border-white group-active:scale-90 transition-all animate-pulse">
            <Utensils className="w-6 h-6 text-white drop-shadow-md" />
          </div>
          <span className="text-[var(--color-coral)] text-[11px] font-bold drop-shadow-md bg-white/90 px-2 py-0.5 rounded-full">EAT HERE</span>
        </button>
      </div>

      {/* Bottom Info */}
      <div className="absolute bottom-6 left-4 right-20 z-10">
        <h2 className="font-semibold text-[28px] text-white mb-2 drop-shadow-lg leading-tight">{rec.name}</h2>
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="text-[13px] font-medium px-2.5 py-1 bg-white/20 backdrop-blur-md text-white rounded-lg border border-white/30 flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-[#FF9500] text-[#FF9500]" /> {rec.rating}
          </span>
          <span className="text-[13px] font-medium px-2.5 py-1 bg-white/20 backdrop-blur-md text-white rounded-lg border border-white/30">
            {rec.cuisine}
          </span>
          <span className="text-[13px] font-medium px-2.5 py-1 bg-white/20 backdrop-blur-md text-white rounded-lg border border-white/30">
            {rec.price}
          </span>
          <span className="text-[13px] font-medium px-2.5 py-1 bg-white/20 backdrop-blur-md text-white rounded-lg border border-white/30 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" /> {rec.distance < 1000 ? `${rec.distance}m` : `${(rec.distance / 1000).toFixed(1)}km`}
          </span>
        </div>
        <p className="text-white/90 text-[15px] font-medium line-clamp-2 drop-shadow-md">
          {rec.analysis}
        </p>
      </div>
    </div>
  );
};

const FeedScreen: React.FC<{ onBack: () => void; onSelectRestaurant: (rec: Recommendation) => void }> = ({ onBack, onSelectRestaurant }) => {
  // Generate feed data once
  const [feedItems] = useState<Recommendation[]>(() => {
    const shuffled = [...restaurantDb].sort(() => 0.5 - Math.random());
    return shuffled.map(r => ({
      ...r,
      distance: Math.floor(Math.random() * 2500) + 100,
      matchPercentage: 85 + Math.floor(Math.random() * 14),
      analysis: `People are loving the signature dishes at ${r.name}. A must-try for ${r.cuisine} fans!`
    }));
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col h-full bg-black relative overflow-hidden"
    >
      {/* Top Navigation Overlay */}
      <div className="absolute top-0 left-0 right-0 p-6 z-50 flex items-center justify-between pointer-events-none">
        <button onClick={onBack} className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 pointer-events-auto hover:bg-black/60 transition-colors">
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div className="flex items-center gap-1 text-white/90 font-semibold drop-shadow-md pointer-events-auto text-[17px]">
          <Compass className="w-5 h-5" /> For You
        </div>
        <div className="w-10" /> {/* Spacer for centering */}
      </div>

      {/* Scrollable Feed */}
      <div className="w-full h-full overflow-y-auto snap-y snap-mandatory scrollbar-hide flex flex-col">
        {feedItems.map(rec => (
          <FeedItem key={rec.id} rec={rec} onOrder={() => onSelectRestaurant(rec)} />
        ))}
      </div>
    </motion.div>
  );
};

// --- Main App ---

export default function App() {
  const [screen, setScreen] = useState<Screen>('auth');
  const [menuSource, setMenuSource] = useState<'results' | 'feed'>('results');
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Recommendation | null>(null);
  const [searchParams, setSearchParams] = useState({
    hunger: 60,
    cuisines: [] as string[],
    price: '$$',
    purposes: [] as string[],
    location: '',
    userCoords: null as {lat: number, lng: number} | null
  });

  const handleLogin = () => {
    setScreen('mode_select');
  };

  const handleModeSelect = (mode: 'eat' | 'browse') => {
    if (mode === 'eat') {
      setScreen('hunger');
    } else {
      setScreen('feed');
    }
  };

  const handleSearch = async (data: any) => {
    const finalParams = { ...searchParams, ...data };
    setSearchParams(finalParams);
    setScreen('loading');
    try {
      const results = await mockFetchRecommendations(
        finalParams.hunger,
        finalParams.cuisines,
        finalParams.price,
        finalParams.purposes,
        finalParams.location,
        finalParams.userCoords
      );
      setRecommendations(results);
      setScreen('results');
    } catch (error) {
      console.error(error);
      setScreen('main');
    }
  };

  return (
    <AppShell>
      <AnimatePresence mode="wait">
        {screen === 'auth' && <AuthScreen key="auth" onLogin={handleLogin} />}
        {screen === 'mode_select' && (
          <ModeSelectionScreen 
            key="mode_select" 
            onSelect={handleModeSelect} 
            onBack={() => setScreen('auth')} 
          />
        )}
        {screen === 'hunger' && (
          <HungerScreen 
            key="hunger" 
            value={searchParams.hunger} 
            onChange={(val) => setSearchParams(prev => ({ ...prev, hunger: val }))} 
            onNext={() => setScreen('main')} 
            onBack={() => setScreen('mode_select')}
          />
        )}
        {screen === 'main' && (
          <MainScreen 
            key="main" 
            initialValues={searchParams}
            onSubmit={handleSearch} 
            onBack={() => setScreen('hunger')}
          />
        )}
        {screen === 'loading' && <LoadingScreen key="loading" />}
        {screen === 'results' && (
          <RecommendationsScreen 
            key="results" 
            recommendations={recommendations} 
            onBack={() => setScreen('main')} 
            onStartOver={() => setScreen('mode_select')}
            onSelectRestaurant={(rec) => {
              setSelectedRestaurant(rec);
              setMenuSource('results');
              setScreen('menu');
            }}
          />
        )}
        {screen === 'feed' && (
          <FeedScreen 
            key="feed" 
            onBack={() => setScreen('mode_select')}
            onSelectRestaurant={(rec) => {
              setSelectedRestaurant(rec);
              setMenuSource('feed');
              setScreen('menu');
            }}
          />
        )}
        {screen === 'menu' && selectedRestaurant && (
          <MenuScreen 
            key="menu" 
            restaurant={selectedRestaurant} 
            onBack={() => setScreen(menuSource)} 
          />
        )}
      </AnimatePresence>
    </AppShell>
  );
}
