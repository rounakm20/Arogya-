import { useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { SYMPTOMS_LIST } from "../data/constants";

export default function SymptomPage({ user }) {
  const [selected, setSelected] = useState([]);
  const [extra, setExtra] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function toggle(s) { setSelected(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]); }

  async function analyze() {
    if (!selected.length && !extra.trim()) return;
    setLoading(true); setResult(null); setError("");

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

      // ── Local Triage Fallback Logic ──
      const runLocalFallback = async () => {
        await new Promise(r => setTimeout(r, 1000));
        const hasSevere = selected.some(s => ["Chest pain","Shortness of breath"].includes(s));
        const hasModerate = selected.some(s => ["Fever","Vomiting","Dizziness"].includes(s));
        setResult({
          urgency: hasSevere ? "emergency" : hasModerate ? "high" : "low",
          conditions: selected.includes("Chest pain") ? ["Angina","GERD","Costochondritis"]
            : selected.includes("Fever") && selected.includes("Cough") ? ["Influenza","Common Cold","Viral Fever"]
            : ["Viral Infection","Stress-related","General Fatigue"],
          advice: hasSevere ? "Go to emergency immediately. Do not delay. Call 108."
            : hasModerate ? "Rest, hydrate well, monitor temperature. See a doctor within 24 hours."
            : "Rest, drink warm fluids, take OTC paracetamol if needed. Monitor for 48 hours.",
          see_doctor: hasSevere ? "Immediately" : hasModerate ? "Within 24 hours" : "Within 3–5 days if no improvement",
          schemes: ["PM-JAY (Ayushman Bharat)","CGHS if applicable"],
        });
      };

      if (!apiKey || apiKey.includes('YOUR_GEMINI')) {
        await runLocalFallback();
        setLoading(false);
        return;
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const userContext = user
        ? `Patient: ${user.name}, Age: ${user.age}, Blood: ${user.blood}, Conditions: ${(user.conditions||[]).join(', ')||'None'}, Allergies: ${(user.allergies||[]).join(', ')||'None'}.`
        : "";

      const prompt = `You are a medical triage AI for an Indian health app called Arogya.
${userContext}
Symptoms reported: ${selected.join(', ')}${extra ? `. Additional info: ${extra}` : ''}.

Respond ONLY with a valid JSON object in this exact format:
{
  "urgency": "emergency" | "high" | "low",
  "conditions": ["string", "string", "string"],
  "advice": "string (2-3 sentences of home care advice)",
  "see_doctor": "string (timeframe like 'Immediately' or 'Within 24 hours')",
  "schemes": ["string", "string"]
}

Rules:
- urgency "emergency" if chest pain, severe shortness of breath, stroke symptoms
- urgency "high" if fever >101°F, vomiting, severe dizziness
- urgency "low" for mild symptoms
- schemes should be relevant Indian government health schemes
- advice should be practical, compassionate, and in simple English`;

      const res = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { 
          temperature: 0.4, 
          maxOutputTokens: 1500 
        },
      });
      const text = res.response.text();

      // Extract JSON from the response - try multiple patterns
      let jsonStr = null;
      
      // Try to extract from ```json ``` code block
      let codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (codeBlockMatch) {
        jsonStr = codeBlockMatch[1].trim();
      }
      
      // If not found in code block, try direct JSON object
      if (!jsonStr) {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          jsonStr = jsonMatch[0];
        }
      }
      
      if (!jsonStr) {
        console.error("Raw response:", text);
        throw new Error('Could not extract JSON from AI response');
      }

      const parsed = JSON.parse(jsonStr);
      setResult(parsed);
    } catch (e) {
      console.error('Symptom analysis error:', e);
      if (e.message?.includes("API key was reported as leaked")) {
          setError("This API key was leaked and disabled by Google. Please generate a new one at aistudio.google.com");
      } else if (e.message?.includes("model") && e.message?.includes("not found")) {
          setError("The AI model was not found. Please try again or check your API key permissions.");
      } else {
          setError(e.message || 'AI analysis failed. Please try again.');
      }
    }
    setLoading(false);
  }

  const US = {
    emergency: { bg:"#fef2f2", border:"#fecaca", color:"#991b1b", label:"🔴 Emergency — Go NOW", barBg:"#ef4444" },
    high:      { bg:"#fff7ed", border:"#fed7aa", color:"#9a3412", label:"🟠 High — See doctor soon", barBg:"#f97316" },
    low:       { bg:"#f0fdf4", border:"#bbf7d0", color:"#14532d", label:"🟢 Low — Home care is fine", barBg:"#059669" },
  };

  return (
    <div className="fade responsive-grid-sidebar" style={{ alignItems:"start" }}>
      {/* Left: select symptoms */}
      <div>
        <div className="card" style={{ marginBottom:"20px" }}>
          <h3 style={{ fontSize:"15px", fontWeight:"700", color:"#0f172a", marginBottom:"4px" }}>Select Symptoms</h3>
          <p style={{ fontSize:"12px", color:"#9ca3af", marginBottom:"16px" }}>Pick everything you're experiencing right now</p>
          <div style={{ display:"flex", flexWrap:"wrap", gap:"8px" }}>
            {SYMPTOMS_LIST.map(s => (
              <button key={s} onClick={() => toggle(s)} className={`chip ${selected.includes(s) ? "sel" : ""}`}>{s}</button>
            ))}
          </div>
          {selected.length > 0 && (
            <div style={{ marginTop:"16px", padding:"10px 14px", background:"#f0fdf4", borderRadius:"10px", border:"1px solid #d1fae5" }}>
              <span style={{ fontSize:"12px", color:"#065f46", fontWeight:"600" }}>{selected.length} symptom{selected.length > 1 ? "s" : ""} selected: </span>
              <span style={{ fontSize:"12px", color:"#059669" }}>{selected.join(", ")}</span>
            </div>
          )}
        </div>
        <div className="card" style={{ marginBottom:"20px" }}>
          <label className="label">Describe anything else (Hindi or English)</label>
          <textarea className="inp" style={{ height:"80px", resize:"none" }} placeholder="e.g. bukhar tha, sardard hai, since 2 days…" value={extra} onChange={e => setExtra(e.target.value)}/>
        </div>
        <button className="btn btn-primary btn-full" style={{ padding:"13px" }} onClick={analyze} disabled={loading || (!selected.length && !extra.trim())}>
          {loading ? <><span className="spin">⟳</span> Analysing your symptoms…</> : "🩺 Analyse Symptoms"}
        </button>
      </div>

      {/* Right: result */}
      <div>
        {!result && !loading && (
          <div className="card" style={{ textAlign:"center", padding:"48px 32px" }}>
            {error ? (
              <>
                <div style={{ fontSize:"36px", marginBottom:"12px" }}>⚠️</div>
                <div style={{ fontSize:"13px", color:"#ef4444", marginBottom:"8px", fontWeight:"600" }}>{error}</div>
                <button className="btn btn-outline" onClick={() => setError("")}>Try Again</button>
              </>
            ) : (
              <>
                <div style={{ fontSize:"48px", marginBottom:"16px" }}>🩺</div>
                <div style={{ fontSize:"15px", fontWeight:"600", color:"#0f172a", marginBottom:"8px" }}>AI Symptom Checker</div>
                <div style={{ fontSize:"12px", color:"#9ca3af", lineHeight:"1.7" }}>Select your symptoms on the left and click Analyse.<br/>Our AI will triage your condition and suggest next steps.</div>
              </>
            )}
          </div>
        )}
        {loading && (
          <div className="card" style={{ textAlign:"center", padding:"48px 32px" }}>
            <div style={{ fontSize:"36px", marginBottom:"16px" }} className="pulse">🧠</div>
            <div style={{ fontSize:"14px", fontWeight:"600", color:"#0f172a", marginBottom:"6px" }}>Analysing symptoms…</div>
            <div style={{ fontSize:"12px", color:"#9ca3af" }}>Checking {selected.length} symptom{selected.length>1?"s":""}</div>
          </div>
        )}
        {result && (
          <div className="fade">
            <div style={{ background:US[result.urgency].bg, border:`1.5px solid ${US[result.urgency].border}`, borderRadius:"14px", padding:"18px 20px", marginBottom:"16px" }}>
              <div style={{ fontSize:"15px", fontWeight:"700", color:US[result.urgency].color, marginBottom:"4px" }}>{US[result.urgency].label}</div>
              <div style={{ fontSize:"12px", color:US[result.urgency].color, opacity:.8 }}>Recommended: See doctor {result.see_doctor}</div>
            </div>
            <div className="card" style={{ marginBottom:"14px" }}>
              <div style={{ fontSize:"13px", fontWeight:"700", color:"#0f172a", marginBottom:"10px" }}>Possible Conditions</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:"8px" }}>
                {result.conditions.map(c => <span key={c} className="tag tag-blue">{c}</span>)}
              </div>
            </div>
            <div className="card" style={{ marginBottom:"14px" }}>
              <div style={{ fontSize:"13px", fontWeight:"700", color:"#0f172a", marginBottom:"8px" }}>💡 Home Advice</div>
              <div style={{ fontSize:"13px", color:"#374151", lineHeight:"1.7" }}>{result.advice}</div>
            </div>
            <div className="card" style={{ marginBottom:"14px" }}>
              <div style={{ fontSize:"13px", fontWeight:"700", color:"#0f172a", marginBottom:"8px" }}>🏥 Applicable Government Schemes</div>
              {result.schemes.map(s => <div key={s} style={{ fontSize:"12.5px", color:"#059669", padding:"4px 0" }}>✓ {s}</div>)}
            </div>
            <button className="btn btn-outline btn-full" onClick={() => { setResult(null); setSelected([]); setExtra(""); }}>Check Again</button>
          </div>
        )}
      </div>
    </div>
  );
}
