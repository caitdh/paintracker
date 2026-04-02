import { useState, useEffect, useCallback } from "react";

const PAIN_LOCATIONS = [
  "Head", "Neck", "Left shoulder", "Right shoulder",
  "Left arm", "Right arm", "Left hand", "Right hand",
  "Upper back", "Lower back", "Chest",
  "Abdomen", "Left hip", "Right hip",
  "Left leg", "Right leg", "Left foot", "Right foot"
];

const SUPPLEMENTS = [
  "Magnesium", "B12", "D3", "Omega-3", "Turmeric",
  "Alpha Lipoic Acid", "CoQ10", "Iron", "Zinc", "NAC"
];

const PAIN_MEDS = [
  "Ibuprofen", "Naproxen", "Acetaminophen", "Gabapentin",
  "Pregabalin", "Amitriptyline", "Duloxetine", "Topical lidocaine", "Other"
];

const CYCLE_PHASES = [
  { id: "menstrual", label: "Menstrual", days: "Days 1–5", color: "#e879a0" },
  { id: "follicular", label: "Follicular", days: "Days 6–13", color: "#34d399" },
  { id: "ovulation", label: "Ovulation", days: "Days 14–16", color: "#fbbf24" },
  { id: "luteal", label: "Luteal", days: "Days 17–28", color: "#818cf8" },
  { id: "none", label: "Not tracking", days: "", color: "#4b5563" },
];

const getPainColor = (val) => {
  if (val === 0) return "#374151";
  if (val <= 3) return "#34d399";
  if (val <= 6) return "#fbbf24";
  return "#f87171";
};

const getPainLabel = (val) => {
  if (val === 0) return "No pain";
  if (val <= 3) return "Mild";
  if (val <= 6) return "Moderate";
  if (val <= 8) return "Severe";
  return "Extreme";
};

const formatDate = (iso) => {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
};

const todayKey = () => new Date().toISOString().slice(0, 10);

const emptyEntry = () => ({
  date: todayKey(),
  pain: null,
  locations: [],
  phase: null,
  hydration: 6,
  supplements: [],
  meds: [],
  notes: "",
});

const STORAGE_KEY = "nerve-pain-entries-v1";

export default function App() {
  const [view, setView] = useState("log");
  const [entry, setEntry] = useState(emptyEntry());
  const [entries, setEntries] = useState([]);
  const [saved, setSaved] = useState(false);
  const [filterPhase, setFilterPhase] = useState("all");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const loaded = JSON.parse(raw);
        setEntries(loaded);
        const today = todayKey();
        const todayEntry = loaded.find(e => e.date === today);
        if (todayEntry) setEntry(todayEntry);
      }
    } catch (_) {}
  }, []);

  const saveEntry = useCallback(() => {
    if (entry.pain === null) return;
    const updated = entries.filter(e => e.date !== entry.date);
    updated.push(entry);
    updated.sort((a, b) => b.date.localeCompare(a.date));
    setEntries(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (_) {}
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [entry, entries]);

  const toggle = (field, val) => {
    setEntry(e => ({
      ...e,
      [field]: e[field].includes(val)
        ? e[field].filter(x => x !== val)
        : [...e[field], val]
    }));
  };

  const filtered = filterPhase === "all"
    ? entries
    : entries.filter(e => e.phase === filterPhase);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0c0c10",
      color: "#ede9f8",
      fontFamily: "'Instrument Sans', 'DM Sans', sans-serif",
      fontSize: 14,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Instrument+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #2a2a38; border-radius: 4px; }
        ::placeholder { color: #4b4a5e; }
        input[type=range] { -webkit-appearance: none; width: 100%; height: 3px; border-radius: 2px; background: #2a2a38; outline: none; cursor: pointer; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 14px; height: 14px; border-radius: 50%; background: #818cf8; cursor: pointer; }
        textarea { outline: none; resize: none; }
        button { cursor: pointer; font-family: inherit; }
        .chip { display: inline-flex; align-items: center; padding: 5px 11px; border-radius: 20px; border: 1px solid #2a2a38; background: none; color: #6b6880; font-size: 12px; transition: all 0.15s; }
        .chip:hover { border-color: #9ca3af; color: #ede9f8; }
        .chip.on { border-color: currentColor; }
        .fade-in { animation: fadeIn 0.3s ease forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div style={{
        display: "flex", alignItems: "center", padding: "18px 24px",
        borderBottom: "1px solid #1c1c28", position: "sticky", top: 0,
        background: "rgba(12,12,16,0.92)", backdropFilter: "blur(12px)", zIndex: 50,
        gap: 12,
      }}>
        <div>
          <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 20, letterSpacing: "-0.3px" }}>
            nerve <em>log</em>
          </div>
          <div style={{ fontSize: 11, color: "#4b4a5e", letterSpacing: "0.8px", textTransform: "uppercase", marginTop: 1 }}>
            pain pattern tracker
          </div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
          {["log", "timeline"].map(v => (
            <button key={v} onClick={() => setView(v)} style={{
              padding: "6px 16px", borderRadius: 20, border: "1px solid",
              borderColor: view === v ? "#818cf8" : "#2a2a38",
              background: view === v ? "rgba(129,140,248,0.12)" : "none",
              color: view === v ? "#818cf8" : "#6b6880",
              fontSize: 12, fontWeight: 400, letterSpacing: "0.3px",
            }}>
              {v === "log" ? "Log Today" : "Timeline"}
            </button>
          ))}
        </div>
      </div>

      {view === "log"
        ? <LogView entry={entry} setEntry={setEntry} toggle={toggle} saveEntry={saveEntry} saved={saved} />
        : <TimelineView entries={filtered} allEntries={entries} filterPhase={filterPhase} setFilterPhase={setFilterPhase} />
      }
    </div>
  );
}

function Section({ label, children }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ fontSize: 10, letterSpacing: "1.4px", textTransform: "uppercase", color: "#4b4a5e", marginBottom: 12, fontWeight: 500 }}>
        {label}
      </div>
      {children}
    </div>
  );
}

