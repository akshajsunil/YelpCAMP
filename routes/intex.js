var express=require("express");
var router=express.Router();
var passport=require("passport");
var User=require("../models/user");


router.get("/",function(req,res){
	res.render("landing");
});



//Auth
router.get("/register",function(req,res){
	res.render("register");
});

router.post("/register",function(req,res){

	var newUser=new User({username:req.body.username});
	User.register(newUser,req.body.password,function(err,User){
		if(err)
		{ req.flash("error",err.message);
		console.log(err);
		return res.redirect("/register");
		}
		passport.authenticate("local")(req,res,function(){
			req.flash("success","welcome "+req.user.username);
			res.redirect("/campgrounds");
		});
	});
});

//login
router.get("/login",function(req,res){

	res.render("login");
});
router.post("/login",passport.authenticate("local",{
successRedirect:"/campgrounds",
failureRedirect:"/login"	
}),function(req,res){


});
router.get("/logout",function(req,res){
req.logout();
req.flash("success","You logged out")
res.redirect("/campgrounds");
});
module.exports=router;