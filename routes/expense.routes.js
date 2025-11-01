import express from "express";
import { addExpense, getUserExpenses } from "../controllers/expense.controller.js";
import { protectRoute } from "../middleware/protectRoutes.js";

const router = express.Router();

router.post('/add', protectRoute, addExpense);
router.get('/get',protectRoute, getUserExpenses);

export default router;
