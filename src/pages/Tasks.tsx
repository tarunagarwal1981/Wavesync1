import React from "react";
import styles from "./Tasks.module.css";
import { Button, Input, TaskCard } from "../components/ui";
import { formatDistanceToNow } from "date-fns";

type ColumnKey = "todo" | "inprogress" | "completed";

interface TaskItem {
  id: string;
  title: string;
  description?: string;
  due?: string; // ISO
  assignment?: string;
  priority: "Low" | "Medium" | "High" | "Urgent";
  attachments?: number;
  column: ColumnKey;
}

const initialTasks: TaskItem[] = [
  { id: "1", title: "Upload Passport Copy", description: "PDF or image", due: new Date(Date.now()+2*86400e3).toISOString(), assignment: "MV Ocean Star", priority: "Medium", attachments: 0, column: "todo" },
  { id: "2", title: "Complete Induction", description: "Read and sign", due: new Date(Date.now()+5*86400e3).toISOString(), assignment: "MT Sea Crest", priority: "Low", attachments: 1, column: "inprogress" },
  { id: "3", title: "Medical Checkup", description: "Bring previous reports", due: new Date(Date.now()+1*86400e3).toISOString(), assignment: "LNG Aurora", priority: "High", attachments: 0, column: "todo" },
  { id: "4", title: "Visa Submission", description: "Upload embassy receipt", due: new Date(Date.now()-1*86400e3).toISOString(), assignment: "MV Blue Horizon", priority: "Urgent", attachments: 2, column: "completed" },
];

export const Tasks: React.FC = () => {
  const [tasks, setTasks] = React.useState<TaskItem[]>(initialTasks);
  const [query, setQuery] = React.useState("");
  const [filterAssignment, setFilterAssignment] = React.useState("all");
  const [filterPriority, setFilterPriority] = React.useState("all");
  const [filterDue, setFilterDue] = React.useState("all");

  const assignments = Array.from(new Set(tasks.map(t => t.assignment).filter(Boolean))) as string[];

  const filtered = tasks.filter(t => {
    const matchesText = `${t.title} ${t.description || ""} ${t.assignment || ""}`.toLowerCase().includes(query.toLowerCase());
    const matchesAssn = filterAssignment === "all" || t.assignment === filterAssignment;
    const matchesPriority = filterPriority === "all" || t.priority === filterPriority;
    const matchesDue = (() => {
      if (filterDue === "all" || !t.due) return true;
      const days = Math.ceil((+new Date(t.due) - Date.now()) / 86400000);
      if (filterDue === "overdue") return days < 0;
      if (filterDue === "7") return days <= 7;
      if (filterDue === "30") return days <= 30;
      return true;
    })();
    return matchesText && matchesAssn && matchesPriority && matchesDue;
  });

  function onDragStart(e: React.DragEvent, id: string) {
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
  }

  function onDropColumn(e: React.DragEvent, col: ColumnKey) {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    setTasks(prev => prev.map(t => (t.id === id ? { ...t, column: col } : t)));
  }

  function allowDrop(e: React.DragEvent) {
    e.preventDefault();
  }

  function Urgency({ due }: { due?: string }) {
    if (!due) return <span className={styles.chip}>No due</span>;
    const diff = +new Date(due) - Date.now();
    const days = Math.ceil(diff / 86400000);
    let color = "var(--gray-700)";
    if (days < 0) color = "var(--color-error)";
    else if (days <= 2) color = "var(--color-warning)";
    else if (days <= 7) color = "var(--color-success)";
    return <span className={styles.chip} style={{ color }}>{days < 0 ? "Overdue" : `Due ${formatDistanceToNow(new Date(due), { addSuffix: true })}`}</span>;
  }

  function TaskCardWrapper({ t }: { t: TaskItem }) {
    const stepsTotal = t.priority === "Urgent" ? 3 : 2;
    const stepsCompleted = t.column === "completed" ? stepsTotal : t.column === "inprogress" ? 1 : 0;
    return (
      <div draggable onDragStart={(e) => onDragStart(e, t.id)}>
        <TaskCard
          title={t.title}
          description={t.description}
          priority={t.priority}
          due={t.due}
          attachments={t.attachments}
          assigneeName={t.assignment}
          stepsCompleted={stepsCompleted}
          stepsTotal={stepsTotal}
          tags={[t.assignment || ""]}
        />
      </div>
    );
  }

  function Column({ col, title }: { col: ColumnKey; title: string }) {
    const colTasks = filtered.filter(t => t.column === col);
    const [isOver, setOver] = React.useState(false);
    return (
      <div className={styles.column} onDragOver={(e) => { allowDrop(e); setOver(true); }} onDragLeave={() => setOver(false)} onDrop={(e) => { onDropColumn(e, col); setOver(false); }}>
        <div className={styles.columnHeader}>{title} <span style={{ color: "var(--color-text-muted)">({colTasks.length})</span></div>
        <div className={[styles.columnBody, isOver ? styles.dropOver : undefined].filter(Boolean).join(" ")}>
          {colTasks.length === 0 ? <div className={styles.empty}>No tasks</div> : colTasks.map(t => <TaskCardWrapper key={t.id} t={t} />)}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <div className={styles.filters}>
          <div className={styles.search}>
            <Input placeholder="Search tasks" value={query} onChange={(e) => setQuery(e.currentTarget.value)} />
          </div>
          <select className={styles.select} value={filterAssignment} onChange={(e) => setFilterAssignment(e.currentTarget.value)}>
            <option value="all">All assignments</option>
            {assignments.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          <select className={styles.select} value={filterPriority} onChange={(e) => setFilterPriority(e.currentTarget.value)}>
            <option value="all">All priorities</option>
            {(["Low","Medium","High","Urgent"] as const).map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <select className={styles.select} value={filterDue} onChange={(e) => setFilterDue(e.currentTarget.value)}>
            <option value="all">Any due date</option>
            <option value="7">Due in 7 days</option>
            <option value="30">Due in 30 days</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
        <div>
          <Button variant="primary">Add task</Button>
        </div>
      </div>

      <div className={styles.board}>
        <Column col="todo" title="To Do" />
        <Column col="inprogress" title="In Progress" />
        <Column col="completed" title="Completed" />
      </div>
    </div>
  );
};

export default Tasks;

