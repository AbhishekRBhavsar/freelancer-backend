const express = require('express');

const router = express.Router();

const controller = require('./controller');
const validator = require('./validator');

const { authentication, authorization } = require('../../../middleware/auth');

router.post('/signup', controller.signup);
router.post('/login', controller.login);

// router.put('/profile', authentication, controller.updateProfile);
// router.get('/profile', authentication, authorization, controller.profile);
// // router.get('/users', authentication, authorization, controller.getAll);

// router.get('/users/:userId', authentication, authorization, controller.findById);
// router.delete('/users/:userId', authentication, authorization, controller.deleteById);

module.exports = router;
