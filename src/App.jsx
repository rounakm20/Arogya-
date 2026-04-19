import { useState } from "react";
import { useAuth } from "./hooks/useAuth";
import { useProfile } from "./hooks/useProfile";
import LoginPage from "./components/LoginPage";
import HomePage from "./components/HomePage";
import SymptomPage from "./components/SymptomPage";
import BloodPage from "./components/BloodPage";
import MedsPage from "./components/MedsPage";
import MoodPage from "./components/MoodPage";
import ReportsPage from "./components/ReportsPage";
import QRPage from "./components/QRPage";
import ProfilePage from "./components/ProfilePage";
import ConsultPage from "./components/ConsultPage";
import { HomeIco, UserIco, BloodIco, PillIco, HeartIco, DocIco, StethIco, QRIco, LogoutIco, ConsultIco } from "./components/Icons";

const NAV_SECTIONS = [
  {
    label: "Overview",
    items: [
      { id: "home",    label: "Dashboard",       icon: HomeIco },
      { id: "profile", label: "My Profile",       icon: UserIco },
    ],
  },
  {
    label: "Health Tools",
    items: [
      { id: "symptom", label: "Symptom Checker",  icon: StethIco },
      { id: "consult", label: "Consultation",     icon: ConsultIco },
      { id: "meds",    label: "Medications",       icon: PillIco },
      { id: "mood",    label: "Mood Tracker",      icon: HeartIco },
    ],
  },
  {
    label: "Records",
    items: [
      { id: "reports", label: "Health Reports",   icon: DocIco },
      { id: "qr",      label: "QR Passport",      icon: QRIco },
      { id: "blood",   label: "Blood Donors",      icon: BloodIco },
    ],
  },
];

const PAGE_TITLES = {
  home:    "Dashboard",
  symptom: "Symptom Checker",
  blood:   "Blood Donors",
  meds:    "Medications",
  mood:    "Mood Tracker",
  reports: "Health Reports",
  consult: "Doctor Consultation",
  qr:      "QR Health Passport",
  profile: "My Profile",
};

const PAGE_SUBS = {
  home:    "Your health at a glance",
  symptom: "AI-powered triage and advice",
  blood:   "Find nearby blood donors",
  meds:    "Track your daily medications",
  mood:    "Mental wellness log",
  reports: "Scan, upload & store health documents",
  consult: "Connect with specialist doctors",
  qr:      "Digital health identity",
  profile: "Personal & medical information",
};

