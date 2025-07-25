const pool = require('./pool');
const bcrypt = require('bcrypt');

const db = {
    async getCategories() {
        const result = await pool.query(`SELECT * FROM categories`);
        return result.rows;
    },

    async getRecipes(category) {
          const query =  `
            SELECT r.*
            FROM recipes r
            WHERE EXISTS (
            SELECT 1
            FROM recipe_categories rc
            JOIN categories c ON c.id = rc.category_id
            WHERE rc.recipe_id = r.id AND c.name = $1
            )`;

        const result = await pool.query(query, [category]);

        return result.rows;
    },

    // Add recipes to database
    async addRecipe(name, description, ingredients, categories, userId) {
        const client = await pool.connect(); // create a single database connection for whole function
        try {
            await client.query("BEGIN"); // begin transaction. Creates a rollback point for the database.

            const queryRecipe = `
                INSERT INTO recipes (name, description, user_id)
                SELECT $1::varchar, $2::text, $3
                WHERE NOT EXISTS (
                SELECT 1 FROM recipes WHERE LOWER(name) = LOWER($1::varchar))
                RETURNING id;
                `;
            const recipeResult = await client.query(queryRecipe, [name, description, userId]);
            const recipeId = recipeResult.rows.length
                ? recipeResult.rows[0].id
                : (
                await client.query('SELECT id FROM recipes WHERE LOWER(name) = LOWER($1::varchar)', [name])
                ).rows[0].id;

                // Ingredients
                const ingredientIds = [];
                for (const raw of ingredients) {
                    const iName = raw.trim().toLowerCase();

                    const ingredientResult = await client.query(
                        `INSERT INTO ingredients (name)
                        SELECT $1::varchar WHERE NOT EXISTS (
                        SELECT 1 FROM ingredients WHERE LOWER(name::varchar) = LOWER($1)
                        )
                        RETURNING id;`,
                        [iName]
                    );

                    const id = ingredientResult.rows.length > 0
                    ? ingredientResult.rows[0].id
                    : (
                        await client.query('SELECT id FROM ingredients WHERE LOWER(name) = LOWER($1::varchar)', [iName])
                        ).rows[0].id;

                    ingredientIds.push(id);
                } //end ingredients for loop

            // Insert categories if missing and collect IDs
            const categoryIds = [];
                for (const raw of categories) {
                const cName = raw.trim().toLowerCase();

                const categoryResult = await client.query(
                    `INSERT INTO categories (name)
                    SELECT $1 WHERE NOT EXISTS (
                    SELECT 1 FROM categories WHERE LOWER(name) = LOWER($1::varchar)
                    )
                    RETURNING id;`,
                    [cName]
                );

                const id = categoryResult.rows.length > 0
                    ? categoryResult.rows[0].id
                    : (
                        await client.query('SELECT id FROM categories WHERE LOWER(name) = LOWER($1::varchar)', [cName])
                        ).rows[0].id;

                categoryIds.push(id);
            }
            
            // Link recipe to each ingredient
            const recipe_ingredients = [];
            for (const ingId of ingredientIds) {
                const q = `
                    INSERT INTO recipe_ingredients (recipe_id, ingredient_id)
                    VALUES ($1, $2) ON CONFLICT DO NOTHING;
                `;
                await client.query(q, [recipeId, ingId]);
                recipe_ingredients.push({ recipeId, ingredientId: ingId });
            }

            // Link recipe to each category
            const recipe_categories = [];
            for (const catId of categoryIds) {
            const q = `
                INSERT INTO recipe_categories (recipe_id, category_id)
                VALUES ($1, $2) ON CONFLICT DO NOTHING;
            `;
            await client.query(q, [recipeId, catId]);
            recipe_categories.push({ recipeId, categoryId: catId });
            }

            await client.query('COMMIT');

        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    },

    async insertUser(username, email, password_hash) {
        await pool.query(`
            INSERT INTO users (name, email, password) VALUES ($1, $2, $3)`,
        [username, email, password_hash])
    },

    async signin(email, password) {
        try {
            const userQuery = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
            const user = userQuery.rows[0];
            if (!user) return null;
            const match = await bcrypt.compare(password, user.password);
            if (!match) return null;
            return user;
        } catch(err) {
            return err;
        }
    },

    async getUserRecipes(userId) {
        const result = await pool.query(`
            SELECT 
                r.id, r.name, r.description,
                ARRAY_AGG(c.name) AS categories
            FROM recipes r
            LEFT JOIN recipe_categories rc ON r.id = rc.recipe_id
            LEFT JOIN categories c ON rc.category_id = c.id
            WHERE r.user_id = $1
            GROUP BY r.id
        `, [userId]);
        return result.rows;
    },

    async deleteRecipe(recipeId) {
        const client = await pool.connect();
        try {
             await client.query('DELETE FROM recipe_ingredients WHERE recipe_id = $1', [recipeId]);
            await client.query('DELETE FROM recipe_categories WHERE recipe_id = $1', [recipeId]);
            await client.query('DELETE FROM recipes WHERE id = $1', [recipeId]);
            await client.query('COMMIT');
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    }

}

module.exports = db;