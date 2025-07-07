const { Router } = require('express');
const categoryRouter = Router();
const categoryController = require('../controllers/categoryController')

categoryRouter.get('/:category', categoryController.getCategoryRecipes);

module.exports = categoryRouter;