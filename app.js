require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.APP_PORT
const path = require('path');
const indexRouter = require('./routers/indexRouter');
const categoryRouter = require('./routers/categoryRouter');
const recipeRouter = require('./routers/recipeRouter');
const expressLayouts = require('express-ejs-layouts');

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


app.listen(PORT, () => { console.info(`port running on port ${PORT}`)})