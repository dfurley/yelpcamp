var express = require("express");
var app = express();

app.set("view engine", "ejs");

app.get("/", function(req, res){
    res.render("landing");
});

app.get("/campgrounds", function(req, res){
    var campgrounds = [
            {name: "Salmon Creek", image: "https://images.pexels.com/photos/699558/pexels-photo-699558.jpeg?h=350&auto=compress&cs=tinysrgb"},
            {name: "Granite Hill", image: "https://images.pexels.com/photos/93858/pexels-photo-93858.jpeg?h=350&auto=compress&cs=tinysrgb"},
            {name: "Tunnel Mountain", image: "https://images.pexels.com/photos/216676/pexels-photo-216676.jpeg?h=350&auto=compress&cs=tinysrgb"},
            {name: "Edale Campground", image: "https://images.pexels.com/photos/618848/pexels-photo-618848.jpeg?h=350&auto=compress&cs=tinysrgb"}
        ]
    res.render("campgrounds",  {campgrounds: campgrounds});
});

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("The YelpCamp Server Has Started!");
});