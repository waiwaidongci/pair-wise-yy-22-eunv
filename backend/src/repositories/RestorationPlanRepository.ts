import { seed } from "../seed";
import type { RestorationPlan } from "../models/RestorationPlan";

const rows: RestorationPlan[] = seed.restorationPlan.map((row) => ({ ...row })) as unknown as RestorationPlan[];

export const restorationPlanRepository = {
  findAll: () => rows,
  findById: (id: number) => rows.find((row) => row.id === id),
  save: (row: unknown) => { rows.push(row as RestorationPlan); return row; },
  update: (id: number, patch: Partial<RestorationPlan>) => {
    const row = rows.find((item) => item.id === id);
    if (row) Object.assign(row, patch);
    return row;
  }
};
