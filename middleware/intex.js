var middlewareObj={};
var Campground=require("../models/campgrounds");
var Comment=require("../models/comment");
middlewareObj.checkCampgroundOwnership = function(req,res,next){
    if(req.isAuthenticated()){
        Campground.findById(req.params.id,function(err,found){
            if(err)
            {
                req.flash("error","Campground not found");
                res.redirect("back");
            }
            else{
                if(found.author.id.equals(req.user._id))
                {
                    next();
                }
                else{
                    req.flash("error","Hold your horses , you are not allowed to go there..");
                    res.redirect("back");
                }
            }
        });
    }
    else{
        req.flash("error","You need to log in to do that");
        res.redirect("back");
    }
}

middlewareObj.checkCommentOwnership=function (req,res,next){
    if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id,function(err,found){
            if(err)
            {
                res.redirect("back");
            }
            else{
                if(found.author.id.equals(req.user._id))
                {
                    next();
                }
                else{
                    req.flash("error","You cannot do that! Be more ,you know more something?");
                    res.redirect("back");
                }
            }
        });
    }
    else{
        req.flash("error","You need to log in to do that");
        res.redirect("back");
    }
}
middlewareObj.isLoggedin= function(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
   req.flash("error","You need to log in to do that");
    res.redirect("/login");
}
module.exports=middlewareObj;