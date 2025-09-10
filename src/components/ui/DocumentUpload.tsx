import React from "react";
import styles from "./DocumentUpload.module.css";
import { Button, Input } from "./index";

type Category = "Medical" | "STCW" | "Visa" | "Company" | "Other";
const ACCEPTED = ["application/pdf", "image/jpeg", "image/png"] as const;

interface FileItem {
  id: string;
  file: File;
  progress: number;
  error?: string;
  aiProcessing?: boolean;
}

export interface DocumentUploadProps {
  onUpload?: (files: { file: File; category: Category; expiry?: string }[]) => Promise<void> | void;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({ onUpload }) => {
  const [category, setCategory] = React.useState<Category>("Medical");
  const [expiry, setExpiry] = React.useState<string>("");
  const [items, setItems] = React.useState<FileItem[]>([]);
  const [dragOver, setDragOver] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  function validate(files: File[]): { valid: File[]; errors: string[] } {
    const valid: File[] = [];
    const errors: string[] = [];
    for (const f of files) {
      if (!ACCEPTED.includes(f.type as any)) {
        errors.push(`${f.name}: unsupported type ${f.type}`);
        continue;
      }
      valid.push(f);
    }
    return { valid, errors };
  }

  function addFiles(files: File[]) {
    const { valid, errors } = validate(files);
    const newItems: FileItem[] = valid.map(f => ({ id: crypto.randomUUID(), file: f, progress: 0, aiProcessing: true }));
    setItems(prev => [...prev, ...newItems]);
    if (errors.length) alert(errors.join("\n"));
    // Mock upload + AI processing
    newItems.forEach((it) => {
      const start = Date.now();
      const duration = 1200 + Math.random() * 1200;
      const timer = setInterval(() => {
        const pct = Math.min(100, Math.round(((Date.now() - start) / duration) * 100));
        setItems(prev => prev.map(p => p.id === it.id ? { ...p, progress: pct } : p));
        if (pct >= 100) {
          clearInterval(timer);
          // AI processing mock
          setTimeout(() => {
            setItems(prev => prev.map(p => p.id === it.id ? { ...p, aiProcessing: false } : p));
          }, 1000);
        }
      }, 120);
    });
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
  }

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.currentTarget.files || []);
    addFiles(files);
    e.currentTarget.value = "";
  }

  async function onSubmit() {
    if (!items.length) return;
    await onUpload?.(items.map(it => ({ file: it.file, category, expiry: expiry || undefined })));
    alert("Uploaded!");
    setItems([]);
  }

  return (
    <div className={styles.uploader}>
      <div className={styles.controls}>
        <div className={styles.select}>
          <div className={styles.label}>Category</div>
          <select value={category} onChange={(e) => setCategory(e.currentTarget.value as Category)}>
            {(["Medical","STCW","Visa","Company","Other"] as const).map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className={styles.date}>
          <div className={styles.label}>Expiry date (optional)</div>
          <Input type="date" value={expiry} onChange={(e) => setExpiry(e.currentTarget.value)} />
        </div>
      </div>

      <div
        className={[styles.dropzone, dragOver ? styles.dragOver : undefined].filter(Boolean).join(" ")}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
      >
        Drag & drop files here or click to select
        <div className={styles.hint}>Accepted: PDF, JPG, PNG</div>
        <input ref={inputRef} type="file" multiple accept={ACCEPTED.join(",")} style={{ display: "none" }} onChange={onPick} />
      </div>

      <div className={styles.list}>
        {items.map(it => {
          const isImage = it.file.type.startsWith("image/");
          return (
            <div key={it.id} className={styles.item}>
              <div className={styles.thumb} aria-hidden>
                {isImage ? <img src={URL.createObjectURL(it.file)} alt="preview" /> : <span>{it.file.type.includes("pdf") ? "PDF" : "FILE"}</span>}
              </div>
              <div className={styles.meta}>
                <div className={styles.title}>{it.file.name}</div>
                <div className={styles.sub}>{(it.file.size/1024/1024).toFixed(2)} MB • {it.file.type || "unknown"}</div>
                <div className={styles.progress}><div className={styles.bar} style={{ width: `${it.progress}%` }} /></div>
                {it.aiProcessing && <div className={styles.ai}><span className={styles.dot} aria-hidden /> AI processing…</div>}
                {it.error && <div className={styles.error}>{it.error}</div>}
              </div>
              <div className={styles.actions}>
                <Button variant="ghost" onClick={() => setItems(prev => prev.filter(p => p.id !== it.id))}>Remove</Button>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
        <Button variant="secondary" onClick={() => inputRef.current?.click()}>Add more</Button>
        <Button variant="primary" disabled={items.length === 0} onClick={onSubmit}>Upload</Button>
      </div>
    </div>
  );
};

export default DocumentUpload;

