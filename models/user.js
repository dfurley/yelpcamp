var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    avatar: {type: String, default: 's3.amazonaws.com/37assets/svn/765-default-avatar.png'},
    firstName: String,
    lastName: String,
    email: String,
    isAdmin: {type: Boolean, default: false}
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);