const Artisan = require("../models/artisan.model");
const WorkImage = require("../models/WorkImage.js");
const mongoose = require("mongoose");
const createProfile = async (req, res) => {
  try {
    const {
      businessName,
      businessAddress,
      occupation,
      occupationType,
      availabilityDays,
      availabilityTime,
      bio,
    } = req.body;

    const profilePicture = req.files["profilePicture"]?.[0]?.filename;
    const businessCertificate = req.files["businessCertificate"]?.[0]?.filename;
    const NIN = req.files["NIN"]?.[0]?.filename;
    const coverPicture = req.files["coverPicture"]?.[0]?.filename;

    const artisan = await Artisan.findById(req.user.id);
    if (!artisan) {
      return res
        .status(404)
        .json({ success: false, message: "Artisan not found" });
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
        bio: artisan.Bio,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyProfile = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    // Get artisan info
    const artisan = await Artisan.findOne({ _id: userId }).lean();

    if (!artisan) {
      return res.status(404).json({ message: "Artisan profile not found" });
    }

    // Get associated work images
    const workImages = await WorkImage.find({ userId })
      .select("imageUrl description")
      .lean();

    // Destructure only needed fields from artisan
    const {
      _id,
      fullName,
      email,
      phoneNumber,
      businessName,
      businessAddress,
      occupation,
      occupationType,
      availabilityDays,
      availabilityHours,
      profilePicture,
      coverPicture,
      businessCertificate,
      NIN,
      Bio,
    } = artisan;

    // Send combined profile + work images
    return res.status(200).json({
      success: true,
      data: {
        id: _id,
        fullName,
        email,
        phoneNumber,
        businessName,
        businessAddress,
        occupation,
        occupationType,
        availabilityDays,
        availabilityHours,
        profilePicture,
        coverPicture,
        businessCertificate,
        NIN,
        bio: Bio,
        workImages, // <-- included here
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getPublicArtisanProfile = async (req, res) => {
  try {
    const artisanId = req.params.id;

    const artisan = await Artisan.findById(artisanId)
      .select(
        "-user -resetPasswordToken -resetPasswordExpires -verificationToken -__v -password"
      )
      .lean();

    if (!artisan) {
      return res.status(404).json({ message: "Artisan not found" });
    }

    const workImages = await WorkImage.find({ userId: artisanId })
      .select("imageUrl description")
      .lean();

    const {
      _id,
      fullName,
      email,
      phoneNumber,
      businessName,
      businessAddress,
      occupation,
      occupationType,
      availabilityDays,
      availabilityHours,
      profilePicture,
      coverPicture,
      businessCertificate,
      NIN,
      Bio,
    } = artisan;

    return res.status(200).json({
      success: true,
      data: {
        id: _id,
        fullName,
        email,
        phoneNumber,
        businessName,
        businessAddress,
        occupation,
        occupationType,
        availabilityDays,
        availabilityHours,
        profilePicture,
        coverPicture,
        businessCertificate,
        NIN,
        bio: Bio,
        workImages,
      },
    });
  } catch (err) {
    console.error("Get public artisan error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const reportArtisan = async (req, res) => {
  try {
    const artisanId = req.params.id;
    const { reason } = req.body;

    const artisan = await Artisan.findById(artisanId);
    if (!artisan) {
      return res.status(404).json({ message: "Artisan not found" });
    }

    artisan.isReported = true;
    artisan.reports.push({ reason, reportedBy: req.user.id });
    await artisan.save();

    return res.status(200).json({ message: "Artisan reported successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to report artisan" });
  }
};

const getAllArtisans = async (req, res) => {
  try {
    const { search, occupation, location, page = 1, limit = 10 } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phoneNumber: { $regex: search, $options: "i" } },
      ];
    }

    if (occupation) {
      query.occupation = { $regex: occupation, $options: "i" };
    }

    if (location) {
      query.businessAddress = { $regex: location, $options: "i" };
    }

    const skip = (page - 1) * limit;

    const artisans = await Artisan.find(query)
      .select(
        "-password -resetPasswordToken -resetPasswordExpires -verificationToken -__v"
      )
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await Artisan.countDocuments(query);

    const artisanIds = artisans.map((a) => a._id);

    const allImages = await WorkImage.find({ userId: { $in: artisanIds } })
      .select("userId imageUrl description")
      .lean();

    const data = artisans.map((artisan) => {
      const workImages = allImages.filter(
        (img) => img.userId.toString() === artisan._id.toString()
      );

      return {
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
        bio: artisan.Bio,
        workImages,
      };
    });

    return res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      count: data.length,
      data,
    });
  } catch (err) {
    console.error("Get all artisans error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};



module.exports = {
  createProfile,
  getMyProfile,
  getPublicArtisanProfile,
  reportArtisan,
  getAllArtisans,
};

