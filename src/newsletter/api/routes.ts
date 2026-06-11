import { Router } from 'express';
import { checkAuth } from '../../middlewares/auth';
import { subscribe, subscriptions, unsubscribe } from '../ctl/newsletter';


export const router = Router();

router.post("/:userId/subscribe", checkAuth, subscribe)
router.post("/:userId/unsubscribe", checkAuth, unsubscribe)
router.get("/:userId/subscriptions", checkAuth, subscriptions)
router.get("/subscriptions", checkAuth, subscriptions)