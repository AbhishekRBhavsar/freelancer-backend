const express = require('express');
const multer = require('multer');

const Role = {
  'developer': 'developer',
  'client': 'client',
}
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

const controller = require('./controller');
const validator = require('./validator');

const { authentication, authorization } = require('../../../middleware/auth');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const filePath = path.join(__dirname, '..', '..', '..', '..', 'storage', 'organization');
    fs.mkdirSync(filePath, { recursive: true });
    cb(null, filePath);
  },
  filename(req, file, cb) {
    const fileName = uuidv4();
    req.uuid = fileName;
    cb(null, `${fileName}${path.extname(file.originalname)}`);
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

router.post('/job', authentication, authorization([Role.client]), controller.createJob);
router.put('/job/:jobId?', authentication, authorization([Role.client]), controller.updateJob);
router.get('/job', authentication, controller.getJobs);
router.get('/job/:jobId?', authentication, controller.getJob);

router.post('/organization', authentication, authorization([Role.client]), upload.single('image'), controller.createOrganization);
router.get('/organization', authentication, controller.getOrganizations);
router.get('/client/jobs', authentication, authorization(['client']), controller.getClientJobs);

module.exports = router;
