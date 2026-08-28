import Course from '../../models/courseModel.js';
import mongoose from 'mongoose';
export const getActivityAnalytics = async (req, res) => {
    console.log("Controller Hit - getActivityAnalytics");
    try {
        const range = String(req.query.range || 'week');
        let startDate = new Date();
        let endDate = new Date();
        let format = "%Y-%m-%d";
        let labels = [];
        const now = new Date();
        const getStartOfWeek = (d) => {
            const date = new Date(d);
            const day = date.getDay();
            const diff = date.getDate() - day + (day === 0 ? -6 : 1);
            return new Date(date.setDate(diff));
        };
        if (range === 'week') {
            startDate = getStartOfWeek(now);
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 6);
            endDate.setHours(23, 59, 59, 999);
            format = "%Y-%m-%d";
            for (let i = 0; i < 7; i++) {
                const d = new Date(startDate);
                d.setDate(d.getDate() + i);
                labels.push(d.toISOString().slice(0, 10));
            }
        }
        else if (range === 'month') {
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            endDate.setHours(23, 59, 59, 999);
            format = "%Y-%m-%d";
            const daysInMonth = endDate.getDate();
            for (let i = 1; i <= daysInMonth; i++) {
                const d = new Date(now.getFullYear(), now.getMonth(), i);
                labels.push(d.toISOString().slice(0, 10));
            }
        }
        else if (range === 'year') {
            startDate = new Date(now.getFullYear(), 0, 1);
            endDate = new Date(now.getFullYear(), 11, 31);
            endDate.setHours(23, 59, 59, 999);
            format = "%Y-%m";
            for (let i = 0; i < 12; i++) {
                const m = i + 1;
                labels.push(`${now.getFullYear()}-${String(m).padStart(2, '0')}`);
            }
        }
        else {
            startDate = getStartOfWeek(now);
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 6);
            format = "%Y-%m-%d";
            for (let i = 0; i < 7; i++) {
                const d = new Date(startDate);
                d.setDate(d.getDate() + i);
                labels.push(d.toISOString().slice(0, 10));
            }
        }
        const agg = [
            { $match: { userId: new mongoose.Types.ObjectId(req.user.id) } },
            { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
            { $match: { "modules.0": { $exists: true } } },
            { $match: { "modules.gammaUrl": { $ne: null } } },
            {
                $group: {
                    _id: { $dateToString: { format: format, date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            }
        ];
        const results = await Course.aggregate(agg);
        const buckets = labels.map(label => {
            const found = results.find(r => r._id === label);
            return { label, count: found ? found.count : 0 };
        });
        res.json({ range, buckets });
    }
    catch (error) {
        console.error('Analytics Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
