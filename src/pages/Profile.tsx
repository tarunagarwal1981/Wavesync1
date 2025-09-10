import React from "react";
import styles from "./Profile.module.css";
import { Button, Badge, Input } from "../components/ui";
import { format } from "date-fns";

type TabKey = "personal" | "contact" | "qualifications" | "documents" | "assignments" | "training" | "settings";

export const Profile: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState<TabKey>("personal");
  const [formData, setFormData] = React.useState({
    firstName: "Captain",
    lastName: "Nemo",
    email: "captain.nemo@wavesync.com",
    phone: "+1 555 0123",
    nationality: "SG",
    dateOfBirth: "1985-06-15",
    rank: "Master",
    experience: "15 years",
  });

  const tabs: { key: TabKey; label: string }[] = [
    { key: "personal", label: "Personal" },
    { key: "contact", label: "Contact" },
    { key: "qualifications", label: "Qualifications" },
    { key: "documents", label: "Documents" },
    { key: "assignments", label: "Assignments" },
    { key: "training", label: "Training" },
    { key: "settings", label: "Settings" },
  ];

  function PersonalInfo() {
    return (
      <div className={styles.form}>
        <div className={styles.formRow}>
          <div className={styles.formField}>
            <label className={styles.label}>First Name</label>
            <input className={styles.input} value={formData.firstName} onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))} />
          </div>
          <div className={styles.formField}>
            <label className={styles.label}>Last Name</label>
            <input className={styles.input} value={formData.lastName} onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))} />
          </div>
        </div>
        <div className={styles.formRow}>
          <div className={styles.formField}>
            <label className={styles.label}>Date of Birth</label>
            <input className={styles.input} type="date" value={formData.dateOfBirth} onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))} />
          </div>
          <div className={styles.formField}>
            <label className={styles.label}>Nationality</label>
            <select className={styles.input} value={formData.nationality} onChange={(e) => setFormData(prev => ({ ...prev, nationality: e.target.value }))}>
              <option value="SG">Singapore</option>
              <option value="US">United States</option>
              <option value="UK">United Kingdom</option>
            </select>
          </div>
        </div>
        <div className={styles.formRow}>
          <div className={styles.formField}>
            <label className={styles.label}>Rank</label>
            <select className={styles.input} value={formData.rank} onChange={(e) => setFormData(prev => ({ ...prev, rank: e.target.value }))}>
              <option value="Master">Master</option>
              <option value="ChiefOfficer">Chief Officer</option>
              <option value="SecondOfficer">Second Officer</option>
            </select>
          </div>
          <div className={styles.formField}>
            <label className={styles.label}>Experience</label>
            <input className={styles.input} value={formData.experience} onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))} />
          </div>
        </div>
      </div>
    );
  }

  function ContactInfo() {
    return (
      <div className={styles.form}>
        <div className={styles.formField}>
          <label className={styles.label}>Email</label>
          <input className={styles.input} type="email" value={formData.email} onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))} />
        </div>
        <div className={styles.formField}>
          <label className={styles.label}>Phone</label>
          <input className={styles.input} value={formData.phone} onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))} />
        </div>
        <div className={styles.formField}>
          <label className={styles.label}>Address</label>
          <textarea className={styles.input} rows={3} placeholder="Enter your address" />
        </div>
      </div>
    );
  }

  function Qualifications() {
    const quals = [
      { title: "Master Unlimited License", issued: "2020-03-15", expiry: "2025-03-15", status: "Valid" },
      { title: "GMDSS Certificate", issued: "2019-08-20", expiry: "2024-08-20", status: "Valid" },
      { title: "Medical Certificate", issued: "2023-01-10", expiry: "2024-01-10", status: "Expiring" },
    ];
    return (
      <div className={styles.grid}>
        {quals.map((q, i) => (
          <div key={i} className={styles.item}>
            <div>
              <div className={styles.itemTitle}>{q.title}</div>
              <div className={styles.itemMeta}>Issued: {format(new Date(q.issued), "dd MMM yyyy")} • Expires: {format(new Date(q.expiry), "dd MMM yyyy")}</div>
            </div>
            <Badge variant={q.status === "Valid" ? "success" : "warning"}>{q.status}</Badge>
          </div>
        ))}
      </div>
    );
  }

  function Documents() {
    const docs = [
      { title: "Passport", status: "Valid", expiry: "2028-06-15" },
      { title: "Seaman Book", status: "Valid", expiry: "2026-12-20" },
      { title: "Medical Certificate", status: "Expiring", expiry: "2024-01-10" },
    ];
    return (
      <div className={styles.grid}>
        {docs.map((d, i) => (
          <div key={i} className={styles.item}>
            <div>
              <div className={styles.itemTitle}>{d.title}</div>
              <div className={styles.itemMeta}>Expires: {format(new Date(d.expiry), "dd MMM yyyy")}</div>
            </div>
            <Badge variant={d.status === "Valid" ? "success" : "warning"}>{d.status}</Badge>
          </div>
        ))}
      </div>
    );
  }

  function Assignments() {
    const assignments = [
      { vessel: "MV Ocean Star", position: "Master", start: "2023-01-15", end: "2023-07-15", status: "Completed" },
      { vessel: "MT Sea Crest", position: "Master", start: "2022-06-01", end: "2022-12-01", status: "Completed" },
    ];
    return (
      <div className={styles.grid}>
        {assignments.map((a, i) => (
          <div key={i} className={styles.item}>
            <div>
              <div className={styles.itemTitle}>{a.vessel}</div>
              <div className={styles.itemMeta}>{a.position} • {format(new Date(a.start), "dd MMM yyyy")} - {format(new Date(a.end), "dd MMM yyyy")}</div>
            </div>
            <Badge variant="neutral">{a.status}</Badge>
          </div>
        ))}
      </div>
    );
  }

  function Training() {
    const training = [
      { course: "BST Certificate", completed: "2023-03-15", validUntil: "2028-03-15", status: "Valid" },
      { course: "ECDIS Navigation", completed: "2022-11-20", validUntil: "2027-11-20", status: "Valid" },
    ];
    return (
      <div className={styles.grid}>
        {training.map((t, i) => (
          <div key={i} className={styles.item}>
            <div>
              <div className={styles.itemTitle}>{t.course}</div>
              <div className={styles.itemMeta}>Completed: {format(new Date(t.completed), "dd MMM yyyy")} • Valid until: {format(new Date(t.validUntil), "dd MMM yyyy")}</div>
            </div>
            <Badge variant="success">{t.status}</Badge>
          </div>
        ))}
      </div>
    );
  }

  function Settings() {
    return (
      <div className={styles.form}>
        <div className={styles.formField}>
          <label className={styles.label}>Language</label>
          <select className={styles.input}>
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
          </select>
        </div>
        <div className={styles.formField}>
          <label className={styles.label}>Timezone</label>
          <select className={styles.input}>
            <option value="UTC">UTC</option>
            <option value="EST">Eastern Time</option>
            <option value="PST">Pacific Time</option>
          </select>
        </div>
        <div className={styles.formField}>
          <label className={styles.label}>Email Notifications</label>
          <div style={{ display: "flex", gap: 12 }}>
            <label><input type="checkbox" defaultChecked /> Assignment updates</label>
            <label><input type="checkbox" defaultChecked /> Document reminders</label>
            <label><input type="checkbox" /> Training notifications</label>
          </div>
        </div>
      </div>
    );
  }

  function renderContent() {
    switch (activeTab) {
      case "personal": return <PersonalInfo />;
      case "contact": return <ContactInfo />;
      case "qualifications": return <Qualifications />;
      case "documents": return <Documents />;
      case "assignments": return <Assignments />;
      case "training": return <Training />;
      case "settings": return <Settings />;
      default: return null;
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.avatar}>CN</div>
        <div className={styles.info}>
          <div className={styles.name}>{formData.firstName} {formData.lastName}</div>
          <div className={styles.role}>{formData.rank} • {formData.experience}</div>
          <div className={styles.status}>
            <Badge variant="success">Active</Badge>
            <span style={{ fontSize: "var(--font-12)", color: "var(--color-text-muted)" }}>Last active: 2 hours ago</span>
          </div>
        </div>
        <div>
          <Button variant="primary">Edit Profile</Button>
        </div>
      </div>

      <div className={styles.tabs} role="tablist">
        {tabs.map(tab => (
          <button
            key={tab.key}
            role="tab"
            aria-selected={activeTab === tab.key}
            className={[styles.tab, activeTab === tab.key ? styles.tabActive : undefined].filter(Boolean).join(" ")}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className={styles.content}>
        <div className={styles.sectionHeader}>{tabs.find(t => t.key === activeTab)?.label}</div>
        <div className={styles.sectionBody}>
          {renderContent()}
          {(activeTab === "personal" || activeTab === "contact" || activeTab === "settings") && (
            <div className={styles.actions}>
              <Button variant="secondary">Cancel</Button>
              <Button variant="primary">Save Changes</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
