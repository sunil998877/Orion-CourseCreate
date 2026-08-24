export const getRazorpayConfig = async (req, res) => {
    try {
        const keyId = process.env.RAZORPAY_KEY_ID;
        if (!keyId) {
            return res.status(500).json({ success: false, message: "Razorpay key is not configured" });
        }
        return res.status(200).json({
            success: true,
            data: { keyId, currency: "INR", provider: "razorpay" },
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
