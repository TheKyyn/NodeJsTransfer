const express = require('express');
const multer = require('multer');
const { uploadFile, listFiles, getFile, deleteFile, createSharedLink, accessSharedFile } = require('../controllers/fileController');
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
router.post('/share/:fileId', authenticateToken, createSharedLink);

router.get('/list', authenticateToken, listFiles);
router.get('/:fileId', authenticateToken, getFile);
router.get('/shared/:token', accessSharedFile);

router.delete('/:fileId', authenticateToken, deleteFile);

module.exports = router;
