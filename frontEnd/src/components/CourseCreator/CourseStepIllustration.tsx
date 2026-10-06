import React from 'react';

interface CourseStepIllustrationProps {
    className?: string;
}

export const CourseStepIllustration: React.FC<CourseStepIllustrationProps> = ({ className = '' }) => {
    return (
        <div className={`relative flex items-center justify-center select-none ${className}`}>

            <div className="absolute inset-0 rounded-full bg-lime-400/15 blur-2xl pointer-events-none" />

            <svg
                viewBox="0 0 220 190"
                className="w-full h-full drop-shadow-[0_0_24px_rgba(74,222,128,0.35)]"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <defs>

                    <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>

                    <filter id="intenseGlow" x="-30%" y="-30%" width="160%" height="160%">
                        <feGaussianBlur stdDeviation="6" result="blur1" />
                        <feGaussianBlur stdDeviation="2" result="blur2" />
                        <feMerge>
                            <feMergeNode in="blur1" />
                            <feMergeNode in="blur2" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>

                    <linearGradient id="capGradient" x1="50" y1="20" x2="170" y2="60" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#1e293b" />
                        <stop offset="50%" stopColor="#0f172a" />
                        <stop offset="100%" stopColor="#020617" />
                    </linearGradient>

                    <linearGradient id="capBevel" x1="50" y1="45" x2="170" y2="55" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#0a0f1d" />
                        <stop offset="100%" stopColor="#020617" />
                    </linearGradient>

                    <linearGradient id="screenGlass" x1="60" y1="50" x2="160" y2="170" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#061812" stopOpacity="0.95" />
                        <stop offset="50%" stopColor="#04120e" stopOpacity="0.95" />
                        <stop offset="100%" stopColor="#010705" stopOpacity="0.98" />
                    </linearGradient>

                    <linearGradient id="cardBoxGrad" x1="68" y1="72" x2="98" y2="102" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#064e3b" stopOpacity="0.7" />
                        <stop offset="100%" stopColor="#022c22" stopOpacity="0.9" />
                    </linearGradient>

                    <linearGradient id="orbitGrad" x1="20" y1="70" x2="200" y2="150" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#4ade80" stopOpacity="0.9" />
                        <stop offset="50%" stopColor="#a3e635" stopOpacity="0.7" />
                        <stop offset="100%" stopColor="#22c55e" stopOpacity="0.3" />
                    </linearGradient>

                    <linearGradient id="tasselGrad" x1="165" y1="45" x2="175" y2="85" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#fef08a" />
                        <stop offset="40%" stopColor="#eab308" />
                        <stop offset="100%" stopColor="#ca8a04" />
                    </linearGradient>
                </defs>

                <path
                    d="M 28 105 C 15 75, 70 48, 140 55 C 190 60, 215 88, 195 115"
                    stroke="url(#orbitGrad)"
                    strokeWidth="1.4"
                    fill="none"
                    strokeDasharray="4 2"
                    opacity="0.55"
                />

                <circle cx="36" cy="94" r="2" fill="#86efac" filter="url(#neonGlow)" />
                <circle cx="198" cy="92" r="2.5" fill="#a3e635" filter="url(#neonGlow)" />

                <rect
                    x="56"
                    y="50"
                    width="108"
                    height="122"
                    rx="22"
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="5"
                    filter="url(#intenseGlow)"
                    opacity="0.75"
                />

                <rect
                    x="56"
                    y="50"
                    width="108"
                    height="122"
                    rx="22"
                    fill="url(#screenGlass)"
                    stroke="#4ade80"
                    strokeWidth="2.5"
                />

                <rect
                    x="62"
                    y="56"
                    width="96"
                    height="110"
                    rx="17"
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="1"
                    strokeOpacity="0.4"
                />

                <g transform="translate(0, 0)">

                    <rect
                        x="69"
                        y="68"
                        width="32"
                        height="32"
                        rx="8"
                        fill="url(#cardBoxGrad)"
                        stroke="#22c55e"
                        strokeWidth="1.4"
                        filter="drop-shadow(0 0 6px rgba(34,197,94,0.4))"
                    />

                    <polygon
                        points="81,77 81,91 93,84"
                        fill="#a3e635"
                        filter="drop-shadow(0 0 4px #a3e635)"
                    />

                    <rect x="109" y="74" width="42" height="3" rx="1.5" fill="#f1f5f9" opacity="0.85" />
                    <rect x="109" y="82" width="34" height="3" rx="1.5" fill="#cbd5e1" opacity="0.65" />
                    <rect x="109" y="90" width="24" height="3" rx="1.5" fill="#94a3b8" opacity="0.45" />
                </g>

                <g transform="translate(0, 0)">

                    <rect
                        x="69"
                        y="108"
                        width="32"
                        height="32"
                        rx="8"
                        fill="url(#cardBoxGrad)"
                        stroke="#22c55e"
                        strokeWidth="1.4"
                        filter="drop-shadow(0 0 6px rgba(34,197,94,0.4))"
                    />

                    <circle cx="90" cy="116" r="2.5" fill="#a3e635" filter="drop-shadow(0 0 3px #a3e635)" />

                    <path
                        d="M 74 132 L 81 120 L 87 127 L 91 119 L 96 132 Z"
                        fill="#22c55e"
                        stroke="#86efac"
                        strokeWidth="1"
                        strokeLinejoin="round"
                        filter="drop-shadow(0 0 3px #22c55e)"
                    />

                    <rect x="109" y="114" width="42" height="3" rx="1.5" fill="#f1f5f9" opacity="0.85" />
                    <rect x="109" y="122" width="34" height="3" rx="1.5" fill="#cbd5e1" opacity="0.65" />
                    <rect x="109" y="130" width="24" height="3" rx="1.5" fill="#94a3b8" opacity="0.45" />
                </g>

                <rect x="94" y="152" width="32" height="6" rx="3" fill="#042f24" stroke="#22c55e" strokeWidth="0.8" opacity="0.6" />

                <path
                    d="M 195 115 C 180 145, 120 162, 50 152 C 20 148, 5 125, 28 105"
                    stroke="url(#orbitGrad)"
                    strokeWidth="1.6"
                    fill="none"
                    filter="url(#neonGlow)"
                />
                <circle cx="65" cy="154" r="3" fill="#4ade80" filter="url(#neonGlow)" />
                <circle cx="168" cy="138" r="2.2" fill="#86efac" filter="url(#neonGlow)" />

                <ellipse
                    cx="110"
                    cy="110"
                    rx="88"
                    ry="38"
                    transform="rotate(-24 110 110)"
                    stroke="url(#orbitGrad)"
                    strokeWidth="1"
                    strokeDasharray="6 3"
                    fill="none"
                    opacity="0.6"
                />
                <circle cx="178" cy="72" r="2" fill="#a3e635" filter="url(#neonGlow)" />

                <g id="capBase">

                    <path
                        d="M 82 43 C 82 52, 138 52, 138 43 L 136 32 C 136 40, 84 40, 84 32 Z"
                        fill="#060c18"
                    />

                    <path
                        d="M 82 43 C 82 53, 138 53, 138 43"
                        stroke="#a3e635"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        fill="none"
                        filter="url(#intenseGlow)"
                    />
                    <path
                        d="M 82 43 C 82 53, 138 53, 138 43"
                        stroke="#bef264"
                        strokeWidth="2"
                        strokeLinecap="round"
                        fill="none"
                    />
                </g>

                <g id="capTop">

                    <path
                        d="M 52 28 L 110 46 L 168 28 L 168 33 L 110 51 L 52 33 Z"
                        fill="url(#capBevel)"
                        stroke="#090d16"
                        strokeWidth="0.5"
                    />

                    <polygon
                        points="52,28 110,10 168,28 110,46"
                        fill="url(#capGradient)"
                        stroke="#38bdf8"
                        strokeWidth="0.6"
                        strokeOpacity="0.25"
                    />

                    <circle cx="110" cy="28" r="3.5" fill="#facc15" filter="drop-shadow(0 0 3px #facc15)" />

                    <path
                        d="M 110 28 C 130 32, 155 36, 162 46 C 166 52, 164 62, 163 68"
                        fill="none"
                        stroke="#facc15"
                        strokeWidth="2"
                        strokeLinecap="round"
                        filter="drop-shadow(0 0 3px rgba(250,204,21,0.7))"
                    />

                    <rect x="159" y="68" width="8" height="3" rx="1.5" fill="#eab308" />

                    <path
                        d="M 159 71 L 157 85 C 163 87, 167 87, 169 85 L 167 71 Z"
                        fill="url(#tasselGrad)"
                        filter="drop-shadow(0 0 4px rgba(234,179,8,0.8))"
                    />
                </g>
            </svg>
        </div>
    );
};

export default CourseStepIllustration;
