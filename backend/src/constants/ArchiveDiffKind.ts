export const ArchiveDiffKind = ["PLAN_FIELD","STEP_ADDED","STEP_CHANGED","STEP_REMOVED","IMAGE_ADDED","IMAGE_CHANGED","IMAGE_REMOVED"] as const;
export type ArchiveDiffKind = (typeof ArchiveDiffKind)[number];
