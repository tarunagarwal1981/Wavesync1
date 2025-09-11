import React from "react";
import styles from "./CourseCard.module.css";
import { Button, Badge } from "./index";

export interface CourseCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  provider: string;
  duration: string;
  difficulty?: "Beginner" | "Intermediate" | "Advanced";
  thumbnailUrl?: string;
  progress?: number; // 0..100
  completed?: boolean;
  hasCertificate?: boolean;
  prerequisites?: string[];
  onEnroll?: () => void;
  onContinue?: () => void;
  onViewCertificate?: () => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  title,
  provider,
  duration,
  difficulty = "Beginner",
  thumbnailUrl,
  progress,
  completed,
  hasCertificate,
  prerequisites = [],
  onEnroll,
  onContinue,
  onViewCertificate,
  className,
  ...props
}) => {
  const pct = Math.min(100, Math.max(0, progress ?? 0));
  return (
    <div className={[styles.card, className].filter(Boolean).join(" ")} {...props}>
      <div className={styles.thumb} aria-hidden>
        {thumbnailUrl ? <img src={thumbnailUrl} alt="course" /> : <span>🎓</span>}
      </div>
      <div className={styles.content}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center" }}>
          <div>
            <div className={styles.title}>{title}</div>
            <div className={styles.provider}>{provider}</div>
          </div>
          <div className={styles.actions}>
            {completed ? (
              hasCertificate && <Button variant="secondary" onClick={onViewCertificate}>View Certificate</Button>
            ) : pct > 0 ? (
              <Button variant="primary" onClick={onContinue}>Continue</Button>
            ) : (
              <Button variant="primary" onClick={onEnroll}>Enroll</Button>
            )}
          </div>
        </div>

        <div className={styles.meta}>
          <span>Duration: {duration}</span>
          <span>Level: {difficulty}</span>
          {completed ? <Badge variant="success">Completed</Badge> : pct > 0 ? <Badge variant="info">In progress</Badge> : null}
          {hasCertificate && completed && <Badge variant="success">Certificate</Badge>}
        </div>

        {pct > 0 && (
          <div className={styles.progress} aria-label="Progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
            <div className={styles.bar} style={{ width: `${pct}%` }} />
          </div>
        )}

        {prerequisites.length > 0 && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span className={styles.prereq}>Prerequisites: {prerequisites.join(", ")}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseCard;

