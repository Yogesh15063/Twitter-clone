import express, { Router } from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { getNotifications, deleteNotifications } from "../controllers/notification.controller.js";

const router = new express.Router();
router.get('/',protectRoute,getNotifications);
router.delete('/',protectRoute,deleteNotifications);
 export default router;