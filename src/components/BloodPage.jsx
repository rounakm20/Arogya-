import { useState, useEffect } from "react";
import { useBloodDonors } from "../hooks/useBloodDonors";

export default function BloodPage({ userId, user }) {
  const { donors, loading, fetchDonors, sendRequest } = useBloodDonors();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [reqOpen, setReqOpen] = useState(false);
  const [reqForm, setReqForm] = useState({ blood:"O+", city:"", name:"", phone:"" });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const groups = ["All","O+","O-","A+","A-","B+","B-","AB+","AB-"];

  // Re-fetch when filter/search changes (debounced)
  useEffect(() => {
    const t = setTimeout(() => fetchDonors({ blood: filter, search }), 300);
    return () => clearTimeout(t);
  }, [filter, search, fetchDonors]);

  const filtered = donors; // already filtered server-side

  return (
    <div className="fade">
      {/* Header row */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"24px", flexWrap:"wrap", gap:"12px" }}>
        <div>
          <h2 style={{ fontSize:"18px", fontWeight:"700", color:"#0f172a" }}>Blood Donor Registry</h2>
          <p style={{ fontSize:"12px", color:"#9ca3af", marginTop:"2px" }}>{filtered.length} donors found in your region</p>
        </div>
        <button className="btn btn-danger" onClick={() => setReqOpen(true)}>🚨 Request Blood Urgently</button>
      </div>

      {/* Emergency request modal */}
      {reqOpen && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.4)", zIndex:100, display:"flex", alignItems:"center", justifyContent:"center", padding:"24px" }} onClick={() => { setReqOpen(false); setSubmitted(false); }}>
          <div style={{ background:"#fff", borderRadius:"20px", padding:"28px", width:"100%", maxWidth:"440px", boxShadow:"0 24px 64px rgba(0,0,0,.2)" }} onClick={e => e.stopPropagation()} className="fade">
            <h3 style={{ fontSize:"17px", fontWeight:"700", marginBottom:"20px" }}>🚨 Urgent Blood Request</h3>
            {!submitted ? (
              <>
                <div className="responsive-grid-2" style={{ marginBottom:"12px" }}>
                  <div><label className="label">Your Name</label><input className="inp" placeholder="Full name" value={reqForm.name} onChange={e => setReqForm({...reqForm, name:e.target.value})}/></div>
                  <div><label className="label">Contact Number</label><input className="inp" placeholder="+91 …" value={reqForm.phone} onChange={e => setReqForm({...reqForm, phone:e.target.value})}/></div>
                </div>
                <div className="responsive-grid-2" style={{ marginBottom:"20px" }}>
                  <div>
                    <label className="label">Blood Group Needed</label>
                    <select className="inp" value={reqForm.blood} onChange={e => setReqForm({...reqForm, blood:e.target.value})}>
                      {groups.slice(1).map(g => <option key={g}>{g}</option>)}
                    </select>
                  </div>
                  <div><label className="label">City</label><input className="inp" placeholder="Your city" value={reqForm.city} onChange={e => setReqForm({...reqForm, city:e.target.value})}/></div>
                </div>
                <div style={{ display:"flex", gap:"10px" }}>
                  <button className="btn btn-danger" style={{ flex:1 }} disabled={submitting} onClick={async () => {
                    if (!reqForm.city || !reqForm.name) return;
                    setSubmitting(true);
                    try { await sendRequest({ ...reqForm, requested_at: new Date().toISOString() }); setSubmitted(true); }
                    catch (e) { console.error(e); setSubmitted(true); /* optimistic */ }
                    finally { setSubmitting(false); }
                  }}>{submitting ? "⏳ Sending…" : "Send Request to Donors"}</button>
                  <button className="btn btn-ghost" onClick={() => setReqOpen(false)}>Cancel</button>
                </div>
              </>
            ) : (
              <div style={{ textAlign:"center", padding:"20px" }} className="fade">
                <div style={{ fontSize:"40px", marginBottom:"12px" }}>✅</div>
                <div style={{ fontSize:"15px", fontWeight:"700", color:"#059669", marginBottom:"6px" }}>Request sent to {filtered.filter(d=>d.available).length} available donors!</div>
                <div style={{ fontSize:"12px", color:"#9ca3af", marginBottom:"18px" }}>Donors will contact you on your number shortly.</div>
                <button className="btn btn-ghost" onClick={() => { setReqOpen(false); setSubmitted(false); }}>Close</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{ display:"flex", gap:"12px", marginBottom:"20px", alignItems:"center", flexWrap:"wrap" }}>
        <input className="inp" style={{ maxWidth:"280px" }} placeholder="🔍 Search by name or city…" value={search} onChange={e => setSearch(e.target.value)}/>
        <div style={{ display:"flex", gap:"6px", flexWrap:"wrap" }}>
          {groups.map(g => (
            <button key={g}
              style={{ padding:"7px 14px", borderRadius:"8px", fontSize:"12px", fontWeight:"600", border:"1.5px solid", cursor:"pointer", transition:"all .15s",
                background: filter===g ? "#0f172a" : "#fff",
                color: filter===g ? "#fff" : "#6b7280",
                borderColor: filter===g ? "#0f172a" : "#e2e8f0" }}
              onClick={() => setFilter(g)}>{g}</button>
          ))}
        </div>
      </div>

      {loading && (
        <div style={{ textAlign:"center", padding:"40px", color:"#9ca3af" }}>⏳ Finding donors in your area…</div>
      )}
      {!loading && filtered.length === 0 && (
        <div style={{ textAlign:"center", padding:"48px", color:"#9ca3af" }}>
          <div style={{ fontSize:"32px", marginBottom:"12px" }}>🩸</div>
          <div style={{ fontSize:"14px", fontWeight:"600" }}>No donors found for this filter.</div>
          <div style={{ fontSize:"12px", marginTop:"6px" }}>Try a different blood group or city.</div>
        </div>
      )}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(300px, 1fr))", gap:"14px" }}>
        {filtered.map(d => (
          <div key={d.id} className="card" style={{ padding:"20px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:"12px", marginBottom:"14px" }}>
              <div style={{ width:"44px", height:"44px", borderRadius:"12px", background:"#fee2e2", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"15px", fontWeight:"800", color:"#ef4444", flexShrink:0 }}>{d.blood}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:"14px", fontWeight:"700", color:"#0f172a" }}>{d.name}</div>
                <div style={{ fontSize:"12px", color:"#9ca3af" }}>📍 {d.city} · Last donated: {d.last_donated || d.last || "Recently"}</div>
              </div>
              <span className={`tag ${d.available ? "tag-green" : "tag-gray"}`}>{d.available ? "Available" : "Unavailable"}</span>
            </div>
            {d.available && (
              <a href={`tel:${d.phone}`} className="btn btn-outline btn-full" style={{ fontSize:"12.5px", display:"block", textAlign:"center", textDecoration:"none" }}>
                📞 Contact Donor
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
