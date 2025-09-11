import React from "react";
import styles from "./GlobalSearch.module.css";
import { Input, Button } from "./index";
import { ClipboardList, FileText, CheckSquare, GraduationCap, Anchor } from "lucide-react";

export type SearchResultType = "assignment" | "document" | "task" | "training" | "vessel";

export interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle?: string;
  meta?: string;
  url?: string;
}

export interface GlobalSearchProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  onResultClick?: (result: SearchResult) => void;
  recentSearches?: string[];
  onRecentClick?: (query: string) => void;
  results?: SearchResult[];
  loading?: boolean;
}

function TypeIcon({ type }: { type: SearchResultType }) {
  const icon = {
    assignment: <ClipboardList size={16} />,
    document: <FileText size={16} />,
    task: <CheckSquare size={16} />,
    training: <GraduationCap size={16} />,
    vessel: <Anchor size={16} />,
  }[type];
  const className = {
    assignment: styles.iconAssignment,
    document: styles.iconDocument,
    task: styles.iconTask,
    training: styles.iconTraining,
    vessel: styles.iconVessel,
  }[type];
  return <div className={[styles.iconWrap, className].join(" ")}>{icon}</div>;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({
  placeholder = "Search assignments, documents, tasks...",
  onSearch,
  onResultClick,
  recentSearches = [],
  onRecentClick,
  results = [],
  loading = false,
}) => {
  const [query, setQuery] = React.useState("");
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(-1);
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const panelRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!panelRef.current?.contains(e.target as Node) && !inputRef.current?.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  React.useEffect(() => {
    if (query.length > 0) {
      setIsOpen(true);
      onSearch?.(query);
    } else {
      setIsOpen(false);
    }
  }, [query, onSearch]);

  function onKeyDown(e: React.KeyboardEvent) {
    if (!isOpen) return;
    
    const allItems = [...recentSearches, ...results];
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, allItems.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      if (selectedIndex < recentSearches.length) {
        const recentQuery = recentSearches[selectedIndex];
        setQuery(recentQuery);
        onRecentClick?.(recentQuery);
      } else {
        const result = results[selectedIndex - recentSearches.length];
        onResultClick?.(result);
      }
      setIsOpen(false);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  }

  const grouped = results.reduce((acc, r) => {
    if (!acc[r.type]) acc[r.type] = [];
    acc[r.type].push(r);
    return acc;
  }, {} as Record<SearchResultType, SearchResult[]>);

  const typeLabels: Record<SearchResultType, string> = {
    assignment: "Assignments",
    document: "Documents", 
    task: "Tasks",
    training: "Training",
    vessel: "Vessels",
  };

  return (
    <div className={styles.search}>
      <Input
        ref={inputRef}
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.currentTarget.value)}
        onFocus={() => setIsOpen(true)}
        onKeyDown={onKeyDown}
      />
      
      {isOpen && (
        <div className={styles.panel} ref={panelRef}>
          {query.length === 0 && recentSearches.length > 0 && (
            <div className={styles.header}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Recent searches</div>
              <div className={styles.recent}>
                {recentSearches.map((recent, i) => (
                  <div
                    key={recent}
                    className={[styles.recentItem, selectedIndex === i ? styles.selected : undefined].filter(Boolean).join(" ")}
                    onClick={() => {
                      setQuery(recent);
                      onRecentClick?.(recent);
                      setIsOpen(false);
                    }}
                  >
                    {recent}
                  </div>
                ))}
              </div>
            </div>
          )}

          {query.length > 0 && (
            <div className={styles.results}>
              {loading ? (
                <div className={styles.empty}>Searching...</div>
              ) : results.length === 0 ? (
                <div className={styles.empty}>No results found for "{query}"</div>
              ) : (
                Object.entries(grouped).map(([type, items]) => (
                  <div key={type} className={styles.group}>
                    <div className={styles.groupHeader}>{typeLabels[type as SearchResultType]} ({items.length})</div>
                    <div className={styles.groupItems}>
                      {items.map((result, i) => {
                        const globalIndex = recentSearches.length + results.indexOf(result);
                        return (
                          <div
                            key={result.id}
                            className={[styles.item, selectedIndex === globalIndex ? styles.selected : undefined].filter(Boolean).join(" ")}
                            onClick={() => {
                              onResultClick?.(result);
                              setIsOpen(false);
                            }}
                          >
                            <TypeIcon type={result.type} />
                            <div className={styles.content}>
                              <div className={styles.title}>{result.title}</div>
                              {result.subtitle && <div className={styles.subtitle}>{result.subtitle}</div>}
                              {result.meta && <div className={styles.meta}>{result.meta}</div>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {query.length > 0 && (
            <div className={styles.footer}>
              <Button variant="ghost" onClick={() => setIsOpen(false)}>Close</Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;
