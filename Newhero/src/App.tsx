import { useState } from 'react'
import schoolPhoto from '@/imports/ChatGPT_Image_Aug_1__2026__11_22_39_AM-1.png'

const NAV_LINKS = ['Home', 'About Us', 'Academics', 'Students', 'News & Events', 'Contact']

function LocationIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  )
}

function MailIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2"/>
      <path d="M2 7l10 7 10-7"/>
    </svg>
  )
}

function PhoneIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.28h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6.11 6.11l.94-.94a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7a2 2 0 0 1 1.72 2.02z"/>
    </svg>
  )
}

function MenuIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6"/>
      <line x1="3" y1="12" x2="21" y2="12"/>
      <line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  )
}

function ShieldCrest() {
  return (
    <svg width="48" height="56" viewBox="0 0 48 56" fill="none">
      <path d="M24 2L4 10v18c0 13 8.5 21 20 26 11.5-5 20-13 20-26V10L24 2z" fill="#1B2A6B" stroke="#3B4FBB" strokeWidth="1.5"/>
      <path d="M24 8L8 15v13c0 9.5 6 15.5 16 20 10-4.5 16-10.5 16-20V15L24 8z" fill="none" stroke="#7B8FDB" strokeWidth="1"/>
      <text x="24" y="30" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold" fontFamily="serif">M</text>
      <path d="M16 34h16M16 37h16" stroke="#7B8FDB" strokeWidth="1"/>
    </svg>
  )
}

function GraduationIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1B2A6B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10v6M2 10l10-5 10 5-10 5-10-5z"/>
      <path d="M6 12v5c3 3 9 3 12 0v-5"/>
    </svg>
  )
}

function PeopleIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1B2A6B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  )
}

function TrophyIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1B2A6B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="8 21 12 17 16 21"/>
      <line x1="12" y1="17" x2="12" y2="11"/>
      <path d="M7 4H4a1 1 0 0 0-1 1v3a4 4 0 0 0 4 4h.5M17 4h3a1 1 0 0 1 1 1v3a4 4 0 0 1-4 4h-.5"/>
      <path d="M7 4h10v7a5 5 0 0 1-10 0V4z"/>
    </svg>
  )
}

function QualityIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#1B2A6B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10v6M2 10l10-5 10 5-10 5-10-5z"/>
      <path d="M6 12v5c3 3 9 3 12 0v-5"/>
    </svg>
  )
}

function CharacterIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#1B2A6B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  )
}

function CoIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#1B2A6B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 8v4l3 3"/>
      <path d="M8 12H4M20 12h-4M12 4V2M12 22v-2"/>
    </svg>
  )
}

function CommunityIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#1B2A6B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  )
}

function ClockTowerIllustration() {
  return (
    <svg viewBox="0 0 200 340" fill="none" className="w-full h-full opacity-20">
      <rect x="70" y="260" width="60" height="80" fill="white"/>
      <rect x="80" y="200" width="40" height="70" fill="white"/>
      <rect x="85" y="160" width="30" height="50" fill="white"/>
      <rect x="90" y="120" width="20" height="50" fill="white"/>
      <polygon points="100,80 85,130 115,130" fill="white"/>
      <circle cx="100" cy="175" r="14" fill="none" stroke="white" strokeWidth="3"/>
      <line x1="100" y1="175" x2="100" y2="163" stroke="white" strokeWidth="2"/>
      <line x1="100" y1="175" x2="109" y2="175" stroke="white" strokeWidth="2"/>
      <rect x="60" y="255" width="80" height="6" fill="white"/>
      <rect x="50" y="318" width="100" height="6" fill="white"/>
      <rect x="75" y="225" width="8" height="35" fill="rgba(255,255,255,0.4)"/>
      <rect x="117" y="225" width="8" height="35" fill="rgba(255,255,255,0.4)"/>
      <rect x="80" y="270" width="10" height="30" fill="rgba(255,255,255,0.4)"/>
      <rect x="110" y="270" width="10" height="30" fill="rgba(255,255,255,0.4)"/>
      <rect x="94" y="270" width="12" height="20" fill="rgba(255,255,255,0.6)"/>
    </svg>
  )
}

