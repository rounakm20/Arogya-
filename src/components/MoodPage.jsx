import { useState } from "react";
import { useMoodLogs } from "../hooks/useMoodLogs";
import { MOODS } from "../data/constants";

export default function MoodPage({ userId }) {
  const { logs, loading, addLog } = useMoodLogs(userId);
  const [sel, setSel] = useState(null);
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);
  const [tip, setTip] = useState("");
  const [saving, setSaving] = useState(false);

  const tips = [
    "Take 5 deep breaths — inhale 4 counts, exhale 6.",
    "A 10-minute walk outside can lift your mood significantly.",
    "Talk to someone you trust today.",
    "Drink water and step away from screens for 5 minutes.",
    "Write down 3 things you are grateful for right now.",
  ];

  async function save() {
    if (!sel) return;
    setSaving(true);
    try {
      const moodData = MOODS[sel - 1];
      await addLog({
        score: sel,
        note,
        mood_name: moodData.l,
        mood_emoji: moodData.e
      });
      setTip(tips[Math.floor(Math.random() * tips.length)]);
      setSaved(true); setSel(null); setNote("");
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  }

  const avg = logs.length ? Math.round(logs.reduce((a,b) => a+b.score, 0) / logs.length) : 0;
  const maxScore = 10;

  return (
    <div className="fade responsive-grid-sidebar" style={{ alignItems:"start" }}>
      {/* Left */}
      <div>
        {/* Stats */}
        <div className="responsive-grid-3" style={{ marginBottom:"22px" }}>
          {[
            { v:`${avg}/10`, l:"Avg This Week", e: MOODS[Math.min(avg-1,9)]?.e || "🙂" },
            { v:logs.length, l:"Total Check-ins", e:"📅" },
            { v:Math.max(...logs.map(l=>l.score))+"/10", l:"Best Score", e:"🏆" },
          ].map((s,i) => (
            <div key={i} className="stat-card" style={{ textAlign:"center" }}>
              <div style={{ fontSize:"24px", marginBottom:"6px" }}>{s.e}</div>
              <div style={{ fontSize:"22px", fontWeight:"800", color:"#0f172a" }}>{s.v}</div>
              <div style={{ fontSize:"12px", color:"#9ca3af", marginTop:"2px" }}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Bar chart */}
        <div className="card" style={{ marginBottom:"22px" }}>
          <h3 style={{ fontSize:"14px", fontWeight:"700", marginBottom:"16px" }}>Weekly Mood Chart</h3>
          <div style={{ display:"flex", gap:"8px", alignItems:"flex-end", height:"80px" }}>
            {[...logs].slice(0,7).reverse().map((l,i) => (
              <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:"4px" }}>
                <div style={{ width:"100%", background: l.score>=7 ? "#059669" : l.score>=5 ? "#f59e0b" : "#ef4444", borderRadius:"6px", height:`${(l.score/maxScore)*72}px`, opacity:.85, transition:"height .4s ease", minHeight:"8px" }}/>
                <div style={{ fontSize:"10px", color:"#9ca3af", fontWeight:"500" }}>{l.day.slice(0,3)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Log new */}
        <div className="card">
          <h3 style={{ fontSize:"14px", fontWeight:"700", marginBottom:"14px" }}>How are you feeling right now?</h3>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:"8px", marginBottom:"14px" }}>
            {MOODS.map(m => (
              <button key={m.s} className={`mood-btn ${sel===m.s ? "sel" : ""}`} onClick={() => setSel(m.s)}>
                <span style={{ fontSize:"22px" }}>{m.e}</span>
                <span style={{ fontSize:"11px" }}>{m.s}</span>
              </button>
            ))}
          </div>
          {sel && <p style={{ textAlign:"center", fontSize:"13px", color:"#059669", fontWeight:"600", marginBottom:"12px" }}>{sel}/10 — {MOODS[sel-1].l}</p>}
          <textarea className="inp" style={{ height:"72px", resize:"none", marginBottom:"12px" }} placeholder="What's on your mind? (Hindi or English)" value={note} onChange={e => setNote(e.target.value)}/>
          <button className="btn btn-primary btn-full" onClick={save} disabled={!sel || saving}>{saving ? "⏳ Saving…" : "Save & Get Wellness Tip"}</button>
        </div>
      </div>

      {/* Right */}
      <div>
        {saved && tip && (
          <div className="card fade" style={{ marginBottom:"16px", border:"1.5px solid #ede9fe", background:"#faf5ff" }}>
            <div style={{ fontSize:"13px", fontWeight:"700", color:"#5b21b6", marginBottom:"6px" }}>💜 Wellness Tip</div>
            <div style={{ fontSize:"13px", color:"#6d28d9", lineHeight:"1.7" }}>{tip}</div>
            <button className="btn btn-ghost" style={{ marginTop:"10px", fontSize:"12px", padding:"6px 12px" }} onClick={() => setSaved(false)}>Dismiss</button>
          </div>
        )}

        <div className="card">
          <h3 style={{ fontSize:"14px", fontWeight:"700", marginBottom:"14px" }}>Recent Check-ins</h3>
          {logs.slice(0,7).map((l,i) => (
            <div key={i} className="data-row">
              <span style={{ fontSize:"22px" }}>{MOODS[Math.min(l.score-1,9)]?.e}</span>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", justifyContent:"space-between" }}>
                  <span style={{ fontSize:"13px", fontWeight:"600" }}>{l.score}/10 — {MOODS[Math.min(l.score-1,9)]?.l}</span>
                  <span style={{ fontSize:"11px", color:"#9ca3af" }}>{l.day}</span>
                </div>
                {l.note && <div style={{ fontSize:"11px", color:"#9ca3af", marginTop:"2px" }}>{l.note}</div>}
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop:"14px", background:"#fef3c7", border:"1px solid #fde68a", borderRadius:"12px", padding:"14px 16px" }}>
          <p style={{ fontSize:"12px", color:"#78350f", lineHeight:"1.6" }}>💛 Feeling persistently low? Reach out to iCall helpline: <strong>9152987821</strong></p>
        </div>
      </div>
    </div>
  );
}
