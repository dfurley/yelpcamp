var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");

// ================
// Other Routes
// ================

// Landing page
router.get("/", function(req, res){
    res.render("landing");
});


// ==================
// Auth Routes
// ==================

// SHOW
router.get("/register", function(req, res){
    res.render("auth/register")
});

// handle sign up logic
router.post("/register", function(req, res){
    // create new user and save to newUser variable
    var newUser = new User({username: req.body.username});
    // pass newUser and password to passport, if error redirect back to register, else save user to db and redirect to campgrounds page
    User.register(newUser, req.body.password, function(err, user){
       if(err){
           console.log(err);
           return res.render("register")
       }
       passport.authenticate("local")(req, res, function(){
           res.redirect("/campgrounds");
       });
    });
});

// show login form
router.get("/login", function(req, res){
    res.render("auth/login");
});
// handling login logic - using passport.authenticate middleware
router.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/campgrounds",
        failureRedirect: "/login"
    }), function(req, res){
});

// logout logic
router.get("/logout", function(req, res){
    req.logout();
    res.redirect("/");
});

// middleware to check is user is logged in 
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

module.exports = router