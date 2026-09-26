import { seed } from "../seed";
import type { RestorationStep } from "../models/RestorationStep";

const rows: RestorationStep[] = seed.restorationStep.map((row) => ({ ...row }));

export const restorationStepRepository = {
  findAll: () => rows,
  findById: (id: number) => rows.find((row) => row.id === id),
  findByPlanId: (planId: number) => rows.filter((row) => row.plan_id === planId),
  nextId: () => rows.reduce((max, row) => Math.max(max, row.id), 0) + 1,
  save: (row: RestorationStep) => { rows.push(row); return row; },
  update: (id: number, patch: Partial<RestorationStep>) => {
    const current = rows.find((row) => row.id === id);
    if (!current) return undefined;
    Object.assign(current, patch);
    return current;
  }
};
