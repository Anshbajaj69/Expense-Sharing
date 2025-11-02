import express from "express";
import { addExpense, getBalanceSheet, getUserExpenses, generateBalanceSheet } from "../controllers/expense.controller.js";
import { protectRoute } from "../middleware/protectRoutes.js";

const router = express.Router();

router.post('/add', protectRoute, addExpense);
router.get('/get',protectRoute, getUserExpenses);
router.get('/balance-sheet',protectRoute,getBalanceSheet);
router.get('/generate-balance-sheet', protectRoute, generateBalanceSheet);

export default router;