export default function App() {
  const { user: authUser, loading: authLoading, signOut } = useAuth();
  const { profile, loading: profileLoading } = useProfile(authUser?.id);
  const [page, setPage] = useState("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Show spinner while Supabase restores the session
  if (authLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0f172a" }}>
        <div style={{ textAlign: "center", color: "#fff" }}>
          <div style={{ fontSize: "36px", marginBottom: "12px" }}>🩺</div>
          <div style={{ fontSize: "14px", color: "rgba(255,255,255,.5)" }}>Loading Arogya…</div>
        </div>
      </div>
    );
  }

  // Not logged in — show login
  if (!authUser) return <LoginPage />;

  // Build the user object from real profile data (fallback to email while profile loads)
  const user = profile
    ? {
        id:                profile.id?.slice(0, 13).toUpperCase() || "ARG-2025-00001",
        uuid:              profile.id,
        name:              profile.name || authUser.email,
        email:             authUser.email,
        dob:               profile.dob || "—",
        age:               profile.dob
                              ? Math.floor((Date.now() - new Date(profile.dob)) / (365.25 * 864e5))
                              : "—",
        gender:            profile.gender || "—",
        blood:             profile.blood || "—",
        weight:            profile.weight || "—",
        height:            profile.height || "—",
        bmi:               profile.bmi || "—",
        city:              profile.city || "—",
        phone:             profile.phone || "—",
        conditions:        profile.conditions || [],
        allergies:         profile.allergies || [],
        medications:       profile.medications_static || [],
        vaccinations:      profile.vaccinations || [],
        emergency_contact: profile.emergency_contact || "—",
        doctor:            profile.doctor || "—",
        insurance:         profile.insurance || "—",
        last_checkup:      profile.last_checkup || "—",
        issued:            profile.issued || "—",
        expiry:            profile.expiry || "—",
      }
    : {
        id:    "Loading…",
        uuid:  authUser.id,
        name:  authUser.email?.split("@")[0] || "User",
        email: authUser.email,
        blood: "—", city: "—", gender: "—", age: "—",
        conditions: [], allergies: [], medications: [], vaccinations: [],
      };

  const handleSignOut = async () => { await signOut(); setPage("home"); };

  const initials = user.name.split(" ").map(n => n[0]).join("").toUpperCase();

  const renderPage = () => {
    switch (page) {
      case "home":    return <HomePage    userId={authUser?.id} user={user} setPage={setPage} />;
      case "symptom": return <SymptomPage user={user} />;
      case "blood":   return <BloodPage   userId={authUser?.id} user={user} />;
      case "meds":    return <MedsPage    userId={authUser?.id} />;
      case "mood":    return <MoodPage    userId={authUser?.id} />;
      case "reports": return <ReportsPage userId={authUser?.id} />;
      case "consult": return <ConsultPage user={user} />;
      case "qr":      return <QRPage user={user} />;
      case "profile": return <ProfilePage user={user} onLogout={handleSignOut} setPage={setPage} profileLoading={profileLoading} />;
      default:        return null;
    }
  };

  return (
    <div className="layout">
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && <div className="fade" style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", backdropFilter:"blur(3px)", zIndex:150 }} onClick={() => setMobileMenuOpen(false)}/>}
      
      {/* ── SIDEBAR ── */}
      <aside className={`sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "36px", height: "36px", background: "rgba(5,150,105,.2)", border: "1.5px solid rgba(5,150,105,.4)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0 }}>🩺</div>
            <div>
              <h1>Arogya</h1>
              <span>Health Dashboard</span>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          {NAV_SECTIONS.map(section => (
            <div key={section.label}>
              <div className="nav-section-label">{section.label}</div>
              {section.items.map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    className={`nav-btn ${page === item.id ? "active" : ""}`}
                    onClick={() => { setPage(item.id); setMobileMenuOpen(false); }}
                  >
                    <Icon />
                    {item.label}
                  </button>
                );
              })}
            </div>
          ))}

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Logout */}
          <button
            className="nav-btn"
            onClick={handleSignOut}
            style={{ marginTop: "8px", color: "rgba(239,68,68,.55)" }}
            onMouseEnter={e => { e.currentTarget.style.color = "#f87171"; e.currentTarget.style.background = "rgba(239,68,68,.08)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "rgba(239,68,68,.55)"; e.currentTarget.style.background = "none"; }}
          >
            <LogoutIco />
            Sign Out
          </button>
        </nav>

        {/* User pill */}
        <div className="sidebar-user">
          <div className="sidebar-avatar">{initials}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user.name}</div>
            <div className="sidebar-user-role">{user.blood} · {(user.city || "—").split(",")[0]}</div>
          </div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="main">
        {/* Topbar */}
        <div className="topbar">
          <div style={{ display:"flex", alignItems:"center", gap:"14px" }}>
            <button className="mobile-menu-btn btn btn-ghost" style={{ padding:"6px 12px", fontSize:"22px" }} onClick={() => setMobileMenuOpen(true)}>≡</button>
            <div>
              <div className="topbar-title">{PAGE_TITLES[page]}</div>
              <div className="topbar-sub">{PAGE_SUBS[page]}</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ fontSize: "12px", color: "#9ca3af", fontFamily: "'JetBrains Mono', monospace" }}>{user.id}</div>
            <div
              style={{ width: "38px", height: "38px", borderRadius: "50%", background: "#d1fae5", border: "2px solid #a7f3d0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "800", color: "#059669", cursor: "pointer", flexShrink: 0 }}
              onClick={() => setPage("profile")}
              title="View Profile"
            >
              {initials}
            </div>
          </div>
        </div>

        {/* Page content */}
        <div className="content" key={page}>
          {renderPage()}
        </div>
      </main>
    </div>
  );
}
