const express = require('express');
const router = express.Router();
const artisanController = require('../controllers/artisan.controller');


router.post('/signup', artisanController.signup);
router.post('/login', artisanController.login);
router.post('/forgot-password', artisanController.forgotPassword);
router.post('/reset-password', artisanController.resetPassword);
router.get('/verify-email/:token', artisanController.verifyEmail);

module.exports = router;