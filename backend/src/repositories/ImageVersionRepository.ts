import { seed } from "../seed";
import type { ImageVersion } from "../models/ImageVersion";

const rows: ImageVersion[] = seed.imageVersion.map((row) => ({ ...row }));

export const imageVersionRepository = {
  findAll: () => rows,
  findById: (id: number) => rows.find((row) => row.id === id),
  findByPlanId: (planId: number) => rows.filter((row) => row.plan_id === planId),
  nextId: () => rows.reduce((max, row) => Math.max(max, row.id), 0) + 1,
  save: (row: ImageVersion) => { rows.push(row); return row; },
  update: (id: number, patch: Partial<ImageVersion>) => {
    const current = rows.find((row) => row.id === id);
    if (!current) return undefined;
    Object.assign(current, patch);
    return current;
  }
};
