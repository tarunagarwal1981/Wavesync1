import React from "react";
import styles from "./Training.module.css";
import { Button, Badge } from "../components/ui";
import { format } from "date-fns";

type Category = "All" | "Safety" | "Navigation" | "Engineering" | "Security" | "Medical";

interface CourseItem {
  id: string;
  title: string;
  provider: string;
  duration: string;
  format: "Online" | "Classroom" | "Blended";
  prerequisites?: string[];
  progress: number; // 0..100
  completed?: boolean;
  certificateValidUntil?: string; // ISO
  category: Category;
}

const COURSES: CourseItem[] = [
  { id: "1", title: "Basic Safety Training (BST)", provider: "Wave Academy", duration: "24h", format: "Blended", prerequisites: [], progress: 60, category: "Safety" },
  { id: "2", title: "Advanced Fire Fighting", provider: "SeaPro Institute", duration: "12h", format: "Classroom", prerequisites: ["BST"], progress: 0, category: "Safety" },
  { id: "3", title: "ECDIS Navigation", provider: "Nautical Learn", duration: "10h", format: "Online", prerequisites: [], progress: 100, completed: true, certificateValidUntil: new Date(Date.now() + 365*86400e3).toISOString(), category: "Navigation" },
];

interface CalendarEvent { day: number; title: string; }
const CAL_EVENTS: CalendarEvent[] = [ { day: new Date().getDate() + 1, title: "BST Session" }, { day: new Date().getDate() + 3, title: "Fire Drill" } ];

interface CertItem { id: string; title: string; validUntil?: string; status: "Valid" | "ExpiringSoon" | "Expired"; }
const CERTS: CertItem[] = [
  { id: "c1", title: "BST Certificate", validUntil: new Date(Date.now() + 90*86400e3).toISOString(), status: "Valid" },
  { id: "c2", title: "Medical Certificate", validUntil: new Date(Date.now() + 15*86400e3).toISOString(), status: "ExpiringSoon" },
  { id: "c3", title: "US C1D Visa", validUntil: new Date(Date.now() - 1*86400e3).toISOString(), status: "Expired" },
];

export const Training: React.FC = () => {
  const [cat, setCat] = React.useState<Category>("All");
  const categories: Category[] = ["All", "Safety", "Navigation", "Engineering", "Security", "Medical"];
  const filtered = COURSES.filter(c => cat === "All" || c.category === cat);

  function progressColor(p: number) {
    if (p >= 100) return "var(--color-success)";
    if (p >= 50) return "var(--color-primary)";
    return "var(--gray-600)";
  }

  const now = new Date();
  const first = new Date(now.getFullYear(), now.getMonth(), 1);
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.sideHeader}>Categories</div>
        <div className={styles.cats}>
          {categories.map(c => (
            <button key={c} className={[styles.catBtn, cat === c ? styles.catActive : undefined].filter(Boolean).join(" ")} onClick={() => setCat(c)}>
              <span>{c}</span>
              <Badge variant="neutral">{COURSES.filter(x => c === "All" || x.category === c).length}</Badge>
            </button>
          ))}
        </div>
      </aside>

      <section className={styles.content}>
        <div className={styles.toolbar}>
          <div className={styles.filters}>
            <select className={styles.select} aria-label="Format">
              <option>Any format</option>
              <option>Online</option>
              <option>Classroom</option>
              <option>Blended</option>
            </select>
            <select className={styles.select} aria-label="Status">
              <option>Any status</option>
              <option>In progress</option>
              <option>Completed</option>
            </select>
          </div>
          <div>
            <Button variant="primary">Enroll new course</Button>
          </div>
        </div>

        <div className={styles.grid}>
          {filtered.length === 0 ? (
            <div className={styles.empty}>No courses found.</div>
          ) : filtered.map(c => (
            <div key={c.id} className={styles.course}>
              <div>
                <div className={styles.title}>{c.title}</div>
                <div className={styles.provider}>{c.provider}</div>
              </div>
              <div className={styles.meta}>
                <span>Duration: {c.duration}</span>
                <span>Format: {c.format}</span>
                {c.prerequisites?.length ? <span>Prerequisites: {c.prerequisites.join(", ")}</span> : null}
                {c.completed && c.certificateValidUntil && (
                  <span>Certificate valid until: {format(new Date(c.certificateValidUntil), "dd MMM yyyy")}</span>
                )}
              </div>
              <div className={styles.progress}>
                <div className={styles.bar} style={{ width: `${c.progress}%`, background: progressColor(c.progress) }} />
              </div>
              <div className={styles.badges}>
                {c.completed ? <Badge variant="success">Completed</Badge> : <Badge variant="primary">In progress</Badge>}
                {c.certificateValidUntil && <Badge variant="neutral">Certificate</Badge>}
              </div>
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <Button variant="secondary">View</Button>
                {!c.completed && <Button variant="primary">Continue</Button>}
              </div>
            </div>
          ))}
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>Training calendar</div>
          <div className={styles.sectionBody}>
            <div className={styles.calendar}>
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const ev = CAL_EVENTS.filter(e => e.day === day);
                return (
                  <div key={day} className={styles.day}>
                    <div>{day}</div>
                    {ev.map((e, idx) => <div key={idx} className={styles.event}>{e.title}</div>)}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>Certificates</div>
          <div className={styles.sectionBody}>
            <div className={styles.certList}>
              {CERTS.map(c => (
                <div key={c.id} className={styles.certRow}>
                  <div>{c.title}</div>
                  <div>{c.validUntil ? format(new Date(c.validUntil), "dd MMM yyyy") : "—"}</div>
                  <div>
                    {c.status === "Valid" && <Badge variant="success">Valid</Badge>}
                    {c.status === "ExpiringSoon" && <Badge variant="warning">Expiring soon</Badge>}
                    {c.status === "Expired" && <Badge variant="danger">Expired</Badge>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Training;

