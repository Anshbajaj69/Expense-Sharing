import mongoose from "mongoose";
import Expense from "../models/expense.model.js";
import User from "../models/user.model.js";

export const addExpense = async (req, res) => {
    try {
        const { description, amount, participants, splitMethod, exactAmounts, percentages } = req.body;
        const userId = req.user._id;

        // Basic input validation
        if (!description || !amount || !participants || !splitMethod) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (amount <= 0) {
            return res.status(400).json({ message: "Amount must be greater than 0" });
        }

        if (!Array.isArray(participants) || participants.length === 0) {
            return res.status(400).json({ message: "At least one participant is required" });
        }

        // Validate MongoDB ObjectIds
        const invalidIds = participants.filter(id => !mongoose.Types.ObjectId.isValid(id));
        if (invalidIds.length > 0) {
            return res.status(400).json({ message: "Invalid participant IDs" });
        }

        // Check if all participants exist
        const existingUsers = await User.find({ _id: { $in: participants } });
        if (existingUsers.length !== participants.length) {
            return res.status(400).json({ message: "One or more participants do not exist" });
        }

        // Ensure creator is part of the participants
        if (!participants.includes(userId.toString())) {
            return res.status(400).json({ message: "Expense creator must be included in participants" });
        }

        let expenseData = {
            userId,
            description,
            amount,
            participants,
            splitMethod,
        };

        // ---- Exact Split ----
        if (splitMethod === "exact") {
            if (!exactAmounts || !Array.isArray(exactAmounts) || exactAmounts.length === 0) {
                return res.status(400).json({ message: "Exact amounts are required for exact split" });
            }

            if (exactAmounts.length !== participants.length) {
                return res.status(400).json({ message: "Exact amounts must be provided for all participants" });
            }

            // Ensure all participants are covered
            const exactAmountUserIds = exactAmounts.map(entry => entry.userId.toString());
            const allParticipantsCovered = participants.every(p => exactAmountUserIds.includes(p.toString()));
            if (!allParticipantsCovered) {
                return res.status(400).json({ message: "Exact amounts must include all participants" });
            }

            // Validate total = amount (with small rounding tolerance)
            const totalExactAmount = exactAmounts.reduce((sum, entry) => sum + parseFloat(entry.amount), 0);
            if (Math.abs(totalExactAmount - amount) > 0.01) {
                return res.status(400).json({
                    message: `Exact amounts (${totalExactAmount.toFixed(2)}) do not sum up to total (${amount})`
                });
            }

            expenseData.exactAmounts = exactAmounts;
        }

        // ---- Percentage Split ----
         else if (splitMethod === 'percentage') {
    if (!percentages || !Array.isArray(percentages) || percentages.length === 0) {
        return res.status(400).json({ message: "Percentages are required for percentage split method" });
    }

    // Ensure each participant has a corresponding percentage
    if (percentages.length !== participants.length) {
        return res.status(400).json({ message: "Percentages must be provided for all participants" });
    }

    const percentageUserIds = percentages.map(entry => entry.userId.toString());
    const allParticipantsCovered = participants.every(p => percentageUserIds.includes(p.toString()));
    if (!allParticipantsCovered) {
        return res.status(400).json({ message: "Percentages must include all participants" });
    }

    // Validate total = 100%
    const totalPercentage = percentages.reduce((sum, entry) => sum + parseFloat(entry.percentage), 0);
    if (Math.abs(totalPercentage - 100) > 0.01) {
        return res.status(400).json({ 
            message: `Percentages (${totalPercentage.toFixed(2)}%) do not add up to 100%` 
        });
    }

    //  Compute amount for each participant
    const computedPercentages = percentages.map(entry => ({
        userId: entry.userId,
        percentage: parseFloat(entry.percentage),
        amount: parseFloat(((amount * entry.percentage) / 100).toFixed(2))
    }));

    // Add to expenseData
    expenseData.percentages = computedPercentages;
}


        // ---- Equal Split ----
        else if (splitMethod === "equal") {
            const equalShare = parseFloat((amount / participants.length).toFixed(2));
            expenseData.exactAmounts = participants.map(participantId => ({
                userId: participantId,
                amount: equalShare,
            }));

            // Adjust any rounding difference to the first participant
            const totalAssigned = equalShare * participants.length;
            const difference = amount - totalAssigned;
            if (Math.abs(difference) > 0.01) {
                expenseData.exactAmounts[0].amount += difference;
            }
        }

        else {
            return res.status(400).json({ message: "Invalid split method" });
        }

        // Save expense
        const newExpense = new Expense(expenseData);
        await newExpense.save();

        // Populate user and participant details for response
        await newExpense.populate("userId", "username email");
        await newExpense.populate("participants", "username email");
        res.setHeader("Content-Type", "application/json");
        return res.status(201).json({
            message: "Expense added successfully",
            expense: newExpense,
        });

    } catch (error) {
        console.error("Error in addExpense:", error);

        if (error.name === "ValidationError") {
            return res.status(400).json({
                message: "Validation error",
                errors: Object.values(error.errors).map(e => e.message),
            });
        }

        return res.status(500).json({ message: "Error adding expense" });
    }
};



export const getUserExpenses = async (req, res) => {
    try {
        const userId = req.user._id;

        // Find expenses where user is either the creator OR a participant
        const expenses = await Expense.find({
            $or: [
                { userId: userId },
                { participants: userId }
            ]
        })
        .populate('userId', 'username email')
        .populate('participants', 'username email')
        .populate('exactAmounts.userId', 'username email')
        .populate('percentages.userId', 'username email')
        .sort({ createdAt: -1 }); // Most recent first

        return res.status(200).json({ 
            message: "Expenses fetched successfully",
            count: expenses.length,
            expenses 
        });

    } catch (error) {
        console.error("Error in getUserExpenses:", error);
        return res.status(500).json({ message: "Error fetching expenses" });
    }
};
