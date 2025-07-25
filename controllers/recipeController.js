const db = require('../db/query');
const recipeRouter = require('../routers/recipeRouter');

const controller = {

    async createRecipe(req, res) {
        try {
            res.render('newRecipe', {title: 'New Recipe'})
        } catch(err) {

        }
    },

    async addRecipe(req, res) {
        const name = req.body['recipe-name'];
        const {description, ingredients, categories} = req.body;
        const _ingredients = ingredients.split(',').map(str => str.trim()); // CS = comma separated
        const _categories = categories ? categories.split(',').map(c => c.trim()) : [];
        const userId = req.session.userId;

        try {
            result = await db.addRecipe(name, description, _ingredients, _categories, userId);
            res.redirect('/');
        } catch(err) {
            console.error(err);
        }
    },

    async deleteRecipe(req, res) {
        const recipeId = req.params.id;
        try {
            await db.deleteRecipe(recipeId);
            res.redirect('/auth/profile');
        } catch(err) {
            res.status(500).send(`error from recipeController: ${err}`);
        }
    }
    
}

module.exports = controller;