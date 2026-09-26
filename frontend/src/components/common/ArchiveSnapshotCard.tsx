import type { RestorationArchive } from "../../types/RestorationArchive";
import { formatArchiveNo, formatDate } from "../../utils/formatters";
import { StatusBadge } from "./StatusBadge";

// Renders the frozen archive exactly as generated; later source changes never alter this view.
export function ArchiveSnapshotCard({ archive }: { archive: RestorationArchive }) {
  return <article className="panel archive-card">
    <header className="archive-head">
      <strong>{formatArchiveNo(archive.archive_no)} · {archive.plan_title}</strong>
      <StatusBadge value={archive.approval_status} />
      <span>{formatDate(archive.archived_at)}</span>
    </header>
    <p>方案方法：{archive.method}</p>
    <p>风险说明：{archive.risk_assessment}</p>
    <h3>步骤（{archive.steps.length}）</h3>
    <div className="table">
      {archive.steps.map((step) => <div key={step.id} className="row">
        <strong>{step.step_order} · {step.technique}</strong>
        <span>{step.material_used}</span>
        <StatusBadge value={step.step_status} />
      </div>)}
    </div>
    <h3>影像版本（{archive.images.length}）</h3>
    <div className="table">
      {archive.images.map((image) => <div key={image.id} className="row">
        <strong>{image.version_no}</strong>
        <span>{image.note}</span>
        <StatusBadge value={image.image_type} />
      </div>)}
    </div>
  </article>;
}
