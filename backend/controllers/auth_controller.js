const dotenv = require('dotenv')
const User = require('../models/user_model')
const Key = require('../models/token_model')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')
const bcrypt = require('bcrypt')
const JWT_SECRET = process.env.JWT_SECRET;

// mail handler
var transport = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS
    }
  });

  
function sendVerificationEmail(email, emailToken, req) {
    const rootUrl = `${req.protocol}://${req.get('host')}`
    const authUrl = `/verify/${emailToken}`
    const url = rootUrl+authUrl
    
    
    transport.sendMail({
        to: email,
        subject: 'Verify your email address',
        html: `Click <a href="${url}">here</a> to verify your email address.`,
    });
}

// form error handling
const handleErrors = (err) => {
    console.log(err.message, err.code);
    let errors = {email: '', password: ''};

    // Incorrect email and password
    if (err.message === 'Incorrect email') {
        errors.email = 'That email is not registered';
    }

    if (err.message === 'Incorrect password') {
        errors.password = 'Password is wrong... try again';
    }

    // Duplicate email error
    if (err.code === 11000) {
        errors.email = 'Email is already in use..';
        return errors;
    }

    // Validation errors
    if (err.message.includes('user validation failed')) {
        Object.values(err.errors).forEach(({properties}) => {
            errors[properties.path] = properties.message;
        });
    }
    return errors;
}


//jwt cookies functions
const maxAge = 1 * 24 * 60 * 60;
const createToken = (id) =>{

    return jwt.sign({id}, 'this text is a secret', {
        expiresIn: maxAge
    })
}

module.exports.signup_get = (req, res) => {
    res.render('signup');
}

module.exports.login_get = (req, res) => {
    res.render('login');
}

module.exports.reset_get = (req, res) => {
    res.render('reset_password');
}

module.exports.password_get = (req, res) => {
    res.render('new_password');
}

module.exports.signup_post = async (req, res) => {
    const {email, password} = req.body;
    // console.log(email, password)
    try {
         //hashpassword
         const saltRounds = 10
         const hashedPassword = await bcrypt.hash(password, saltRounds)

         //commit data to db
         const user = await User.insertMany({email, password: hashedPassword})

        // const user = await User.create({email, password})
        // console.log(user)
        // Generate verification token
        const emailToken = jwt.sign({ userId: user[0]._id }, JWT_SECRET, { expiresIn: '1d' });

        // Send verification email
         console.log(user[0].email)
        sendVerificationEmail(user[0].email, emailToken, req)
        // console.log(user._id)

        const token = createToken(user[0]._id);
        res.cookie('jwt', token, {httpOnly: true, maxAge: maxAge * 1000})
        res.status(200).json({user: user[0]._id});
    } catch (err) {
        const errors = handleErrors(err);
        res.status(400).json({errors});
    }
}

// Verification route
module.exports.verify_token = async (req, res) => {
    const {emailToken} = req.params;

    try {
        const decoded = jwt.verify(req.params.emailToken, JWT_SECRET);
        const user = await User.findById(decoded.userId);
        // console.log(emailToken)
        if (!user) {
            return res.status(400).send('Invalid token or user does not exist');
        }

        user.emailVerified = true;
        await user.save();

        console.log('Email verified successfully');
        res.send("<script>alert('Email verified successfully'); location.href='/login';</script>")

    } catch (error) {
        res.status(400).send('Invalid token');
    }
}



module.exports.login_post = async (req, res) => {
    const {email, password } = req.body;

    try {

       const user = await User.login(email, password);
    
       const token = createToken(user._id);
       res.cookie('jwt', token, {httpOnly: true, maxAge: maxAge * 1000})
       res.cookie('user_id', user._id, {httpOnly: true, maxAge: maxAge * 1000}  )
       res.status(200).json({user: user.role})

    } catch (err) {
        const errors = handleErrors(err)
        res.status(400).json({errors});
    } 
}

module.exports.logout_get = (req, res) => {
    res.cookie('jwt', '', {maxAge: 1});
    res.redirect('/');
}



    //send password reset email
    function sendPasswordResetEmail(user, token, req) {
        const rootUrl = `${req.protocol}://${req.get('host')}`
        const authUrl = `/resetPassword/${token}`;
        const url = rootUrl+authUrl
        
        transport.sendMail({
            to: user.email,
            subject: 'Reset Password',
            html: `Please click on the link below to reset your password. <br>Link:  <a href="${url}">Click here</a>`,
        });
    }

module.exports.reset_post = async (req, res) => {
    const {email} = req.body
    
    const user = await User.findOne({ email });

            if (!user) {
                return res.send(`<script>alert('No user exist with this email!'); location.replace('/reset');</script>`)
            }

            const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '12h' });
            
            user.passwordResetToken = token;
            user.passwordResetExpires = Date.now() + 43200000; // 12 hours
            await user.save();

            sendPasswordResetEmail(user, token, req);
            console.log('Password reset email sent')
            return res.send(`<script>alert('Password reset email sent! Please check your inbox.'); location.replace('/');</script>`)
}


module.exports.resetPassword = async (req, res) => {
    const { token } = req.params;

    return res.render('new_password', {token})
}


module.exports.password_post = async (req, res) => {
    const  token  = req.body.token;
    const password = req.body.password; 
    console.log(req.body)
    try {
         const decoded = jwt.verify(token, JWT_SECRET);
            const user = await User.findOne({
                _id: decoded.userId,
                passwordResetToken: token,
                passwordResetExpires: { $gt: Date.now() },
            });

            if (!user) {
                console.log('User not found')
                return res.send(`<script>alert('Invalid token!.'); location.replace('/reset');</script>`)
            }

            // Update password
            user.password = await bcrypt.hash(password, 10);
            user.passwordResetToken = undefined;
            user.passwordResetExpires = undefined;
            await user.save();

            console.log('Password reset successful')
            return res.send(`<script>alert('Password reset successful!.'); location.replace('/login');</script>`)
        } catch (error) {
            console.log('Everything not okay')
            return res.send(`<script>alert('Invalid token!.'); location.replace('/reset');</script>`)
        }
}