import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from 'cors';

import authRoutes from "./routes/auth.routes.js";
import expenseRoutes from "./routes/expense.routes.js"
import connectMongoDB from "./db/connectMongoDb.js";

dotenv.config();


const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());
app.use(cors({
    origin: '*',    // or specify your frontend URL
}));

app.use('/api/auth', authRoutes);
app.use('/api/expense', expenseRoutes);

app.listen(PORT, () => {
    console.log(`app is listening to the PORT ${PORT}`);
    connectMongoDB();
})