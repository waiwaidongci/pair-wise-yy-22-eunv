import type { PlanArchiveView } from "../../types/PlanArchive";
import { StatusBadge } from "./StatusBadge";
import { formatArchiveVersion, formatDate } from "../../utils/formatters";

// 修复档案为生成当时的完整快照：方案方法、风险说明、全部步骤和对应影像版本，之后只读。
export function ArchiveSnapshotView({ archive }: { archive: PlanArchiveView }) {
  return <div className="snapshot">
    <p className="hint">档案 {formatArchiveVersion(archive.archive_version)} · 归档人 {archive.archived_by} · 归档时间 {formatDate(archive.archived_at)}</p>
    <h3>方案方法</h3>
    <p>{archive.method}</p>
    <h3>风险说明</h3>
    <p>{archive.risk_assessment}</p>
    <h3>修复步骤（{archive.steps.length}）</h3>
    <div className="table">
      {archive.steps.map((step) => <article key={step.id} className="row">
        <strong>{step.step_order} · {step.technique}</strong>
        <span>{step.material_used}</span>
        <StatusBadge value={step.step_status} />
      </article>)}
    </div>
    <h3>影像版本（{archive.images.length}）</h3>
    <div className="table">
      {archive.images.map((image) => <article key={image.id} className="row">
        <strong>{image.version_no} · {image.image_type}</strong>
        <span>{image.note}</span>
        <span className="hint">{formatDate(image.capture_at)}</span>
      </article>)}
    </div>
    <p className="hint">档案内容按生成时保存，来源记录后续补录或更正不会改写本档案。</p>
  </div>;
}
