import type { NextFunction, Request, Response } from "express";
import { planArchiveService } from "../services/PlanArchiveService";

export const planArchiveController = {
  list: (req: Request, res: Response) => {
    const planId = req.query.plan_id === undefined ? undefined : Number(req.query.plan_id);
    return res.json(planArchiveService.list(planId));
  },
  get: (req: Request, res: Response, next: NextFunction) => {
    try {
      return res.json(planArchiveService.get(Number(req.params.id)));
    } catch (err) {
      return next(err);
    }
  },
  diff: (req: Request, res: Response, next: NextFunction) => {
    try {
      return res.json(planArchiveService.pendingDiff(Number(req.params.planId)));
    } catch (err) {
      return next(err);
    }
  },
  create: (req: Request, res: Response, next: NextFunction) => {
    try {
      const actor = String((req as Request & { user?: { id?: unknown } }).user?.id ?? "system");
      return res.status(201).json(planArchiveService.archive(Number(req.body.plan_id), actor));
    } catch (err) {
      return next(err);
    }
  }
};
