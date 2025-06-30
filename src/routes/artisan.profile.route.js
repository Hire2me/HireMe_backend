const express = require('express');
const router = express.Router();
const {createProfile, getMyProfile, getPublicArtisanProfile, reportArtisan, getAllArtisans} = require('../controllers/artisan.profile.controller');
const { authenticateToken } = require('../middleware/auth');
const  upload = require ('../image/multer');



router.post('/profile', upload.fields([
    { name: 'profilePicture', maxCount: 1 },
    { name: 'businessCertificate', maxCount: 1 },
    { name: 'NIN', maxCount: 1 },
    { name: 'coverPicture', maxCount: 1 }

  ]), authenticateToken, createProfile);

router.get('/profile', authenticateToken, getMyProfile);
router.get('/profile/:id', getPublicArtisanProfile);
router.post('/report/:id', reportArtisan);
router.get('/all', getAllArtisans);

module.exports = router;