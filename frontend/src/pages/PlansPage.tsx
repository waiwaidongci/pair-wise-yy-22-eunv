import { useEffect, useState } from "react";
import { useRestorationPlanStore } from "../stores/RestorationPlanStore";
import { useRestorationArchiveStore } from "../stores/RestorationArchiveStore";
import { usePlanApproval } from "../hooks/usePlanApproval";
import { StatusBadge } from "../components/common/StatusBadge";
import { StatCard } from "../components/common/StatCard";
import { EmptyState } from "../components/common/EmptyState";
import { ArchiveDiffList } from "../components/common/ArchiveDiffList";
import { ArchiveSnapshotCard } from "../components/common/ArchiveSnapshotCard";
import { formatArchiveNo } from "../utils/formatters";

export function PlansPage() {
  const { rows: plans, load: loadPlans } = useRestorationPlanStore();
  const { versions, diffs, error, loadPlan, archive, reopen } = useRestorationArchiveStore();
  const { page, setPage, pageSize, pageRows, total } = usePlanApproval(plans);
  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => { void loadPlans(); }, [loadPlans]);
  useEffect(() => { plans.forEach((plan) => { void loadPlan(plan.id); }); }, [plans, loadPlan]);

  const archivedCount = plans.filter((plan) => plan.approval_status === "ARCHIVED").length;
  const pendingDiffCount = Object.values(diffs).reduce((sum, entries) => sum + entries.length, 0);
  const selectedPlan = plans.find((plan) => plan.id === selected) ?? null;
  const selectedVersions = selected ? versions[selected] ?? [] : [];
  const selectedDiffs = selected ? diffs[selected] ?? [] : [];

  const onArchive = async (planId: number) => { await archive(planId); await loadPlans(); };
  const onReopen = async (planId: number) => { await reopen(planId); await loadPlans(); };

  return <main className="page">
    <section className="page-head">
      <div>
        <p className="eyebrow">relic-restore</p>
        <h1>修复方案</h1>
      </div>
      <StatusBadge value={error ? "ERROR" : "READY"} />
    </section>
    {error ? <p className="error-banner">{error}</p> : null}
    <section className="metrics">
      <StatCard label="方案总数" value={total} />
      <StatCard label="已归档" value={archivedCount} />
      <StatCard label="待复核差异" value={pendingDiffCount} />
    </section>
    <section className="workbench">
      <div className="panel wide">
        <h2>方案列表</h2>
        <div className="table">
          {pageRows.map((plan) => {
            const planVersions = versions[plan.id] ?? [];
            const latest = planVersions[0];
            const isArchived = plan.approval_status === "ARCHIVED";
            return <article key={plan.id} className="row">
              <strong>{plan.plan_title}</strong>
              <StatusBadge value={plan.approval_status} />
              <span>{isArchived && latest ? `已归档 ${formatArchiveNo(latest.archive_no)}` : "未归档 · 跟随最新来源"}</span>
              <button onClick={() => setSelected(plan.id)}>详情</button>
              {isArchived
                ? <button onClick={() => void onReopen(plan.id)}>另存新版本</button>
                : <button onClick={() => void onArchive(plan.id)}>归档</button>}
            </article>;
          })}
        </div>
        <p>
          第 {page} 页 / 共 {Math.max(1, Math.ceil(total / pageSize))} 页
          <button disabled={page <= 1} onClick={() => setPage(page - 1)}>上一页</button>
          <button disabled={page * pageSize >= total} onClick={() => setPage(page + 1)}>下一页</button>
        </p>
      </div>
      <div className="panel">
        <h2>待复核差异</h2>
        {selectedPlan ? <ArchiveDiffList entries={selectedDiffs} /> : <EmptyState title="请选择方案" />}
      </div>
    </section>
    {selectedPlan ? <section className="panel wide">
      <h2>档案版本 · {selectedPlan.plan_title}（按版本留查）</h2>
      {selectedVersions.length
        ? selectedVersions.map((version) => <ArchiveSnapshotCard key={version.id} archive={version} />)
        : <EmptyState title="尚未归档，重新打开时继续跟随最新来源" />}
    </section> : null}
  </main>;
}
