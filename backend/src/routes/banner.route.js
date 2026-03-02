const express = require('express');
const router = express.Router();
const bannerController = require('../controllers/banner.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

router.get('/', bannerController.getBanners);
router.post('/', verifyToken, isAdmin, upload.single('image'), bannerController.createBanner);
router.delete('/:id', verifyToken, isAdmin, bannerController.deleteBanner);

module.exports = router;