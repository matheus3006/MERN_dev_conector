const mongoose = require('mongoose');


//create User Schema
const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    //Login made with email not a username.
    email: {
        type: String,
        required: true,
        unique:true
    },

    password: {
        type: String,
        required: true
    },
    
    //Will be used  Gravatar, so that when a user creates a new account it will use the avatar on the user's email.
    avatar:{
        type : String
    },

    date:{
        type: Date,
        default: Date.now
    }

});

module.exports = User = mongoose.model('user', UserSchema);