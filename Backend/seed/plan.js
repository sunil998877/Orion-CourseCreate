import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import Plan from "../models/credits/plain.js";
import { DEFAULT_CREDIT_PLANS } from "../config/creditPlans.js";

const seedPlans = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) {
            throw new Error("MONGODB_URI is not defined in environment variables");
        }

        await mongoose.connect(mongoUri);
        console.log("Connected to MongoDB");

        for (const p of DEFAULT_CREDIT_PLANS) {
            await Plan.findOneAndUpdate(
                { name: p.name },
                { $set: p },
                { upsert: true, new: true }
            );
        }

        console.log("Plans seeded successfully");
    } catch (error) {
        console.error("Plans seed failed:", error);
    } finally {
        await mongoose.disconnect();
        console.log("MongoDB connection closed");
        process.exit(0);
    }
};

seedPlans();
