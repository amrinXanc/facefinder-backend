const { signup, login, forgotPassword, resetPassword  } = require('../Controllers/AuthController');
const { signupValidation, loginValidation} = require('../Middlewares/AuthValidation');

const router = require('express').Router();

// signup route
router.post('/signup', signupValidation, signup);

// login route
router.post('/login', loginValidation, login);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
module.exports = router;
