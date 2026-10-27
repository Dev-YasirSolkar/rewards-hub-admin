import React from 'react';

interface IconProps {
  size?: number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const DashboardIcon: React.FC<IconProps> = ({ size = 18, color = '#38bdf8', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, ...style }}>
    <rect x="3" y="3" width="8" height="8" rx="2" fill="url(#db-grad1)" />
    <rect x="13" y="3" width="8" height="5" rx="2" fill="url(#db-grad2)" />
    <rect x="13" y="10" width="8" height="11" rx="2" fill="url(#db-grad1)" />
    <rect x="3" y="13" width="8" height="8" rx="2" fill="url(#db-grad2)" />
    <defs>
      <linearGradient id="db-grad1" x1="3" y1="3" x2="11" y2="11" gradientUnits="userSpaceOnUse">
        <stop stopColor={color} />
        <stop offset="1" stopColor="#0284c7" />
      </linearGradient>
      <linearGradient id="db-grad2" x1="13" y1="3" x2="21" y2="11" gradientUnits="userSpaceOnUse">
        <stop stopColor="#818cf8" />
        <stop offset="1" stopColor="#4f46e5" />
      </linearGradient>
    </defs>
  </svg>
);

export const UsersIcon: React.FC<IconProps> = ({ size = 18, color = '#60a5fa', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, ...style }}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="9" cy="7" r="4" fill="url(#user-grad)" stroke={color} strokeWidth="1.5" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <defs>
      <linearGradient id="user-grad" x1="5" y1="3" x2="13" y2="11" gradientUnits="userSpaceOnUse">
        <stop stopColor="#3b82f6" stopOpacity="0.4" />
        <stop offset="1" stopColor="#1d4ed8" stopOpacity="0.8" />
      </linearGradient>
    </defs>
  </svg>
);

export const WithdrawalsIcon: React.FC<IconProps> = ({ size = 18, color = '#34d399', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, ...style }}>
    <rect x="2" y="5" width="20" height="14" rx="3" fill="url(#card-bg)" stroke={color} strokeWidth="1.5" />
    <path d="M2 10h20" stroke="#059669" strokeWidth="2" />
    <circle cx="6" cy="15" r="1.5" fill="#34d399" />
    <circle cx="10" cy="15" r="1.5" fill="#a7f3d0" />
    <path d="M17 14l3 3m0 0l-3 3m3-3h-4" stroke="#facc15" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <defs>
      <linearGradient id="card-bg" x1="2" y1="5" x2="22" y2="19" gradientUnits="userSpaceOnUse">
        <stop stopColor="#064e3b" />
        <stop offset="1" stopColor="#022c22" />
      </linearGradient>
    </defs>
  </svg>
);

export const TransactionsIcon: React.FC<IconProps> = ({ size = 18, color = '#fbbf24', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, ...style }}>
    <circle cx="12" cy="12" r="9" fill="url(#coin-gold)" stroke={color} strokeWidth="1.5" />
    <path d="M12 7v10M9 9.5a2.5 2.5 0 0 1 5 0c0 2-5 2-5 4a2.5 2.5 0 0 0 5 0" stroke="#78350f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <defs>
      <linearGradient id="coin-gold" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
        <stop stopColor="#fde047" />
        <stop offset="0.5" stopColor="#f59e0b" />
        <stop offset="1" stopColor="#d97706" />
      </linearGradient>
    </defs>
  </svg>
);

export const MiningCardsIcon: React.FC<IconProps> = ({ size = 18, color = '#f97316', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, ...style }}>
    <path d="M14 3l7 7-4 4-7-7 4-4z" fill="url(#pick-metal)" />
    <path d="M17 10l-10 10a2 2 0 0 1-3-3l10-10" stroke="#fdba74" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="18" cy="6" r="1.5" fill="#facc15" />
    <defs>
      <linearGradient id="pick-metal" x1="14" y1="3" x2="21" y2="14" gradientUnits="userSpaceOnUse">
        <stop stopColor="#ea580c" />
        <stop offset="1" stopColor="#9a3412" />
      </linearGradient>
    </defs>
  </svg>
);

