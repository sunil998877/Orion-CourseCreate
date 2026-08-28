import { getPlansList } from "../../services/creditService/planService.js";
export const getPlans = async (req, res) => {
    try {
        const plans = await getPlansList();
        return res.status(200).json({
            success: true,
            data: plans,
        });
    }
    catch (error) {
        console.error("Error fetching plans:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch plans",
        });
    }
};
