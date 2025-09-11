import React from "react";
import styles from "./AssignmentCard.module.css";
import { Badge, Button } from "./index";

export type AssignmentState = "pending" | "accepted" | "declined" | "expired";

export interface AssignmentCardProps extends React.HTMLAttributes<HTMLDivElement> {
  vesselName: string;
  position: string;
  companyName: string;
  joiningDate?: string; // ISO
  location?: string;
  duration?: string;
  state: AssignmentState;
  onAccept?: () => void;
  onDecline?: () => void;
  onView?: () => void;
}

function stateBadge(state: AssignmentState) {
  switch (state) {
    case "pending": return <Badge variant="warning">Pending</Badge>;
    case "accepted": return <Badge variant="success">Accepted</Badge>;
    case "declined": return <Badge variant="danger">Declined</Badge>;
    case "expired": return <Badge variant="warning">Expired</Badge>;
  }
}

export const AssignmentCard: React.FC<AssignmentCardProps> = ({
  vesselName,
  position,
  companyName,
  joiningDate,
  location,
  duration,
  state,
  onAccept,
  onDecline,
  onView,
  className,
  ...props
}) => {
  return (
    <div className={[styles.card, className].filter(Boolean).join(" ")} {...props}>
      <div className={styles.header}>
        <div className={styles.logo} aria-hidden>⛵</div>
        <div className={styles.titles}>
          <div className={styles.vessel}>{vesselName}</div>
          <div className={styles.position}>{position}</div>
        </div>
        <div className={styles.statusWrap}>
          {stateBadge(state)}
        </div>
      </div>
      <div className={styles.body}>
        <div className={styles.details}>
          <div className={styles.pair}>
            <div className={styles.label}>Company</div>
            <div className={styles.value}>{companyName}</div>
          </div>
          <div className={styles.pair}>
            <div className={styles.label}>Joining date</div>
            <div className={styles.value}>{joiningDate ? new Date(joiningDate).toLocaleDateString() : "—"}</div>
          </div>
          <div className={styles.pair}>
            <div className={styles.label}>Location</div>
            <div className={styles.value}>{location || "—"}</div>
          </div>
          <div className={styles.pair}>
            <div className={styles.label}>Duration</div>
            <div className={styles.value}>{duration || "—"}</div>
          </div>
        </div>
        <div className={styles.actions}>
          {state === "pending" && (
            <>
              <Button variant="primary" onClick={onAccept}>Accept</Button>
              <Button variant="ghost" onClick={onDecline}>Decline</Button>
            </>
          )}
          {state !== "pending" && (
            <Button variant="secondary" onClick={onView}>View Details</Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssignmentCard;

