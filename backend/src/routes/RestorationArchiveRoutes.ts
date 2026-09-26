import { Router } from "express";
import { restorationArchiveController } from "../controllers/RestorationArchiveController";

const router = Router();
router.get("/", restorationArchiveController.list);
router.get("/plan/:planId", restorationArchiveController.listByPlan);
router.get("/plan/:planId/diff", restorationArchiveController.diff);
router.get("/:id", restorationArchiveController.detail);
router.post("/", restorationArchiveController.archive);
router.post("/reopen", restorationArchiveController.reopen);
export default router;
