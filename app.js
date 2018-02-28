var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");

mongoose.connect("mongodb://localhost/yelp_camp");
app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine", "ejs");

// SCHEMA SETUP
var campgroundSchema = new mongoose.Schema({
    name: String,
    image: String,
    description: String
});

var Campground = mongoose.model("Campground", campgroundSchema);

// TEMPORARY

// Campground.create(
//     {
//         name: "Tunnel Mountain", 
//         image: "https://images.pexels.com/photos/216676/pexels-photo-216676.jpeg?h=350&auto=compress&cs=tinysrgb",
//         description: "Sitting above Banff town on tunnel mountain, this campground offers RV hookups, firepits, and running water."
        
//     }, function(err, campground) {
//         if(err) {
//             console.log(err);
//         } else {
//             console.log("NEW CAMPGROUND CREATED: ");
//             console.log(campground);
//         }
//     });

app.get("/", function(req, res){
    res.render("landing");
});

// INDEX - show all campgrounds
app.get("/campgrounds", function(req, res){
    // Get all campgrounds from DB
    Campground.find({}, function(err, allCampgrounds){
       if(err){
           console.log(err);
       } else {
           res.render("index",  {campgrounds: allCampgrounds});
       }
    });
});

// NEW - show form to create new campground
app.get("/campgrounds/new", function(req, res){
   res.render("new"); 
});

// CREATE - add new campground to database
app.post("/campgrounds", function(req, res){
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
app.get("/campgrounds/:id", function(req, res){
   // find campground with given id
   Campground.findById(req.params.id, function(err, foundCampground){
      if(err){
          console.log(err);
      } else {
          // show all info about the campground  
          res.render("show", {campground: foundCampground});
      }
   });
});

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("The YelpCamp Server Has Started!");
});