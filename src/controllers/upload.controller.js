const WorkImage = require('../models/WorkImage');
const Artisan = require('../models/artisan.model');


exports.uploadImages = async (req, res) => {
  const { userId } = req.params;
  const files = req.files;
  const descriptions = Array.isArray(req.body.descriptions)
    ? req.body.descriptions
    : [req.body.descriptions]; 

  if (!files || files.length < 7) {
    return res.status(400).json({
      message: 'Please upload at least 7 photos. Photos must include the display of your previous works',
    });
  }

  try {
    const uploadedImages = files.map((file, i) => ({
      userId,
      imageUrl: file.path, 
      description: descriptions[i] || '',
    }));

    await WorkImage.insertMany(uploadedImages);
    await Artisan.findByIdAndUpdate(userId, { profileCompleted: true });

    res.status(201).json({ message: 'Photos uploaded successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
