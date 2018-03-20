// Required packages etc.
var express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    passport = require("passport"),
    LocalStrategy = require("passport-local"),
    Campground = require("./models/campground"),
    Comment = require("./models/comment"),
    User = require("./models/user"),
    seedDB = require("./seeds")

// Database set up etc.
mongoose.connect("mongodb://localhost/yelp_camp");
app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
seedDB();

// Passport config
app.use(require("express-session")({
    secret: "A surprise to be sure, but a welcome one",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// middleware to pass user data to every template
app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   next();
});

// ================
// Routes
// ================

// Landing page
app.get("/", function(req, res){
    res.render("landing");
});

// ==================
// Campground Routes
// ==================

// INDEX - show all campgrounds
app.get("/campgrounds", function(req, res){
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
app.get("/campgrounds/new", function(req, res){
   res.render("campgrounds/new"); 
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
   Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
      if(err){
          console.log(err);
      } else {
          // show all info about the campground  
          res.render("campgrounds/show", {campground: foundCampground});
      }
   });
});

// =================
// COMMENT ROUTES
// =================

// NEW
app.get("/campgrounds/:id/comments/new", isLoggedIn, function(req, res){
   // find campground by id
   Campground.findById(req.params.id, function(err, campground){
      if(err){
          console.log(err);
      } else {
          res.render("comments/new", {campground: campground});
      }
   });
});

// CREATE
app.post("/campgrounds/:id/comments", isLoggedIn, function(req, res){
    //lookup campground using id
    Campground.findById(req.params.id, function(err, campground){
        if(err){
            console.log(err);
            res.redirect("/campgrounds")
        } else {
            //create new comment
            Comment.create(req.body.comment, function(err, comment){
                if(err){
                    console.log(err);
                } else {
                    //connect new comment to campground
                    campground.comments.push(comment);
                    campground.save();
                    //redirect campground show page
                    res.redirect('/campgrounds/' + campground._id);
                }
            });
        }
    });
});

// ==================
// Auth Routes
// ==================

// SHOW
app.get("/register", function(req, res){
    res.render("auth/register")
});

// handle sign up logic
app.post("/register", function(req, res){
    // create new user and save to newUser variable
    var newUser = new User({username: req.body.username});
    // pass newUser and password to passport, if error redirect back to register, else save user to db and redirect to campgrounds page
    User.register(newUser, req.body.password, function(err, user){
       if(err){
           console.log(err);
           return res.render("register")
       }
       passport.authenticate("local")(req, res, function(){
           res.redirect("/campgrounds");
       });
    });
});

// show login form
app.get("/login", function(req, res){
    res.render("auth/login");
});
// handling login logic - using passport.authenticate middleware
app.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/campgrounds",
        failureRedirect: "/login"
    }), function(req, res){
});

// logout logic
app.get("/logout", function(req, res){
    req.logout();
    res.redirect("/");
});

// middleware to check is user is logged in 
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

// Launch server
app.listen(process.env.PORT, process.env.IP, function(){
    console.log("The YelpCamp Server Has Started!");
});