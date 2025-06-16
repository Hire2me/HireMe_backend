const Artisan = require('../models/artisan.model');

const createProfile = async (req, res) => {
  try {
    const {
      businessName,
      businessAddress,
      occupation,
      occupationType,
      availabilityDays,
      availabilityTime,
      bio
    } = req.body;

    const profilePicture = req.files['profilePicture']?.[0]?.filename;
    const businessCertificate = req.files['businessCertificate']?.[0]?.filename;
    const NIN = req.files['NIN']?.[0]?.filename;
    const coverPicture = req.files['coverPicture']?.[0]?.filename;

    const artisan = await Artisan.findById(req.user.id);
    if (!artisan) {
      return res.status(404).json({ success: false, message: 'Artisan not found' });
    }

    artisan.isCreatingProfile = true; 

    artisan.businessName = businessName;
    artisan.businessAddress = businessAddress;
    artisan.profilePicture = profilePicture;
    artisan.coverPicture = coverPicture;
    artisan.occupation = occupation;
    artisan.occupationType = occupationType;
    artisan.availabilityDays = JSON.parse(availabilityDays);
    artisan.availabilityHours = availabilityTime;
    artisan.businessCertificate = businessCertificate;
    artisan.NIN = NIN;
    artisan.Bio = bio;

    await artisan.save();

    res.status(201).json({
  success: true,
  data: {
    id: artisan._id,
    fullName: artisan.fullName,
    email: artisan.email,
    phoneNumber: artisan.phoneNumber,
    businessName: artisan.businessName,
    businessAddress: artisan.businessAddress,
    occupation: artisan.occupation,
    occupationType: artisan.occupationType,
    availabilityDays: artisan.availabilityDays,
    availabilityHours: artisan.availabilityHours,
    profilePicture: artisan.profilePicture,
    coverPicture: artisan.coverPicture,
    businessCertificate: artisan.businessCertificate,
    NIN: artisan.NIN,
    bio: artisan.Bio
  }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = createProfile;
