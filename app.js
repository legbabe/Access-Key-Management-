require('dotenv').config()
const dotenv = require('dotenv')
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const User = require('./backend/models/user_model')
const Key = require('./backend/models/token_model')
const authRoutes = require('./backend/routes/auth_routes')
const keyRoutes = require('./backend/routes/key_routes')
const cookieParser = require('cookie-parser');
const { Server } = require('https');
const { requireAuth } = require('./backend/middleware/authMiddleware');
const moment = require('moment')


const app = express();

app.use(express.urlencoded({extended: false}))

// //setting ejs
app.set("views", __dirname + "/views");
app.set('view engine', 'ejs');

console.log(__dirname)

//adding static middleware
app.use(express.static(__dirname +'/public'));
app.use(express.json());
app.use(cookieParser())

//All pages navigations
    app.get('/', (req, res) => {
    res.render('index')
})

app.use(authRoutes)
app.use(keyRoutes)
// app.use(otherRoutes)

app.get('/admin', (req, res) => {
    res.render('admin.ejs')
})



app.get('/personnel', requireAuth, async (req, res) => {
try{
    const user_id = req.cookies.user_id
    // console.log(user_id)
    const user = await User.findOne({_id: user_id})
    // console.log(user)
    const keys = await Key.find({userEmail: user.email})
    // console.log(keys)

    keys.forEach(key => {
        key.procDate = moment(key.proc_date).format('MMMM Do YYYY, h:mm:ss a');
        key.expireAt = moment(key.expiryDate).format('MMMM Do YYYY, h:mm:ss a');
    });

    res.render('it_personnel_home.ejs', {keys})
}
catch{
    res.status(500).send('Error fetching keys');
}
})

app.get('/dashboard', requireAuth, async (req, res) => {
try{
    const keys = await Key.find()

    keys.forEach(key => {
        key.procDate = moment(key.proc_date).format('MMMM Do YYYY, h:mm:ss a');
        key.expireAt = moment(key.expiryDate).format('MMMM Do YYYY, h:mm:ss a');
    });

    res.render('admin_home.ejs', {keys})
    }
    catch (error) {
        res.status(500).send('Error fetching keys');
    }
})

app.get('/generate_key', (req, res) => {
    res.render('generate_key.ejs')
}); 


// database connection
const dbURI = process.env.DB_STRING
mongoose.connect(dbURI).then(
    (result)=> app.listen(5000)
).catch((error) => console.log(error))
