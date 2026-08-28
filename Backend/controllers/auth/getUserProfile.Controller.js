import User from '../../models/userModel.js';
export const getUserProfile = async (req, res) => {
    console.log("Controller Hit - getUserProfile");
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user)
            return res.status(404).json({ message: 'User not found' });
        res.json(user);
    }
    catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
