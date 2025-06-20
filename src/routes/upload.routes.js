const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadImages } = require('../controllers/upload.controller');

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/:userId', upload.array('photos', 10), uploadImages);

module.exports = router;
