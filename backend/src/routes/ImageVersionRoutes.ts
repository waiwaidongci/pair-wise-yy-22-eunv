import { Router } from "express";
import { imageVersionController } from "../controllers/ImageVersionController";

const router = Router();
router.get("/", imageVersionController.list);
router.post("/", imageVersionController.create);
router.put("/:id", imageVersionController.update);
export default router;
