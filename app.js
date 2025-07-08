require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.APP_PORT
const path = require('path');
const indexRouter = require('./routers/indexRouter');
const categoryRouter = require('./routers/categoryRouter');
const recipeRouter = require('./routers/recipeRouter');
const authRouter = require('./routers/authRouter');
const expressLayouts = require('express-ejs-layouts');
const pool = require('./db/pool');

// auth and cookies
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
app.use(
    session({
        store: new pgSession({ pool }),
        secret: 'keyboard cat', // change using environment variables
        resave: false,
        saveUninitialized: false,
        cookie: { maxAge: 1000 * 60 * 60 * 24 }
    })
);

// inject logged-in user into all views
app.use(async (req, res, next) => {
  if (req.session.userId) {
    const result = await pool.query('SELECT name FROM users WHERE id = $1', [req.session.userId]);
    res.locals.username = result.rows[0]?.name;
  } else {
    res.locals.username = null;
  }
  next();
});


app.use(expressLayouts);
app.set('layout', 'layouts/main');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use('/', indexRouter);
app.use('/category', categoryRouter);
app.use('/recipes', recipeRouter);
app.use('/auth', authRouter);


app.listen(PORT, () => { console.info(`port running on port ${PORT}`)})