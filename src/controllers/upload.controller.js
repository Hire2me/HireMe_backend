const cloudinary = require('../utils/cloudinary');
const WorkImage = require('../models/WorkImage');
const User = require('../models/User');

exports.uploadImages = async (req, res) => {
    const { userId } = req.params;
    const files = req.files;
    const descriptions = req.body.descriptions || [];

    if (files.length < 7) {
        return res.status(400).json({ message: 'Please upload at least 7 photos' });
    }

    try {
        const uploadedImages = await Promise.all(files.map(async (file, i) => {
            const result = await cloudinary.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
                if (error) throw error;
            });

            const imageBuffer = file.buffer.toString('base64');
            const cloudRes = await cloudinary.uploader.upload(`data:image/jpeg;base64,${imageBuffer}`);

            return {
                userId,
                imageUrl: cloudRes.secure_url,
                description: descriptions[i] || ''
            };
        }));

        await WorkImage.insertMany(uploadedImages);
        await User.findByIdAndUpdate(userId, { profileCompleted: true });

        res.status(201).json({ message: 'Photos uploaded successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