export const DailyActivitiesIcon: React.FC<IconProps> = ({ size = 18, color = '#a78bfa', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, ...style }}>
    <rect x="3" y="4" width="18" height="17" rx="3" fill="url(#cal-bg)" stroke={color} strokeWidth="1.5" />
    <path d="M3 9h18" stroke="#8b5cf6" strokeWidth="1.5" />
    <path d="M8 2v4M16 2v4" stroke="#c4b5fd" strokeWidth="2" strokeLinecap="round" />
    <circle cx="8" cy="13" r="1.5" fill="#facc15" />
    <circle cx="12" cy="13" r="1.5" fill="#34d399" />
    <circle cx="16" cy="13" r="1.5" fill="#38bdf8" />
    <circle cx="8" cy="17" r="1.5" fill="#f472b6" />
    <circle cx="12" cy="17" r="1.5" fill="#fbbf24" />
    <defs>
      <linearGradient id="cal-bg" x1="3" y1="4" x2="21" y2="21" gradientUnits="userSpaceOnUse">
        <stop stopColor="#2e1065" />
        <stop offset="1" stopColor="#0f172a" />
      </linearGradient>
    </defs>
  </svg>
);

export const TasksIcon: React.FC<IconProps> = ({ size = 18, color = '#2dd4bf', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, ...style }}>
    <rect x="4" y="4" width="16" height="17" rx="2" fill="url(#task-bg)" stroke={color} strokeWidth="1.5" />
    <path d="M9 2h6a1 1 0 0 1 1 1v2H8V3a1 1 0 0 1 1-1z" fill="#0d9488" stroke={color} strokeWidth="1" />
    <path d="M8 11l2 2 4-4" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8 16h8" stroke="#5eead4" strokeWidth="1.5" strokeLinecap="round" />
    <defs>
      <linearGradient id="task-bg" x1="4" y1="4" x2="20" y2="21" gradientUnits="userSpaceOnUse">
        <stop stopColor="#115e59" />
        <stop offset="1" stopColor="#042f2e" />
      </linearGradient>
    </defs>
  </svg>
);

export const AffiliatesIcon: React.FC<IconProps> = ({ size = 18, color = '#ec4899', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, ...style }}>
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="#f472b6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const SettingsIcon: React.FC<IconProps> = ({ size = 18, color = '#e2e8f0', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, ...style }}>
    <circle cx="12" cy="12" r="3" fill="#38bdf8" stroke={color} strokeWidth="1.5" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const FraudIcon: React.FC<IconProps> = ({ size = 18, color = '#f87171', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, ...style }}>
    <path d="M12 2l8 4v6c0 5.25-3.5 10-8 11-4.5-1-8-5.75-8-11V6l8-4z" fill="url(#shield-red)" stroke={color} strokeWidth="1.5" />
    <path d="M12 8v4m0 4h.01" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
    <defs>
      <linearGradient id="shield-red" x1="4" y1="2" x2="20" y2="23" gradientUnits="userSpaceOnUse">
        <stop stopColor="#991b1b" />
        <stop offset="1" stopColor="#450a0a" />
      </linearGradient>
    </defs>
  </svg>
);

export const NotificationsIcon: React.FC<IconProps> = ({ size = 18, color = '#fb923c', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, ...style }}>
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="#fdba74" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="18" cy="5" r="2.5" fill="#ef4444" stroke="#ffffff" strokeWidth="1" />
  </svg>
);

export const AuditIcon: React.FC<IconProps> = ({ size = 18, color = '#94a3b8', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, ...style }}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="#1e293b" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M14 2v6h6" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M16 13H8M16 17H8M10 9H8" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const CrownIcon: React.FC<IconProps> = ({ size = 20, color = '#facc15', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, ...style }}>
    <path d="M3 18h18l-2-11-5 5-2-7-2 7-5-5-2 11z" fill="url(#crown-gold)" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
    <rect x="3" y="18" width="18" height="3" rx="1.5" fill="#eab308" />
    <circle cx="3" cy="7" r="1.5" fill="#fef08a" />
    <circle cx="12" cy="5" r="1.5" fill="#ffffff" />
    <circle cx="21" cy="7" r="1.5" fill="#fef08a" />
    <defs>
      <linearGradient id="crown-gold" x1="3" y1="5" x2="21" y2="21" gradientUnits="userSpaceOnUse">
        <stop stopColor="#fde047" />
        <stop offset="0.6" stopColor="#eab308" />
        <stop offset="1" stopColor="#ca8a04" />
      </linearGradient>
    </defs>
  </svg>
);

