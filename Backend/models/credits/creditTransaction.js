import mongoose from "mongoose";

const integerSetter = (val) => (typeof val === "number" ? Math.round(val) : val);

const CreditTransactionSchema = new mongoose.Schema({
    wallet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Wallet",
        required: true,
        index: true,
    },
    type: {
        type: String,
        required: true,
        enum: [
            "RESERVE",
            "RECONCILE",
            "REFUND",
            "RECHARGE",
            "PLAN_RESET",
            "ADJUSTMENT",
        ],
        index: true,
    },
    status: {
        type: String,
        enum: [
            "PENDING",      // For active reservations awaiting reconciliation or release
            "RECONCILED",   // Reservation successfully fulfilled
            "RELEASED",     // Reservation released/refunded
            "EXPIRED",      // Stale reservation voided by cleanup job
            "COMPLETED"     // For instant transactions like RECHARGE, PLAN_RESET, ADJUSTMENT
        ],
        default: function () {
            return this.type === "RESERVE" ? "PENDING" : "COMPLETED";
        },
        index: true,
    },
    amount: {
        type: Number,
        required: true,
        set: integerSetter,
        validate: {
            validator: (v) => Number.isInteger(v),
            message: "Amount must be an integer (no floats allowed)"
        }
    },
    action: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PricingRule",
        default: null,
    },
    referenceId: {
        type: String,
        default: null,
        index: true,
    },
    approvedBy: {
        type: String,
        default: null, // User ID or Email of support agent who approved an ADJUSTMENT
    },
    reason: {
        type: String,
        default: null, // Reason for ADJUSTMENT or failure/refund
    },
    providerUsageMeta: {
        type: mongoose.Schema.Types.Mixed,
        default: null,
    }
}, { timestamps: true });

CreditTransactionSchema.index({ type: 1, status: 1, createdAt: 1 });
CreditTransactionSchema.index({ createdAt: -1 });
CreditTransactionSchema.index({ wallet: 1, type: 1, status: 1 });

const CreditTransaction = mongoose.model("CreditTransaction", CreditTransactionSchema);
export default CreditTransaction;