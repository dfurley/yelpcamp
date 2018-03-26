// All middleware lives here
var middlewareObj = {};
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var User = require("../models/user");

middlewareObj.checkCampgroundOwnership = function(req, res, next){
    //  is user logged in?
    if(req.isAuthenticated()){
        Campground.findById(req.params.id, function(err, foundCampground){
            if(err){
                req.flash("error", "Campground not found");
                res.redirect("back");
            } else {
                // does user own campground
                if(foundCampground.author.id.equals(req.user._id) || req.user.isAdmin){
                    next();
                } else {
                    req.flash("error", "You do not have permission to do that!");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "You must be logged in to do that!");
        res.redirect("back");
    }
}

middlewareObj.checkCommentOwnership = function(req, res, next){
    //  is user logged in?
    if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id, function(err, foundComment){
            if(err){
                req.flash("error", "Comment not found");
                res.redirect("back");
            } else {
                // does user own comment
                if(foundComment.author.id.equals(req.user._id) || req.user.isAdmin){
                    next();
                } else {
                    req.flash("error", "You do not have permission to do that!");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "You must be logged in to do that!");
        res.redirect("back");
    }
}

middlewareObj.checkCurrentUser = function(req, res, next){
    //  is user logged in?
    if(req.isAuthenticated()){
        User.findById(req.params.id, function(err, user){
            if(err){
                req.flash("error", err.message);
                res.redirect("back");
            } else {
                // does user own comment
                if(user._id.equals(req.user._id) || req.user.isAdmin){
                    next();
                } else {
                    req.flash("error", "You do not have permission to do that!");
                    res.redirect("/campgrounds");
                }
            }
        });
    } else {
        req.flash("error", "You must be logged in to do that!");
        res.redirect("back");
    }
}

middlewareObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "You must be logged in to do that!");
    res.redirect("/login");
}


module.exports = middlewareObj;