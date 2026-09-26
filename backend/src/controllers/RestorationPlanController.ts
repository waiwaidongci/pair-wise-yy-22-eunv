import type { NextFunction, Request, Response } from "express";
import { restorationPlanService } from "../services/RestorationPlanService";

export const restorationPlanController = {
  list: (_req: Request, res: Response) => res.json(restorationPlanService.list()),
  create: (req: Request, res: Response, next: NextFunction) => {
    try {
      return res.status(201).json(restorationPlanService.create(req.body));
    } catch (err) {
      return next(err);
    }
  },
  update: (req: Request, res: Response, next: NextFunction) => {
    try {
      return res.json(restorationPlanService.update(Number(req.params.id), req.body));
    } catch (err) {
      return next(err);
    }
  },
  saveAsNewVersion: (req: Request, res: Response, next: NextFunction) => {
    try {
      const actor = String((req as Request & { user?: { id?: unknown } }).user?.id ?? "system");
      return res.status(201).json(restorationPlanService.saveAsNewVersion(Number(req.params.id), actor));
    } catch (err) {
      return next(err);
    }
  }
};
