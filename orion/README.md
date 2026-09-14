# AEON Website - React Application

A modern, responsive React website for AEON: The Autonomous Revenue Agent. Built with React, Chart.js, and Tailwind CSS.

## Features

- **Responsive Design**: Fully responsive layout for desktop, tablet, and mobile devices
- **Interactive Components**: 
  - Mobile menu with smooth animations
  - Feature tabs with dynamic content switching
  - EVOKE Difference interactive sections
  - Animated counters and charts
- **Smooth Animations**: Scroll-triggered animations using Intersection Observer API
- **Data Visualization**: Interactive charts using Chart.js showing ROI metrics
- **Marquee Effects**: Smooth scrolling marquees for testimonials and trusted companies

## Tech Stack

- **React 18**: Modern React with hooks
- **Chart.js**: Data visualization library
- **Tailwind CSS**: Utility-first CSS framework (via CDN)
- **React Chart.js 2**: React wrapper for Chart.js

## Project Structure

```
src/
├── components/          # React components
│   ├── Header.jsx      # Navigation header with mobile menu
│   ├── Hero.jsx        # Hero section
│   ├── TrustedBy.jsx   # Trusted companies marquee
│   ├── CurrentReality.jsx  # Problem/advantage cards
│   ├── ROI.jsx         # ROI section with charts
│   ├── Features.jsx    # Interactive features section
│   ├── EvokeDifference.jsx  # EVOKE difference section
│   ├── GetStarted.jsx  # 3-step process section
│   ├── Pricing.jsx     # Pricing plans
│   ├── Testimonials.jsx # Testimonials marquee
│   └── FinalCTA.jsx    # Final call-to-action
├── utils/              # Utility functions and hooks
│   ├── animations.js  # Animation utilities
│   ├── useScrollAnimation.js  # Scroll animation hook
│   └── useCounter.js  # Counter animation hook
├── styles/             # Global styles
│   └── index.css      # Main stylesheet
├── App.jsx            # Main app component
└── index.js           # Entry point
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd AEON
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables (optional):
   - Create a `.env` file in the root directory
   - Add the following variables (get these from your EmailJS account):
```bash
REACT_APP_EMAILJS_PUBLIC_KEY=your_emailjs_public_key_here
REACT_APP_EMAILJS_SERVICE_ID=your_emailjs_service_id_here
REACT_APP_EMAILJS_TEMPLATE_ID=your_emailjs_template_id_here
```
   - Note: If environment variables are not set, the app will use default values (hardcoded fallbacks)

4. Start the development server:
```bash
npm start
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `build` folder.

## Component Details

### Header
- Fixed navigation bar with smooth scroll shadow effect
- Responsive mobile menu with overlay
- Smooth transitions and animations

### Hero
- Main landing section with headline and CTA
- Scroll-triggered fade-in animations

### ROI Section
- Animated counters (40%, 3x, 85%+)
- Three interactive charts:
  - Cost reduction bar chart
  - Lead qualification growth line chart
  - Task distribution doughnut chart

### Features Section
- Interactive tabbed interface
- 6 different agent types:
  - Sales & Qualification
  - Customer Success
  - Custom Workflow
  - Onboarding & Training
  - Proactive Outreach
  - Internal Helpdesk

### EVOKE Difference
- 4 key differentiators:
  - Augment, Don't Replace
  - Zero-Code Customization
  - Security & Compliance
  - Synergy with NOVA

## Customization

### Colors
The color scheme uses:
- Primary: `#FFC700` (Yellow/Gold)
- Background: `#0A0A0A` (Dark)
- Cards: `#121212` (Dark Gray)
- Text: `#E0E0E0` (Light Gray)

### Animations
Scroll animations are handled by the `useScrollAnimation` hook and `initScrollAnimations` utility function. Adjust thresholds and delays in the respective files.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Environment Variables

The application uses EmailJS for contact form submissions. To configure EmailJS:

1. Sign up for a free account at [EmailJS](https://www.emailjs.com/)
2. Create a service, template, and get your public key
3. Create a `.env` file in the root directory with:
```bash
REACT_APP_EMAILJS_PUBLIC_KEY=your_emailjs_public_key_here
REACT_APP_EMAILJS_SERVICE_ID=your_emailjs_service_id_here
REACT_APP_EMAILJS_TEMPLATE_ID=your_emailjs_template_id_here
```

**Note:** If environment variables are not set, the app will use default fallback values. However, it's recommended to use your own EmailJS account for production.

## Deployment

### GitHub Pages
1. Install `gh-pages` package:
```bash
npm install --save-dev gh-pages
```

2. Add to `package.json`:
```json
"homepage": "https://yourusername.github.io/aeon-website",
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d build"
}
```

3. Deploy:
```bash
npm run deploy
```

### Netlify / Vercel
1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set publish directory: `build`
4. Add environment variables in the platform's dashboard

### Other Platforms
The `build` folder contains the production-ready static files that can be deployed to any static hosting service.

## License

This project is proprietary software.

