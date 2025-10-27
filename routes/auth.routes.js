import express from "express";
import {signup, login, getUserProfile, fetchFriends} from '../controllers/auth.controller.js';


const router = express.Router();

router.post("/signup",signup);
router.post("/login",login);
//router.get("/getUser",protectRoute,getUserProfile);
router.get("/",fetchFriends);

export default router;