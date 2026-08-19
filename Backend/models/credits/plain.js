import mongoose from "mongoose";

const integerSetter = (val) => (typeof val === "number" ? Math.round(val) : val);

const PlansSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        enum: ["Free", "Pro", "Team"],
    },
    monthlyCreditAllotment: {
        type: Number,
        required: true,
        min: 0,
        set: integerSetter,
        validate: {
            validator: (v) => Number.isInteger(v) && v >= 0,
            message: "monthlyCreditAllotment must be a non-negative integer"
        }
    },
    priceInINR: {
        type: Number,
        required: true,
        min: 0,
        set: integerSetter,
        validate: {
            validator: (v) => Number.isInteger(v) && v >= 0,
            message: "priceInINR must be a non-negative integer"
        }
    },
    rolloverAllowed: {
        type: Boolean,
        default: false
    }
},
    { timestamps: true }
);

const Plan = mongoose.model("Plan", PlansSchema);
export default Plan;