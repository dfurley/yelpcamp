var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");
var Campground = require("../models/campground");

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
    res.render("auth/register", {page: 'register'});
});

// Sign up logic moved to users.js

// show login form
router.get("/login", function(req, res){
    res.render("auth/login", {page: 'login'});
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
    req.flash("success", "See you later!");
    res.redirect("/campgrounds");
});

module.exports = router;