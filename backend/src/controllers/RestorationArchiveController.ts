import type { NextFunction, Request, Response } from "express";
import { restorationArchiveService } from "../services/RestorationArchiveService";

const actorOf = (req: Request) => Number((req as any).user?.id ?? 1);

export const restorationArchiveController = {
  list: (_req: Request, res: Response) => res.json(restorationArchiveService.list()),
  listByPlan: (req: Request, res: Response) => res.json(restorationArchiveService.listByPlan(Number(req.params.planId))),
  detail: (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json(restorationArchiveService.get(Number(req.params.id)));
    } catch (err) {
      next(err);
    }
  },
  diff: (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json(restorationArchiveService.diff(Number(req.params.planId)));
    } catch (err) {
      next(err);
    }
  },
  archive: (req: Request, res: Response, next: NextFunction) => {
    try {
      res.status(201).json(restorationArchiveService.archive(Number(req.body?.plan_id), actorOf(req)));
    } catch (err) {
      next(err);
    }
  },
  reopen: (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json(restorationArchiveService.reopen(Number(req.body?.plan_id), actorOf(req)));
    } catch (err) {
      next(err);
    }
  }
};
