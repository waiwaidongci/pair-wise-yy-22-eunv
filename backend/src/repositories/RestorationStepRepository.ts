import { seed } from "../seed";
import type { RestorationStep } from "../models/RestorationStep";

const rows: RestorationStep[] = seed.restorationStep.map((row) => ({ ...row })) as unknown as RestorationStep[];

export const restorationStepRepository = {
  findAll: () => rows,
  findByPlanId: (planId: number) => rows.filter((row) => row.plan_id === planId),
  save: (row: unknown) => { rows.push(row as RestorationStep); return row; }
};
