const mongoose = require('mongoose');
const {isEmail} = require('validator');
const bcrypt = require('bcrypt')
const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        required: [true, "Please enter an email address"],
        unique: true,
        lowercase: true,
        validate: [isEmail, "Please enter a valid email address"]
    },
    password: {
        type: String,
        required: [true, "Please enter a password"]
    },

    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user'
    },

    emailVerified: {
        type: Boolean, 
        default: false
    },
    passwordResetToken: {type: String},
    passwordResetExpires: {type: Date}
    
}, {timestamps: true});


//method to login user
userSchema.statics.login = async function (email, password){
    const user = await this.findOne({email, emailVerified: true});
    
    if (!user) {
      throw Error('Incorrect email');
        }
    else{
      const auth = await bcrypt.compare(password, user.password);
      if (auth) {
        return user;
      } 
      throw Error('Incorrect password');
    }
}

const User = mongoose.model('user', userSchema);

module.exports = User;