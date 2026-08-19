import User from '../../models/userModel.js';

export const updateAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const mime = req.file.mimetype || 'image/png';
    const base64 = req.file.buffer.toString('base64');
    const avatarUrl = `data:${mime};base64,${base64}`;

    await User.updateOne(
      { _id: req.user.id },
      {
        $set: { avatar: avatarUrl },
        $push: {
          notifications: {
            title: 'Avatar Updated',
            message: 'Your profile avatar has been updated.',
            type: 'info',
            isRead: false,
            createdAt: new Date()
          }
        }
      }
    );
    res.json({ success: true, avatar: avatarUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating avatar' });
  }
};
