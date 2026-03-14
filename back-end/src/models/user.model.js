const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        require: true,
        unique: [true, "Username already exists"],
    },
    email: {
        type: String,
        require: true,
        unique: [true, "Email already exists"],
    },
    password: {
        type: String,
        require: true,
    }
})

const userModel = mongoose.model("users", userSchema);

module.exports = userModel;