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
    res.render("auth/register");
});

// handle sign up logic
router.post("/register", function(req, res){
    // create new user and save to newUser variable
    var newUser = new User({username: req.body.username});
    // pass newUser and password to passport, if error redirect back to register, else save user to db and redirect to campgrounds page
    User.register(newUser, req.body.password, function(err, user){
       if(err){
           req.flash("error", err.message);
           console.log(err);
           return res.redirect("/register");
       }
       passport.authenticate("local")(req, res, function(){
           req.flash("success", "Welcome to YelpCamp" + user.username);
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
    req.flash("success", "Successfully logged out!");
    res.redirect("/campgrounds");
});


module.exports = router;