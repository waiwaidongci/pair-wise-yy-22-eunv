import { useEffect, useState } from "react";
import { useRestorationPlanStore } from "../stores/RestorationPlanStore";
import { useRestorationStepStore } from "../stores/RestorationStepStore";
import { useImageVersionStore } from "../stores/ImageVersionStore";
import { usePlanArchiveStore } from "../stores/PlanArchiveStore";
import { StatusBadge } from "../components/common/StatusBadge";
import { EmptyState } from "../components/common/EmptyState";
import { ArchiveDiffList } from "../components/common/ArchiveDiffList";
import { ArchiveSnapshotView } from "../components/common/ArchiveSnapshotView";
import { formatArchiveVersion, formatDate } from "../utils/formatters";
import type { RestorationPlan } from "../types/RestorationPlan";

export function PlansPage() {
  const plans = useRestorationPlanStore((state) => state.rows);
  const loadPlans = useRestorationPlanStore((state) => state.load);
  const saveAsNewVersion = useRestorationPlanStore((state) => state.saveAsNewVersion);
  const steps = useRestorationStepStore((state) => state.rows);
  const loadSteps = useRestorationStepStore((state) => state.load);
  const updateStep = useRestorationStepStore((state) => state.update);
  const images = useImageVersionStore((state) => state.rows);
  const loadImages = useImageVersionStore((state) => state.load);
  const archives = usePlanArchiveStore((state) => state.archives);
  const currentArchive = usePlanArchiveStore((state) => state.current);
  const diff = usePlanArchiveStore((state) => state.diff);
  const loadArchives = usePlanArchiveStore((state) => state.loadArchives);
  const openArchive = usePlanArchiveStore((state) => state.openArchive);
  const loadDiff = usePlanArchiveStore((state) => state.loadDiff);
  const archivePlan = usePlanArchiveStore((state) => state.archive);

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [notice, setNotice] = useState("");
  const [editingStepId, setEditingStepId] = useState<number | null>(null);
  const [editingMaterial, setEditingMaterial] = useState("");

  useEffect(() => {
    void loadPlans();
    void loadSteps();
    void loadImages();
  }, [loadPlans, loadSteps, loadImages]);

  const selected = plans.find((plan) => plan.id === selectedId) ?? null;
  const isArchived = selected?.approval_status === "ARCHIVED";
  const liveSteps = selected ? steps.filter((step) => step.plan_id === selected.id) : [];
  const liveImages = selected ? images.filter((image) => image.plan_id === selected.id) : [];

  useEffect(() => {
    if (selected && selected.approval_status === "ARCHIVED") {
      void loadArchives(selected.id);
      void loadDiff(selected.id);
    }
  }, [selected, loadArchives, loadDiff]);

  const handleArchive = async (plan: RestorationPlan) => {
    const created = await archivePlan(plan.id);
    await loadPlans();
    setSelectedId(plan.id);
    setNotice(created
      ? `已生成修复档案 ${formatArchiveVersion(created.archive_version)}，方案转入已归档；后续来源变化只列入待复核差异。`
      : "归档请求已提交。");
  };

  const handleSaveAsNewVersion = async (plan: RestorationPlan) => {
    const created = await saveAsNewVersion(plan.id);
    if (created) {
      setSelectedId(created.id);
      setNotice(`已另存为新版本方案 ${formatArchiveVersion(created.version_no)}，可继续修复；旧档案仍按版本留查。`);
    } else {
      setNotice("另存新版本请求已提交。");
    }
  };

  const handleSaveMaterial = async () => {
    if (editingStepId === null) return;
    await updateStep(editingStepId, { material_used: editingMaterial });
    setEditingStepId(null);
    if (selected) await loadDiff(selected.id);
    setNotice("来源记录已更正；已生成档案保持不变，差异已列入待复核。");
  };

  return <main className="page">
    <section className="page-head">
      <div>
        <p className="eyebrow">relic-restore</p>
        <h1>修复方案</h1>
      </div>
      <StatusBadge value={selected?.approval_status ?? "LIST"} />
    </section>
    {notice && <section className="notice">{notice}</section>}
    <section className="workbench">
      <div className="panel wide">
        <h2>方案列表</h2>
        <div className="table">
          {plans.map((plan) => <article key={plan.id} className="row plan-row">
            <strong>{plan.plan_title} <span className="hint">{formatArchiveVersion(plan.version_no)}</span></strong>
            <StatusBadge value={plan.approval_status} />
            <span className="actions">
              <button onClick={() => setSelectedId(plan.id)}>打开</button>
              {plan.approval_status === "APPROVED" && <button onClick={() => void handleArchive(plan)}>归档</button>}
              {plan.approval_status === "ARCHIVED" && <button onClick={() => void handleSaveAsNewVersion(plan)}>另存新版本</button>}
            </span>
          </article>)}
        </div>
      </div>
      <div className="panel">
        <h2>方案详情</h2>
        {!selected && <EmptyState title="请选择左侧方案查看详情" />}
        {selected && !isArchived && <>
          <p className="hint">未归档方案 · 重新打开时跟随最新来源记录</p>
          <h3>方案方法</h3>
          <p>{selected.method}</p>
          <h3>风险说明</h3>
          <p>{selected.risk_assessment}</p>
          <h3>修复步骤（{liveSteps.length}）</h3>
          {liveSteps.length === 0 && <EmptyState title="暂无步骤" />}
          <div className="table">
            {liveSteps.map((step) => <article key={step.id} className="row">
              <strong>{step.step_order} · {step.technique}</strong>
              <span>{step.material_used}</span>
              <StatusBadge value={step.step_status} />
            </article>)}
          </div>
          <h3>影像版本（{liveImages.length}）</h3>
          {liveImages.length === 0 && <EmptyState title="暂无影像" />}
          <div className="table">
            {liveImages.map((image) => <article key={image.id} className="row">
              <strong>{image.version_no} · {image.image_type}</strong>
              <span>{image.note}</span>
              <span className="hint">{formatDate(image.capture_at)}</span>
            </article>)}
          </div>
          {selected.approval_status === "APPROVED"
            ? <div className="actions"><button onClick={() => void handleArchive(selected)}>归档生成修复档案</button></div>
            : <p className="hint">方案审批通过后可归档。</p>}
        </>}
        {selected && isArchived && <>
          <p className="notice">方案已归档为只读档案；继续修复请另存新版本，旧档案按版本留查。</p>
          <h3>待复核差异（对比基准：档案 {formatArchiveVersion(diff?.archive_version ?? null)}）</h3>
          <ArchiveDiffList diffs={diff?.diffs ?? []} />
          <h3>来源记录（可补录更正）</h3>
          <p className="hint">更正来源记录不会改写已生成档案，只会形成待复核差异。</p>
          <div className="table">
            {liveSteps.map((step) => <article key={step.id} className="row">
              <strong>{step.step_order} · {step.technique}</strong>
              {editingStepId === step.id
                ? <span className="actions">
                    <input value={editingMaterial} onChange={(event) => setEditingMaterial(event.target.value)} />
                    <button onClick={() => void handleSaveMaterial()}>保存</button>
                    <button onClick={() => setEditingStepId(null)}>取消</button>
                  </span>
                : <span>{step.material_used}</span>}
              {editingStepId === step.id
                ? <span />
                : <span className="actions"><button onClick={() => { setEditingStepId(step.id); setEditingMaterial(step.material_used); }}>更正材料</button></span>}
            </article>)}
          </div>
          <h3>档案版本</h3>
          {archives.length === 0 && <EmptyState title="暂无档案" />}
          <div className="table">
            {archives.map((archive) => <article key={archive.id} className="row">
              <strong>档案 {formatArchiveVersion(archive.archive_version)}</strong>
              <span className="hint">{formatDate(archive.archived_at)}</span>
              <span className="actions"><button onClick={() => void openArchive(archive.id)}>查看档案</button></span>
            </article>)}
          </div>
          {currentArchive && <ArchiveSnapshotView archive={currentArchive} />}
          <div className="actions"><button onClick={() => void handleSaveAsNewVersion(selected)}>另存新版本继续修复</button></div>
        </>}
      </div>
    </section>
  </main>;
}
