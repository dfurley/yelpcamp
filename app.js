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
    image: String
});

var Campground = mongoose.model("Campground", campgroundSchema);

// TEMPORARY

// Campground.create(
//     {
//         name: "Tunnel Mountain", 
//         image: "https://images.pexels.com/photos/216676/pexels-photo-216676.jpeg?h=350&auto=compress&cs=tinysrgb"
        
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

app.get("/campgrounds", function(req, res){
    // Get all campgrounds from DB
    Campground.find({}, function(err, allCampgrounds){
       if(err){
           console.log(err);
       } else {
           res.render("campgrounds",  {campgrounds: allCampgrounds});
       }
    });
});

app.get("/campgrounds/new", function(req, res){
   res.render("new.ejs"); 
});

app.post("/campgrounds", function(req, res){
    var name = req.body.name;
    var image = req.body.image;
    var newCampground = {name:name, image:image};
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

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("The YelpCamp Server Has Started!");
});