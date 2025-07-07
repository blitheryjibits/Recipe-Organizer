/** @type {import('tailwindcss').Config} */
module.exports = {
content: [
    "public/views/**/*.html",
    "./views/*.ejs",
    "public/scripts/**/*.{js,mjs}"
],
theme: {
extend: {},
},
plugins: [
{
tailwindcss: {},
autoprefixer: {},
},
],
};