import type { NextFunction, Request, Response } from "express";
import { restorationStepService } from "../services/RestorationStepService";

export const restorationStepController = {
  list: (_req: Request, res: Response) => res.json(restorationStepService.list()),
  create: (req: Request, res: Response, next: NextFunction) => {
    try {
      return res.status(201).json(restorationStepService.create(req.body));
    } catch (err) {
      return next(err);
    }
  },
  update: (req: Request, res: Response, next: NextFunction) => {
    try {
      return res.json(restorationStepService.update(Number(req.params.id), req.body));
    } catch (err) {
      return next(err);
    }
  }
};
