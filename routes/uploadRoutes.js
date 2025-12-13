const express = require('express');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads')); // save inside backend/uploads
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});


// File filter (only images allowed)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Only images are allowed!"));
  }
};

const upload = multer({ storage, fileFilter });

// Upload single image
router.post('/single', upload.single('image'), (req, res) => {
  res.json({
    message: 'Image uploaded successfully',
    file: req.file,
    url: `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`
  });
});

// Upload multiple images
router.post('/multiple', upload.array('images', 5), (req, res) => {
  const files = req.files.map(file => ({
    filename: file.filename,
    url: `${req.protocol}://${req.get('host')}/uploads/${file.filename}`
  }));
  res.json({
    message: 'Images uploaded successfully',
    files
  });
});

module.exports = router;
