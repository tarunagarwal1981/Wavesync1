import React from "react";
import styles from "./Documents.module.css";
import { Button, Input, Badge } from "../components/ui";
import { FileText, ShieldPlus, Stethoscope, Plane, FileCheck } from "lucide-react";
import { format } from "date-fns";

type ViewMode = "grid" | "list";
type Category = "All" | "Medical" | "STCW" | "Visa" | "Company" | "Other";

interface DocItem {
  id: string;
  type: Category;
  title: string;
  description?: string;
  uploadedAt: string; // ISO
  expiry?: string; // ISO
  sizeKb: number;
  mime: string;
}

const ICON: Record<Category, React.ReactNode> = {
  All: <FileText size={16} />, Medical: <Stethoscope size={16} />, STCW: <ShieldPlus size={16} />, Visa: <Plane size={16} />, Company: <FileCheck size={16} />, Other: <FileText size={16} />
};

const MOCK: DocItem[] = [
  { id: "1", type: "Medical", title: "Medical Certificate", description: "SEAFARER MED 1", uploadedAt: new Date().toISOString(), expiry: new Date(Date.now() + 90*86400e3).toISOString(), sizeKb: 320, mime: "application/pdf" },
  { id: "2", type: "STCW", title: "BST Certificate", description: "Basic Safety Training", uploadedAt: new Date().toISOString(), expiry: new Date(Date.now() + 15*86400e3).toISOString(), sizeKb: 860, mime: "application/pdf" },
  { id: "3", type: "Visa", title: "US C1D Visa", description: "Valid multi-entry", uploadedAt: new Date().toISOString(), expiry: new Date(Date.now() - 1*86400e3).toISOString(), sizeKb: 540, mime: "image/jpeg" },
];

function expiryClass(exp?: string) {
  if (!exp) return "";
  const days = Math.ceil((+new Date(exp) - Date.now()) / 86400000);
  if (days < 0) return styles.statusExpired;
  if (days <= 30) return styles.statusExpSoon;
  return styles.statusValid;
}

export const Documents: React.FC = () => {
  const [view, setView] = React.useState<ViewMode>("grid");
  const [cat, setCat] = React.useState<Category>("All");
  const [query, setQuery] = React.useState("");
  const [dragOver, setDragOver] = React.useState(false);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());

  const categories: Category[] = ["All", "Medical", "STCW", "Visa", "Company", "Other"];
  const filtered = MOCK.filter(d => (cat === "All" || d.type === cat) && `${d.title} ${d.description || ""}`.toLowerCase().includes(query.toLowerCase()));

  function toggleSel(id: string) {
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  function UploadArea() {
    return (
      <div
        className={[styles.upload, dragOver ? styles.dragOver : undefined].filter(Boolean).join(" ")}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); /* handle files */ }}
      >
        Drag & drop files here or <Button variant="secondary">Browse</Button>
      </div>
    );
  }

  function Card({ d }: { d: DocItem }) {
    const expClass = expiryClass(d.expiry);
    const body = (
      <>
        <div className={styles.title}>{d.title}</div>
        {d.description && <div className={styles.desc}>{d.description}</div>}
        <div className={styles.meta}>
          <span className={expClass}>Expiry: {d.expiry ? format(new Date(d.expiry), "dd MMM yyyy") : "—"}</span>
          <span>Uploaded: {format(new Date(d.uploadedAt), "dd MMM yyyy")}</span>
          <span>{(d.sizeKb/1024).toFixed(1)} MB</span>
          <span>{d.mime}</span>
        </div>
      </>
    );
    if (view === "grid") {
      return (
        <label className={styles.card}>
          <div className={styles.iconWrap}>{ICON[d.type]}</div>
          {body}
          <div>
            <input type="checkbox" checked={selected.has(d.id)} onChange={() => toggleSel(d.id)} />
          </div>
        </label>
      );
    }
    return (
      <label className={styles.rowCard}>
        <div className={styles.iconWrap}>{ICON[d.type]}</div>
        <div>
          {body}
        </div>
        <div>
          <input type="checkbox" checked={selected.has(d.id)} onChange={() => toggleSel(d.id)} />
        </div>
      </label>
    );
  }

  return (
    <div className={styles.layout}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sideHeader}>Categories</div>
        <div className={styles.cats}>
          {categories.map(c => (
            <button key={c} className={[styles.catBtn, cat === c ? styles.catActive : undefined].filter(Boolean).join(" ")} onClick={() => setCat(c)}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>{ICON[c]} {c}</span>
              <Badge variant="neutral">{MOCK.filter(d => c === "All" || d.type === c).length}</Badge>
            </button>
          ))}
        </div>
      </aside>

      {/* Main content */}
      <section className={styles.content}>
        <div className={styles.toolbar}>
          <div className={styles.filters}>
            <div className={styles.search}><Input placeholder="Search documents" value={query} onChange={(e) => setQuery(e.currentTarget.value)} /></div>
            <select className={styles.select} aria-label="File type">
              <option>All types</option>
              <option>PDF</option>
              <option>Image</option>
            </select>
            <select className={styles.select} aria-label="Status">
              <option>Any status</option>
              <option>Valid</option>
              <option>Expiring soon</option>
              <option>Expired</option>
            </select>
          </div>
          <div className={styles.actions}>
            <Button variant="secondary" disabled={selected.size === 0}>Download</Button>
            <Button variant="ghost" disabled={selected.size === 0}>Delete</Button>
            <Button variant="ghost" onClick={() => setView(v => v === "grid" ? "list" : "grid")}>{view === "grid" ? "List view" : "Grid view"}</Button>
          </div>
        </div>

        <UploadArea />

        {filtered.length === 0 ? (
          <div className={styles.empty}>No documents found.</div>
        ) : view === "grid" ? (
          <div className={styles.grid}>
            {filtered.map(d => <Card key={d.id} d={d} />)}
          </div>
        ) : (
          <div className={styles.list}>
            {filtered.map(d => <Card key={d.id} d={d} />)}
          </div>
        )}
      </section>
    </div>
  );
};

export default Documents;

