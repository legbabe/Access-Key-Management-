const mongoose = require('mongoose')
const User = require("../models/user_model")
const Token = require("../models/token_model")
const crypto = require("crypto")


//key genetation 
const key_gen = async (req, res) => {
    const keyGeneration = () => {
        const buffer = crypto.randomBytes(8)

    return buffer.toString('hex')
    }
    const key = keyGeneration()


    //finding user
    const user_id = req.cookies.user_id
    const user = await User.findById(user_id)
    // console.log(user.email)

    const token = new Token({
        token: key,
        userEmail: user.email
    })

    //check if user exists 
    const userExists = await Token.exists({'userEmail': user.email})

    if(!userExists){

        const saveToken = await token.save()
        return res.send("<script>alert('Your access key has been successfully created!'); location.replace('/personnel'); </script>")
        } 

    const tokens = await Token.find({userEmail:user.email})
        console.log(tokens)
    const arr = []

    for (const token of tokens) {
        // Process each token
        // console.log('Token:', token);
        // console.log(token)
        arr.push(token.tokenStatus)
    }

    //check if active token exists
    const check = arr.includes('active');

    if(check){
        res.send("<script>alert('Sorry! You already have an active access key...'); location.replace('/personnel');</script>")
    } else {
        const saveToken = await token.save()
        return res.send("<script>alert('Your access key has been successfully created!'); location.replace('/personnel');</script>")
    }
}

const revoke_key = async (req, res) => {
    const keyId = req.body.id;
    console.log(req.body.id)
    try {
        const result = await Token.updateOne({ _id: keyId }, { $set: { tokenStatus: 'revoked' } });
        if (result.modifiedCount > 0) {
            return res.send(`<script>alert('Access key successfully revoked!'); location.replace('/dashboard');</script>`)
        } else {
            return res.send(`<script>alert('Error revoking access key! \nPlease try again later.'); location.replace('/dashboard');</script>`)   
        }
    } catch (error) {
        console.error(error);
        res.json({ success: false });
    }
};

const getActiveKey = async (req, res) => {
    const userEmail = req.params.userEmail
    const keys = await Token.findOne({userEmail, tokenStatus: 'active'})
    // console.log(keys)
    if(keys){
        console.log(keys)
        res.status(200).json({
            Key: keys.token, 
            'Procurement Date': keys.proc_date,
            'Expiry Date': keys.expiryDate,
        })
    } else {
        res.status(404).json({Error: 'No active key found!' })
    }

}

module.exports = {
    key_gen,
    revoke_key,
    getActiveKey
}