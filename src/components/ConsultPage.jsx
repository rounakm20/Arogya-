import { useState, useEffect } from "react";
import { useDoctors } from "../hooks/useDoctors";
import { useAppointments } from "../hooks/useAppointments";
import { ChatIco } from "./Icons";

export default function ConsultPage({ user }) {
  const { doctors, loading: docsLoading, fetchDoctors } = useDoctors();
  const { requests, loading: reqsLoading, sendRequest, cancelRequest } = useAppointments(user?.uuid);
  const [view, setView] = useState("search"); // "search" or "requests"
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  
  // Appointment modal state
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  const specialties = [
    "All",
    "Cardiologist",
    "Pediatrician",
    "Orthopedic",
    "Dermatologist",
    "Neurologist",
    "Gynecologist",
    "General Surgeon",
    "Ent Specialist"
  ];

  // Re-fetch when filter/search changes (debounced)
  useEffect(() => {
    const t = setTimeout(() => fetchDoctors({ specialty: filter, search }), 300);
    return () => clearTimeout(t);
  }, [filter, search, fetchDoctors]);

  if (!user) return <div style={{ padding: "40px", textAlign: "center" }}>Loading...</div>;

  return (
    <div className="fade">
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#0f172a" }}>Doctor Consultation</h2>
        <p style={{ fontSize: "12px", color: "#9ca3af", marginTop: "2px" }}>
          Find and connect with specialized healthcare professionals
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "28px", borderBottom: "1px solid #e9eef5", marginBottom: "28px" }}>
        <button 
          onClick={() => setView("search")}
          style={{ paddingBottom: "12px", fontSize: "14px", fontWeight: "700", cursor: "pointer", border: "none", background: "none", color: view === "search" ? "#0ea5e9" : "#94a3b8", borderBottom: view === "search" ? "2.5px solid #0ea5e9" : "none", transition: "all .2s ease", letterSpacing: "0.2px" }}
        >
          Find Doctors
        </button>
        <button 
          onClick={() => setView("requests")}
          style={{ paddingBottom: "12px", fontSize: "14px", fontWeight: "700", cursor: "pointer", border: "none", background: "none", color: view === "requests" ? "#0ea5e9" : "#94a3b8", borderBottom: view === "requests" ? "2.5px solid #0ea5e9" : "none", position: "relative", transition: "all .2s ease", letterSpacing: "0.2px" }}
        >
          My Requests
          {requests.filter(r => r.status === 'Pending').length > 0 && (
            <span style={{ position: "absolute", top: "-6px", right: "-14px", minWidth: "18px", height: "18px", padding: "0 4px", background: "#ef4444", color: "#fff", borderRadius: "99px", fontSize: "10px", fontWeight: "800", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #fff", boxShadow: "0 2px 4px rgba(239,68,68,0.2)" }}>
              {requests.filter(r => r.status === 'Pending').length}
            </span>
          )}
        </button>
      </div>

      {view === "search" ? (
        <>
          {/* Search and Filters */}
          <div className="mobile-flex-col" style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
            <div style={{ position: "relative", maxWidth: "400px", width: "100%" }}>
              <input
                className="inp"
                style={{ paddingLeft: "40px" }}
                placeholder="Search doctors by name, specialty, or city..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <div style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }}>
                🔍
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", width: "100%" }}>
              {specialties.map((s) => (
                <button
                  key={s}
                  style={{
                    padding: "10px 18px",
                    borderRadius: "12px",
                    fontSize: "12px",
                    fontWeight: "700",
                    border: "1.5px solid",
                    cursor: "pointer",
                    transition: "all .2s cubic-bezier(0.4, 0, 0.2, 1)",
                    background: filter === s ? "#0ea5e9" : "#fff",
                    color: filter === s ? "#fff" : "#64748b",
                    borderColor: filter === s ? "#0ea5e9" : "#e2e8f0",
                    boxShadow: filter === s ? "0 4px 12px rgba(14,165,233,0.2)" : "none",
                  }}
                  onClick={() => setFilter(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

      {/* Content */}
      {docsLoading && (
        <div style={{ textAlign: "center", padding: "60px", color: "#9ca3af" }}>
          <div className="loading-spinner" style={{ marginBottom: "12px" }}>⏳</div>
          <div style={{ fontSize: "14px" }}>Finding available doctors...</div>
        </div>
      )}

      {!docsLoading && doctors.length === 0 && (
        <div style={{ textAlign: "center", padding: "80px 24px", background: "#f8fafc", borderRadius: "20px", border: "1px dashed #e2e8f0" }}>
          <div style={{ fontSize: "40px", marginBottom: "16px" }}>👨‍⚕️</div>
          <div style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a" }}>No doctors found</div>
          <p style={{ fontSize: "14px", color: "#64748b", marginTop: "8px" }}>
            Try adjusting your search or filters to find more healthcare providers.
          </p>
          <button 
            className="btn btn-ghost" 
            style={{ marginTop: "16px" }}
            onClick={() => { setFilter("All"); setSearch(""); }}
          >
            Reset Filters
          </button>
        </div>
      )}
      {!docsLoading && doctors.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
          {doctors.map((doc) => (
            <div 
              key={doc.id} 
              className="card" 
              style={{ 
                padding: "24px", 
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)", 
                border: "1.5px solid #e9eef5",
                position: "relative"
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 24px rgba(0,0,0,0.08)"; e.currentTarget.style.borderColor = "#0ea5e9"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = "#e9eef5"; }}
            >
              <div style={{ display: "flex", gap: "16px", marginBottom: "20px" }}>
                <div 
                  style={{ 
                    width: "60px", 
                    height: "60px", 
                    borderRadius: "16px", 
                    background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
                    border: "1px solid #bae6fd",
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center", 
                    fontSize: "24px",
                    flexShrink: 0 
                  }}
                >
                  {doc.image_url ? <img src={doc.image_url} alt={doc.name} style={{ width: "100%", height: "100%", borderRadius: "16px", objectFit: "cover" }} /> : "👨‍⚕️"}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a" }}>{doc.name}</div>
                  <div style={{ fontSize: "13px", fontWeight: "600", color: "#0ea5e9", marginTop: "2px" }}>{doc.specialty}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "6px", fontSize: "12px", color: "#64748b" }}>
                    <span>📍</span> {doc.location || "Online Consultation"}
                  </div>
                </div>
              </div>

              <div style={{ background: "#f8fafc", borderRadius: "12px", padding: "12px", marginBottom: "20px" }}>
                <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: "700", color: "#94a3b8", marginBottom: "4px" }}>
                  Availability
                </div>
                <div style={{ fontSize: "13px", color: "#334155", fontWeight: "500" }}>
                  🕒 {doc.availability || "Available by Appointment"}
                </div>
              </div>

              <div className="mobile-flex-col" style={{ display: "flex", gap: "10px" }}>
                <a 
                  href={`tel:${doc.contact}`} 
                  className="btn btn-outline" 
                  style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", textDecoration: "none", fontSize: "13px" }}
                >
                  <span>📞</span> Call
                </a>
                <button 
                  className="btn btn-primary" 
                  style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontSize: "13px" }}
                  onClick={() => {
                    setSelectedDoctor(doc);
                    setMessage("");
                    setSuccess(false);
                    setError("");
                  }}
                >
                  <ChatIco /> Chat
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
        </>
      ) : (
        <div className="fade">
          {reqsLoading && (
            <div style={{ textAlign: "center", padding: "40px", color: "#9ca3af" }}>⏳ Loading your appointment requests...</div>
          )}
          
          {!reqsLoading && requests.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px 24px", background: "#f8fafc", borderRadius: "20px", border: "1px dashed #e2e8f0" }}>
              <div style={{ fontSize: "32px", marginBottom: "12px" }}>📅</div>
              <div style={{ fontSize: "14px", fontWeight: "700", color: "#0f172a" }}>No appointment requests yet</div>
              <p style={{ fontSize: "12px", color: "#64748b", marginTop: "6px" }}>Your sent requests will appear here once you send them to a doctor.</p>
              <button 
                className="btn btn-outline" 
                style={{ marginTop: "16px", fontSize: "12px" }}
                onClick={() => setView("search")}
              >
                Find a Doctor
              </button>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {requests.map(req => (
              <div 
                key={req.id} 
                className="card fade" 
                style={{ 
                  padding: "20px 24px", 
                  background: "#fff", 
                  border: "1.5px solid #e9eef5",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.02)"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
                  <div style={{ 
                    width: "48px", 
                    height: "48px", 
                    borderRadius: "14px", 
                    background: req.status === 'Accepted' ? "#ecfdf5" : "#f1f5f9", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center", 
                    fontSize: "20px",
                    border: req.status === 'Accepted' ? "1px solid #10b981" : "1px solid #e2e8f0"
                  }}>
                    {req.status === 'Accepted' ? "✅" : "👨‍⚕️"}
                  </div>
                  <div style={{ flex: 1, minWidth: "180px" }}>
                    <div style={{ fontSize: "15px", fontWeight: "700", color: "#0f172a" }}>{req.doctors?.name || "Doctor"}</div>
                    <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
                      <span style={{ color: "#0ea5e9", fontWeight: "600" }}>{req.doctors?.specialty}</span> · Requested on {new Date(req.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span className={`tag ${req.status === 'Accepted' ? 'tag-green' : req.status === 'Pending' ? 'tag-gray' : 'tag-red'}`} style={{ textTransform: "capitalize", padding: "6px 14px", borderRadius: "8px", fontWeight: "700" }}>
                      {req.status}
                    </span>
                    {req.status === 'Pending' && (
                      <button 
                        className="btn btn-ghost" 
                        style={{ padding: "8px 12px", fontSize: "12px", color: "#ef4444", border: "1.5px solid #fee2e2" }}
                        onClick={() => { if(confirm("Cancel this appointment request?")) cancelRequest(req.id); }}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
                <div style={{ marginTop: "16px", padding: "16px 20px", background: "#f8fafc", borderRadius: "12px", fontSize: "13px", color: "#334155", border: "1px solid #f1f5f9", lineHeight: "1.6" }}>
                  <div style={{ fontWeight: "800", fontSize: "10px", color: "#94a3b8", textTransform: "uppercase", marginBottom: "8px", letterSpacing: "0.5px" }}>My Consultation Request</div>
                  {req.message}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Appointment Request Modal */}
      {selectedDoctor && (
        <div 
          className="fade" 
          style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.7)", backdropFilter: "blur(4px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}
          onClick={() => !sending && setSelectedDoctor(null)}
        >
          <div 
            className="card slide-up" 
            style={{ width: "95%", maxWidth: "480px", padding: "calc(16px + 2vw)", position: "relative", maxHeight: "90vh", overflowY: "auto" }}
            onClick={e => e.stopPropagation()}
          >
            {!success ? (
              <>
                <div style={{ display: "flex", gap: "16px", marginBottom: "24px", alignItems: "center" }}>
                  <div style={{ width: "50px", height: "50px", borderRadius: "12px", background: "#f0f9ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>
                    👨‍⚕️
                  </div>
                  <div>
                    <div style={{ fontSize: "14px", color: "#64748b" }}>Message to</div>
                    <div style={{ fontSize: "18px", fontWeight: "700", color: "#0f172a" }}>{selectedDoctor.name}</div>
                  </div>
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <label className="label">Appointment Request / Message</label>
                  <textarea 
                    className="inp" 
                    rows="4" 
                    placeholder="Hi Doctor, I'd like to book an appointment for..."
                    style={{ resize: "none" }}
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                  />
                  {error && <div style={{ fontSize: "12px", color: "#ef4444", marginTop: "6px" }}>{error}</div>}
                </div>

                <div style={{ display: "flex", gap: "12px" }}>
                  <button 
                    className="btn btn-primary" 
                    style={{ flex: 1 }}
                    disabled={sending || !message.trim()}
                    onClick={async () => {
                      if (!message.trim()) return;
                      setError("");
                      setSending(true);
                      try {
                        await sendRequest({
                          userId: user.uuid,
                          doctorId: selectedDoctor.id,
                          message: message.trim()
                        });
                        setSuccess(true);
                        setTimeout(() => {
                          setSelectedDoctor(null);
                          setView("requests");
                        }, 2000);
                      } catch (e) {
                        console.error(e);
                        setError("Failed to send request. Please try again.");
                      }
                      setSending(false);
                    }}
                  >
                    {sending ? "Sending..." : "Send Request"}
                  </button>
                  <button 
                    className="btn btn-ghost" 
                    disabled={sending}
                    onClick={() => setSelectedDoctor(null)}
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>✅</div>
                <div style={{ fontSize: "20px", fontWeight: "700", color: "#0f172a", marginBottom: "8px" }}>Request Sent!</div>
                <p style={{ fontSize: "14px", color: "#64748b" }}>
                  {selectedDoctor.name} has received your appointment request and will get back to you soon.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
