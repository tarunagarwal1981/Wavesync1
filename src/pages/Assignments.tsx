import React from "react";
import styles from "./Assignments.module.css";
import { Card, Button, Badge, Input } from "../components/ui";
import { VesselType } from "../types";
import { format } from "date-fns";

type TabKey = "Pending" | "Active" | "Completed" | "Declined";

interface AssignmentCardData {
  id: string;
  vesselName: string;
  vesselType: VesselType;
  position: string;
  joiningDate: string; // ISO
  company: string;
  status: TabKey;
}

const MOCK: AssignmentCardData[] = [
  { id: "1", vesselName: "MV Ocean Star", vesselType: VesselType.Container, position: "Chief Officer", joiningDate: new Date().toISOString(), company: "BlueWave Shipping", status: "Pending" },
  { id: "2", vesselName: "MT Sea Crest", vesselType: VesselType.Tanker, position: "Master", joiningDate: new Date(Date.now()+7*86400e3).toISOString(), company: "MarineTrust", status: "Active" },
  { id: "3", vesselName: "MV Blue Horizon", vesselType: VesselType.BulkCarrier, position: "Second Engineer", joiningDate: new Date(Date.now()-30*86400e3).toISOString(), company: "Oceanic Lines", status: "Completed" },
  { id: "4", vesselName: "LNG Aurora", vesselType: VesselType.LNG, position: "ETO", joiningDate: new Date(Date.now()+14*86400e3).toISOString(), company: "Polar Marine", status: "Pending" },
];

export const Assignments: React.FC = () => {
  const [tab, setTab] = React.useState<TabKey>("Pending");
  const [query, setQuery] = React.useState("");
  const [sort, setSort] = React.useState("joiningDateDesc");
  const [page, setPage] = React.useState(1);
  const pageSize = 6;

  const filtered = React.useMemo(() => {
    const list = MOCK.filter(a => a.status === tab && (
      a.vesselName.toLowerCase().includes(query.toLowerCase()) ||
      a.company.toLowerCase().includes(query.toLowerCase()) ||
      a.position.toLowerCase().includes(query.toLowerCase())
    ));
    const sorted = [...list].sort((a, b) => {
      switch (sort) {
        case "joiningDateAsc": return +new Date(a.joiningDate) - +new Date(b.joiningDate);
        case "joiningDateDesc": return +new Date(b.joiningDate) - +new Date(a.joiningDate);
        case "vesselNameAsc": return a.vesselName.localeCompare(b.vesselName);
        case "vesselNameDesc": return b.vesselName.localeCompare(a.vesselName);
        default: return 0;
      }
    });
    return sorted;
  }, [tab, query, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);

  React.useEffect(() => { setPage(1); }, [tab, query, sort]);

  const tabs: TabKey[] = ["Pending", "Active", "Completed", "Declined"];

  return (
    <div className={styles.page}>
      {/* Toolbar: Tabs, Filters, Sort */}
      <div className={styles.toolbar}>
        <div className={styles.tabs} role="tablist" aria-label="Assignments filters">
          {tabs.map(t => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              className={[styles.tab, tab === t ? styles.tabActive : undefined].filter(Boolean).join(" ")}
              onClick={() => setTab(t)}
            >
              {t} {t === "Pending" && <Badge variant="primary">{MOCK.filter(a => a.status === t).length}</Badge>}
            </button>
          ))}
        </div>

        <div className={styles.filters}>
          <div className={styles.search}>
            <Input placeholder="Search vessel, company, position" value={query} onChange={e => setQuery(e.currentTarget.value)} />
          </div>
        </div>

        <div>
          <select className={styles.select} value={sort} onChange={e => setSort(e.currentTarget.value)} aria-label="Sort">
            <option value="joiningDateDesc">Joining date (newest)</option>
            <option value="joiningDateAsc">Joining date (oldest)</option>
            <option value="vesselNameAsc">Vessel name (A–Z)</option>
            <option value="vesselNameDesc">Vessel name (Z–A)</option>
          </select>
        </div>
      </div>

      {/* Grid of cards */}
      {pageItems.length === 0 ? (
        <div className={styles.empty}>No assignments in {tab.toLowerCase()}.</div>
      ) : (
        <div className={styles.grid}>
          {pageItems.map(a => (
            <Card key={a.id} header={
              <div className={styles.cardHeader}>
                <div style={{ fontWeight: 800 }}>{a.vesselName}</div>
                <Badge variant="neutral">{a.vesselType}</Badge>
              </div>
            }>
              <div className={styles.cardBody}>
                <div className={styles.row}>
                  <div className={styles.pair}>
                    <div className={styles.label}>Position</div>
                    <div className={styles.value}>{a.position}</div>
                  </div>
                  <div className={styles.pair}>
                    <div className={styles.label}>Joining</div>
                    <div className={styles.value}>{format(new Date(a.joiningDate), "dd MMM yyyy")}</div>
                  </div>
                  <div className={styles.pair}>
                    <div className={styles.label}>Company</div>
                    <div className={styles.value}>{a.company}</div>
                  </div>
                </div>

                <div className={styles.row}>
                  <div className={styles.pair}>
                    <div className={styles.label}>Status</div>
                    <div className={styles.value}>
                      {a.status === "Pending" && <Badge variant="primary">Pending</Badge>}
                      {a.status === "Active" && <Badge variant="success">Active</Badge>}
                      {a.status === "Completed" && <Badge variant="neutral">Completed</Badge>}
                      {a.status === "Declined" && <Badge variant="danger">Declined</Badge>}
                    </div>
                  </div>

                  <div className={styles.actions}>
                    {a.status === "Pending" && <Button variant="primary">Accept</Button>}
                    {a.status === "Pending" && <Button variant="ghost">Decline</Button>}
                    {a.status === "Active" && <Button variant="secondary">View Details</Button>}
                    {a.status === "Completed" && <Button variant="ghost">View Summary</Button>}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div style={{ display: "flex", gap: 8, justifyContent: "center", alignItems: "center" }}>
        <Button variant="ghost" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Previous</Button>
        <span style={{ color: "var(--color-text-muted)" }}>Page {page} of {totalPages}</span>
        <Button variant="ghost" disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Next</Button>
      </div>
    </div>
  );
};

export default Assignments;

