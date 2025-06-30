const express = require('express');
const router = express.Router();
const { uploadImages } = require('../controllers/upload.controller');
const { authenticateToken } = require('../middleware/auth');
const  upload = require ('../image/multer');

router.post('/:userId', upload.array('photos', 10), authenticateToken, uploadImages);

module.exports = router;
