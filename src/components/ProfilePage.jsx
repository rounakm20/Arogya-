export default function ProfilePage({ user, onLogout, setPage }) {
  const initials = (user.name || "U").split(" ").map(n => n[0]).join("").toUpperCase();

  const bmiNum = parseFloat(user.bmi);
  const bmiLabel = bmiNum < 18.5 ? "Underweight" : bmiNum < 25 ? "Normal" : bmiNum < 30 ? "Overweight" : "Obese";
  const bmiColor = bmiNum < 18.5 ? "#f59e0b" : bmiNum < 25 ? "#059669" : bmiNum < 30 ? "#f97316" : "#ef4444";

  const Section = ({ title, children }) => (
    <div className="card" style={{ marginBottom: "16px" }}>
      <h3 style={{ fontSize: "14px", fontWeight: "700", color: "#0f172a", marginBottom: "16px", paddingBottom: "10px", borderBottom: "1px solid #f1f5f9" }}>{title}</h3>
      {children}
    </div>
  );

  const Field = ({ label, value, mono }) => (
    <div style={{ marginBottom: "14px" }}>
      <div style={{ fontSize: "11px", fontWeight: "700", color: "#9ca3af", textTransform: "uppercase", letterSpacing: ".6px", marginBottom: "3px" }}>{label}</div>
      <div style={{ fontSize: "13.5px", fontWeight: "600", color: "#0f172a", fontFamily: mono ? "'JetBrains Mono', monospace" : "inherit" }}>{value || "—"}</div>
    </div>
  );

  return (
    <div className="fade responsive-grid-sidebar-left" style={{ alignItems: "start" }}>

      {/* ── LEFT PANEL ── */}
      <div>
        {/* Avatar card */}
        <div className="card" style={{ marginBottom: "16px", textAlign: "center", padding: "28px 20px" }}>
          <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: "#d1fae5", border: "3px solid #a7f3d0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", fontWeight: "800", color: "#059669", margin: "0 auto 12px" }}>
            {initials}
          </div>
          <div style={{ fontSize: "18px", fontWeight: "800", color: "#0f172a", marginBottom: "2px" }}>{user.name}</div>
          <div style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "4px" }}>{user.email}</div>
          <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "16px" }}>📍 {user.city}</div>

          {/* Key badges */}
          <div style={{ display: "flex", justifyContent: "center", gap: "8px", flexWrap: "wrap", marginBottom: "18px" }}>
            <span className="tag tag-red" style={{ fontSize: "13px", padding: "5px 12px" }}>🩸 {user.blood}</span>
            <span className="tag tag-gray">{user.gender}</span>
            <span className="tag tag-gray">{user.age}y</span>
          </div>

          <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "14px", display: "flex", flexDirection: "column", gap: "8px" }}>
            <button className="btn btn-outline btn-full" style={{ fontSize: "13px" }} onClick={() => setPage("qr")}>🪪 View QR Passport</button>
            <button className="btn btn-danger btn-full" style={{ fontSize: "13px" }} onClick={onLogout}>Sign Out</button>
          </div>
        </div>

        {/* BMI card */}
        <div className="card" style={{ marginBottom: "16px" }}>
          <h3 style={{ fontSize: "13px", fontWeight: "700", color: "#0f172a", marginBottom: "14px" }}>Body Metrics</h3>
          <div className="responsive-grid-2" style={{ marginBottom: "12px" }}>
            {[["⚖️ Weight", user.weight], ["📏 Height", user.height]].map(([k, v]) => (
              <div key={k} style={{ background: "#f8fafc", borderRadius: "10px", padding: "12px", textAlign: "center" }}>
                <div style={{ fontSize: "11px", color: "#9ca3af", marginBottom: "3px" }}>{k}</div>
                <div style={{ fontSize: "15px", fontWeight: "800", color: "#0f172a" }}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{ background: "#f8fafc", borderRadius: "10px", padding: "12px", textAlign: "center" }}>
            <div style={{ fontSize: "11px", color: "#9ca3af", marginBottom: "3px" }}>🫀 BMI</div>
            <div style={{ fontSize: "20px", fontWeight: "800", color: bmiColor }}>{user.bmi}</div>
            <span style={{ fontSize: "11px", fontWeight: "600", color: bmiColor, background: `${bmiColor}18`, padding: "2px 8px", borderRadius: "6px", marginTop: "4px", display: "inline-block" }}>{bmiLabel}</span>
          </div>
        </div>

        {/* Alerts */}
        <div className="card">
          <h3 style={{ fontSize: "13px", fontWeight: "700", color: "#0f172a", marginBottom: "12px" }}>⚠️ Medical Alerts</h3>
          <div style={{ marginBottom: "10px" }}>
            <div style={{ fontSize: "11px", fontWeight: "700", color: "#9ca3af", textTransform: "uppercase", letterSpacing: ".6px", marginBottom: "7px" }}>Conditions</div>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {(user.conditions || []).map(c => <span key={c} className="tag tag-amber">{c}</span>)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: "11px", fontWeight: "700", color: "#9ca3af", textTransform: "uppercase", letterSpacing: ".6px", marginBottom: "7px" }}>Allergies</div>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {(user.allergies || []).map(a => <span key={a} className="tag tag-red">⚠ {a}</span>)}
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div>
        {/* Personal info */}
        <Section title="👤 Personal Information">
          <div className="responsive-grid-3">
            <Field label="Full Name" value={user.name} />
            <Field label="Date of Birth" value={user.dob} />
            <Field label="Age" value={user.age + " years"} />
            <Field label="Gender" value={user.gender} />
            <Field label="Blood Group" value={user.blood} />
            <Field label="City" value={user.city} />
            <Field label="Email" value={user.email} />
            <Field label="Phone" value={user.phone} />
            <Field label="Patient ID" value={user.id} mono />
          </div>
        </Section>

        {/* Emergency + Insurance */}
        <Section title="🚨 Emergency & Insurance">
          <div className="responsive-grid-2">
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "12px", padding: "16px" }}>
              <div style={{ fontSize: "12px", fontWeight: "700", color: "#991b1b", marginBottom: "6px" }}>🚨 Emergency Contact</div>
              <div style={{ fontSize: "14px", fontWeight: "700", color: "#0f172a" }}>{user.emergency_contact || "Not set"}</div>
            </div>
            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "12px", padding: "16px" }}>
              <div style={{ fontSize: "12px", fontWeight: "700", color: "#065f46", marginBottom: "6px" }}>🏛 Insurance</div>
              <div style={{ fontSize: "14px", fontWeight: "700", color: "#0f172a" }}>{user.insurance || "Not set"}</div>
            </div>
          </div>
        </Section>

        {/* Doctor & clinical */}
        <Section title="🏥 Clinical Details">
          <div className="responsive-grid-2">
            <Field label="Primary Doctor" value={user.doctor} />
            <Field label="Last Check-up" value={user.last_checkup} />
          </div>
          <div className="responsive-grid-3" style={{ marginTop: "4px" }}>
            {(user.vaccinations || []).map((v, i) => (
              <div key={i} style={{ background: "#f0fdf4", border: "1px solid #d1fae5", borderRadius: "10px", padding: "10px 12px", fontSize: "12px", color: "#065f46", fontWeight: "500" }}>
                ✓ {v}
              </div>
            ))}
          </div>
        </Section>

        {/* Medications */}
        <Section title="💊 Current Medications">
          <div className="responsive-grid-2">
            {(user.medications || []).map((m, i) => (
              <div key={i} style={{ background: "#f8fafc", border: "1px solid #e9eef5", borderRadius: "10px", padding: "12px 14px", display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "34px", height: "34px", background: "#dbeafe", borderRadius: "9px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", flexShrink: 0 }}>💊</div>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: "600", color: "#0f172a" }}>{m.split("–")[0].trim()}</div>
                  <div style={{ fontSize: "11px", color: "#9ca3af" }}>{m.split("–")[1]?.trim()}</div>
                </div>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}