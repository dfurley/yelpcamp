var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");

// ==================
// Campground Routes
// ==================

// INDEX - show all campgrounds
router.get("/", function(req, res){
    // Get all campgrounds from DB
    Campground.find({}, function(err, allCampgrounds){
       if(err){
           console.log(err);
       } else {
           res.render("campgrounds/index",  {campgrounds: allCampgrounds, currentUser: req.user});
       }
    });
});

// NEW - show form to create new campground
router.get("/new", function(req, res){
   res.render("campgrounds/new"); 
});

// CREATE - add new campground to database
router.post("/", function(req, res){
    var name = req.body.name;
    var image = req.body.image;
    var description = req.body.description;
    var newCampground = {name:name, image:image, description:description};
    // create new campground and save to database
    Campground.create(newCampground, function(err, newlyCreated){
       if(err){
           console.log(err);
       } else {
           // redirect back to campgrounds page
           res.redirect("/campgrounds");
       }
    });
});

// SHOW - shows more info about one campground
router.get("/:id", function(req, res){
   // find campground with given id
   Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
      if(err){
          console.log(err);
      } else {
          // show all info about the campground  
          res.render("campgrounds/show", {campground: foundCampground});
      }
   });
});

// middleware to check is user is logged in 
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

module.exports = router;