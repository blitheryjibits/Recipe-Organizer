const bcrypt = require('bcrypt');
const db = require('../db/query');

const controller = {

    async signup(req, res) {
        res.render('signup', {title:"signup"});
    },

    async createAccount(req, res) {
        const { username, email, password } = req.body;
        const password_hash = await bcrypt.hash(password, 10);

        try {
            await db.insertUser(username, email, password_hash);
            res.redirect('/auth/signin');
        } catch(err) {
            res.status(500).send(`Error saving user: ${err}`);
        }
    },

    async signin(req, res) {
        res.render('signin', {title:"signin"});
    },

    async verifyAccount(req, res) {
        const { email, password } = req.body;
        try {
            const user = await db.signin(email, password);
            if (!user) {
                return res.status(401).render('signin', { title:"signin", error: 'invalid email or password' });
            } 
            
            req.session.userId = user.id;
            return res.redirect('/');
        } catch(err) {
            return res.status(500).render('signin', { title:"signin", error: 'Something went wrong. Please try again.' });
        }
        
    },

    async signout(req, res) {
        req.session.destroy((err) => {
            if(err) {
                return res.status(500).send('Error signing out');
            }
            res.clearCookie('connect.sid');
            res.redirect('/');
        })
    },

    async ensureAuthenticated(req, res, next) {
        if(req.session && req.session.userId) {
            return next();
        }
        res.redirect('/auth/signin');
    },

    async viewProfile(req, res) {
        const userId = req.session.userId;
        try {
            const recipes = await db.getUserRecipes(userId);
            res.render('profile', {title: 'Profile', recipes: recipes})
        } catch(err) {
            res.status(500).send(`Error getting user recipes: ${err}`);
        }
    }

}

module.exports = controller;