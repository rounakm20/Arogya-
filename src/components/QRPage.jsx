import { useState } from "react";
import QRCode from "./QRCode";

export default function QRPage({ user }) {
  const [scanning, setScanning] = useState(false);
  const [scanPhase, setScanPhase] = useState("scanning");
  const [scannedView, setScannedView] = useState(false);
  const [scannedTab, setScannedTab] = useState("overview");
  const [sharing, setSharing] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareLink = `${window.location.origin}/p/${user.uuid}`;
  const initials = (user.name || "U").split(" ").map(n => n[0]).join("").toUpperCase();

  function startScan() {
    setScanning(true); setScanPhase("scanning");
    setTimeout(() => setScanPhase("found"), 1200);
    setTimeout(() => { 
      setScanning(false); 
      // In a real app, this would use a library like html5-qrcode.
      // We simulate the scan result by opening the user's own public profile.
      window.open(shareLink, '_blank');
    }, 2000);
  }
  function copy() { setCopied(true); setTimeout(() => setCopied(false), 2000); }

  return (
    <div className="fade">
      {/* Scanner overlay */}
      {scanning && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.93)", zIndex:200, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"24px" }}>
          {scanPhase === "found" ? (
            <div className="fade" style={{ textAlign:"center", color:"#fff" }}>
              <div style={{ width:"72px", height:"72px", background:"#059669", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"32px", margin:"0 auto 18px" }}>✓</div>
              <div style={{ fontSize:"20px", fontWeight:"700" }}>QR Verified!</div>
              <div style={{ fontSize:"13px", color:"rgba(255,255,255,.5)", marginTop:"6px" }}>Loading patient data…</div>
            </div>
          ) : (
            <>
              <div style={{ fontSize:"13px", color:"rgba(255,255,255,.6)", marginBottom:"32px", letterSpacing:"2px", textTransform:"uppercase", fontWeight:"600" }}>Scanning QR Code</div>
              <div style={{ position:"relative", width:"240px", height:"240px", marginBottom:"32px" }}>
                {[[0,0],[0,1],[1,0],[1,1]].map(([r,c],i) => (
                  <div key={i} style={{ position:"absolute", width:"28px", height:"28px",
                    top:r===0?0:"auto", bottom:r===1?0:"auto",
                    left:c===0?0:"auto", right:c===1?0:"auto",
                    borderTop:r===0?"3px solid #059669":"none",
                    borderBottom:r===1?"3px solid #059669":"none",
                    borderLeft:c===0?"3px solid #059669":"none",
                    borderRight:c===1?"3px solid #059669":"none" }}/>
                ))}
                <div style={{ position:"absolute", inset:"16px", background:"rgba(255,255,255,.03)", borderRadius:"4px", overflow:"hidden" }}>
                  <div className="scan-line"/>
                </div>
              </div>
              <p style={{ fontSize:"12px", color:"rgba(255,255,255,.35)" }}>Point camera at any Arogya QR code</p>
              <button onClick={() => setScanning(false)} style={{ marginTop:"28px", padding:"10px 24px", background:"rgba(255,255,255,.08)", border:"1px solid rgba(255,255,255,.15)", color:"rgba(255,255,255,.5)", borderRadius:"10px", cursor:"pointer", fontSize:"13px" }}>Cancel</button>
            </>
          )}
        </div>
      )}

      {/* Share modal */}
      {sharing && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.4)", zIndex:150, display:"flex", alignItems:"center", justifyContent:"center", padding:"24px" }} onClick={() => setSharing(false)}>
          <div style={{ background:"#fff", borderRadius:"20px", padding:"28px", width:"100%", maxWidth:"460px", boxShadow:"0 24px 64px rgba(0,0,0,.15)" }} onClick={e => e.stopPropagation()} className="fade">
            <h3 style={{ fontSize:"17px", fontWeight:"700", marginBottom:"18px" }}>Share Health Passport</h3>
            <div style={{ background:"#f8fafc", border:"1px solid #e2e8f0", borderRadius:"10px", padding:"12px 14px", display:"flex", alignItems:"center", gap:"10px", marginBottom:"16px" }}>
              <span style={{ fontSize:"12px", color:"#64748b", flex:1, fontFamily:"'JetBrains Mono',monospace", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{shareLink}</span>
              <button className="btn btn-primary" style={{ fontSize:"12px", padding:"6px 14px" }} onClick={copy}>{copied ? "✓ Copied!" : "Copy"}</button>
            </div>
            {[{ icon:"👨‍⚕️", l:"Share with Doctor", s:"Send link via WhatsApp" },{ icon:"🏥", l:"Share with Hospital", s:"Generate temp access PIN" },{ icon:"🚨", l:"Emergency Access", s:"24-hour open access link" },{ icon:"📥", l:"Download as PDF", s:"Save to your device" }].map(o => (
              <button key={o.l} style={{ width:"100%", display:"flex", alignItems:"center", gap:"14px", padding:"13px 14px", background:"#fff", border:"1px solid #f1f5f9", borderRadius:"12px", marginBottom:"8px", textAlign:"left", cursor:"pointer", transition:"all .15s" }}
                onMouseEnter={e => { e.currentTarget.style.background="#f9fafb"; e.currentTarget.style.borderColor="#d1d5db"; }}
                onMouseLeave={e => { e.currentTarget.style.background="#fff"; e.currentTarget.style.borderColor="#f1f5f9"; }}>
                <div style={{ width:"38px", height:"38px", background:"#f1f5f9", borderRadius:"10px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"17px", flexShrink:0 }}>{o.icon}</div>
                <div><div style={{ fontSize:"13.5px", fontWeight:"600", color:"#0f172a" }}>{o.l}</div><div style={{ fontSize:"11.5px", color:"#9ca3af" }}>{o.s}</div></div>
                <div style={{ marginLeft:"auto", color:"#d1d5db", fontSize:"20px" }}>›</div>
              </button>
            ))}
            <button className="btn btn-ghost btn-full" style={{ marginTop:"8px" }} onClick={() => setSharing(false)}>Close</button>
          </div>
        </div>
      )}

      <div className="responsive-grid-sidebar-left" style={{ alignItems:"start" }}>
        {/* Left — Passport card */}
        <div>
          {/* Dark passport card */}
          <div style={{ background:"linear-gradient(135deg,#0f172a 0%,#1e3a5f 55%,#0f172a 100%)", borderRadius:"20px", padding:"24px", color:"#fff", position:"relative", overflow:"hidden", marginBottom:"16px" }}>
            <div style={{ position:"absolute", top:-50, right:-50, width:160, height:160, borderRadius:"50%", background:"rgba(5,150,105,.12)" }}/>
            <div style={{ position:"absolute", bottom:-30, left:-20, width:120, height:120, borderRadius:"50%", background:"rgba(59,130,246,.08)" }}/>
            {/* Header */}
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"20px", position:"relative", zIndex:1 }}>
              <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                <div style={{ width:"30px", height:"30px", background:"#059669", borderRadius:"9px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"15px" }}>🩺</div>
                <div>
                  <div style={{ fontSize:"12px", fontWeight:"800", letterSpacing:"2px", color:"#34d399", textTransform:"uppercase" }}>Arogya</div>
                  <div style={{ fontSize:"9px", color:"rgba(255,255,255,.4)" }}>Digital Health Passport</div>
                </div>
              </div>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontSize:"9px", color:"rgba(255,255,255,.4)" }}>PATIENT ID</div>
                <div style={{ fontSize:"11px", fontWeight:"600", fontFamily:"'JetBrains Mono',monospace", color:"#93c5fd" }}>{user.id}</div>
              </div>
            </div>
            {/* QR + Info */}
            <div style={{ display:"flex", gap:"16px", alignItems:"flex-start", position:"relative", zIndex:1 }}>
              <div style={{ background:"#fff", borderRadius:"12px", padding:"8px", width:"100px", height:"100px", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", position:"relative", flexShrink:0 }} onClick={startScan}>
                <QRCode size={84} value={user.id + user.name + user.blood}/>
                <div style={{ position:"absolute", bottom:3, left:0, right:0, textAlign:"center", fontSize:"7px", color:"#94a3b8", fontWeight:"600", letterSpacing:"0.5px" }}>TAP TO SCAN</div>
              </div>
              <div style={{ flex:1 }}>
                {/* Name comes from login form */}
                <div style={{ fontSize:"18px", fontWeight:"800", color:"#fff", letterSpacing:"-0.5px", marginBottom:"3px" }}>{user.name}</div>
                <div style={{ fontSize:"11px", color:"rgba(255,255,255,.5)", marginBottom:"10px" }}>{user.dob} · {user.age}y · {user.gender}</div>
                <div style={{ display:"flex", gap:"6px", flexWrap:"wrap", marginBottom:"8px" }}>
                  <span style={{ background:"rgba(239,68,68,.25)", color:"#fca5a5", padding:"4px 10px", borderRadius:"7px", fontSize:"12px", fontWeight:"700" }}>🩸 {user.blood}</span>
                  <span style={{ background:"rgba(255,255,255,.1)", color:"rgba(255,255,255,.75)", padding:"4px 10px", borderRadius:"7px", fontSize:"11px" }}>⚖ {user.weight}</span>
                </div>
                {user.allergies.map(a => <span key={a} style={{ background:"rgba(245,158,11,.2)", color:"#fcd34d", padding:"3px 9px", borderRadius:"7px", fontSize:"10px", display:"inline-block", marginRight:"4px" }}>⚠ {a}</span>)}
              </div>
            </div>
            {/* Footer */}
            <div style={{ marginTop:"18px", paddingTop:"12px", borderTop:"1px solid rgba(255,255,255,.08)", display:"flex", justifyContent:"space-between", alignItems:"center", position:"relative", zIndex:1 }}>
              <div style={{ fontSize:"9px", color:"rgba(255,255,255,.3)" }}>Issued: {user.issued} · Expires: {user.expiry}</div>
              <div style={{ display:"flex", gap:"5px", alignItems:"center" }}>
                <div style={{ width:"7px", height:"7px", borderRadius:"50%", background:"#34d399" }} className="pulse"/>
                <div style={{ fontSize:"9px", color:"#34d399", fontWeight:"700", letterSpacing:"1px" }}>ACTIVE</div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="responsive-grid-2" style={{ marginBottom:"16px" }}>
            <button onClick={startScan} style={{ background:"#ecfdf5", border:"1.5px solid #a7f3d0", borderRadius:"12px", padding:"14px", textAlign:"left", cursor:"pointer", transition:"all .15s" }}
              onMouseEnter={e => e.currentTarget.style.opacity=".85"} onMouseLeave={e => e.currentTarget.style.opacity="1"}>
              <div style={{ fontSize:"20px", marginBottom:"5px" }}>📷</div>
              <div style={{ fontSize:"13px", fontWeight:"700", color:"#065f46" }}>Scan QR</div>
              <div style={{ fontSize:"11px", color:"#9ca3af", marginTop:"2px" }}>Verify a passport</div>
            </button>
            <button onClick={() => setSharing(true)} style={{ background:"#eff6ff", border:"1.5px solid #bfdbfe", borderRadius:"12px", padding:"14px", textAlign:"left", cursor:"pointer", transition:"all .15s" }}
              onMouseEnter={e => e.currentTarget.style.opacity=".85"} onMouseLeave={e => e.currentTarget.style.opacity="1"}>
              <div style={{ fontSize:"20px", marginBottom:"5px" }}>↗</div>
              <div style={{ fontSize:"13px", fontWeight:"700", color:"#1e40af" }}>Share</div>
              <div style={{ fontSize:"11px", color:"#9ca3af", marginTop:"2px" }}>Share with doctor</div>
            </button>
          </div>

          {/* Security note */}
          <div style={{ background:"#fef3c7", border:"1px solid #fde68a", borderRadius:"12px", padding:"14px 16px", display:"flex", gap:"10px" }}>
            <span style={{ fontSize:"16px" }}>🔐</span>
            <p style={{ fontSize:"11.5px", color:"#78350f", lineHeight:"1.6" }}>Your passport is end-to-end encrypted. Only people you explicitly share it with can view your health data.</p>
          </div>
        </div>

        {/* Right — Passport Information Details */}
        {scannedView ? (
          <div className="fade">
            <div style={{ background:"#ecfdf5", border:"1px solid #a7f3d0", borderRadius:"14px", padding:"14px 18px", marginBottom:"16px", display:"flex", alignItems:"center", gap:"12px" }}>
              <div style={{ width:"32px", height:"32px", background:"#059669", borderRadius:"8px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"15px" }}>✓</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:"13px", fontWeight:"700", color:"#065f46" }}>QR Passport Status</div>
                <div style={{ fontSize:"11px", color:"#6b7280" }}>Active and securely encrypted</div>
              </div>
              <button className="btn btn-outline" style={{ fontSize:"12px", padding:"7px 14px" }} onClick={() => setScannedView(false)}>← Back</button>
            </div>

            <div className="card" style={{ marginBottom:"14px" }}>
              <div style={{ display:"flex", alignItems:"center", gap:"14px", marginBottom:"14px" }}>
                <div style={{ width:"52px", height:"52px", borderRadius:"50%", background:"#d1fae5", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"18px", fontWeight:"800", color:"#059669" }}>{initials}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:"17px", fontWeight:"800", color:"#0f172a" }}>{user.name}</div>
                  <div style={{ fontSize:"12px", color:"#6b7280" }}>{user.dob} · {user.age}y · {user.gender}</div>
                </div>
                <div style={{ background:"#fee2e2", color:"#ef4444", fontWeight:"800", fontSize:"15px", padding:"8px 12px", borderRadius:"10px" }}>{user.blood}</div>
              </div>
              <div style={{ display:"flex", gap:"6px", flexWrap:"wrap" }}>
                {user.allergies.map(a => <span key={a} className="tag tag-amber">⚠ {a} Allergy</span>)}
                {user.conditions.map(c => <span key={c} className="tag tag-blue">{c}</span>)}
              </div>
            </div>

            <div style={{ display:"flex", gap:"8px", marginBottom:"16px" }}>
              {["overview","medical","meds","vitals"].map(t => (
                <button key={t}
                  style={{ padding:"8px 16px", borderRadius:"8px", fontSize:"12.5px", fontWeight:"600", border:"none", cursor:"pointer", transition:"all .15s",
                    background: scannedTab===t ? "#0f172a" : "#f3f4f6",
                    color: scannedTab===t ? "#fff" : "#6b7280" }}
                  onClick={() => setScannedTab(t)}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>

            {scannedTab === "overview" && (
              <div className="fade responsive-grid-2">
                {[["📞 Emergency", user.emergency_contact],["🏥 Doctor", user.doctor],["🏛 Insurance", user.insurance],["📅 Last Check-up", user.last_checkup],["📍 City", user.city],["🪪 Patient ID", user.id]].map(([k,v]) => (
                  <div key={k} style={{ background:"#f8fafc", borderRadius:"12px", padding:"14px" }}>
                    <div style={{ fontSize:"11px", color:"#9ca3af", marginBottom:"3px" }}>{k}</div>
                    <div style={{ fontSize:"13px", fontWeight:"600", color:"#0f172a" }}>{v}</div>
                  </div>
                ))}
              </div>
            )}
            {scannedTab === "medical" && (
              <div className="fade responsive-grid-2">
                <div className="card-sm">
                  <div style={{ fontSize:"12px", fontWeight:"700", color:"#374151", marginBottom:"10px" }}>Conditions</div>
                  {user.conditions.map(c => <div key={c} style={{ fontSize:"13px", color:"#1e40af", padding:"5px 0", borderBottom:"1px solid #f9fafb" }}>• {c}</div>)}
                </div>
                <div className="card-sm">
                  <div style={{ fontSize:"12px", fontWeight:"700", color:"#374151", marginBottom:"10px" }}>Allergies</div>
                  {user.allergies.map(a => <div key={a} style={{ fontSize:"13px", color:"#b45309", padding:"5px 0" }}>⚠ {a}</div>)}
                </div>
                <div className="card-sm" style={{ gridColumn:"1/-1" }}>
                  <div style={{ fontSize:"12px", fontWeight:"700", color:"#374151", marginBottom:"10px" }}>Vaccinations</div>
                  {user.vaccinations.map(v => <div key={v} style={{ fontSize:"12.5px", color:"#059669", padding:"5px 0", borderBottom:"1px solid #f9fafb" }}>✓ {v}</div>)}
                </div>
              </div>
            )}
            {scannedTab === "meds" && (
              <div className="fade">
                {user.medications.map((m,i) => (
                  <div key={i} style={{ background:"#f8fafc", borderRadius:"12px", padding:"14px", marginBottom:"8px", display:"flex", alignItems:"center", gap:"12px" }}>
                    <div style={{ width:"38px", height:"38px", background:"#dbeafe", borderRadius:"10px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"18px" }}>💊</div>
                    <div>
                      <div style={{ fontSize:"13.5px", fontWeight:"600", color:"#0f172a" }}>{m.split("–")[0].trim()}</div>
                      <div style={{ fontSize:"11px", color:"#9ca3af" }}>{m.split("–")[1]?.trim()}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {scannedTab === "vitals" && (
              <div className="fade responsive-grid-2">
                {[["⚖ Weight",user.weight,"Normal"],["📏 Height",user.height,"—"],["🫀 BMI",user.bmi,"Normal"],["🩸 Blood Group",user.blood,"—"],["💉 BP","130/85 mmHg","Borderline"],["📋 Last Check-up",user.last_checkup,"—"]].map(([k,v,s]) => (
                  <div key={k} style={{ background:"#f8fafc", borderRadius:"12px", padding:"14px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                    <div>
                      <div style={{ fontSize:"11px", color:"#9ca3af" }}>{k}</div>
                      <div style={{ fontSize:"15px", fontWeight:"700", color:"#0f172a" }}>{v}</div>
                    </div>
                    {s !== "—" && <span className={s==="Normal" ? "tag tag-green" : s==="Borderline" ? "tag tag-amber" : "tag tag-gray"}>{s}</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="fade">
            <h3 style={{ fontSize:"15px", fontWeight:"700", color:"#0f172a", marginBottom:"14px" }}>What's in your passport</h3>
            <div className="card">
              {[["🩺 Medical History","Conditions, allergies & vaccination records"],["💊 Medications","Current prescriptions & dosages"],["📊 Vitals","Weight, height, BMI & blood pressure"],["👨‍⚕️ Doctor Info","Primary physician & clinic details"],["🏛 Insurance","PM-JAY policy details"],["🚨 Emergency Contact","Instantly accessible in emergencies"]].map(([t,d]) => (
                <div key={t} className="data-row">
                  <div style={{ flex:1 }}>
                    <span style={{ fontSize:"13.5px", fontWeight:"600", color:"#374151" }}>{t}</span>
                    <span style={{ fontSize:"12.5px", color:"#9ca3af" }}> — {d}</span>
                  </div>
                  <div style={{ width:"20px", height:"20px", borderRadius:"50%", background:"#d1fae5", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"10px", color:"#059669" }}>✓</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
