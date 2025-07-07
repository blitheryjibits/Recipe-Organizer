const db = require('../db/query');

const controller = {

    async getCategoryRecipes(req, res) {
        try {
            const { category } = req.params;
            const recipes = await db.getRecipes(category);
            res.render('recipes', { title: "Recipes", category: category, recipes: recipes });
        } catch(err) {
            res.status(500).send(`error getting recipes: ${err}`);
        }
    }
}

module.exports = controller;