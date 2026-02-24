const Notification = require('../models/Notification');

// Get user notifications
const getUserNotifications = async (req, res) => {
  const userId = req.user?.id || req.user?._id;

  try {
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json(notifications);
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
};

// Mark notification as read
const markAsRead = async (req, res) => {
  const { notificationId } = req.params;

  try {
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.status(200).json(notification);
  } catch (err) {
    console.error('Error marking notification as read:', err);
    res.status(500).json({ message: 'Failed to mark notification as read' });
  }
};

// Mark all as read
const markAllAsRead = async (req, res) => {
  const userId = req.user?.id || req.user?._id;

  try {
    await Notification.updateMany({ userId, read: false }, { read: true });
    res.status(200).json({ message: 'All notifications marked as read' });
  } catch (err) {
    console.error('Error marking all as read:', err);
    res.status(500).json({ message: 'Failed to mark notifications as read' });
  }
};

// Get unread count
const getUnreadCount = async (req, res) => {
  const userId = req.user?.id || req.user?._id;

  try {
    const count = await Notification.countDocuments({ userId, read: false });
    res.status(200).json({ unreadCount: count });
  } catch (err) {
    console.error('Error getting unread count:', err);
    res.status(500).json({ message: 'Failed to get unread count' });
  }
};

module.exports = {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
};
