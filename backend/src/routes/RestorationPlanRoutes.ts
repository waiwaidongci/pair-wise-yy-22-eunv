import { Router } from "express";
import { restorationPlanController } from "../controllers/RestorationPlanController";

const router = Router();
router.get("/", restorationPlanController.list);
router.post("/", restorationPlanController.create);
router.put("/:id", restorationPlanController.update);
router.post("/:id/new-version", restorationPlanController.saveAsNewVersion);
export default router;
