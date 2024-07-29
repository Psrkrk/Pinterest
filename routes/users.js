const mongoose = require('mongoose');
const plm = require('passport-local-mongoose');


mongoose.connect("mongodb://127.0.0.1:27017/application");


// Define user schema
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,

    },
    posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    }],
    dp: {
        type: String,
        default: 'default.jpg' // Assuming default image path
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    fullname: {
        type: String,
        required: true
    }
});

userSchema.plugin(plm)
module.exports = mongoose.model('User', userSchema);