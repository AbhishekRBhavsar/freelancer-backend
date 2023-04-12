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


router.get('/client/profile', authentication, controller.getClientProfile);
router.put('/client/profile', authentication, authorization(['client']), controller.updateProfile);
router.put('/client/projects', authentication, authorization(['client']), controller.updateClientProject);
router.patch('/client/org', authentication, authorization(['client']), controller.updateClientOrganization);

module.exports = router;