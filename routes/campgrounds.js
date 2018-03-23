var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
// for middleware, if just directory required, index.js automatically required
var middleware = require("../middleware");

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

// CREATE - add new campground to database
router.post("/", middleware.isLoggedIn ,function(req, res){
    var name = req.body.name;
    var image = req.body.image;
    var description = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    var newCampground = {name:name, image:image, description:description, author:author};
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

// NEW - show form to create new campground
router.get("/new", middleware.isLoggedIn, function(req, res){
   res.render("campgrounds/new"); 
});

// EDIT - show form to edit an individual campground
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res){
    Campground.findById(req.params.id, function(err, foundCampground){
        res.render("campgrounds/edit", {campground: foundCampground});
    });
});

// UPDATE - apply updated information
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
    //find and update correct campground
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
       if(err){
           res.redirect("/campgrounds");
       } else {
           res.redirect("/campgrounds/" + req.params.id);
       }
    });
    // redirect to show page
});

// DESTROY - delete campground from the system
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
   Campground.findByIdAndRemove(req.params.id, function(err){
       if(err){
           res.redirect("/campgrounds");
       } else {
           req.flash("success", "Campground successfully deleted.");
           res.redirect("/campgrounds");
       }
   }) ;
});

module.exports = router;