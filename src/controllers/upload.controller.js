const cloudinary = require('../utils/image/cloudinary');
const WorkImage = require('../models/WorkImage');


exports.uploadImages = async (req, res) => {
    const { userId } = req.params;
    const files = req.files;
    const descriptions = req.body.descriptions || [];

    if (files.length < 7) {
        return res.status(400).json({ message: 'Please upload at least 7 photos, Photos must include the display of your previous works' });
    }

    try {
        const uploadedImages = await Promise.all(files.map(async (file, i) => {
            const result = await cloudinary.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
                if (error) throw error;
            });


            const cloudRes = await cloudinary.uploader.upload(
                `data:${file.mimetype};base64,${file.buffer.toString('base64')}`
            );

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
