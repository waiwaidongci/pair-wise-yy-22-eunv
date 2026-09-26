import { restorationPlanRepository } from "../repositories/RestorationPlanRepository";
import { restorationStepRepository } from "../repositories/RestorationStepRepository";
import { ERROR_CODES } from "../constants/errorCodes";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import { createRestorationPlanDto } from "../constructors/RestorationPlanDtoFactory";
import { toAuditTarget } from "../utils/formatters";
import type { RestorationPlan } from "../models/RestorationPlan";

const httpError = (status: number, code: keyof typeof ERROR_CODES) => Object.assign(new Error(ERROR_MESSAGES[code]), { status, code: ERROR_CODES[code] });

export const restorationPlanService = {
  list: () => restorationPlanRepository.findAll(),
  create: (row: Partial<RestorationPlan>) => {
    const plan = createRestorationPlanDto({ version_no: 1, origin_plan_id: null, ...row, id: restorationPlanRepository.nextId() });
    console.info(LOG_TEMPLATES.RestorationPlan[0], toAuditTarget("RestorationPlan", plan.id));
    return restorationPlanRepository.save(plan);
  },
  // 已归档方案为只读档案，方案内容变更必须另存新版本。
  update: (id: number, patch: Partial<RestorationPlan>) => {
    const plan = restorationPlanRepository.findById(id);
    if (!plan) throw httpError(404, "PLAN_NOT_FOUND");
    if (plan.approval_status === "ARCHIVED") throw httpError(409, "PLAN_ARCHIVED");
    console.info(LOG_TEMPLATES.RestorationPlan[1], toAuditTarget("RestorationPlan", id));
    return restorationPlanRepository.update(id, patch);
  },
  // 另存新版本：基于当前来源记录生成可继续修复的新版本方案，旧方案与旧档案按版本留查。
  saveAsNewVersion: (planId: number, actor: string) => {
    const plan = restorationPlanRepository.findById(planId);
    if (!plan) throw httpError(404, "PLAN_NOT_FOUND");
    if (plan.approval_status !== "ARCHIVED") throw httpError(409, "PLAN_NOT_ARCHIVED");
    const newPlan = createRestorationPlanDto({
      relic_id: plan.relic_id,
      damage_record_id: plan.damage_record_id,
      plan_title: plan.plan_title,
      method: plan.method,
      risk_assessment: plan.risk_assessment,
      approval_status: "DRAFT",
      owner_id: plan.owner_id,
      id: restorationPlanRepository.nextId(),
      version_no: plan.version_no + 1,
      origin_plan_id: plan.origin_plan_id ?? plan.id
    });
    restorationPlanRepository.save(newPlan);
    restorationStepRepository.findByPlanId(planId).forEach((step) => {
      restorationStepRepository.save({ ...step, id: restorationStepRepository.nextId(), plan_id: newPlan.id });
    });
    console.info(LOG_TEMPLATES.RestorationPlan[4], toAuditTarget("RestorationPlan", newPlan.id), actor);
    return newPlan;
  }
};
