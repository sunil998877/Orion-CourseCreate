import crypto from "crypto";
import Razorpay from "razorpay";

export const getRazorpayClient = () => {
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_id || !key_secret) {
        throw new Error("Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.");
    }
    return new Razorpay({ key_id, key_secret });
};

export const validateRazorpayPayment = ({ razorpayOrderId, razorpayPaymentId }) => {
    const secret = process.env.RAZORPAY_KEY_SECRET;
    return crypto
        .createHmac("sha256", secret || "")
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest("hex");
};

export const verifySignature = (orderId, paymentId, signature) => {
    const secret = process.env.RAZORPAY_KEY_SECRET;
    const expected = crypto
        .createHmac("sha256", secret || "")
        .update(`${orderId}|${paymentId}`)
        .digest("hex");
    return expected === signature;
};

export default {
    getRazorpayClient,
    validateRazorpayPayment,
    verifySignature,
};
