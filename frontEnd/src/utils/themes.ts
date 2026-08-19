export interface GammaTheme {
  id: string;
  name: string;
  category: string;
  style: string;
  gradient: string; // Used for UI preview
  colors: string[];
}

export const THEME_CATEGORIES = [
  'All',
  'Professional',
  'Creative',
  'Bold',
  'Elegant',
  'Warm',
  'Soft',
  'Unique'
];

export const GAMMA_THEMES: GammaTheme[] = [
  // Professional / Corporate
  { id: 'default-dark', name: 'Basic Dark', category: 'Professional', style: 'Serious, Formal', gradient: 'bg-slate-900', colors: ['#000000', '#3b82f6', '#a855f7'] },
  { id: 'default-light', name: 'Basic Light', category: 'Professional', style: 'Corporate, Tech', gradient: 'bg-slate-100', colors: ['#3b82f6', '#ffffff', '#1e3a8a'] },
  { id: 'ash', name: 'Ash', category: 'Professional', style: 'Geometric, Formal', gradient: 'bg-zinc-800', colors: ['#000000', '#ffffff', '#71717a'] },
  { id: 'coal', name: 'Coal', category: 'Professional', style: 'Serious, Corporate', gradient: 'bg-gray-950', colors: ['#4b5563', '#ffffff', '#111827'] },
  { id: 'chimney-smoke', name: 'Chimney Smoke', category: 'Professional', style: 'Elegant, Subtle', gradient: 'bg-gray-200', colors: ['#ffffff', '#c0c0c0', '#e5e7eb'] },
  { id: 'commons', name: 'Commons', category: 'Professional', style: 'Professional, Tech', gradient: 'bg-gray-100', colors: ['#f3f4f6', '#22c55e'] },
  { id: 'consultant', name: 'Consultant', category: 'Professional', style: 'Consulting, Business', gradient: 'bg-sky-50', colors: ['#e0f2fe', '#ffffff'] },
  { id: 'founder', name: 'Founder', category: 'Professional', style: 'Serious, Professional', gradient: 'bg-black', colors: ['#000000', '#3b82f6'] },
  { id: 'gleam', name: 'Gleam', category: 'Professional', style: 'Serious, Tech', gradient: 'bg-neutral-300', colors: ['#d4d4d4', '#c0c0c0'] },
  { id: 'howlite', name: 'Howlite', category: 'Professional', style: 'Corporate, Elegant', gradient: 'bg-white', colors: ['#ffffff', '#000000'] },

  // Modern / Creative
  { id: 'aurora', name: 'Aurora', category: 'Creative', style: 'Futuristic, Creative', gradient: 'bg-gradient-to-r from-purple-600 to-pink-500', colors: ['#000000', '#a855f7', '#3b82f6', '#d946ef'] },
  { id: 'gamma', name: 'Gamma', category: 'Creative', style: 'Playful, Modern', gradient: 'bg-gradient-to-r from-orange-400 to-pink-400', colors: ['#fb923c', '#f472b6'] },
  { id: 'gamma-dark', name: 'Gamma Dark', category: 'Creative', style: 'Playful, Vibrant', gradient: 'bg-indigo-950', colors: ['#1e1b4b', '#fb923c'] },
  { id: 'atmosphere', name: 'Atmosphere', category: 'Creative', style: 'Feminine, Playful', gradient: 'bg-gradient-to-br from-orange-400 via-pink-400 to-purple-500', colors: ['#fb923c', '#f472b6', '#a855f7'] },
  { id: 'electric', name: 'Electric', category: 'Creative', style: 'Professional, Bold', gradient: 'bg-gradient-to-tr from-gray-900 to-purple-900', colors: ['#000000', '#fb923c', '#f472b6', '#a855f7'] },
  { id: 'elysia', name: 'Elysia', category: 'Creative', style: 'Playful, Pastel', gradient: 'bg-gradient-to-r from-blue-200 to-pink-200', colors: ['#bfdbfe', '#fbcfe8'] },
  { id: 'daydream', name: 'Daydream', category: 'Creative', style: 'Soft, Modern', gradient: 'bg-gradient-to-br from-white via-purple-50 to-pink-50', colors: ['#ffffff', '#faf5ff', '#fdf2f8'] },

  // Bold / Vibrant
  { id: 'alien', name: 'Alien', category: 'Bold', style: 'Playful, Bold', gradient: 'bg-black border border-lime-500', colors: ['#39FF14', '#000000'] },
  { id: 'atacama', name: 'Atacama', category: 'Bold', style: 'Playful, High Tech', gradient: 'bg-zinc-900', colors: ['#000000', '#ff007f'] },
  { id: 'blueberry', name: 'Blueberry', category: 'Bold', style: 'Fun, Modern', gradient: 'bg-indigo-600', colors: ['#4f46e5', '#6366f1', '#ec4899'] },
  { id: 'borealis', name: 'Borealis', category: 'Bold', style: 'Futuristic, Creative', gradient: 'bg-navy-900', colors: ['#000080', '#40e0d0', '#39FF14'] },
  { id: 'canaveral', name: 'Canaveral', category: 'Bold', style: 'Bold, Futuristic', gradient: 'bg-black', colors: ['#000000', '#fb923c'] },
  { id: 'fluo', name: 'Fluo', category: 'Bold', style: 'Bold, Futuristic', gradient: 'bg-zinc-950', colors: ['#39FF14', '#000000'] },

  // Elegant / Luxurious
  { id: 'aurum', name: 'Aurum', category: 'Elegant', style: 'Classy, Luxury', gradient: 'bg-gradient-to-br from-yellow-600 to-yellow-900', colors: ['#FFD700', '#000000'] },
  { id: 'gold-leaf', name: 'Gold Leaf', category: 'Elegant', style: 'Classy, Elegant', gradient: 'bg-amber-50', colors: ['#FFD700', '#fdfbd3', '#fffff0'] },
  { id: 'chocolate', name: 'Chocolate', category: 'Elegant', style: 'Warm, Classic', gradient: 'bg-amber-900', colors: ['#451a03', '#f5f5dc'] },
  { id: 'creme', name: 'Creme', category: 'Elegant', style: 'Feminine, Luxury', gradient: 'bg-orange-50', colors: ['#fff7ed', '#f5f5dc'] },
  { id: 'dune', name: 'Dune', category: 'Elegant', style: 'Elegant, Classic', gradient: 'bg-orange-100', colors: ['#ffedd5', '#FFD700'] },
  { id: 'editoria', name: 'Editoria', category: 'Elegant', style: 'Neutral, Professional', gradient: 'bg-stone-800', colors: ['#292524', '#d6d3d1', '#fff7ed'] },
  { id: 'finesse', name: 'Finesse', category: 'Elegant', style: 'Feminine, Floral', gradient: 'bg-stone-100', colors: ['#f5f5f4', '#808000', '#22c55e'] },

  // Warm / Earthy
  { id: 'clementa', name: 'Clementa', category: 'Warm', style: 'Warm, Retro', gradient: 'bg-orange-600', colors: ['#ea580c', '#451a03', '#fbbf24'] },
  { id: 'cornfield', name: 'Cornfield', category: 'Warm', style: 'Vintage, Classic', gradient: 'bg-yellow-100', colors: ['#808000', '#f0e68c', '#e1ad01'] },
  { id: 'flax', name: 'Flax', category: 'Warm', style: 'Soft, Earthy', gradient: 'bg-orange-50', colors: ['#efdecd', '#d2b48c', '#f5f5dc'] },

  // Soft / Friendly
  { id: 'breeze', name: 'Breeze', category: 'Soft', style: 'Simple, Fresh', gradient: 'bg-sky-200', colors: ['#bae6fd', '#f0f9ff', '#ffffff'] },
  { id: 'cornflower', name: 'Cornflower', category: 'Soft', style: 'Friendly, Clean', gradient: 'bg-blue-400', colors: ['#60a5fa', '#ffffff'] },
  { id: 'coral-glow', name: 'Coral Glow', category: 'Soft', style: 'Fresh, Creative', gradient: 'bg-rose-300', colors: ['#ff7f50', '#ffdab9', '#ffe4e1'] },
  { id: 'ashrose', name: 'Ashrose', category: 'Soft', style: 'Iridescent, Soft', gradient: 'bg-rose-50', colors: ['#eae0c8', '#c0c0c0', '#e6e6fa'] },
  { id: 'bubble-gum', name: 'Bubble Gum', category: 'Soft', style: 'Playful, Retro', gradient: 'bg-pink-300', colors: ['#f472b6', '#374151'] },
  { id: 'bee-happy', name: 'Bee Happy', category: 'Soft', style: 'Friendly, Fun', gradient: 'bg-yellow-400', colors: ['#facc15', '#000000'] },

  // Unique / Special
  { id: 'chimney-dust', name: 'Chimney Dust', category: 'Unique', style: 'Serious, High Tech', gradient: 'bg-zinc-700', colors: ['#3f3f46', '#c0c0c0'] },
  { id: 'dawn', name: 'Dawn', category: 'Unique', style: 'Modern, Minimalist', gradient: 'bg-slate-800', colors: ['#334155', '#ffdab9', '#f472b6'] },
  { id: 'chisel', name: 'Chisel', category: 'Unique', style: 'Professional, Earthy', gradient: 'bg-stone-50', colors: ['#ffffff', '#d2b48c', '#f5f5dc'] },
  { id: 'daktilo', name: 'Daktilo', category: 'Unique', style: 'Typewriter, Edgy', gradient: 'bg-orange-50', colors: ['#fff7ed', '#f5f5dc', '#ffdab9'] },
  { id: 'ag4mc9ggtxi8iyi', name: 'Flamingo', category: 'Unique', style: 'Fresh, Organic', gradient: 'bg-rose-400', colors: ['#f472b6', '#ff7f50', '#fb923c'] },
];
