import { restorationStepRepository } from "../repositories/RestorationStepRepository";
import { restorationPlanRepository } from "../repositories/RestorationPlanRepository";
import { ERROR_CODES } from "../constants/errorCodes";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import { toAuditTarget } from "../utils/formatters";
import type { RestorationStep } from "../models/RestorationStep";

const httpError = (status: number, code: keyof typeof ERROR_CODES) => Object.assign(new Error(ERROR_MESSAGES[code]), { status, code: ERROR_CODES[code] });

export const restorationStepService = {
  list: () => restorationStepRepository.findAll(),
  // 已归档方案不能新增步骤（属于继续修复），需另存新版本。
  create: (row: Partial<RestorationStep>) => {
    const plan = restorationPlanRepository.findById(Number(row.plan_id));
    if (plan && plan.approval_status === "ARCHIVED") throw httpError(409, "PLAN_ARCHIVED");
    const step = { ...row, id: row.id ?? restorationStepRepository.nextId() } as RestorationStep;
    console.info(LOG_TEMPLATES.RestorationStep[0], toAuditTarget("RestorationStep", step.id));
    return restorationStepRepository.save(step);
  },
  // 来源记录的补录更正始终允许；已归档方案会因此产生待复核差异，但档案内容不变。
  update: (id: number, patch: Partial<RestorationStep>) => {
    const step = restorationStepRepository.findById(id);
    if (!step) throw httpError(404, "STEP_NOT_FOUND");
    console.info(LOG_TEMPLATES.RestorationStep[1], toAuditTarget("RestorationStep", id));
    return restorationStepRepository.update(id, patch);
  }
};