export const LogoutIcon: React.FC<IconProps> = ({ size = 16, color = '#ef4444', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, ...style }}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const TrashIcon: React.FC<IconProps> = ({ size = 16, color = '#ef4444', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, ...style }}>
    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const SaveIcon: React.FC<IconProps> = ({ size = 16, color = '#ffffff', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, ...style }}>
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M17 21v-8H7v8M7 3v5h8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const VideoIcon: React.FC<IconProps> = ({ size = 18, color = '#38bdf8', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, ...style }}>
    <rect x="2" y="4" width="15" height="16" rx="3" fill="url(#video-bg)" stroke={color} strokeWidth="1.5" />
    <path d="M17 9l5-3v12l-5-3V9z" fill={color} />
    <path d="M7 10l5 2.5-5 2.5V10z" fill="#ffffff" />
    <defs>
      <linearGradient id="video-bg" x1="2" y1="4" x2="17" y2="20" gradientUnits="userSpaceOnUse">
        <stop stopColor="#0284c7" />
        <stop offset="1" stopColor="#0369a1" />
      </linearGradient>
    </defs>
  </svg>
);

export const StarIcon: React.FC<IconProps> = ({ size = 16, color = '#facc15', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, ...style }}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="url(#star-gold)" stroke={color} strokeWidth="1" />
    <defs>
      <linearGradient id="star-gold" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
        <stop stopColor="#fde047" />
        <stop offset="1" stopColor="#eab308" />
      </linearGradient>
    </defs>
  </svg>
);

export const GiftIcon: React.FC<IconProps> = ({ size = 18, color = '#f43f5e', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, ...style }}>
    <rect x="3" y="8" width="18" height="13" rx="2" fill="url(#gift-bg)" stroke={color} strokeWidth="1.5" />
    <path d="M12 8v13M3 13h18" stroke="#ffe4e6" strokeWidth="2" />
    <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.5 4.5 0 0 1 12 7.5 4.5 4.5 0 0 1 16.5 3a2.5 2.5 0 0 1 0 5" stroke="#fb7185" strokeWidth="2" strokeLinecap="round" />
    <defs>
      <linearGradient id="gift-bg" x1="3" y1="8" x2="21" y2="21" gradientUnits="userSpaceOnUse">
        <stop stopColor="#e11d48" />
        <stop offset="1" stopColor="#881337" />
      </linearGradient>
    </defs>
  </svg>
);

export const ClockIcon: React.FC<IconProps> = ({ size = 16, color = '#94a3b8', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, ...style }}>
    <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" />
    <path d="M12 7v5l3 3" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const CheckCircleIcon: React.FC<IconProps> = ({ size = 16, color = '#10b981', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, ...style }}>
    <circle cx="12" cy="12" r="10" fill="url(#check-circle-grad)" stroke={color} strokeWidth="1.5" />
    <path d="M8 12.5l2.5 2.5 5.5-5.5" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <defs>
      <linearGradient id="check-circle-grad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
        <stop stopColor="#10b981" />
        <stop offset="1" stopColor="#059669" />
      </linearGradient>
    </defs>
  </svg>
);

export const SpinnerIcon: React.FC<IconProps> = ({ size = 18, color = '#38bdf8', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ animation: 'spin 1s linear infinite', flexShrink: 0, ...style }}>
    <circle cx="12" cy="12" r="10" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="3" />
    <path d="M12 2a10 10 0 0 1 10 10" stroke={color} strokeWidth="3" strokeLinecap="round" />
  </svg>
);

export const RefreshIcon: React.FC<IconProps> = ({ size = 16, color = '#38bdf8', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, ...style }}>
    <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
