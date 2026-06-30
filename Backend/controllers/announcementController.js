import Announcement from '../models/Announcement.js';

export const getActiveAnnouncement = async (req, res) => {
    try {
        const announcement = await Announcement.findOne({ isActive: true }).sort({ createdAt: -1 });
        res.status(200).json(announcement);
    } catch (error) {
        console.error('Error fetching announcement:', error);
        res.status(500).json({ message: 'Error fetching announcement', error: error.message });
    }
};

export const getAdminAnnouncement = async (req, res) => {
    try {
        const announcement = await Announcement.findOne().sort({ createdAt: -1 });
        res.status(200).json(announcement);
    } catch (error) {
        console.error('Error fetching announcement for admin:', error);
        res.status(500).json({ message: 'Error fetching announcement', error: error.message });
    }
};

export const createOrUpdateAnnouncement = async (req, res) => {
    try {
        const { message, discountText, endDate, link, isActive } = req.body;
        
        let announcement = await Announcement.findOne().sort({ createdAt: -1 });
        
        if (announcement) {
            announcement.message = message !== undefined ? message : announcement.message;
            announcement.discountText = discountText !== undefined ? discountText : announcement.discountText;
            announcement.endDate = endDate ? endDate : null;
            announcement.link = link !== undefined ? link : announcement.link;
            announcement.isActive = isActive !== undefined ? isActive : announcement.isActive;
            
            await announcement.save();
        } else {
            announcement = await Announcement.create({
                message,
                discountText,
                endDate: endDate ? endDate : null,
                link,
                isActive
            });
        }
        
        res.status(200).json({ message: 'Announcement saved successfully', announcement });
    } catch (error) {
        console.error('Error saving announcement:', error);
        res.status(500).json({ message: 'Error saving announcement', error: error.message });
    }
};

export const deleteAnnouncement = async (req, res) => {
    try {
        await Announcement.deleteMany({});
        res.status(200).json({ message: 'Announcement ended successfully' });
    } catch (error) {
        console.error('Error ending announcement:', error);
        res.status(500).json({ message: 'Error ending announcement', error: error.message });
    }
};
