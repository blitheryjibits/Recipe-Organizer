const { Router } = require('express');
const authRouter = Router();
const authController = require('../controllers/authController')

authRouter.get('/signup', authController.signup);
authRouter.post('/signup', authController.createAccount);

authRouter.get('/signin', authController.signin);
authRouter.post('/signin', authController.verifyAccount);

authRouter.post('/signout', authController.signout);

authRouter.get('/profile', authController.ensureAuthenticated, authController.viewProfile);

module.exports = authRouter;