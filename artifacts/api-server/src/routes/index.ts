import { Router, type IRouter } from "express";
import healthRouter from "./health";
import adminAuthRouter from "./admin-auth";
import enquiriesRouter from "./enquiries";
import contentRouter from "./content";
import workRouter from "./work";

const router: IRouter = Router();

router.use(healthRouter);
router.use(adminAuthRouter);
router.use(enquiriesRouter);
router.use(contentRouter);
router.use(workRouter);

export default router;
