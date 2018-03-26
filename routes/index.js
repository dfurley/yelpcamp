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

// handle sign up logic
router.post("/register", function(req, res){
    // create new user and save to newUser variable
    var newUser = new User({
        username: req.body.username,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        avatar: req.body.avatar
    });
    // check if admin code is correct, if true, make new user an admin
    if(req.body.adminCode === '5555') {
        newUser.isAdmin = true;
    }
    // pass newUser and password to passport, if error redirect back to register, else save user to db and redirect to campgrounds page
    User.register(newUser, req.body.password, function(err, user){
       if(err){
           console.log(err);
           return res.render("auth/register", {error: err.message});
       }
       passport.authenticate("local")(req, res, function(){
           req.flash("success", "Welcome to YelpCamp " + user.username);
           res.redirect("/campgrounds");
       });
    });
});

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

// user profile route
router.get("/users/:id", function(req, res){
   User.findById(req.params.id, function(err, foundUser){
      if(err){
          req.flash("error", "Something went wrong");
          res.redirect("/campgrounds");
      } 
      Campground.find().where('author.id').equals(foundUser._id).exec(function(err, campgrounds){
          if(err){
              req.flash("error", "Something went wrong");
              res.redirect("/campgrounds");
          }
          res.render("users/show", {user: foundUser, campgrounds: campgrounds});
      });
   }); 
});


module.exports = router;