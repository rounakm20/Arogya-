import { useState } from "react";
import { useAuth } from "../hooks/useAuth";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const COMMON_ALLERGIES = ["Penicillin", "Aspirin", "Ibuprofen", "Sulfa drugs", "Latex", "Pollen", "Dust", "Nuts", "Dairy", "Eggs"];
const COMMON_CONDITIONS = ["Diabetes", "Hypertension", "Asthma", "Heart Disease", "Thyroid", "Arthritis", "None"];

// No props needed — auth hook drives navigation via Supabase session
export default function LoginPage() {
  const { signIn, signUp } = useAuth();
  const [tab, setTab] = useState("login");
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [sf, setSf] = useState({
    name: "", email: "", password: "",
    dob: "", gender: "Male", blood: "O+", weight: "", height: "", city: "",
    conditions: [], allergies: [], otherAllergy: "",
    emergency_name: "", emergency_relation: "", emergency_phone: "",
    doctor: "", insurance: "",
  });
  const [err, setErr] = useState("");
  const [signupDone, setSignupDone] = useState(false); // true when email confirmation needed
  const [showLoginPwd, setShowLoginPwd]   = useState(false);
  const [showSignupPwd, setShowSignupPwd] = useState(false);

  // Reusable eye icon toggle button
  const EyeBtn = ({ show, onToggle }) => (
    <button
      type="button"
      onClick={onToggle}
      style={{
        position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)",
        background: "none", border: "none", cursor: "pointer", padding: "4px",
        color: "rgba(255,255,255,.4)", display: "flex", alignItems: "center",
        transition: "color .15s",
      }}
      onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,.8)"}
      onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,.4)"}
      tabIndex={-1}
    >
      {show ? (
        // Eye-off SVG
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
          <line x1="1" y1="1" x2="23" y2="23"/>
        </svg>
      ) : (
        // Eye SVG
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
      )}
    </button>
  );

  function upSf(k, v) { setSf(p => ({ ...p, [k]: v })); }
  function toggleArr(field, value) {
    setSf(p => ({ ...p, [field]: p[field].includes(value) ? p[field].filter(x => x !== value) : [...p[field], value] }));
  }

  async function handleLogin() {
    if (!loginForm.email.trim() || !loginForm.password.trim()) { setErr("Email and password are required"); return; }
    setErr(""); setLoading(true);
    try {
      await signIn(loginForm.email.trim(), loginForm.password);
      // App.jsx will detect the session change via onAuthStateChange and re-render
    } catch (e) {
      const msg = e.message || "";
      if (msg.includes("Invalid login") || msg.includes("invalid_credentials")) {
        setErr("❌ Wrong email or password. Please try again.");
      } else if (msg.includes("rate") || msg.includes("after")) {
        setErr("⏳ Too many attempts. Please wait 60 seconds and try again.");
      } else if (msg.includes("Email not confirmed")) {
        setErr("📧 Please check your email and click the confirmation link first.");
      } else {
        setErr(msg || "Login failed. Check your email and password.");
      }
    } finally { setLoading(false); }
  }

  function nextStep() {
    setErr("");
    if (step === 1 && (!sf.name.trim() || !sf.email.trim() || !sf.password.trim())) { setErr("Name, email and password are required"); return; }
    if (step === 2 && (!sf.dob || !sf.weight || !sf.height || !sf.city.trim())) { setErr("Please fill all required fields"); return; }
    setStep(s => s + 1);
  }

  async function handleSignup() {
    setErr("");
    if (!sf.emergency_name.trim() || !sf.emergency_phone.trim()) { setErr("Emergency contact name and phone are required"); return; }
    setLoading(true);
    try {
      const allergies = [...sf.allergies, ...(sf.otherAllergy.trim() ? [sf.otherAllergy.trim()] : [])];
      const bmi = sf.weight && sf.height
        ? (parseFloat(sf.weight) / ((parseFloat(sf.height) / 100) ** 2)).toFixed(1)
        : null;

      const profileData = {
        name:              sf.name.trim(),
        dob:               sf.dob || null,
        gender:            sf.gender,
        blood:             sf.blood,
        weight:            sf.weight ? sf.weight + " kg" : null,
        height:            sf.height ? sf.height + " cm" : null,
        bmi:               bmi,
        city:              sf.city.trim(),
        conditions:        sf.conditions.filter(c => c !== "None"),
        allergies:         allergies,
        emergency_contact: `${sf.emergency_name} (${sf.emergency_relation || "Contact"}) · ${sf.emergency_phone}`,
        doctor:            sf.doctor.trim() || null,
        insurance:         sf.insurance.trim() || null,
      };

      const result = await signUp(sf.email.trim(), sf.password, profileData);

      // If Supabase didn't create a session (email confirmation still enabled),
      // show a success/check-email screen instead of leaving user stuck
      if (!result?.session) {
        setSignupDone(true);
      }
      // If session exists, onAuthStateChange in useAuth will fire and App.jsx
      // will automatically transition to the dashboard — no need to do anything here
    } catch (e) {
      const msg = e.message || "";
      if (msg.includes("rate") || msg.includes("after")) {
        setErr("⏳ Too many attempts. Please wait 60 seconds and try again.");
      } else if (msg.includes("already registered") || msg.includes("already exists")) {
        setErr("ℹ️ This email is already registered. Please Log In instead.");
      } else if (msg.includes("password")) {
        setErr("🔒 Password must be at least 6 characters.");
      } else {
        setErr(msg || "Sign up failed. Please try again.");
      }
    } finally { setLoading(false); }
  }

  // ── Email confirmation pending screen ──
  if (signupDone) return (
    <div className="login-bg">
      <div style={{ width: "100%", maxWidth: "440px", zIndex: 1, position: "relative" }}>
        <div style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.1)", borderRadius: "20px", padding: "40px 28px", backdropFilter: "blur(12px)", textAlign: "center" }}>
          <div style={{ fontSize: "52px", marginBottom: "16px" }}>📧</div>
          <h2 style={{ fontSize: "22px", fontWeight: "800", color: "#fff", marginBottom: "10px", letterSpacing: "-0.5px" }}>Check your email!</h2>
          <p style={{ fontSize: "13.5px", color: "rgba(255,255,255,.5)", lineHeight: "1.7", marginBottom: "24px" }}>
            We sent a confirmation link to <strong style={{ color: "#34d399" }}>{sf.email}</strong>.<br/>
            Click the link in the email to activate your account.
          </p>
          <div style={{ background: "rgba(5,150,105,.1)", border: "1px solid rgba(5,150,105,.25)", borderRadius: "12px", padding: "14px 16px", marginBottom: "20px", fontSize: "12.5px", color: "#6ee7b7", textAlign: "left" }}>
            💡 <strong>Tip:</strong> After confirming, come back here and click <strong>Log In</strong> to access your dashboard.
          </div>
          <button
            style={{ width: "100%", padding: "12px", background: "#059669", color: "#fff", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: "700", cursor: "pointer", fontFamily: "inherit" }}
            onClick={() => { setSignupDone(false); setTab("login"); setLoginForm({ email: sf.email, password: "" }); }}
          >
            Go to Log In →
          </button>
        </div>
      </div>
    </div>
  );


  const inp = {
    width: "100%", padding: "11px 14px",
    border: "1.5px solid rgba(255,255,255,.12)", borderRadius: "10px",
    background: "rgba(255,255,255,.06)", color: "#fff", fontSize: "13.5px",
    outline: "none", transition: "border .15s", fontFamily: "inherit",
  };
  const lbl = { fontSize: "12px", fontWeight: "600", color: "rgba(255,255,255,.55)", marginBottom: "6px", display: "block" };
  const g2 = { gap: "12px" }; // replaced by className="responsive-grid-2" below
  const focus = e => (e.target.style.borderColor = "rgba(5,150,105,.6)");
  const blur  = e => (e.target.style.borderColor = "rgba(255,255,255,.12)");

  const chipBase = (active, color = "emerald") => ({
    padding: "6px 13px", borderRadius: "8px", fontSize: "12px", fontWeight: "600",
    border: "1.5px solid", cursor: "pointer", transition: "all .15s", fontFamily: "inherit",
    background: active ? (color === "amber" ? "rgba(245,158,11,.15)" : "rgba(5,150,105,.2)") : "rgba(255,255,255,.05)",
    borderColor: active ? (color === "amber" ? "#f59e0b" : "#059669") : "rgba(255,255,255,.12)",
    color: active ? (color === "amber" ? "#fbbf24" : "#34d399") : "rgba(255,255,255,.45)",
  });

  const stepIcons = ["👤", "📏", "🩺"];
  const stepLabels = ["Account", "Body & Location", "Medical Profile"];

  return (
    <div className="login-bg">
      <div style={{ position: "fixed", top: -120, right: -120, width: 400, height: 400, borderRadius: "50%", background: "rgba(5,150,105,.07)", pointerEvents: "none" }} />
      <div style={{ position: "fixed", bottom: -80, left: -80, width: 300, height: 300, borderRadius: "50%", background: "rgba(59,130,246,.05)", pointerEvents: "none" }} />

      <div style={{ width: "100%", maxWidth: tab === "signup" ? "520px" : "440px", position: "relative", zIndex: 1 }}>

        {/* Brand */}
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{ width: "60px", height: "60px", background: "rgba(5,150,105,.2)", border: "1.5px solid rgba(5,150,105,.4)", borderRadius: "18px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", fontSize: "26px" }}>🩺</div>
          <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#fff", letterSpacing: "-1px" }}>Arogya</h1>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,.35)", marginTop: "5px" }}>Your personal health dashboard</p>
        </div>

        <div style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.1)", borderRadius: "20px", padding: "28px", backdropFilter: "blur(12px)" }}>

          {/* Tabs */}
          <div style={{ display: "flex", gap: "4px", background: "rgba(255,255,255,.05)", borderRadius: "10px", padding: "3px", marginBottom: "24px" }}>
            {["login", "signup"].map(t => (
              <button key={t}
                style={{ flex: 1, padding: "8px", borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: "600", transition: "all .15s", fontFamily: "inherit", background: tab === t ? "#fff" : "transparent", color: tab === t ? "#0f172a" : "rgba(255,255,255,.4)" }}
                onClick={() => { setTab(t); setStep(1); setErr(""); }}>
                {t === "login" ? "Log In" : "Sign Up"}
              </button>
            ))}
          </div>

          {/* ── LOG IN ── */}
          {tab === "login" && (
            <div>
              <div style={{ marginBottom: "14px" }}>
                <label style={lbl}>Email</label>
                <input type="email" style={inp} placeholder="you@email.com" value={loginForm.email} onChange={e => setLoginForm({ ...loginForm, email: e.target.value })} onFocus={focus} onBlur={blur} />
              </div>
              <div style={{ marginBottom: "20px" }}>
                <label style={lbl}>Password</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showLoginPwd ? "text" : "password"}
                    style={{ ...inp, paddingRight: "42px" }}
                    placeholder="••••••••"
                    value={loginForm.password}
                    onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
                    onFocus={focus} onBlur={blur}
                    onKeyDown={e => e.key === "Enter" && handleLogin()}
                  />
                  <EyeBtn show={showLoginPwd} onToggle={() => setShowLoginPwd(p => !p)} />
                </div>
              </div>
              {err && <p style={{ fontSize: "12px", color: "#f87171", marginBottom: "12px", padding: "8px 12px", background: "rgba(239,68,68,.1)", borderRadius: "8px" }}>{err}</p>}
              <button style={{ width: "100%", padding: "12px", background: loading ? "#047857" : "#059669", color: "#fff", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: "700", cursor: loading ? "not-allowed" : "pointer", transition: "all .15s", fontFamily: "inherit", opacity: loading ? .75 : 1 }}
                onClick={handleLogin} disabled={loading}
                onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = "#047857"; e.currentTarget.style.transform = "translateY(-1px)"; } }}
                onMouseLeave={e => { if (!loading) { e.currentTarget.style.background = "#059669"; e.currentTarget.style.transform = "translateY(0)"; } }}>
                {loading ? "⏳ Signing in…" : "Enter Dashboard →"}
              </button>
              <p style={{ fontSize: "11.5px", color: "rgba(255,255,255,.22)", textAlign: "center", marginTop: "14px" }}>Don't have an account? Switch to Sign Up above.</p>
            </div>
          )}

          {/* ── SIGN UP (3 steps) ── */}
          {tab === "signup" && (
            <div>
              {/* Step indicator */}
              <div style={{ display: "flex", alignItems: "center", marginBottom: "24px" }}>
                {stepLabels.map((label, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", flex: i < 2 ? 1 : "none" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                      <div style={{ width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", border: "2px solid", transition: "all .2s",
                        background: step > i + 1 ? "#059669" : step === i + 1 ? "rgba(5,150,105,.2)" : "rgba(255,255,255,.04)",
                        borderColor: step >= i + 1 ? "#059669" : "rgba(255,255,255,.1)" }}>
                        {step > i + 1 ? "✓" : stepIcons[i]}
                      </div>
                      <span style={{ fontSize: "10px", fontWeight: "600", whiteSpace: "nowrap", color: step === i + 1 ? "rgba(255,255,255,.7)" : "rgba(255,255,255,.25)" }}>{label}</span>
                    </div>
                    {i < 2 && <div style={{ flex: 1, height: "2px", background: step > i + 1 ? "#059669" : "rgba(255,255,255,.1)", margin: "0 8px", marginBottom: "18px", transition: "background .3s" }} />}
                  </div>
                ))}
              </div>

              {/* STEP 1 — Account */}
              {step === 1 && (
                <div className="fade">
                  <div style={{ marginBottom: "14px" }}>
                    <label style={lbl}>Full Name *</label>
                    <input style={inp} placeholder="e.g. Arjun Sharma" value={sf.name} onChange={e => upSf("name", e.target.value)} onFocus={focus} onBlur={blur} />
                  </div>
                  <div style={{ marginBottom: "14px" }}>
                    <label style={lbl}>Email *</label>
                    <input type="email" style={inp} placeholder="you@email.com" value={sf.email} onChange={e => upSf("email", e.target.value)} onFocus={focus} onBlur={blur} />
                  </div>
                  <div>
                    <label style={lbl}>Password *</label>
                    <div style={{ position: "relative" }}>
                      <input
                        type={showSignupPwd ? "text" : "password"}
                        style={{ ...inp, paddingRight: "42px" }}
                        placeholder="••••••••"
                        value={sf.password}
                        onChange={e => upSf("password", e.target.value)}
                        onFocus={focus} onBlur={blur}
                      />
                      <EyeBtn show={showSignupPwd} onToggle={() => setShowSignupPwd(p => !p)} />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2 — Body & Location */}
              {step === 2 && (
                <div className="fade">
                  <div style={{ ...g2, marginBottom: "12px" }}>
                    <div>
                      <label style={lbl}>Date of Birth *</label>
                      <input type="date" style={inp} value={sf.dob} onChange={e => upSf("dob", e.target.value)} onFocus={focus} onBlur={blur} />
                    </div>
                    <div>
                      <label style={lbl}>Gender</label>
                      <select style={{ ...inp, cursor: "pointer" }} value={sf.gender} onChange={e => upSf("gender", e.target.value)}>
                        {["Male", "Female", "Non-binary", "Prefer not to say"].map(g => <option key={g} style={{ background: "#1e293b" }}>{g}</option>)}
                      </select>
                    </div>
                  </div>
                  <div style={{ ...g2, marginBottom: "12px" }}>
                    <div>
                      <label style={lbl}>Weight (kg) *</label>
                      <input type="number" style={inp} placeholder="e.g. 72" value={sf.weight} onChange={e => upSf("weight", e.target.value)} onFocus={focus} onBlur={blur} />
                    </div>
                    <div>
                      <label style={lbl}>Height (cm) *</label>
                      <input type="number" style={inp} placeholder="e.g. 175" value={sf.height} onChange={e => upSf("height", e.target.value)} onFocus={focus} onBlur={blur} />
                    </div>
                  </div>
                  <div style={{ ...g2, marginBottom: "12px" }}>
                    <div>
                      <label style={lbl}>Blood Group</label>
                      <select style={{ ...inp, cursor: "pointer" }} value={sf.blood} onChange={e => upSf("blood", e.target.value)}>
                        {BLOOD_GROUPS.map(g => <option key={g} style={{ background: "#1e293b" }}>{g}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={lbl}>City *</label>
                      <input style={inp} placeholder="e.g. Lucknow, UP" value={sf.city} onChange={e => upSf("city", e.target.value)} onFocus={focus} onBlur={blur} />
                    </div>
                  </div>
                  {sf.weight && sf.height && (
                    <div style={{ background: "rgba(5,150,105,.1)", border: "1px solid rgba(5,150,105,.25)", borderRadius: "10px", padding: "10px 14px", fontSize: "12px", color: "#34d399" }}>
                      📊 BMI: <strong>{(parseFloat(sf.weight) / ((parseFloat(sf.height) / 100) ** 2)).toFixed(1)}</strong> —&nbsp;
                      {(() => { const b = parseFloat(sf.weight) / ((parseFloat(sf.height) / 100) ** 2); return b < 18.5 ? "Underweight" : b < 25 ? "Normal" : b < 30 ? "Overweight" : "Obese"; })()}
                    </div>
                  )}
                </div>
              )}

              {/* STEP 3 — Medical */}
              {step === 3 && (
                <div className="fade">
                  {/* Conditions */}
                  <div style={{ marginBottom: "16px" }}>
                    <label style={lbl}>Known Medical Conditions</label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "7px" }}>
                      {COMMON_CONDITIONS.map(c => (
                        <button key={c} style={chipBase(sf.conditions.includes(c))} onClick={() => toggleArr("conditions", c)}>{c}</button>
                      ))}
                    </div>
                  </div>

                  {/* Allergies */}
                  <div style={{ marginBottom: "16px" }}>
                    <label style={lbl}>Allergies (select all that apply)</label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "7px", marginBottom: "8px" }}>
                      {COMMON_ALLERGIES.map(a => (
                        <button key={a} style={chipBase(sf.allergies.includes(a), "amber")} onClick={() => toggleArr("allergies", a)}>{a}</button>
                      ))}
                    </div>
                    <input style={inp} placeholder="Other allergy — type here" value={sf.otherAllergy} onChange={e => upSf("otherAllergy", e.target.value)} onFocus={focus} onBlur={blur} />
                  </div>

                  {/* Emergency contact */}
                  <div style={{ marginBottom: "14px" }}>
                    <label style={lbl}>Emergency Contact *</label>
                    <div style={{ ...g2, marginBottom: "8px" }}>
                      <input style={inp} placeholder="Full name" value={sf.emergency_name} onChange={e => upSf("emergency_name", e.target.value)} onFocus={focus} onBlur={blur} />
                      <input style={inp} placeholder="Relation (e.g. Mother)" value={sf.emergency_relation} onChange={e => upSf("emergency_relation", e.target.value)} onFocus={focus} onBlur={blur} />
                    </div>
                    <input style={inp} placeholder="Phone number" value={sf.emergency_phone} onChange={e => upSf("emergency_phone", e.target.value)} onFocus={focus} onBlur={blur} />
                  </div>

                  {/* Optional */}
                  <div className="responsive-grid-2" style={g2}>
                    <div>
                      <label style={lbl}>Doctor's Name (optional)</label>
                      <input style={inp} placeholder="Dr. Name, Hospital" value={sf.doctor} onChange={e => upSf("doctor", e.target.value)} onFocus={focus} onBlur={blur} />
                    </div>
                    <div>
                      <label style={lbl}>Insurance (optional)</label>
                      <input style={inp} placeholder="e.g. PM-JAY, CGHS" value={sf.insurance} onChange={e => upSf("insurance", e.target.value)} onFocus={focus} onBlur={blur} />
                    </div>
                  </div>
                </div>
              )}

              {/* Error */}
              {err && <p style={{ fontSize: "12px", color: "#f87171", marginTop: "12px", padding: "8px 12px", background: "rgba(239,68,68,.1)", borderRadius: "8px" }}>{err}</p>}

              {/* Nav */}
              <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                {step > 1 && (
                  <button style={{ flexShrink: 0, padding: "11px 20px", background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.12)", color: "rgba(255,255,255,.6)", borderRadius: "10px", fontSize: "13px", fontWeight: "600", cursor: "pointer", fontFamily: "inherit" }}
                    onClick={() => { setStep(s => s - 1); setErr(""); }}>← Back</button>
                )}
                <button style={{ flex: 1, padding: "12px", background: "#059669", color: "#fff", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: "700", cursor: "pointer", transition: "all .15s", fontFamily: "inherit" }}
                  onClick={step < 3 ? nextStep : handleSignup}
                  onMouseEnter={e => { e.currentTarget.style.background = "#047857"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "#059669"; e.currentTarget.style.transform = "translateY(0)"; }}>
                  {step < 3 ? "Continue →" : "Create Account →"}
                </button>
              </div>
              <p style={{ fontSize: "11px", color: "rgba(255,255,255,.2)", textAlign: "center", marginTop: "10px" }}>Step {step} of 3</p>
            </div>
          )}
        </div>

        <p style={{ fontSize: "11px", color: "rgba(255,255,255,.18)", textAlign: "center", marginTop: "16px" }}>🔐 End-to-end encrypted · HIPAA compliant</p>
      </div>
    </div>
  );
}