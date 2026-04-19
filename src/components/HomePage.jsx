import { useMeds } from "../hooks/useMeds";
import { useMoodLogs } from "../hooks/useMoodLogs";
import { useReports } from "../hooks/useReports";
import { useAppointments } from "../hooks/useAppointments";
import { MOODS } from "../data/constants";

export default function HomePage({ userId, user, setPage }) {
  const { meds } = useMeds(userId);
  const { logs } = useMoodLogs(userId);
  const { reports } = useReports(userId);
  const { requests } = useAppointments(userId);

  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const firstName = (user.name || "there").split(" ")[0];

  const quickCards = [
    { icon:"🩺", title:"Symptom Check",  sub:"AI-powered triage",       tag:"AI",        tagC:"tag-blue",   page:"symptom", bg:"#eff6ff" },
    { icon:"🩸", title:"Blood Donors",   sub:"Find donors near you",     tag:"Emergency", tagC:"tag-red",    page:"blood",   bg:"#fff1f2" },
    { icon:"💊", title:"Medications",    sub:"Track your daily meds",    tag:"Daily",     tagC:"tag-green",  page:"meds",    bg:"#f0fdf4" },
    { icon:"🧠", title:"Mood Tracker",   sub:"Mental wellness log",      tag:"Wellness",  tagC:"tag-purple", page:"mood",    bg:"#faf5ff" },
    { icon:"📋", title:"My Reports",     sub:"Scan & store health docs", tag:"Records",   tagC:"tag-amber",  page:"reports", bg:"#fffbeb" },
    { icon:"🪪", title:"QR Passport",    sub:"Share your health record", tag:"Instant",   tagC:"tag-gray",   page:"qr",      bg:"#f8fafc" },
  ];

  const pendingMeds = meds.filter(m => !m.taken_today);
  const avgMood = logs.length ? Math.round(logs.reduce((a,b) => a+b.score, 0) / logs.length) : 0;

  return (
    <div className="fade">
      {/* Welcome banner */}
      <div style={{ background:"linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #0c4a2e 100%)", borderRadius:"20px", padding:"32px 36px", marginBottom:"28px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:-60, right:-60, width:220, height:220, borderRadius:"50%", background:"rgba(5,150,105,.12)" }}/>
        <div style={{ position:"absolute", bottom:-40, left:200, width:160, height:160, borderRadius:"50%", background:"rgba(59,130,246,.08)" }}/>
        <div style={{ position:"relative", zIndex:1 }}>
          <p style={{ fontSize:"13px", color:"rgba(255,255,255,.5)", fontWeight:"500", marginBottom:"6px" }}>{greet} 👋</p>
          <h2 style={{ fontSize:"28px", fontWeight:"800", color:"#fff", letterSpacing:"-0.5px", marginBottom:"8px" }}>Welcome back, {firstName}</h2>
          <p style={{ fontSize:"13px", color:"rgba(255,255,255,.4)", marginBottom:"20px" }}>📍 {user.city} · Patient ID: <span style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:"12px", color:"rgba(99,179,237,.8)" }}>{user.id}</span></p>
          <div style={{ display:"flex", gap:"10px", flexWrap:"wrap" }}>
            <span style={{ background:"rgba(239,68,68,.25)", color:"#fca5a5", padding:"5px 12px", borderRadius:"8px", fontSize:"12px", fontWeight:"700" }}>🩸 {user.blood}</span>
            <span style={{ background:"rgba(255,255,255,.1)", color:"rgba(255,255,255,.7)", padding:"5px 12px", borderRadius:"8px", fontSize:"12px" }}>⚖️ {user.weight}</span>
            <span style={{ background:"rgba(255,255,255,.1)", color:"rgba(255,255,255,.7)", padding:"5px 12px", borderRadius:"8px", fontSize:"12px" }}>📏 {user.height}</span>
            {user.conditions.map(c => <span key={c} style={{ background:"rgba(245,158,11,.2)", color:"#fcd34d", padding:"5px 12px", borderRadius:"8px", fontSize:"12px" }}>{c}</span>)}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="responsive-grid-4" style={{ marginBottom:"28px" }}>
        {[
          { label:"Pending Meds",   value: pendingMeds.length, sub:"today",           color:"#ef4444", bg:"#fef2f2", emoji:"💊" },
          { label: "Mood Score",     value: `${avgMood}/10`,    sub: "weekly average",   color: "#7c3aed", bg: "#f5f3ff", emoji: MOODS[Math.min(avgMood - 1, 9)]?.e || "🙂" },
          { label: "Pending Consults", value: requests.filter(r => r.status === 'Pending').length, sub: "awaiting doctor", color: "#0ea5e9", bg: "#f0f9ff", emoji: "👨‍⚕️" },
          { label: "Last Check-up",  value: user.last_checkup || "—", sub: (user.doctor || "—").split(",")[0], color: "#059669", bg: "#f0fdf4", emoji: "🩺" },
        ].map((s,i) => (
          <div key={i} className="stat-card" style={{ borderTop:`3px solid ${s.color}` }}>
            <div style={{ fontSize:"22px", marginBottom:"10px" }}>{s.emoji}</div>
            <div style={{ fontSize:"22px", fontWeight:"800", color:s.color, letterSpacing:"-0.5px" }}>{s.value}</div>
            <div style={{ fontSize:"12px", fontWeight:"600", color:"#0f172a", marginTop:"2px" }}>{s.label}</div>
            <div style={{ fontSize:"11px", color:"#9ca3af", marginTop:"2px" }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Pending meds alert */}
      {pendingMeds.length > 0 && (
        <div style={{ background:"#fffbeb", border:"1px solid #fde68a", borderRadius:"14px", padding:"18px 22px", marginBottom:"24px", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:"12px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
            <span style={{ fontSize:"22px" }}>⏰</span>
            <div>
              <div style={{ fontSize:"14px", fontWeight:"700", color:"#78350f" }}>{pendingMeds.length} medication{pendingMeds.length > 1 ? "s" : ""} pending today</div>
              <div style={{ fontSize:"12px", color:"#92400e", marginTop:"2px" }}>{pendingMeds.slice(0, 3).map(m => `${m.name} ${m.dose}`).join(" · ")}{pendingMeds.length > 3 ? "..." : ""}</div>
            </div>
          </div>
          <button className="btn btn-ghost" style={{ fontSize:"12px" }} onClick={() => setPage("meds")}>View Medications →</button>
        </div>
      )}

      {/* 2-column: quick access + recent */}
      <div className="responsive-grid-sidebar">
        {/* Quick access grid */}
        <div>
          <h3 style={{ fontSize:"15px", fontWeight:"700", color:"#0f172a", marginBottom:"16px" }}>Quick Access</h3>
          <div className="responsive-grid-3">
            {quickCards.map(c => (
              <button key={c.page} onClick={() => setPage(c.page)}
                style={{ background:c.bg, border:"1.5px solid #e9eef5", borderRadius:"14px", padding:"20px 16px", textAlign:"left", cursor:"pointer", transition:"all .2s" }}
                onMouseEnter={e => { e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 8px 24px rgba(0,0,0,.08)"; e.currentTarget.style.borderColor="#d1d5db"; }}
                onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="none"; e.currentTarget.style.borderColor="#e9eef5"; }}>
                <div style={{ fontSize:"28px", marginBottom:"10px" }}>{c.icon}</div>
                <div style={{ fontSize:"13px", fontWeight:"700", color:"#0f172a", marginBottom:"3px" }}>{c.title}</div>
                <div style={{ fontSize:"11px", color:"#9ca3af", marginBottom:"10px", lineHeight:"1.4" }}>{c.sub}</div>
                <span className={`tag ${c.tagC}`}>{c.tag}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div>
          <h3 style={{ fontSize:"15px", fontWeight:"700", color:"#0f172a", marginBottom:"16px" }}>Recent Activity</h3>
          <div className="card" style={{ padding:"0" }}>
            {reports.length === 0 && logs.length === 0 && requests.length === 0 && meds.filter(m => m.taken_today).length === 0 && (
              <div style={{ padding:"40px", textAlign:"center", color:"#9ca3af", fontSize:"12px" }}>No recent activity yet.</div>
            )}

            {requests.slice(0, 2).map((r, i) => (
              <div key={`req-${i}`} onClick={() => setPage("consult")} style={{ display:"flex", alignItems:"center", gap:"12px", padding:"14px 18px", borderBottom: "1px solid #f8fafc", cursor: "pointer" }}>
                <div style={{ width:"36px", height:"36px", background:"#f0f9ff", borderRadius:"10px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"16px", flexShrink:0 }}>👨‍⚕️</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:"13px", fontWeight:"600", color:"#0f172a" }}>Consultation with {r.doctors?.name}</div>
                  <div style={{ fontSize:"11px", color:"#9ca3af", marginTop:"1px" }}>{r.status} · Requested on {new Date(r.created_at).toLocaleDateString()}</div>
                </div>
                <span className={`tag ${r.status === 'Accepted' ? 'tag-green' : 'tag-gray'}`}>Consult</span>
              </div>
            ))}

            {reports.slice(0, 2).map((r, i) => (
              <div key={`rep-${i}`} style={{ display:"flex", alignItems:"center", gap:"12px", padding:"14px 18px", borderBottom: "1px solid #f8fafc" }}>
                <div style={{ width:"36px", height:"36px", background:"#fefbeb", borderRadius:"10px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"16px", flexShrink:0 }}>📄</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:"13px", fontWeight:"600", color:"#0f172a" }}>{r.name}</div>
                  <div style={{ fontSize:"11px", color:"#9ca3af", marginTop:"1px" }}>{r.date} · {r.status}</div>
                </div>
                <span className={`tag tag-amber`}>Report</span>
              </div>
            ))}

            {meds.filter(m => m.taken_today).slice(0, 2).map((m, i) => (
              <div key={`med-${i}`} style={{ display:"flex", alignItems:"center", gap:"12px", padding:"14px 18px", borderBottom: "1px solid #f8fafc" }}>
                <div style={{ width:"36px", height:"36px", background:"#f0fdf4", borderRadius:"10px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"16px", flexShrink:0 }}>💊</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:"13px", fontWeight:"600", color:"#0f172a" }}>{m.name} taken</div>
                  <div style={{ fontSize:"11px", color:"#9ca3af", marginTop:"1px" }}>Today {m.time}</div>
                </div>
                <span className={`tag tag-green`}>Done</span>
              </div>
            ))}

            {logs.slice(0, 2).map((l, i) => (
              <div key={`mood-${i}`} style={{ display:"flex", alignItems:"center", gap:"12px", padding:"14px 18px", borderBottom: i < logs.slice(0,2).length - 1 ? "1px solid #f8fafc" : "" }}>
                <div style={{ width:"36px", height:"36px", background:"#faf5ff", borderRadius:"10px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"16px", flexShrink:0 }}>{MOODS[Math.min(l.score-1, 9)]?.e}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:"13px", fontWeight:"600", color:"#0f172a" }}>Mood: {l.score}/10</div>
                  <div style={{ fontSize:"11px", color:"#9ca3af", marginTop:"1px" }}>{l.day} · {l.note?.slice(0, 20)}{l.note?.length > 20 ? "..." : ""}</div>
                </div>
                <span className={`tag tag-purple`}>Mental</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
