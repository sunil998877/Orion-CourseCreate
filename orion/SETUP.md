# Quick Setup Guide

## Installation Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm start
   ```
   The app will open at [http://localhost:3000](http://localhost:3000)

3. **Build for Production**
   ```bash
   npm run build
   ```

## Project Structure Overview

```
├── public/
│   └── index.html          # HTML template with Tailwind CDN
├── src/
│   ├── components/         # React components
│   │   ├── Header.jsx      # Navigation with mobile menu
│   │   ├── Hero.jsx        # Hero section
│   │   ├── TrustedBy.jsx   # Companies marquee
│   │   ├── CurrentReality.jsx  # Problem/advantage cards
│   │   ├── ROI.jsx         # Charts and counters
│   │   ├── Features.jsx    # Interactive feature tabs
│   │   ├── EvokeDifference.jsx  # EVOKE difference tabs
│   │   ├── GetStarted.jsx  # 3-step process
│   │   ├── Pricing.jsx     # Pricing plans
│   │   ├── Testimonials.jsx  # Testimonials marquee
│   │   └── FinalCTA.jsx    # Final CTA section
│   ├── utils/              # Utility functions and hooks
│   │   ├── animations.js   # Scroll animation utilities
│   │   ├── useScrollAnimation.js  # Scroll animation hook
│   │   └── useCounter.js   # Counter animation hook
│   ├── styles/
│   │   └── index.css       # Global styles and animations
│   ├── App.jsx            # Main app component
│   └── index.js           # Entry point
├── package.json           # Dependencies and scripts
└── README.md              # Full documentation
```

## Key Features Implemented

✅ **Responsive Design** - Mobile-first approach with breakpoints
✅ **Mobile Menu** - Smooth slide-in menu with overlay
✅ **Scroll Animations** - Fade-in effects on scroll
✅ **Interactive Charts** - Chart.js integration for ROI visualization
✅ **Animated Counters** - Number animations on scroll
✅ **Marquee Effects** - Smooth scrolling testimonials and companies
✅ **Feature Tabs** - Interactive feature switching
✅ **Smooth Transitions** - CSS transitions throughout

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Notes

- Tailwind CSS is loaded via CDN in `public/index.html`
- Chart.js is used for data visualization
- All animations use Intersection Observer API for performance
- Mobile menu prevents body scroll when open

