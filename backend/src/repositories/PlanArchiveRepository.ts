import { seed } from "../seed";
import type { PlanArchive } from "../models/PlanArchive";

const rows: PlanArchive[] = seed.planArchive.map((row) => ({ ...row }));

export const planArchiveRepository = {
  findAll: () => rows,
  findById: (id: number) => rows.find((row) => row.id === id),
  findByPlanId: (planId: number) => rows.filter((row) => row.plan_id === planId),
  nextId: () => rows.reduce((max, row) => Math.max(max, row.id), 0) + 1,
  save: (row: PlanArchive) => { rows.push(row); return row; }
};
