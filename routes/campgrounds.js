var express=require("express");
var router=express.Router();
var Campground=require("../models/campgrounds");
var middleware=require("../middleware/intex");
router.get("/",function(req,res){
   
    //res.render("campgrounds",{campgrounds:campgrounds});
    Campground.find({},function(err,allcampgrounds){
    if(err)
    {
        console.log("Error "+err);
    
    }
    else{
        res.render("campgrounds/intex",{campgrounds:allcampgrounds,currentUser:req.user});
    }
    })
        
    });
    router.get("/new",middleware.isLoggedin,function(req,res){
        res.render("campgrounds/new");
    });
    router.get("/:id",function(req,res){
        Campground.findById(req.params.id).populate("comments").exec(function(err,foundCampground){
            if(err)
            {
                console.log(err);
            }
            else{
                //console.log(foundCampground)
                res.render("campgrounds/show",{campground:foundCampground});
            }
        });
    
        
    });
     
    router.post("/",middleware.isLoggedin,function(req,res){
        var name=req.body.name;
        var image=req.body.image;
        var des=req.body.description;
        var price=req.body.price;
        var author={
            id:req.user._id,
            username:req.user.username
        }
        var nc={name:name,image:image,description:des,author:author,price:price};
        Campground.create(nc,function(err,ncampground){
            if(err)
            {
                console.log("error");
            
            }
            else
            {
                console.log(ncampground);
                res.redirect("/campgrounds");
            }
        });
    
        
        
    });

router.get("/:id/edit",middleware.checkCampgroundOwnership,function(req,res){
    Campground.findById(req.params.id,function(err,found){
       
            res.render("campgrounds/edit",{campground:found});
        

    });

});
router.put("/:id",middleware.checkCampgroundOwnership,function(req,res){
    
Campground.findByIdAndUpdate(req.params.id,req.body.campground,function(err,updated){
    if(err)
    res.redirect("/campgrounds");
    else{
        res.redirect("/campgrounds/"+req.params.id);
    }
})
});

router.delete("/:id",middleware.checkCampgroundOwnership,function(req,res){
Campground.findByIdAndRemove(req.params.id,function(err){
    if(err)
    res.redirect("/campgrounds");
    else
    res.redirect("/campgrounds");
});
});



   
    module.exports=router;