import { imageVersionRepository } from "../repositories/ImageVersionRepository";
import { restorationPlanRepository } from "../repositories/RestorationPlanRepository";
import { ERROR_CODES } from "../constants/errorCodes";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import { toAuditTarget } from "../utils/formatters";
import type { ImageVersion } from "../models/ImageVersion";

const httpError = (status: number, code: keyof typeof ERROR_CODES) => Object.assign(new Error(ERROR_MESSAGES[code]), { status, code: ERROR_CODES[code] });

export const imageVersionService = {
  list: () => imageVersionRepository.findAll(),
  // 已归档方案不能新增影像版本（属于继续修复），需另存新版本。
  create: (row: Partial<ImageVersion>) => {
    const plan = restorationPlanRepository.findById(Number(row.plan_id));
    if (plan && plan.approval_status === "ARCHIVED") throw httpError(409, "PLAN_ARCHIVED");
    const image = { ...row, id: row.id ?? imageVersionRepository.nextId() } as ImageVersion;
    console.info(LOG_TEMPLATES.ImageVersion[0], toAuditTarget("ImageVersion", image.id));
    return imageVersionRepository.save(image);
  },
  // 来源记录的补录更正始终允许；已归档方案会因此产生待复核差异，但档案内容不变。
  update: (id: number, patch: Partial<ImageVersion>) => {
    const image = imageVersionRepository.findById(id);
    if (!image) throw httpError(404, "IMAGE_NOT_FOUND");
    console.info(LOG_TEMPLATES.ImageVersion[1], toAuditTarget("ImageVersion", id));
    return imageVersionRepository.update(id, patch);
  }
};
