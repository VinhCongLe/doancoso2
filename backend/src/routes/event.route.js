const express = require('express');
const router = express.Router();
const eventController = require('../controllers/event.controller');
const multer = require('multer');


// 1. CẤU HÌNH MULTER: Nơi lưu và tên file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Ảnh sẽ được lưu vào thư mục 'uploads'
  },
  filename: function (req, file, cb) {
    // Đổi tên file: Thời gian hiện tại + Tên gốc (để tránh trùng lặp file)
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });


router.post('/', upload.single('banner'), eventController.createEvent);
router.put('/:id', upload.single('banner'), eventController.updateEvent);

// Khai báo 2 đường dẫn tương ứng với 2 hàm trong Controller
router.post('/', eventController.createEvent);
router.get('/', eventController.getAllEvents);


// API có ID cụ thể (:id sẽ lấy từ URL)
router.get('/:id', eventController.getEventById);
router.put('/:id', eventController.updateEvent);
router.delete('/:id', eventController.deleteEvent);


module.exports = router;
