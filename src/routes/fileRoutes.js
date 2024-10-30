const express = require('express');
const multer = require('multer');
const { uploadFile } = require('../controllers/fileController');
const authenticateToken = require('../middleware/authMiddleware');

const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

router.post('/upload', authenticateToken, upload.single('file'), uploadFile);

module.exports = router;
