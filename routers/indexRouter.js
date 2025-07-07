const { Router } = require('express');
const controller = require('../controllers/indexController');
const indexRouter = Router();

indexRouter.get('/', controller.getLandingPage);

module.exports = indexRouter;