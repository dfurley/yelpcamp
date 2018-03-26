var express = require("express");
var router  = express.Router();
var passport = require("passport");
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var User = require("../models/user");
var middleware = require("../middleware");

// ==============
// User routes
// ==============

// handle sign up logic - Create a new user
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

// user profile route - SHOW
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

// user edit form - EDIT
router.get("/users/:id/edit", middleware.checkCurrentUser, function(req, res){
    User.findById(req.params.id, function(err, foundUser){
        res.render("users/edit", {user: foundUser});
    });
});

// update user profile - UPDATE
router.put("/users/:id", middleware.checkCurrentUser, function(req, res){
   var newData = {
       firstName: req.body.firstName,
       lastName: req.body.lastName, 
       email: req.body.email, 
       avatar: req.body.avatar
   };
   User.findByIdAndUpdate(req.params.id, newData, function(err, user){
       if(err){
            req.flash("error", "Something went wrong");
            res.redirect("back");
       } else {
            req.flash("success","Successfully Updated!");
            res.redirect("/users/" + user._id);
       }
   });
});

// delete user form - GET
router.get("/users/:id/delete", middleware.checkCurrentUser, function(req, res){
    User.findById(req.params.id, function(err, foundUser){
        res.render("users/delete", {user: foundUser});
    });
});

// delete user - DESTROY
router.delete("/users/:id", middleware.checkCurrentUser, function(req, res){
   User.findByIdAndRemove(req.params.id, function(err){
      if(err){
          req.flash("error", err.message);
          res.redirect("/campgrounds");
      } else {
          req.flash("success", "Sad to see you go.");
          res.redirect("/campgrounds");
      }
   });
});

module.exports = router;