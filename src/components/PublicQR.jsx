import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function PublicQR({ id }) {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      // Unauthenticated request relies on the new "Public can view profiles" RLS policy
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();
        
      if (error) {
        console.error("PublicQR Fetch Error:", error);
        setError(error.message || JSON.stringify(error));
      } else {
        setUser(data);
      }
      setLoading(false);
    }
    fetchProfile();
  }, [id]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}>
        <div style={{ textAlign: "center", color: "#64748b" }}>
          <div style={{ fontSize: "36px", marginBottom: "12px", animation: "pulse 2s infinite" }}>🪪</div>
          <div style={{ fontSize: "14px", fontWeight: "600" }}>Verifying Secure Medical Passport…</div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#fef2f2" }}>
        <div style={{ textAlign: "center", color: "#991b1b", padding: "24px" }}>
          <div style={{ fontSize: "42px", marginBottom: "12px" }}>🛑</div>
          <h2 style={{ fontSize: "18px", fontWeight: "800", marginBottom: "8px" }}>Passport Not Found</h2>
          <p style={{ fontSize: "13px", opacity: 0.8, marginBottom: "12px" }}>This QR code might be expired, invalid, or the user's database permissions are not correctly configured for public read access.</p>
          <div style={{ fontSize: "10px", background: "rgba(0,0,0,0.05)", padding: "8px", borderRadius: "4px", fontFamily: "monospace" }}>
            Error: {error || "No profile returned for ID: " + id}
          </div>
        </div>
      </div>
    );
  }

  const initials = (user.name || "U").split(" ").map(n => n[0]).join("").toUpperCase();

  return (
    <div style={{ maxWidth: "480px", margin: "0 auto", background: "#fff", minHeight: "100vh", padding: "20px" }}>
      {/* HEADER */}
      <div style={{ textAlign: "center", marginBottom: "28px" }}>
        <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "#d1fae5", border: "3px solid #a7f3d0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", fontWeight: "800", color: "#059669", margin: "0 auto 16px" }}>
          {initials}
        </div>
        <h1 style={{ fontSize: "22px", fontWeight: "800", color: "#0f172a", marginBottom: "4px" }}>{user.name}</h1>
        <div style={{ fontSize: "13px", color: "#64748b", fontWeight: "500", letterSpacing: "1px" }}>DOB: {user.dob} • {user.gender}</div>
      </div>

      {/* ALERTS */}
      <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "12px", padding: "16px", marginBottom: "20px" }}>
        <h3 style={{ fontSize: "12px", fontWeight: "800", color: "#b91c1c", marginBottom: "12px", textTransform: "uppercase", letterSpacing: ".5px" }}>⚠️ Critical Medical Alerts</h3>
        
        <div style={{ marginBottom: "12px" }}>
          <div style={{ fontSize: "11px", fontWeight: "700", color: "#ef4444", textTransform: "uppercase", marginBottom: "6px" }}>Allergies</div>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {(user.allergies || []).length > 0 ? (user.allergies || []).map(a => <span key={a} style={{ background: "#ef4444", color: "#fff", padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: "600" }}>{a}</span>) : <span style={{fontSize: "12px", color: "#9ca3af"}}>None logged</span>}
          </div>
        </div>

        <div>
          <div style={{ fontSize: "11px", fontWeight: "700", color: "#f59e0b", textTransform: "uppercase", marginBottom: "6px" }}>Chronic Conditions</div>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
             {(user.conditions || []).length > 0 ? (user.conditions || []).map(c => <span key={c} style={{ background: "#fef3c7", color: "#d97706", padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: "600" }}>{c}</span>) : <span style={{fontSize: "12px", color: "#9ca3af"}}>None logged</span>}
          </div>
        </div>
      </div>

      {/* CORE INFO */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
        <div style={{ background: "#f8fafc", padding: "14px", borderRadius: "12px" }}>
          <div style={{ fontSize: "11px", color: "#9ca3af", fontWeight: "700", textTransform: "uppercase", marginBottom: "4px" }}>Blood Group</div>
          <div style={{ fontSize: "18px", fontWeight: "800", color: "#ef4444" }}>🩸 {user.blood || "Unknown"}</div>
        </div>
        <div style={{ background: "#f8fafc", padding: "14px", borderRadius: "12px" }}>
          <div style={{ fontSize: "11px", color: "#9ca3af", fontWeight: "700", textTransform: "uppercase", marginBottom: "4px" }}>Contact Parent/Kin</div>
          <div style={{ fontSize: "14px", fontWeight: "700", color: "#0f172a" }}>{user.emergency_contact || "Not Provided"}</div>
        </div>
      </div>

      {/* FOOTER */}
      <div style={{ textAlign: "center", borderTop: "2px dashed #e2e8f0", paddingTop: "20px", marginTop: "20px" }}>
         <div style={{ fontSize: "11px", color: "#9ca3af", fontWeight: "600", marginBottom: "4px" }}>CONFIRMED AROGYA PROFILE</div>
         <div style={{ fontSize: "10px", color: "#cbd5e1", fontFamily: "monospace" }}>ID: {id}</div>
      </div>
    </div>
  );
}
