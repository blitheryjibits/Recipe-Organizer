const db = require('../db/query');

const controller = {

    async getLandingPage(req, res) {
        try {
            const result = await db.getCategories();
            const _categories = result.map(({ name }) => name ? name.charAt(0).toUpperCase() + name.slice(1) : '');
            res.render('index', { title: "Recipes", categories: _categories });
        } catch(err) {
            res.status(500).send("Error fetching categories for index: " + err);
        }
    }
}

module.exports = controller;