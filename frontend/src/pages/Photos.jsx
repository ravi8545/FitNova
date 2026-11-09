import { useMemo, useRef, useState } from "react";
import { Upload, Camera, Calendar, TrendingDown, Trophy, Quote } from "lucide-react";
import "../styles/Photos.css";
import { photosData } from "../services/mockData";

const TABS = ["My Photos", "Comparison", "Slideshow", "Insights"];
const METRICS = [["Weight", "weight", "kg"], ["Body Fat", "bodyFat", "%"], ["Chest", "chest", "cm"], ["Waist", "waist", "cm"], ["Arms", "arms", "cm"]];
const CATS = ["Progress", "Front View", "Side View", "Other"];

function Photo({ p, height }) {
  return p.src
    ? <img src={p.src} alt={`Progress photo from ${p.date}`} className="photo-img" style={{ height }} />
    : <div className="photo-img" style={{ height }}>🧍</div>;
}

function Spark({ values, color }) {
  const max = Math.max(...values), min = Math.min(...values);
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * 80},${22 - ((v - min) / (max - min || 1)) * 20}`).join(" ");
  return <svg viewBox="0 0 80 24" className="photo-spark"><polyline points={pts} fill="none" stroke={color} strokeWidth="2" /></svg>;
}

const CardHead = ({ title, sub, right }) => (
  <div className="photo-card-head">
    <div><h3 className="photo-card-title">{title}</h3>{sub && <p className="photo-card-sub">{sub}</p>}</div>
    {right}
  </div>
);

export default function PhotosPage() {
  const [tab, setTab] = useState("My Photos");
  const [photos, setPhotos] = useState(photosData.photos);
  const [selected, setSelected] = useState(photosData.photos.at(-1).id);
  const [latestFirst, setLatestFirst] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef(null);
  const { stats } = photosData;

  const shown = useMemo(() => (latestFirst ? [...photos].reverse() : photos), [photos, latestFirst]);
  const first = photos[0], last = photos.at(-1);
  const sel = photos.find((p) => p.id === selected) || last;

  // TODO: POST multipart to /api/progress/photos/ ; for now previews stay local
  const handleFiles = (files) => {
    setError("");
    const added = [];
    for (const f of files) {
      if (!["image/jpeg", "image/png", "image/webp"].includes(f.type)) { setError("Only JPG, PNG or WEBP files are allowed."); continue; }
      if (f.size > 5 * 1024 * 1024) { setError("Each photo must be 5MB or smaller."); continue; }
      added.push({ ...last, id: Date.now() + added.length, category: "Progress", src: URL.createObjectURL(f),
        date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) });
    }
    if (added.length) { setPhotos((p) => [...p, ...added]); setSelected(added.at(-1).id); }
  };

  const statCards = [
    [Camera, photos.length, "Total Photos", `+${stats.thisMonth} this month`],
    [Calendar, stats.months, "Months Tracking", `Since ${stats.since}`],
    [TrendingDown, `${stats.weightChange} kg`, "Weight Change", "Since first photo"],
    [Trophy, `${stats.consistency}%`, "Consistency", "Monthly upload rate"],
  ];
  const sideStats = [
    [photos.length, "Photos Uploaded", [1, 2, 4, 5, 6, 8], "#2BAF34"],
    [`${stats.weightChange} kg`, "Weight Change", [85.6, 84.8, 83.9, 83.1, 82.6, 82.4], "#8B5CF6"],
    [`${stats.consistency}%`, "Consistency", [40, 55, 50, 70, 65, 75], "#3B82F6"],
    [`${stats.months} months`, "Tracking Period", [1, 1, 2, 2, 3, 3], "#F59E0B"],
  ];

  return (
    <div className="photo-page">
      <div className="photo-header">
        <div>
          <h1 className="photo-title">Progress Photos</h1>
          <p className="photo-sub">Visual proof of your hard work. Track your transformation journey.</p>
        </div>
        <button className="photo-btn" onClick={() => fileRef.current.click()}><Upload size={16} /> Upload Photos</button>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={(e) => handleFiles(e.target.files)} />
      </div>

      <div role="tablist" className="photo-tabs">
        {TABS.map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={`photo-tab${tab === t ? " is-active" : ""}`}>{t}</button>
        ))}
      </div>

      {tab !== "My Photos" && <div className="photo-card photo-empty">{tab} is coming soon.</div>}

      {tab === "My Photos" && (
        <>
          <div className="photo-stats">
            {statCards.map(([Icon, v, l, sub]) => (
              <div key={l} className="photo-card photo-stat">
                <div className="photo-stat-icon"><Icon size={22} /></div>
                <div><b>{v}</b><span>{l}</span><small>{sub}</small></div>
              </div>
            ))}
            <div className="photo-card photo-quote"><Quote size={22} /><p>"Discipline today, a stronger you tomorrow."</p></div>
          </div>

          <div className="photo-layout">
            <div className="photo-col">
              <div className="photo-card">
                <CardHead title="Transformation Timeline" sub="Track your visual progress over time"
                  right={<button className="photo-sort" onClick={() => setLatestFirst((v) => !v)}>{latestFirst ? "Latest First" : "Oldest First"}</button>} />
                <div className="photo-timeline">
                  {shown.map((p) => (
                    <button key={p.id} onClick={() => setSelected(p.id)} className={`photo-thumb${selected === p.id ? " is-active" : ""}`}>
                      <Photo p={p} />
                      <div className="photo-cap">{p.date}<b>{p.weight} kg</b></div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="photo-card">
                <CardHead title="Side by Side Comparison" sub="Your first photo vs the one selected above" />
                <div className="photo-compare">
                  <div className="photo-pair">
                    {[first, sel].map((p) => (
                      <div key={p.id}><Photo p={p} /><div className="photo-cap">{p.date}<b>{p.weight} kg</b></div></div>
                    ))}
                  </div>
                  <ul className="photo-metrics">
                    {METRICS.map(([label, key, unit]) => {
                      const d = +(sel[key] - first[key]).toFixed(1);
                      return (
                        <li key={key}>
                          <span>{label}</span>
                          <span>{first[key]}{unit} → {sel[key]}{unit}</span>
                          <span className={`photo-delta${d > 0 ? " up" : ""}`}>{d > 0 ? "+" : ""}{d}{unit}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </div>

            <div className="photo-col">
              <div className="photo-card">
                <CardHead title="Photo Stats" />
                <ul className="photo-sstats">
                  {sideStats.map(([v, l, vals, c]) => (
                    <li key={l}><div><b>{v}</b><small>{l}</small></div><Spark values={vals} color={c} /></li>
                  ))}
                </ul>
              </div>

              <div className="photo-card">
                <CardHead title="Quick Upload" />
                <div className={`photo-drop${dragging ? " is-drag" : ""}`} onClick={() => fileRef.current.click()}
                  onDragOver={(e) => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)}
                  onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}>
                  <Upload size={24} />
                  <p>Drag & drop your photos here</p>
                  <small>or click to browse</small>
                  <small>JPG, PNG, WEBP (Max 5MB)</small>
                </div>
                {error && <p role="alert" className="photo-error">{error}</p>}
              </div>

              <div className="photo-card">
                <CardHead title="Photo Categories" right={<button className="photo-link">Manage</button>} />
                <div className="photo-cats">
                  {CATS.map((c) => <div key={c}><span>{c}</span><b>{photos.filter((p) => p.category === c).length}</b></div>)}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
