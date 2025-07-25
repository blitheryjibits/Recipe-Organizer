const { Router } = require('express');
const recipeController = require('../controllers/recipeController');
const authController = require('../controllers/authController');
const recipeRouter = Router();

recipeRouter.get('/new', authController.ensureAuthenticated, recipeController.createRecipe);
recipeRouter.post('/add', recipeController.addRecipe);

// delete
recipeRouter.post('/:id/delete', recipeController.deleteRecipe);
// edit
// recipeRouter.get('/:id/edit', recipeController.editRecipe);
// recipeRouter.post('/:id/edit', recipeController.updateRecipe);
// get recipe

module.exports = recipeRouter;