import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import Plan from "../models/credits/plain.js";

const plans = [
    {
        name: "Free",
        monthlyCreditAllotment: 1000,
        priceInINR: 0,
        rolloverAllowed: false,
    },
    {
        name: "Pro",
        monthlyCreditAllotment: 5000,
        priceInINR: 499,
        rolloverAllowed: true,
    },
    {
        name: "Team",
        monthlyCreditAllotment: 15000,
        priceInINR: 1499,
        rolloverAllowed: true,
    },
];

const seedPlans = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) {
            throw new Error("MONGODB_URI is not defined in environment variables");
        }

        await mongoose.connect(mongoUri);
        console.log("Connected to MongoDB");

        for (const p of plans) {
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
