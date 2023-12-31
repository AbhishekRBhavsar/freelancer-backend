const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

const controller = require('./controller');
const validator = require('./validator');

const { authentication, authorization } = require('../../../middleware/auth');


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const filePath = path.join(__dirname, '..', '..', '..', '..', 'storage');
    fs.mkdirSync(filePath, { recursive: true });
    cb(null, filePath);
  },
  filename(req, file, cb) {
    cb(null, `${req.user._id}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, callback) {
    var ext = path.extname(file.originalname);
    if (file.size > 2097152) {
      return callback(
        new Error("Uploading file greater than 2MB is not allowed.")
      );
    }
    if (
      ext === ".PNG" ||
      ext === ".png" ||
      ext === ".JPG" ||
      ext === ".JPEG" ||
      ext === ".jpg" ||
      ext === ".jpeg"
    ) {
      callback(null, true);
    } else {
      return callback(new Error("Only images are allowed"));
    }
  },
  limits: { fileSize: 2000000 } // file size limit for 2 mb
});

router.post('/signup', controller.signup);
router.post('/login', controller.login);

router.put('/profile', authentication, authorization(['developer']), controller.updateProfile);
router.get('/profile', authentication, controller.getProfile);
router.get('/user/:userId?', authentication, controller.getUser); 
router.post('/logout', authentication, controller.logout);
router.post('/avatar', authentication, upload.single('avatar'), controller.updateAvatar);
router.get('/users', authentication, controller.getAllUser);

router.get('/admin/users', authentication, authorization(['admin']), controller.getDetailedUsedrs);
router.get('/admin/users/activity', authentication, authorization(['admin']), controller.getUserActivity);
router.post('/invite', authentication, authorization(['client', 'developer']), controller.invite);

// router.get('/users/:userId', authentication, authorization, controller.findById);
// router.delete('/users/:userId', authentication, authorization, controller.deleteById);

module.exports = router;
