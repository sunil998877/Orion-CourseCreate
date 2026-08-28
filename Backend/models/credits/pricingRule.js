import mongoose from "mongoose";
const integerSetter = (val) => (typeof val === "number" ? Math.round(val) : val);
const PricingSchema = new mongoose.Schema({
    actionKey: {
        type: String,
        required: true,
        unique: true,
    },
    displayName: {
        type: String,
        required: true,
    },
    provider: {
        type: String,
        required: true,
        enum: ['gamma', 'openai', 'elevenlabs'],
    },
    creditCost: {
        type: Number,
        required: true,
        min: 0,
        set: integerSetter,
        validate: {
            validator: (v) => Number.isInteger(v) && v >= 0,
            message: "creditCost must be a non-negative integer"
        }
    },
    costFormula: {
        type: mongoose.Schema.Types.ObjectId,
        default: null,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });
const PricingRule = mongoose.model("PricingRule", PricingSchema);
export default PricingRule;
