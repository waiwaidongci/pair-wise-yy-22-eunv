import type { NextFunction, Request, Response } from "express";
import { imageVersionService } from "../services/ImageVersionService";

export const imageVersionController = {
  list: (_req: Request, res: Response) => res.json(imageVersionService.list()),
  create: (req: Request, res: Response, next: NextFunction) => {
    try {
      return res.status(201).json(imageVersionService.create(req.body));
    } catch (err) {
      return next(err);
    }
  },
  update: (req: Request, res: Response, next: NextFunction) => {
    try {
      return res.json(imageVersionService.update(Number(req.params.id), req.body));
    } catch (err) {
      return next(err);
    }
  }
};
