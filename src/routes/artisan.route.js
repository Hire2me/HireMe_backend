const express = require('express');
const router = express.Router();
const Artisan = require('../models/artisan.model');
const artisanController = require('../controllers/artisan.controller');
const { authenticateToken } = require('../middleware/auth');


router.post('/signup', artisanController.signup);
router.post('/login', artisanController.login);
router.post('/forgot-password', artisanController.forgotPassword);
router.post('/reset-password', artisanController.resetPassword);
router.post('/verify-email', authenticateToken, artisanController.verifyEmail);

router.get('/debug/:email', async (req, res) => {
    try {
        const artisan = await Artisan.findOne({ email: req.params.email });
        if (!artisan) {
            return res.status(404).json({ message: 'Artisan not found' });
        }
        res.json({
            email: artisan.email,
            verificationToken: artisan.verificationToken,
            isEmailVerified: artisan.isEmailVerified
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


module.exports = router;