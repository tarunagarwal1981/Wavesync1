import React from "react";
import styles from "./MobilizationChecklist.module.css";
import { Button, Badge } from "./index";
import { formatDistanceToNow } from "date-fns";

export interface ChecklistDoc {
  key: string;
  label: string;
  required: boolean;
  provided: boolean;
}

export interface ChecklistStep {
  id: string;
  title: string;
  description?: string;
  due?: string; // ISO
  status: "Pending" | "Completed" | "Waived";
  documents?: ChecklistDoc[];
  completed?: boolean;
}

export interface MobilizationChecklistProps {
  title?: string;
  steps: ChecklistStep[];
  onToggleStep?: (id: string, completed: boolean) => void;
  onUploadDoc?: (stepId: string, docKey: string) => void;
}

export const MobilizationChecklist: React.FC<MobilizationChecklistProps> = ({ title = "Mobilization Checklist", steps, onToggleStep, onUploadDoc }) => {
  const [openIds, setOpen] = React.useState<Set<string>>(new Set());

  const completedCount = steps.filter(s => s.completed).length;
  const pct = Math.round((completedCount / Math.max(1, steps.length)) * 100);

  function toggle(id: string) {
    setOpen(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  function Due({ iso }: { iso?: string }) {
    if (!iso) return <span className={styles.muted}>No due</span>;
    const diff = +new Date(iso) - Date.now();
    const days = Math.ceil(diff / 86400000);
    let color = "var(--gray-700)";
    if (days < 0) color = "var(--color-error)";
    else if (days <= 2) color = "var(--color-warning)";
    else if (days <= 7) color = "var(--color-success)";
    return <span className={styles.due} style={{ color }}>{days < 0 ? "Overdue" : `Due ${formatDistanceToNow(new Date(iso), { addSuffix: true })}`}</span>;
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div className={styles.title}>{title}</div>
        <div>{pct}% complete</div>
      </div>
      <div className={styles.progress} aria-label="Progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
        <div className={styles.bar} style={{ width: `${pct}%` }} />
      </div>

      <div className={styles.list}>
        {steps.map(step => {
          const open = openIds.has(step.id);
          return (
            <div key={step.id} className={[styles.item, open ? styles.open : undefined].filter(Boolean).join(" ")}>
              <button className={styles.summary} onClick={() => toggle(step.id)} aria-expanded={open} aria-controls={`step-${step.id}`}>
                <input
                  className={styles.checkbox}
                  type="checkbox"
                  checked={!!step.completed}
                  onChange={(e) => onToggleStep?.(step.id, e.currentTarget.checked)}
                  onClick={(e) => e.stopPropagation()}
                />
                <div>
                  <div className={styles.stepTitle}>{step.title}</div>
                  {step.description && <div className={styles.muted}>{step.description}</div>}
                </div>
                <Due iso={step.due} />
                <Badge variant={step.status === "Completed" ? "success" : step.status === "Waived" ? "neutral" : "warning"}>{step.status}</Badge>
              </button>

              <div id={`step-${step.id}`} className={styles.content}>
                {step.documents && step.documents.length > 0 && (
                  <div className={styles.docs}>
                    {step.documents.map(d => (
                      <div key={d.key} className={styles.docRow}>
                        <div>
                          <div style={{ fontWeight: 600 }}>{d.label}</div>
                          <div className={styles.muted}>{d.required ? "Required" : "Optional"}</div>
                        </div>
                        <div>
                          {d.provided ? <Badge variant="success">Provided</Badge> : <Button variant="secondary" onClick={() => onUploadDoc?.(step.id, d.key)}>Upload</Button>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className={styles.actions}>
                  {!step.completed && <Button variant="primary" onClick={() => onToggleStep?.(step.id, true)}>Mark complete</Button>}
                  {step.completed && <Button variant="ghost" onClick={() => onToggleStep?.(step.id, false)}>Mark pending</Button>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MobilizationChecklist;

