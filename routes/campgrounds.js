var express = require("express");
var router  = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware");
var NodeGeocoder = require('node-geocoder');

// multer and cloudinary config for image upload
var multer = require('multer');
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter})

var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: 'dj8ssunns', 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// google maps config 
var options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};
 
var geocoder = NodeGeocoder(options);

//INDEX - show all campgrounds
router.get("/", function(req, res){
    var noMatch = null;
    var search = req.query.search;
    var perPage = 8;
    var pageQuery = parseInt(req.query.page);
    var pageNumber = pageQuery ? pageQuery : 1;
    // if a query exists, search for matches to query
    if(search) {
        // convert the query search into a regular expression
        const regex = new RegExp(escapeRegex(search), 'gi');
        // Find matching campgrounds from DB
        Campground.find({name: regex}).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function(err, allCampgrounds){
            Campground.count({name: regex}).exec(function(err, count){
                if(err){
                   console.log(err);
                   res.redirect('back');
                } else {
                  if(allCampgrounds.length === 0) {
                      noMatch = "No campgrounds match that search."
                  }
                  res.render("campgrounds/index",{
                      campgrounds:allCampgrounds, 
                      noMatch:noMatch, 
                      search:search,
                      pages: Math.ceil(count / perPage),
                      current: pageNumber,
                      page: 'campgrounds'
                      
                  });
                } 
            });
            
        });
    } else {
        search = null;
        // Else, get all campgrounds from DB
        Campground.find({}).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function (err, allCampgrounds) {
            Campground.count().exec(function (err, count) {
                if (err) {
                    console.log(err);
                } else {
                    res.render("campgrounds/index", {
                        campgrounds: allCampgrounds,
                        current: pageNumber,
                        pages: Math.ceil(count / perPage),
                        noMatch: noMatch,
                        search: search
                    });
                }
            });
        });
    }
});

//CREATE - add new campground to DB
router.post("/", middleware.isLoggedIn, upload.single('image'), function(req, res){
  // get data from form and add to campgrounds array
  var name = req.body.name;
  var desc = req.body.description;
  var price = req.body.price
  var author = {
      id: req.user._id,
      username: req.user.username
  }
  geocoder.geocode(req.body.location, function (err, data) {
    if (err || !data.length) {
      req.flash('error', 'Invalid address');
      return res.redirect('back');
    }
    var lat = data[0].latitude;
    var lng = data[0].longitude;
    var location = data[0].formattedAddress;
    cloudinary.uploader.upload(req.file.path, function(result){
        // add cloudinary url for the image to the campground object under the image property
        req.body.image = result.secure_url;
        var image = req.body.image;
        // pass all data about the new campground to a single variable: newCampground
        var newCampground = {
            name: name, 
            price: price, 
            image: image, 
            description: desc, 
            author:author, 
            location: location, 
            lat: lat, 
            lng: lng
        };
        // Create a new campground and save to DB
        Campground.create(newCampground, function(err, newlyCreated){
            if(err){
                req.flash('error', err.message);
                return res.redirect("back");
            } else {
                //redirect back to campgrounds page
                res.redirect("/campgrounds/" + newlyCreated.id);
            }
        });
    });
  });
});

//NEW - show form to create new campground
router.get("/new", middleware.isLoggedIn, function(req, res){
   res.render("campgrounds/new"); 
});

// SHOW - shows more info about one campground
router.get("/:id", function(req, res){
    //find the campground with provided ID
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if(err){
            req.flash("error", err.message);
            res.redirect("/campgrounds");
        } else {
            //render show template with that campground
            res.render("campgrounds/show", {campground: foundCampground});
        }
    });
});

// EDIT CAMPGROUND ROUTE
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res){
    Campground.findById(req.params.id, function(err, foundCampground){
        res.render("campgrounds/edit", {campground: foundCampground});
    });
});

// UPDATE CAMPGROUND ROUTE
// router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
//     // find and update the correct campground
//     Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
//       if(err){
//           req.flash("error", err.message);
//           res.redirect("/campgrounds");
//       } else {
//           //redirect somewhere(show page)
//           req.flash("success","Successfully Updated!");
//           res.redirect("/campgrounds/" + req.params.id);
//       }
//     });
// });

// UPDATE CAMPGROUND ROUTE
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
  var name = req.body.campground.name;
  var image = req.body.campground.image;
  var desc = req.body.campground.description;
  var price = req.body.campground.price;
  geocoder.geocode(req.body.campground.location, function (err, data) {
    if (err || !data.length) {
      req.flash('error', 'Invalid address');
      return res.redirect('back');
    }
    var lat = data[0].latitude;
    var lng = data[0].longitude;
    var location = data[0].formattedAddress;
    var newData = {name: name, price: price, image: image, description: desc, location: location, lat: lat, lng: lng};
    Campground.findByIdAndUpdate(req.params.id, newData, function(err, campground){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            req.flash("success","Successfully Updated!");
            res.redirect("/campgrounds/" + campground._id);
        }
    });
  });
});

// DESTROY CAMPGROUND ROUTE
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
   Campground.findByIdAndRemove(req.params.id, function(err){
      if(err){
          req.flash("error", err.message);
          res.redirect("/campgrounds");
      } else {
          req.flash("success", "Campground successfully deleted.");
          res.redirect("/campgrounds");
      }
   });
});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;