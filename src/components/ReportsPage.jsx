import { useState, useRef } from "react";
import { useReports } from "../hooks/useReports";

export default function ReportsPage({ userId }) {
  const { reports, loading, uploadReport, deleteReport } = useReports(userId);
  const [showAdd, setShowAdd] = useState(false);
  const [viewReport, setViewReport] = useState(null);
  const [form, setForm] = useState({ name:"", type:"Blood", date:"" });
  const [scanning, setScanning] = useState(false);
  const statusColor = { Normal:"tag-green", Borderline:"tag-amber", Abnormal:"tag-red", Pending:"tag-gray" };

  const fileInputRef = useRef(null);

  async function addReport() {
    if (!form.name || !form.date) return;
    const file = fileInputRef.current?.files?.[0];
    if (!file) return alert("Please select a file to upload");

    setScanning(true); // repurpose scanning state for global loading
    try {
      await uploadReport(file, { name: form.name, type: form.type, status: "Pending" });
      setForm({ name: "", type: "Blood", date: "" });
      setShowAdd(false);
      fileInputRef.current.value = "";
    } catch (e) {
      alert("Upload failed: " + e.message);
    }
    setScanning(false);
  }

  async function simulateScan() {
    setScanning(true);
    try {
      // Create a dummy text file to simulate a scanned report
      const blob = new Blob(["Patient vital signs appear normal. End of scan."], { type: "text/plain" });
      const file = new File([blob], "scanned_report.txt", { type: "text/plain" });
      
      await uploadReport(file, { name: "Scanned Report — " + new Date().toLocaleDateString("en-IN"), type: "General", status: "Normal" });
    } catch (e) {
      alert("Scan upload failed: " + e.message);
    }
    setScanning(false);
  }

  if (viewReport) return (
    <div className="fade" style={{ maxWidth:"600px" }}>
      <button className="btn btn-ghost" style={{ marginBottom:"20px", fontSize:"13px" }} onClick={() => setViewReport(null)}>← Back to Reports</button>
      <div className="card">
        <div style={{ display:"flex", alignItems:"center", gap:"16px", marginBottom:"20px" }}>
          <div style={{ fontSize:"40px" }}>{viewReport.icon}</div>
          <div style={{ flex:1 }}>
            <h2 style={{ fontSize:"18px", fontWeight:"700" }}>{viewReport.name}</h2>
            <p style={{ fontSize:"12px", color:"#9ca3af", marginTop:"3px" }}>{viewReport.type} · {viewReport.date}</p>
          </div>
          <span className={`tag ${statusColor[viewReport.status] || "tag-gray"}`} style={{ fontSize:"13px", padding:"5px 14px" }}>{viewReport.status}</span>
        </div>
        <div className="divider" style={{ marginBottom:"16px" }}/>
        <p style={{ fontSize:"13.5px", color:"#374151", lineHeight:"1.8" }}>
          {viewReport.status === "Normal"
            ? "All values are within the normal reference range. No immediate concerns noted. Continue regular monitoring as advised by your physician."
            : viewReport.status === "Borderline"
              ? "Some values are near the boundary of the normal range. It is recommended to follow up with your doctor and consider lifestyle adjustments."
              : "Values are outside the normal range. Please consult your doctor as soon as possible for further evaluation and treatment."}
        </p>
        <div className="divider" style={{ margin:"16px 0" }}/>
        {viewReport.file_url && (
          <a href={viewReport.file_url} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ display:"inline-block", marginBottom:"16px" }}>
            📥 View / Download Source File
          </a>
        )}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <p style={{ fontSize:"11.5px", color:"#9ca3af" }}>🔐 Stored securely in Arogya Health Records</p>
          <button className="btn btn-ghost" style={{ color:"#ef4444", fontSize:"12px", border:"1px solid #fee2e2" }} onClick={() => { if(confirm("Delete this report?")){ deleteReport(viewReport.id); setViewReport(null); }}}>🗑 Delete</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fade">
      {/* Actions */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"24px", flexWrap:"wrap", gap:"12px" }}>
        <div>
          <h2 style={{ fontSize:"18px", fontWeight:"700", color:"#0f172a" }}>Health Reports</h2>
          <p style={{ fontSize:"12px", color:"#9ca3af", marginTop:"2px" }}>{reports.length} reports securely stored</p>
        </div>
        <div style={{ display:"flex", gap:"10px" }}>
          <button className="btn btn-primary" style={{ fontSize:"12.5px" }} onClick={simulateScan} disabled={scanning}>
            {scanning ? <><span className="spin">⟳</span> Scanning…</> : "📸 Scan Report"}
          </button>
          <button className="btn btn-outline" style={{ fontSize:"12.5px" }} onClick={() => setShowAdd(!showAdd)}>+ Upload Report</button>
        </div>
      </div>

      {showAdd && (
        <div className="card fade" style={{ marginBottom:"20px", border:"1.5px solid #d1fae5" }}>
          <h4 style={{ fontSize:"14px", fontWeight:"700", marginBottom:"14px" }}>Add Report</h4>
          <div className="responsive-grid-3" style={{ marginBottom:"14px" }}>
            <div><label className="label">Report Name</label><input className="inp" placeholder="e.g. CBC Blood Test" value={form.name} onChange={e => setForm({...form,name:e.target.value})}/></div>
            <div>
              <label className="label">Type</label>
              <select className="inp" value={form.type} onChange={e => setForm({...form,type:e.target.value})}>
                {["Blood","Radiology","Cardiology","Urology","General"].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div><label className="label">Date</label><input className="inp" type="date" value={form.date} onChange={e => setForm({...form,date:e.target.value})}/></div>
          </div>
          <div style={{ marginBottom: "16px" }}>
            <label className="label">Select File (PDF, Image)</label>
            <input type="file" ref={fileInputRef} className="inp" accept="image/*,.pdf" />
          </div>
          <div style={{ display:"flex", gap:"10px" }}>
            <button className="btn btn-primary" onClick={addReport} disabled={scanning}>
              {scanning ? "Uploading..." : "Save Report"}
            </button>
            <button className="btn btn-ghost" onClick={() => setShowAdd(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Reports table */}
      <div className="card" style={{ padding:"0", overflowX:"auto" }}>
        <div style={{ minWidth: "600px" }}>
        <div style={{ display:"grid", gridTemplateColumns:"44px 1fr 120px 140px 120px", gap:"12px", padding:"12px 20px", background:"#f8fafc", borderBottom:"1px solid #e9eef5", fontSize:"11px", fontWeight:"700", color:"#9ca3af", textTransform:"uppercase", letterSpacing:".6px" }}>
          <div/><div>Report</div><div>Type</div><div>Date</div><div>Status</div>
        </div>
        {reports.length === 0 && !loading && (
          <div style={{ padding:"40px", textAlign:"center", color:"#9ca3af", fontSize:"13px" }}>No reports found. Upload your first one!</div>
        )}
        {loading && reports.length === 0 && (
          <div style={{ padding:"40px", textAlign:"center", color:"#9ca3af", fontSize:"13px" }}>Loading reports...</div>
        )}
        {reports.map((r, i) => {
          let icon = "📄";
          if (r.type === "Blood") icon = "💧";
          if (r.type === "Radiology") icon = "🩻";
          if (r.type === "Cardiology") icon = "🫀";
          
          return (
            <div key={r.id} onClick={() => setViewReport(r)} style={{ display:"grid", gridTemplateColumns:"44px 1fr 120px 140px 120px", gap:"12px", padding:"14px 20px", borderBottom: i<reports.length-1 ? "1px solid #f8fafc" : "", cursor:"pointer", transition:"background .15s", alignItems:"center" }}
              onMouseEnter={e => e.currentTarget.style.background="#f9fafb"}
              onMouseLeave={e => e.currentTarget.style.background="#fff"}>
              <div style={{ fontSize:"22px" }}>{icon}</div>
              <div style={{ fontSize:"13.5px", fontWeight:"600", color:"#0f172a" }}>{r.name}</div>
              <div><span className="tag tag-gray" style={{ fontSize:"11px", fontWeight:"600" }}>{r.type}</span></div>
              <div style={{ fontSize:"12.5px", color:"#6b7280" }}>{r.date}</div>
              <div><span className={`tag ${statusColor[r.status] || "tag-gray"}`}>{r.status}</span></div>
            </div>
          );
        })}
        </div>
      </div>
    </div>
  );
}
