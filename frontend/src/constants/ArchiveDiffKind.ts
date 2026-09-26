export const ArchiveDiffKind = ["PLAN_FIELD","STEP_ADDED","STEP_CHANGED","STEP_REMOVED","IMAGE_ADDED","IMAGE_CHANGED","IMAGE_REMOVED"] as const;
export type ArchiveDiffKind = (typeof ArchiveDiffKind)[number];
export const ArchiveDiffKindText: Record<ArchiveDiffKind, string> = {
  PLAN_FIELD: "方案字段",
  STEP_ADDED: "步骤补录",
  STEP_CHANGED: "步骤更正",
  STEP_REMOVED: "步骤移除",
  IMAGE_ADDED: "影像补录",
  IMAGE_CHANGED: "影像更正",
  IMAGE_REMOVED: "影像移除"
};
