import { Router } from "express";
import { planArchiveController } from "../controllers/PlanArchiveController";

const router = Router();
router.get("/", planArchiveController.list);
router.get("/plan/:planId/diff", planArchiveController.diff);
router.get("/:id", planArchiveController.get);
router.post("/", planArchiveController.create);
export default router;
