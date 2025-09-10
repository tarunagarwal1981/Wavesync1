import React from "react";
import styles from "./DocumentCard.module.css";
import { FileText, ShieldPlus, Stethoscope, Plane, FileCheck, Download, Eye, RefreshCw, Trash2 } from "lucide-react";

type DocStatus = "valid" | "expiring" | "expired";
type DocCategory = "Medical" | "STCW" | "Visa" | "Company" | "Other";

export interface DocumentCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  category: DocCategory;
  status: DocStatus;
  lastUpdated: string; // ISO
  sizeKb: number;
  onView?: () => void;
  onDownload?: () => void;
  onReplace?: () => void;
  onDelete?: () => void;
}

function Icon({ category }: { category: DocCategory }) {
  const icon = {
    Medical: <Stethoscope size={18} />,
    STCW: <ShieldPlus size={18} />,
    Visa: <Plane size={18} />,
    Company: <FileCheck size={18} />,
    Other: <FileText size={18} />,
  }[category];
  const wrapClass = {
    Medical: styles.iconGreen,
    STCW: styles.iconBlue,
    Visa: styles.iconOrange,
    Company: styles.iconBlue,
    Other: styles.iconGray,
  }[category];
  return <div className={[styles.iconWrap, wrapClass].join(" ")}>{icon}</div>;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({ title, category, status, lastUpdated, sizeKb, onView, onDownload, onReplace, onDelete, className, ...props }) => {
  const [open, setOpen] = React.useState(false);
  const statusClass = status === "valid" ? styles.valid : status === "expiring" ? styles.expSoon : styles.expired;
  const statusText = status === "valid" ? "Valid" : status === "expiring" ? "Expiring soon" : "Expired";
  const sizeStr = `${(sizeKb/1024).toFixed(1)} MB`;

  return (
    <div className={[styles.card, className].filter(Boolean).join(" ")} {...props}>
      <Icon category={category} />
      <div className={styles.content}>
        <div className={styles.title}>{title}</div>
        <div className={styles.category}>{category}</div>
        <div className={styles.meta}>
          <span className={[styles.status, statusClass].join(" ")}>{statusText}</span>
          <span>Updated: {new Date(lastUpdated).toLocaleDateString()}</span>
          <span>{sizeStr}</span>
        </div>
      </div>
      <div className={styles.menu}>
        <button className={styles.menuBtn} aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(v => !v)}>Actions ▾</button>
        {open && (
          <div role="menu" className={styles.menuList} onMouseLeave={() => setOpen(false)}>
            <button className={styles.menuItem} role="menuitem" onClick={onView}><Eye size={16} /> View</button>
            <button className={styles.menuItem} role="menuitem" onClick={onDownload}><Download size={16} /> Download</button>
            <button className={styles.menuItem} role="menuitem" onClick={onReplace}><RefreshCw size={16} /> Replace</button>
            <button className={styles.menuItem} role="menuitem" onClick={onDelete}><Trash2 size={16} /> Delete</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentCard;

