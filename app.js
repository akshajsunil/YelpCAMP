//YELP CAMP
var express=require("express");
var app=express();
var bodyParser=require("body-parser");
var mongoose=require("mongoose");
var passport=require("passport");
var LocalStratergy=require("passport-local");
var methodOverride=require("method-override");
var flash=require("connect-flash");

var Campground=require("./models/campgrounds");
var Comment=require("./models/comment");
var seedDB=require("./seed");
//seedDB();

var commentRoutes=require("./routes/comments");
var campgroundRoutes=require("./routes/campgrounds");
var intexRoutes=require("./routes/intex");

var User=require("./models/user");
app.use(express.static(__dirname+"/public"));
mongoose.connect("mongodb://localhost:27017/yelpcamp", {useNewUrlParser: true,useUnifiedTopology: true});
app.use(flash());




app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine","ejs");
app.use(express.static(__dirname+"/public"));
app.use(methodOverride("_method"));
app.use(require("express-session")({
	secret:"akshaj sksksksksknjkdsbcjkbjkdcnkscksdnc sfsdfsdf",
	resave:false,
	saveUninitialized:false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStratergy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req,res,next){
	res.locals.currentUser=req.user;
	res.locals.error=req.flash("error");
	res.locals.success=req.flash("success");
	next();
});


app.use(intexRoutes);
app.use("/campgrounds",campgroundRoutes);
app.use("/campgrounds/:id/comments",commentRoutes);
app.listen(3001,function(){
	console.log("Yelpcamp server has started at 3001!");
});