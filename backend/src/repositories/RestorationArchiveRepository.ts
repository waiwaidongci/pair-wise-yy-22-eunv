import { seed } from "../seed";
import type { RestorationArchive } from "../models/RestorationArchive";

const rows: RestorationArchive[] = seed.restorationArchive.map((row) => ({ ...row, steps: row.steps.map((step) => ({ ...step })), images: row.images.map((image) => ({ ...image })) })) as unknown as RestorationArchive[];

export const restorationArchiveRepository = {
  findAll: () => rows,
  findById: (id: number) => rows.find((row) => row.id === id),
  findByPlanId: (planId: number) => rows.filter((row) => row.plan_id === planId).sort((a, b) => b.archive_no - a.archive_no),
  nextId: () => rows.reduce((max, row) => Math.max(max, row.id), 0) + 1,
  nextArchiveNo: (planId: number) => rows.filter((row) => row.plan_id === planId).reduce((max, row) => Math.max(max, row.archive_no), 0) + 1,
  save: (row: RestorationArchive) => { rows.push(row); return row; }
};
