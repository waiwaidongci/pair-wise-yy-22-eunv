import { seed } from "../seed";
import type { ImageVersion } from "../models/ImageVersion";

const rows: ImageVersion[] = seed.imageVersion.map((row) => ({ ...row })) as unknown as ImageVersion[];

export const imageVersionRepository = {
  findAll: () => rows,
  findByPlanId: (planId: number) => rows.filter((row) => row.plan_id === planId),
  save: (row: unknown) => { rows.push(row as ImageVersion); return row; }
};
