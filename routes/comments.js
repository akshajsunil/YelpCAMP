var express=require("express");
var router=express.Router({mergeParams:true});
var Campground=require("../models/campgrounds");
var Comment=require("../models/comment");
var middleware=require("../middleware/intex");
//COMMENTS
router.get("/new",middleware.isLoggedin,function(req,res){
	Campground.findById(req.params.id,function(err,campground){
		if(err)
		console.log(err);
		else
		{
		res.render("comments/new",{campground :campground});
		}

	});
	
});
router.post("/",middleware.isLoggedin,function(req,res){
Campground.findById(req.params.id,function(err,campground){
if(err)
{
	console.log(err);
	res.redirect("/campgrounds");
}
else
{
	Comment.create(req.body.comment,function(err,comment){
		if(err)
		{
			console.log(err);
		}
		else{
            comment.author.id=req.user._id;
            comment.author.username=req.user.username;
            comment.save();
			console.log(comment);
			console.log(req.body.comment);
			campground.comments.push(comment);
			campground.save();
			req.flash("sucess","You added a comment successfully..");
			res.redirect("/campgrounds/"+campground._id);
		}
	});
}
});
});
router.get("/:comment_id/edit",middleware.checkCommentOwnership,function(req,res){
	Comment.findById(req.params.comment_id,function(err,foundComment){
			if(err)
			{
				res.redirect("back");
			}
			else{
				res.render("comments/edit",{campground_id:req.params.id,comment:foundComment});
			}
	});
	
	
});
router.put("/:comment_id",middleware.checkCommentOwnership,function(req,res){
Comment.findByIdAndUpdate(req.params.comment_id,req.body.comment,function(err,updatedComment){
	if(err)
	res.redirect("back");
	else
	res.redirect("/campgrounds/"+req.params.id);
});
});

router.delete("/:comment_id",middleware.checkCommentOwnership,function(req,res){

Comment.findByIdAndRemove(req.params.comment_id,function(err){
	if(err)
	res.redirect("back");
	else{
		req.flash("success","You need to log in to do that");
		res.redirect("/campgrounds/"+req.params.id);
	}
});


});






module.exports=router;