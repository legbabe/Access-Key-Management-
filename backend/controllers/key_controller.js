const mongoose = require('mongoose')
const User = require("../models/user_model")
const Token = require("../models/token_model")
const crypto = require("crypto")


const key_gen = async (req, res) => {
    const keyGeneration = () => {
        const buffer = crypto.randomBytes(8)

    return buffer.toString('hex')
    }
    const key = keyGeneration()


    //finding user
    const user_id = req.cookies.user_id
    const user = await User.findById(user_id)

    const token = new Token({
        token: key,
        userEmail: user.email
    })

    //check if user exists 
    const userExists = await Token.exists({'userEmail': user.email})

    if(!userExists){

        const saveToken = await token.save()
        return res.send("<script>alert('Your access key has been successfully created!'); window.history.back();</script>")

    } 

    const tokens = await Token.find()

    const arr = []

    for (const token of tokens) {
        // Process each token
        // console.log('Token:', token);
        arr.push(token.tokenStatus)
    }

    //check if active token exists
    const check = arr.includes('active');

    if(check){
        res.send("<script>alert('Sorry! You already have an active access key...'); window.history.back();</script>")
    } else {
        const saveToken = await token.save()
        return res.send("<script>alert('Your access key has been successfully created!'); window.history.back();</script>")
    }




    // res.send(check)

}



module.exports = {
    key_gen,

}