import type { ArchiveDiffEntry } from "../../types/ArchiveDiff";
import { ArchiveDiffKindText } from "../../constants/ArchiveDiffKind";
import { EmptyState } from "./EmptyState";

export function ArchiveDiffList({ diffs, emptyText = "暂无待复核差异，来源记录与档案一致" }: { diffs: ArchiveDiffEntry[]; emptyText?: string }) {
  if (!diffs.length) return <EmptyState title={emptyText} />;
  return <div className="table">
    {diffs.map((diff, index) => <article key={`${diff.kind}-${diff.target}-${diff.field}-${index}`} className="row diff-row">
      <strong>{ArchiveDiffKindText[diff.kind] ?? diff.kind} · {diff.target}</strong>
      <span className="hint">{diff.field}</span>
      <span>{diff.archived || "—"} → {diff.current || "—"}</span>
    </article>)}
  </div>;
}
