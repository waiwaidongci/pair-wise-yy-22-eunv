import type { ArchiveDiffEntry } from "../../types/RestorationArchive";
import { formatDiffScope } from "../../utils/formatters";
import { EmptyState } from "./EmptyState";

export function ArchiveDiffList({ entries }: { entries: ArchiveDiffEntry[] }) {
  if (!entries.length) return <EmptyState title="暂无待复核差异" />;
  return <div className="table">
    {entries.map((entry, index) => <article key={`${entry.scope}-${entry.target_id}-${entry.field}-${index}`} className="row">
      <strong>{formatDiffScope(entry.scope)} · {entry.field}</strong>
      <span>归档时：{entry.archived_value || "（空）"} → 当前：{entry.current_value || "（已移除）"}</span>
    </article>)}
  </div>;
}
