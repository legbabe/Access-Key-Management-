const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const User = require('./models/user_model')
const authRoutes = require('./routes/auth_routes')
const cookieParser = require('cookie-parser');
const { Server } = require('https');
const { requireAuth } = require('./middleware/authMiddleware');


const app = express();

//setting ejs
app.set('view engine', 'ejs');

//adding static middleware
app.use(express.static('public'));
app.use(express.json());
app.use(cookieParser())

//All pages navigations
app.get('/', (req, res) => {
    res.render('index.ejs')
})

app.use(authRoutes)

app.get('/admin', (req, res) => {
    res.render('admin.ejs')
})

app.get('/personnel', requireAuth, (req, res) => {
    res.render('it_personnel_home.ejs')
})

app.get('/dashboard', (req, res) => {
    res.render('admin_home.ejs')
})

app.get('/generate_key', (req, res) => {
    res.render('generate_key.ejs')
}); 


// database connection
const dbURI = 'mongodb+srv://danielajayi:danielajayi@access-key.lpymepu.mongodb.net/access-key?retryWrites=true&w=majority&appName=Access-key-management'
mongoose.connect(dbURI).then(
    (result)=> app.listen(5000)
).catch((error) => console.log(error))
