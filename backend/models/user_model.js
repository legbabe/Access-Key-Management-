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
        required: [true, "Please enter a password"],
        minlength: [6, "Minimum password length is 6 characters"]
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

// userSchema.pre('save', async function (next) {
//     const salt = await bcrypt.genSalt();
//     this.password = await bcrypt.hash(this.password, salt)
//     next();
// })

//method to login user
userSchema.statics.login = async function (email, password){
    const user = await this.findOne({email, emailVerified: true});
    // console.log(password, user.password)
    // console.log(user)
    try {
        if (!user) {
          throw new Error('User not found');
        }
    
        const auth = await bcrypt.compare(password, user.password);
        if (auth) {
          return user;
        } 
        throw new Error('Incorrect password!');
      } catch (error) {
        console.error(error);
        throw error;
      }

        
}

const User = mongoose.model('user', userSchema);

module.exports = User;