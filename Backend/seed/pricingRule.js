import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();


import PricingRule from "../models/credits/pricingRule.js";

const pricingRules = [
    {
        actionKey: "course_generation_gamma",
        displayName: "Generate Course",
        provider: "gamma",
        creditCost: 250,
    },
    {
        actionKey: "course_outline_openai",
        displayName: "Generate Course Outline",
        provider: "openai",
        creditCost: 10,
    },
    {
        actionKey: "workbook_openai",
        displayName: "Generate Workbook",
        provider: "openai",
        creditCost: 20,
    },
    {
        actionKey: "quiz_openai",
        displayName: "Generate Quiz",
        provider: "openai",
        creditCost: 8,
    },
    {
        actionKey: "podcast_elevenlabs",
        displayName: "Generate Podcast",
        provider: "elevenlabs",
        creditCost: 15,
    },
    {
        actionKey: "rewrite_openai",
        displayName: "Rewrite Content",
        provider: "openai",
        creditCost: 5,
    },
];

const seedPricingRules = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) {
            throw new Error("MONGODB_URI is not defined in environment variables");
        }

        await mongoose.connect(mongoUri);
        console.log("Connected to MongoDB");

        await PricingRule.deleteMany({});
        await PricingRule.insertMany(pricingRules);

        console.log("Pricing rules seeded successfully");
    } catch (error) {
        console.error("Pricing rules seed failed:", error);
    } finally {
        await mongoose.disconnect();
        console.log("MongoDB connection closed");
        process.exit(0);
    }
};

seedPricingRules();