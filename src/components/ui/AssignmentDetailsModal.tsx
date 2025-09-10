import React from "react";
import styles from "./AssignmentDetailsModal.module.css";
import { Modal, Button, Badge } from "./index";
import { VesselType } from "../../types";

type Tab = "Vessel" | "Position" | "Contract" | "Company" | "Documents" | "Actions";

export interface DocumentRequirement {
  key: string;
  label: string;
  required: boolean;
  provided: boolean;
}

export interface AssignmentDetailsData {
  vessel: { name: string; type: VesselType; flag?: string; imo?: string };
  position: { rank: string; responsibilities?: string; salary?: string };
  contract: { duration?: string; joiningDate?: string; signOffDate?: string };
  company: { name: string; address?: string; contact?: string };
  documents: DocumentRequirement[];
}

export interface AssignmentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: AssignmentDetailsData;
  onDownloadPdf?: () => void;
  onAccept?: () => void;
  onDecline?: () => void;
}

export const AssignmentDetailsModal: React.FC<AssignmentDetailsModalProps> = ({ isOpen, onClose, data, onDownloadPdf, onAccept, onDecline }) => {
  const [tab, setTab] = React.useState<Tab>("Vessel");

  const tabs: Tab[] = ["Vessel", "Position", "Contract", "Company", "Documents", "Actions"];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Assignment Details" fullScreenOnMobile footer={
      <div className={styles.footer}>
        <Button variant="ghost" onClick={onDownloadPdf}>Download PDF</Button>
        <Button variant="secondary" onClick={onClose}>Close</Button>
      </div>
    }>
      <div className={styles.tabs} role="tablist">
        {tabs.map(t => (
          <button key={t} role="tab" aria-selected={tab === t} className={[styles.tab, tab === t ? styles.tabActive : undefined].filter(Boolean).join(" ")} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>

      {tab === "Vessel" && (
        <section className={styles.section} aria-labelledby="vessel-info">
          <div className={styles.grid}>
            <div className={styles.pair}><div className={styles.label}>Name</div><div className={styles.value}>{data.vessel.name}</div></div>
            <div className={styles.pair}><div className={styles.label}>Type</div><div className={styles.value}>{data.vessel.type}</div></div>
            <div className={styles.pair}><div className={styles.label}>Flag</div><div className={styles.value}>{data.vessel.flag || "—"}</div></div>
            <div className={styles.pair}><div className={styles.label}>IMO</div><div className={styles.value}>{data.vessel.imo || "—"}</div></div>
          </div>
        </section>
      )}

      {tab === "Position" && (
        <section className={styles.section}>
          <div className={styles.grid}>
            <div className={styles.pair}><div className={styles.label}>Rank</div><div className={styles.value}>{data.position.rank}</div></div>
            <div className={styles.pair}><div className={styles.label}>Salary</div><div className={styles.value}>{data.position.salary || "—"}</div></div>
          </div>
          <div className={styles.pair}><div className={styles.label}>Responsibilities</div><div className={styles.value}>{data.position.responsibilities || "—"}</div></div>
        </section>
      )}

      {tab === "Contract" && (
        <section className={styles.section}>
          <div className={styles.grid}>
            <div className={styles.pair}><div className={styles.label}>Duration</div><div className={styles.value}>{data.contract.duration || "—"}</div></div>
            <div className={styles.pair}><div className={styles.label}>Joining Date</div><div className={styles.value}>{data.contract.joiningDate ? new Date(data.contract.joiningDate).toLocaleDateString() : "—"}</div></div>
            <div className={styles.pair}><div className={styles.label}>Sign-off Date</div><div className={styles.value}>{data.contract.signOffDate ? new Date(data.contract.signOffDate).toLocaleDateString() : "—"}</div></div>
          </div>
        </section>
      )}

      {tab === "Company" && (
        <section className={styles.section}>
          <div className={styles.grid}>
            <div className={styles.pair}><div className={styles.label}>Name</div><div className={styles.value}>{data.company.name}</div></div>
            <div className={styles.pair}><div className={styles.label}>Contact</div><div className={styles.value}>{data.company.contact || "—"}</div></div>
          </div>
          <div className={styles.pair}><div className={styles.label}>Address</div><div className={styles.value}>{data.company.address || "—"}</div></div>
        </section>
      )}

      {tab === "Documents" && (
        <section className={styles.section}>
          <div className={styles.list}>
            {data.documents.map(doc => (
              <div key={doc.key} className={styles.docItem}>
                <div>
                  <div style={{ fontWeight: 600 }}>{doc.label}</div>
                  <div className={styles.label}>{doc.required ? "Required" : "Optional"}</div>
                </div>
                <div>
                  {doc.provided ? <Badge variant="success">Provided</Badge> : <Badge variant="warning">Missing</Badge>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {tab === "Actions" && (
        <section className={styles.section}>
          <div className={styles.footer}>
            <Button variant="primary" onClick={onAccept}>Accept</Button>
            <Button variant="ghost" onClick={onDecline}>Decline</Button>
          </div>
        </section>
      )}
    </Modal>
  );
};

export default AssignmentDetailsModal;