function LogView({ entry, setEntry, toggle, saveEntry, saved }) {
  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "28px 20px 60px" }} className="fade-in">
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 32, letterSpacing: "-0.5px" }}>
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </div>
        <div style={{ fontSize: 12, color: "#4b4a5e", marginTop: 4 }}>
          {entry.pain !== null ? `Pain logged: ${entry.pain}/10 · ${getPainLabel(entry.pain)}` : "No pain logged yet"}
        </div>
      </div>

      <Section label="Pain Level">
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
          {[...Array(11)].map((_, i) => {
            const active = entry.pain === i;
            const col = getPainColor(i);
            return (
              <button key={i} onClick={() => setEntry(e => ({ ...e, pain: i }))} style={{
                width: 36, height: 36, borderRadius: "50%",
                border: `2px solid ${active ? col : "#2a2a38"}`,
                background: active ? col : "#16161f",
                color: active ? (i === 0 ? "#ede9f8" : "#000") : "#6b6880",
                fontSize: 12, fontWeight: 500, transition: "all 0.15s",
              }}>{i}</button>
            );
          })}
        </div>
        {entry.pain !== null && (
          <div style={{ fontSize: 12, color: getPainColor(entry.pain), fontWeight: 500 }}>
            {getPainLabel(entry.pain)}{entry.pain > 0 ? ` — ${entry.pain}/10` : ""}
          </div>
        )}
      </Section>

      <Section label="Pain Location">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {PAIN_LOCATIONS.map(loc => (
            <button key={loc} className={`chip ${entry.locations.includes(loc) ? "on" : ""}`}
              style={{
                color: entry.locations.includes(loc) ? "#c084fc" : undefined,
                borderColor: entry.locations.includes(loc) ? "#c084fc" : undefined,
                background: entry.locations.includes(loc) ? "rgba(192,132,252,0.1)" : undefined
              }}
              onClick={() => toggle("locations", loc)}>{loc}</button>
          ))}
        </div>
      </Section>

      <Section label="Cycle Phase">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {CYCLE_PHASES.map(p => {
            const active = entry.phase === p.id;
            return (
              <button key={p.id} onClick={() => setEntry(e => ({ ...e, phase: active ? null : p.id }))}
                style={{
                  padding: "10px 14px", borderRadius: 10, textAlign: "left",
                  border: `1.5px solid ${active ? p.color : "#2a2a38"}`,
                  background: active ? `${p.color}18` : "#16161f",
                  color: active ? p.color : "#6b6880", transition: "all 0.15s",
                }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{p.label}</div>
                {p.days && <div style={{ fontSize: 11, opacity: 0.7, marginTop: 2 }}>{p.days}</div>}
              </button>
            );
          })}
        </div>
      </Section>

      <Section label={`Hydration — ${entry.hydration} glasses`}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ fontSize: 11, color: "#4b4a5e" }}>0</div>
          <input type="range" min={0} max={12} value={entry.hydration}
            onChange={e => setEntry(en => ({ ...en, hydration: +e.target.value }))} />
          <div style={{ fontSize: 11, color: "#4b4a5e" }}>12</div>
        </div>
        <div style={{ display: "flex", gap: 3, marginTop: 10 }}>
          {[...Array(12)].map((_, i) => (
            <div key={i} style={{
              flex: 1, height: 4, borderRadius: 2,
              background: i < entry.hydration ? "#818cf8" : "#2a2a38",
              transition: "background 0.2s",
            }} />
          ))}
        </div>
      </Section>

      <Section label="Supplements Taken">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {SUPPLEMENTS.map(s => (
            <button key={s} className={`chip ${entry.supplements.includes(s) ? "on" : ""}`}
              style={{
                color: entry.supplements.includes(s) ? "#34d399" : undefined,
                borderColor: entry.supplements.includes(s) ? "#34d399" : undefined,
                background: entry.supplements.includes(s) ? "rgba(52,211,153,0.1)" : undefined
              }}
              onClick={() => toggle("supplements", s)}>{s}</button>
          ))}
        </div>
      </Section>

      <Section label="Pain Medications">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {PAIN_MEDS.map(m => (
            <button key={m} className={`chip ${entry.meds.includes(m) ? "on" : ""}`}
              style={{
                color: entry.meds.includes(m) ? "#fb923c" : undefined,
                borderColor: entry.meds.includes(m) ? "#fb923c" : undefined,
                background: entry.meds.includes(m) ? "rgba(251,146,60,0.1)" : undefined
              }}
              onClick={() => toggle("meds", m)}>{m}</button>
          ))}
        </div>
      </Section>

      <Section label="Notes">
        <textarea value={entry.notes}
          onChange={e => setEntry(en => ({ ...en, notes: e.target.value }))}
          placeholder="Describe the sensation, triggers, anything unusual…"
          rows={3}
          style={{
            width: "100%", background: "#16161f", border: "1px solid #2a2a38",
            borderRadius: 10, color: "#ede9f8", fontFamily: "inherit",
            fontSize: 13, padding: "10px 12px", lineHeight: 1.6,
          }} />
      </Section>

      <button onClick={saveEntry} disabled={entry.pain === null} style={{
        width: "100%", padding: "14px", borderRadius: 12, border: "none",
        background: saved ? "#34d399" : entry.pain === null ? "#1c1c28" : "#818cf8",
        color: saved ? "#000" : entry.pain === null ? "#4b4a5e" : "#fff",
        fontSize: 14, fontWeight: 500, transition: "all 0.2s", marginTop: 8,
      }}>
        {saved ? "✓ Saved" : entry.pain === null ? "Select a pain level to save" : "Save Today's Entry"}
      </button>
    </div>
  );
}

