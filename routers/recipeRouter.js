const { Router } = require('express');
const recipeController = require('../controllers/recipeController');
const recipeRouter = Router();

recipeRouter.get('/new', recipeController.createRecipe);
recipeRouter.post('/add', recipeController.addRecipe);

// delete
// edit
// get recipe

module.exports = recipeRouter;