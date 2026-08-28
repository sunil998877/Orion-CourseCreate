import mongoose from "mongoose";
const integerSetter = (val) => (typeof val === "number" ? Math.round(val) : val);
const WalletSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    },
    plan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Plan",
        required: true,
    },
    balance: {
        type: Number,
        min: 0,
        default: 0,
        set: integerSetter,
        validate: {
            validator: (v) => Number.isInteger(v) && v >= 0,
            message: "Balance must be a non-negative integer"
        }
    },
    reserved: {
        type: Number,
        default: 0,
        min: 0,
        set: integerSetter,
        validate: {
            validator: (v) => Number.isInteger(v) && v >= 0,
            message: "Reserved credits must be a non-negative integer"
        }
    },
    lifetimeUsed: {
        type: Number,
        default: 0,
        min: 0,
        set: integerSetter,
        validate: {
            validator: (v) => Number.isInteger(v) && v >= 0,
            message: "Lifetime used credits must be a non-negative integer"
        }
    },
    renewsOn: {
        type: Date,
        default: null
    },
}, { timestamps: true });
const Wallet = mongoose.model("Wallet", WalletSchema);
export default Wallet;
