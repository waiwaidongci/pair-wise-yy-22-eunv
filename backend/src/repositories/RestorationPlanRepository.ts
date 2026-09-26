import { seed } from "../seed";
import type { RestorationPlan } from "../models/RestorationPlan";

const rows: RestorationPlan[] = seed.restorationPlan.map((row) => ({ ...row }));

export const restorationPlanRepository = {
  findAll: () => rows,
  findById: (id: number) => rows.find((row) => row.id === id),
  nextId: () => rows.reduce((max, row) => Math.max(max, row.id), 0) + 1,
  save: (row: RestorationPlan) => { rows.push(row); return row; },
  update: (id: number, patch: Partial<RestorationPlan>) => {
    const current = rows.find((row) => row.id === id);
    if (!current) return undefined;
    Object.assign(current, patch);
    return current;
  }
};