function TimelineView({ entries, allEntries, filterPhase, setFilterPhase }) {
  if (allEntries.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "80px 24px", color: "#4b4a5e" }} className="fade-in">
        <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 28, marginBottom: 12, color: "#2a2a38" }}>No entries yet</div>
        <div style={{ fontSize: 13 }}>Log your first day to start seeing patterns.</div>
      </div>
    );
  }

  const chartData = [...allEntries].slice(0, 30).reverse();

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "28px 20px 60px" }} className="fade-in">
      <div style={{ background: "#13131a", border: "1px solid #1c1c28", borderRadius: 14, padding: "20px", marginBottom: 28 }}>
        <div style={{ fontSize: 10, letterSpacing: "1.2px", textTransform: "uppercase", color: "#4b4a5e", marginBottom: 16 }}>
          Pain over time
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 60 }}>
          {chartData.map((e, i) => {
            const h = e.pain === 0 ? 2 : (e.pain / 10) * 56 + 2;
            const phase = CYCLE_PHASES.find(p => p.id === e.phase);
            return (
              <div key={i} title={`${formatDate(e.date)}: ${e.pain}/10`} style={{
                flex: 1, height: h, borderRadius: 3,
                background: getPainColor(e.pain), opacity: 0.85,
                borderBottom: phase ? `3px solid ${phase.color}` : "3px solid transparent",
              }} />
            );
          })}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
          <div style={{ fontSize: 10, color: "#4b4a5e" }}>{chartData[0] ? formatDate(chartData[0].date) : ""}</div>
          <div style={{ fontSize: 10, color: "#4b4a5e" }}>{chartData[chartData.length - 1] ? formatDate(chartData[chartData.length - 1].date) : ""}</div>
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 12, flexWrap: "wrap" }}>
          {CYCLE_PHASES.filter(p => p.id !== "none").map(p => (
            <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#6b6880" }}>
              <div style={{ width: 10, height: 3, borderRadius: 2, background: p.color }} />
              {p.label}
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
        <button className={`chip ${filterPhase === "all" ? "on" : ""}`}
          onClick={() => setFilterPhase("all")}
          style={{ color: filterPhase === "all" ? "#ede9f8" : undefined, borderColor: filterPhase === "all" ? "#4b5563" : undefined }}>
          All phases
        </button>
        {CYCLE_PHASES.map(p => (
          <button key={p.id} className={`chip ${filterPhase === p.id ? "on" : ""}`}
            onClick={() => setFilterPhase(filterPhase === p.id ? "all" : p.id)}
            style={{
              color: filterPhase === p.id ? p.color : undefined,
              borderColor: filterPhase === p.id ? p.color : undefined,
              background: filterPhase === p.id ? `${p.color}12` : undefined,
            }}>{p.label}</button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {entries.length === 0
          ? <div style={{ color: "#4b4a5e", fontSize: 13, padding: "20px 0" }}>No entries for this filter.</div>
          : entries.map((e, i) => {
            const phase = CYCLE_PHASES.find(p => p.id === e.phase);
            return (
              <div key={e.date} style={{
                background: "#13131a", border: "1px solid #1c1c28", borderRadius: 12,
                padding: "14px 16px", display: "grid", gridTemplateColumns: "52px 1fr", gap: 14,
                borderLeft: phase ? `3px solid ${phase.color}` : "3px solid #1c1c28",
                animation: `fadeIn 0.25s ease ${i * 0.03}s both`,
              }}>
                <div style={{ textAlign: "center", paddingTop: 2 }}>
                  <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 24, lineHeight: 1, color: "#ede9f8" }}>
                    {new Date(e.date + "T12:00:00").getDate()}
                  </div>
                  <div style={{ fontSize: 10, color: "#4b4a5e", textTransform: "uppercase", letterSpacing: "0.5px", marginTop: 2 }}>
                    {new Date(e.date + "T12:00:00").toLocaleString("en-US", { month: "short" })}
                  </div>
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                    <div style={{
                      display: "inline-flex", alignItems: "center", gap: 6,
                      background: `${getPainColor(e.pain)}20`, color: getPainColor(e.pain),
                      padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 500,
                    }}>
                      <span style={{ fontSize: 15, fontWeight: 700 }}>{e.pain}</span>
                      <span style={{ opacity: 0.8 }}>{getPainLabel(e.pain)}</span>
                    </div>
                    {phase && (
                      <div style={{
                        fontSize: 11, color: phase.color, padding: "3px 9px",
                        borderRadius: 20, border: `1px solid ${phase.color}40`, background: `${phase.color}10`,
                      }}>{phase.label}</div>
                    )}
                    <div style={{ fontSize: 11, color: "#4b4a5e", marginLeft: "auto" }}>💧 {e.hydration}</div>
                  </div>
                  {e.locations.length > 0 && <div style={{ fontSize: 12, color: "#c084fc", marginBottom: 5 }}>📍 {e.locations.join(", ")}</div>}
                  {e.supplements.length > 0 && <div style={{ fontSize: 12, color: "#34d399", marginBottom: 5 }}>💊 {e.supplements.join(", ")}</div>}
                  {e.meds.length > 0 && <div style={{ fontSize: 12, color: "#fb923c", marginBottom: 5 }}>🩹 {e.meds.join(", ")}</div>}
                  {e.notes && <div style={{ fontSize: 12, color: "#6b6880", marginTop: 6, lineHeight: 1.5, fontStyle: "italic" }}>"{e.notes}"</div>}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
