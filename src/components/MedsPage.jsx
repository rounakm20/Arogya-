import { useState } from "react";
import { useMeds } from "../hooks/useMeds";

export default function MedsPage({ userId }) {
  const { meds, loading, addMed, toggleTaken, deleteMed } = useMeds(userId);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name:"", dose:"", time:"08:00", freq:"Daily", notes:"" });
  const [adding, setAdding] = useState(false);

  const taken = meds.filter(m => m.taken_today).length;

  async function add() {
    if (!form.name || !form.dose) return;
    setAdding(true);
    try { await addMed(form); setForm({ name:"", dose:"", time:"08:00", freq:"Daily", notes:"" }); setShowAdd(false); }
    catch (e) { console.error(e); }
    finally { setAdding(false); }
  }

  return (
    <div className="fade">
      {/* Stats */}
      <div className="responsive-grid-3" style={{ marginBottom:"24px" }}>
        {[{ v:taken, l:"Taken Today", c:"#059669" }, { v:meds.length-taken, l:"Pending", c:"#ef4444" }, { v:meds.length, l:"Total Meds", c:"#0f172a" }].map((s,i) => (
          <div key={i} className="stat-card" style={{ textAlign:"center" }}>
            <div style={{ fontSize:"28px", fontWeight:"800", color:s.c }}>{s.v}</div>
            <div style={{ fontSize:"13px", color:"#6b7280", marginTop:"4px" }}>{s.l}</div>
          </div>
        ))}
      </div>

      <div className="progress-bar" style={{ marginBottom:"24px" }}>
        <div className="progress-fill" style={{ width:`${meds.length ? taken/meds.length*100 : 0}%` }}/>
      </div>

      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"16px" }}>
        <h3 style={{ fontSize:"15px", fontWeight:"700", color:"#0f172a" }}>Today's Schedule</h3>
        <button className="btn btn-primary" style={{ fontSize:"12.5px", padding:"8px 16px" }} onClick={() => setShowAdd(!showAdd)}>+ Add Medication</button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="card fade" style={{ marginBottom:"20px", border:"1.5px solid #d1fae5" }}>
          <h4 style={{ fontSize:"14px", fontWeight:"700", marginBottom:"16px" }}>New Medication</h4>
          <div className="responsive-grid-3" style={{ marginBottom:"14px" }}>
            <div><label className="label">Medicine Name</label><input className="inp" placeholder="e.g. Paracetamol" value={form.name} onChange={e => setForm({...form,name:e.target.value})}/></div>
            <div><label className="label">Dose</label><input className="inp" placeholder="e.g. 500mg" value={form.dose} onChange={e => setForm({...form,dose:e.target.value})}/></div>
            <div><label className="label">Time</label><input className="inp" type="time" value={form.time} onChange={e => setForm({...form,time:e.target.value})}/></div>
          </div>
          <div className="responsive-grid-2" style={{ marginBottom:"16px" }}>
            <div>
              <label className="label">Frequency</label>
              <select className="inp" value={form.freq} onChange={e => setForm({...form,freq:e.target.value})}>
                {["Daily","Twice daily","Weekly","As needed"].map(f => <option key={f}>{f}</option>)}
              </select>
            </div>
            <div><label className="label">Notes (optional)</label><input className="inp" placeholder="e.g. Take with food" value={form.notes} onChange={e => setForm({...form,notes:e.target.value})}/></div>
          </div>
          <div style={{ display:"flex", gap:"10px" }}>
            <button className="btn btn-primary" onClick={add} disabled={adding}>{adding ? "Adding…" : "Add Medication"}</button>
            <button className="btn btn-ghost" onClick={() => setShowAdd(false)}>Cancel</button>
          </div>
        </div>
      )}

      {loading && meds.length === 0 && (
        <div style={{ textAlign:"center", padding:"40px", color:"#9ca3af" }}>⏳ Loading medications…</div>
      )}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(300px, 1fr))", gap:"14px" }}>
        {meds.map(m => (
          <div key={m.id} className="card" style={{ opacity: m.taken_today ? .65 : 1, borderLeft:`4px solid ${m.taken_today ? "#9ca3af" : m.color}` }}>
            <div style={{ display:"flex", alignItems:"center", gap:"12px", marginBottom:"12px" }}>
              <div style={{ width:"42px", height:"42px", borderRadius:"12px", background:m.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"18px", flexShrink:0 }}>💊</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:"14px", fontWeight:"700", color: m.taken_today ? "#9ca3af" : "#0f172a", textDecoration: m.taken_today ? "line-through" : "none" }}>{m.name}</div>
                <div style={{ fontSize:"12px", color:"#9ca3af" }}>{m.dose} · {m.freq}</div>
                {m.notes && <div style={{ fontSize:"11px", color:"#b0b8c4", marginTop:"1px" }}>{m.notes}</div>}
              </div>
              <span style={{ fontSize:"12px", fontWeight:"600", color:"#059669", background:"#ecfdf5", padding:"4px 10px", borderRadius:"8px" }}>{m.time}</span>
            </div>
            <div style={{ display:"flex", gap:"8px" }}>
              <button className="btn btn-outline" style={{ flex:1, fontSize:"12px", padding:"8px" }} onClick={() => toggleTaken(m.id, m.taken_today)}>
                {m.taken_today ? "↩ Mark as Pending" : "✓ Mark as Taken"}
              </button>
              <button className="btn btn-danger" style={{ fontSize:"12px", padding:"8px 12px" }} onClick={() => deleteMed(m.id)}>🗑</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
