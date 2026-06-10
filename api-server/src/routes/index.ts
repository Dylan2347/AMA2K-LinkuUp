import { Router, type IRouter } from "express";
import healthRouter from "./health";
import profilesRouter from "./profiles";
import discoverRouter from "./discover";
import swipesRouter from "./swipes";
import matchesRouter from "./matches";
import messagesRouter from "./messages";
import eventsRouter from "./events";
import likesRouter from "./likes";
import { requireAuth } from "../middleware/auth";

const router: IRouter = Router();

// Public
router.use(healthRouter);

// SSE events — auth handled internally via query param (EventSource can't set headers)
router.use(eventsRouter);

// All other routes require a valid Supabase session
router.use(requireAuth);
router.use(likesRouter);
router.use(profilesRouter);
router.use(discoverRouter);
router.use(swipesRouter);
router.use(matchesRouter);
router.use(messagesRouter);

export default router;