const FEATURE_CARDS = [
  {
    icon: <QualityIcon />,
    title: 'Quality Education',
    desc: 'Modern teaching methods and experienced faculty',
  },
  {
    icon: <CharacterIcon />,
    title: 'Character Building',
    desc: 'Strong values, discipline and leadership',
  },
  {
    icon: <CoIcon />,
    title: 'Co-Curricular',
    desc: 'Sports, clubs, and activities for all-round development',
  },
  {
    icon: <CommunityIcon />,
    title: 'Community',
    desc: 'Building strong bonds with parents and society',
  },
]

export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }} className="min-h-screen bg-white">

      {/* Top Bar */}
      <div style={{ backgroundColor: '#1B2A6B' }} className="text-white text-xs py-2 px-4 md:px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <LocationIcon />
            <span className="hidden sm:inline">Government School • Southern Province • Sri Lanka</span>
            <span className="sm:hidden">Southern Province • Sri Lanka</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <MailIcon />
              <span className="hidden md:inline">info@dampellamv.lk</span>
            </span>
            <span className="flex items-center gap-1.5">
              <PhoneIcon />
              <span>+94 41 2 123 456</span>
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <ShieldCrest />
            <div>
              <div style={{ fontFamily: "'Inter', sans-serif", color: '#1B2A6B' }} className="font-bold text-base leading-tight">
                MR/ Dampella M.V
              </div>
              <div style={{ color: '#1B2A6B', letterSpacing: '0.12em' }} className="text-[9px] font-semibold uppercase">
                Excellence in Education
              </div>
            </div>
          </div>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-6 text-sm font-medium">
            {NAV_LINKS.map((link) => (
              <a
                key={link}
                href="#"
                style={{ color: link === 'Home' ? '#1B2A6B' : '#4B5563' }}
                className={`hover:text-[#1B2A6B] transition-colors pb-0.5 ${link === 'Home' ? 'border-b-2 border-[#1B2A6B]' : ''}`}
              >
                {link}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              style={{ backgroundColor: '#1B2A6B' }}
              className="hidden lg:inline-flex items-center gap-1 text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:opacity-90 transition-opacity whitespace-nowrap"
            >
              Student Portal
            </button>
            <button
              className="lg:hidden text-gray-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <MenuIcon />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-100 bg-white px-4 py-4 flex flex-col gap-3">
            {NAV_LINKS.map((link) => (
              <a
                key={link}
                href="#"
                style={{ color: link === 'Home' ? '#1B2A6B' : '#4B5563' }}
                className="text-sm font-medium py-1"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link}
              </a>
            ))}
            <button
              style={{ backgroundColor: '#1B2A6B' }}
              className="mt-2 text-white text-sm font-semibold px-5 py-2.5 rounded-full w-full"
            >
              Student Portal
            </button>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section style={{ backgroundColor: '#EEF2FF' }} className="relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 md:px-8 grid lg:grid-cols-2 gap-0 min-h-[520px]">

          {/* Left text */}
          <div className="flex flex-col justify-center py-14 lg:py-20 gap-5 relative z-10">
            <p style={{ color: '#5B35D5', letterSpacing: '0.08em' }} className="text-xs font-bold uppercase">
              Welcome to MR/ Dampella M.V
            </p>
            <h1
              style={{ fontFamily: "'Playfair Display', serif", color: '#111827', lineHeight: 1.15 }}
              className="text-4xl md:text-5xl font-extrabold"
            >
              Inspiring Minds.<br />
              Building <span style={{ color: '#5B35D5' }}>Futures.</span>
            </h1>
            <div style={{ width: 40, height: 3, backgroundColor: '#5B35D5' }} className="rounded-full" />
            <p className="text-gray-500 text-sm leading-relaxed max-w-sm">
              Dedicated to excellence in education and character development. Empowering students to become responsible citizens and future leaders.
            </p>

            <div className="flex flex-wrap gap-3 mt-1">
              <button
                style={{ backgroundColor: '#1B2A6B' }}
                className="inline-flex items-center gap-2 text-white text-sm font-semibold px-6 py-3 rounded-full hover:opacity-90 transition-opacity"
              >
                Discover Our School
                <span className="text-base">→</span>
              </button>
              <button
                style={{ color: '#1B2A6B', borderColor: '#1B2A6B' }}
                className="inline-flex items-center gap-2 text-sm font-semibold px-6 py-3 rounded-full border-2 hover:bg-[#1B2A6B] hover:text-white transition-colors"
              >
                Explore Academics
              </button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap items-center gap-6 mt-3">
              <div className="flex items-center gap-2">
                <GraduationIcon />
                <div>
                  <div style={{ color: '#1B2A6B' }} className="text-lg font-bold leading-tight">+1,200</div>
                  <div className="text-xs text-gray-500">Students</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <PeopleIcon />
                <div>
                  <div style={{ color: '#1B2A6B' }} className="text-lg font-bold leading-tight">50+</div>
                  <div className="text-xs text-gray-500">Teachers</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <TrophyIcon />
                <div>
                  <div style={{ color: '#1B2A6B' }} className="text-lg font-bold leading-tight">25+</div>
                  <div className="text-xs text-gray-500">Years of Excellence</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right photo */}
          <div className="relative hidden lg:block">
            {/* Gradient overlay blending left edge into section bg */}
            <div
              className="absolute inset-y-0 left-0 w-24 z-10 pointer-events-none"
              style={{ background: 'linear-gradient(to right, #EEF2FF, transparent)' }}
            />
            <img
              src={schoolPhoto}
              alt="MR/ Dampella M.V school building"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Mobile hero image */}
        <div className="lg:hidden w-full h-56 relative">
          <img
            src={schoolPhoto}
            alt="MR/ Dampella M.V school building"
            className="w-full h-full object-cover"
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'linear-gradient(to bottom, #EEF2FF 0%, transparent 30%)' }}
          />
        </div>
      </section>

      {/* About Section */}
      <section style={{ backgroundColor: '#1B2A6B' }} className="relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-16 md:py-20">

          {/* Top part: illustration + text */}
          <div className="grid lg:grid-cols-2 gap-10 items-center mb-12">
            {/* Illustration */}
            <div className="hidden lg:flex items-center justify-center h-64">
              <ClockTowerIllustration />
            </div>

            {/* Text */}
            <div>
              <p style={{ color: '#A5B4FC', letterSpacing: '0.1em' }} className="text-xs font-bold uppercase mb-3">
                About Our School
              </p>
              <h2
                style={{ fontFamily: "'Playfair Display', serif" }}
                className="text-white text-3xl md:text-4xl font-bold leading-snug mb-5"
              >
                A Tradition of Excellence Since 1998
              </h2>
              <p className="text-blue-200 text-sm leading-relaxed max-w-md">
                MR/ Dampella M.V is committed to providing a holistic education that nurtures academic, physical, and moral excellence in every student.
              </p>
            </div>
          </div>

          {/* Feature cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURE_CARDS.map((card) => (
              <div
                key={card.title}
                className="bg-white rounded-2xl p-6 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="mb-1">{card.icon}</div>
                <h3 style={{ color: '#1B2A6B' }} className="font-bold text-sm">
                  {card.title}
                </h3>
                <p className="text-gray-500 text-xs leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>

          {/* Learn more */}
          <div className="mt-10 flex justify-start lg:justify-end">
            <button
              style={{ backgroundColor: '#1B2A6B', border: '2px solid rgba(255,255,255,0.3)' }}
              className="inline-flex items-center gap-2 text-white text-sm font-semibold px-6 py-3 rounded-full hover:bg-[#263590] transition-colors"
            >
              Learn More About Us
              <span className="text-base">→</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
