//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require ("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');
const FacebookStrategy = require("passport-facebook").Strategy;

//const multer = require('multer');
//const fs = require('fs');

//var title;
//const upload = multer({
  //  dest: 'uploads/'
//})

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

app.use(session({
  secret: "Our little secret.",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb+srv://admin-daremberg_15:adesoga15@cluster0-tmy4o.mongodb.net/laydeekissDB", {useNewUrlParser: true, useUnifiedTopology: true,});
mongoose.set("useCreateIndex", true);


const userSchema = new mongoose.Schema ({

 fName: String,
   lName: String,
   username: String,
   pNUMBER: String,
     password: String,
     googleId: String,
     secret: String,
     facebookId:String,
     secret:String


});

const contactSchema = new mongoose.Schema ({
  fname: String,
  lname: String,
  email: String,
  phone: String,
    postBody: String
});

const postSchema = new mongoose.Schema({
  _id: String,
   img:{
       data: Buffer,
       contentType: String
   },
   productdisc: String,
   productName: String,
   productDescription:String,
   category: String,
    price1: String,
    price2: String,
    pieces: String,


});

const Post =new mongoose.model("Post", postSchema);

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);


const User =new mongoose.model("User", userSchema);
const Contact =new mongoose.model("Contact", contactSchema);

passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:4000/auth/google/balqis",
  //  userProfileURL: "http://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log(profile);
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));

passport.use(new FacebookStrategy({
    clientID:process.env.APP_ID,
    clientSecret: process.env.APP_SECRET,
    callbackURL: "http://localhost:4000/auth/facebook/balqis"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ facebookId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));
app.get("/", function(req, res){
  res.render("home");
});

app.get('/auth/google',
  passport.authenticate('google', { scope: ["profile"]})
);

app.get('/auth/google/balqis',
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect to secrets.
    res.redirect('/');
  });

  app.get('/auth/facebook',
    passport.authenticate('facebook', {scope: ["profile"]})
  );

  app.get('/auth/facebook/balqis',
    passport.authenticate('facebook', { failureRedirect: '/login' }),
    function(req, res) {
      // Successful authentication, redirect home.
      res.redirect('/');
    });

app.get("/login", function(req, res){
  res.render("login");
});
app.get("/register", function(req, res){
  res.render("register");
});
app.get("/contact", function(req, res){
  res.render("contact");
});
app.get("/help", function(req, res){
  res.render("help");
});
app.get("/cart", function(req, res){
  res.render("cart");
});
app.get("/forget", function(req, res){
  res.render("forget");
});
app.get("/post", function(req, res){
  res.render("post");
});

app.get("/compose", function(req, res) {
    res.render("compose");
})

app.post("/register", function(req, res){
  User.register(({fName: req.body.fName, lName: req.body.lName, username: req.body.username, pNUMBER: req.body.pNUMBER}),
  req.body.password, function(err, user){

if (err) {
  console.log(err);
   res.redirect("/register");
  } else {
   passport.authenticate("local")(req, res, function(){
     res.redirect("/login");
    });
  }
});
  });

  app.post("/login", function(req, res){
  const user = new User({
    username: req.body.username,
    password: req.body.password
  });

  req.login(user, function(err){
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function(){
        res.redirect("/")
      });
    }
  });

  });



app.post("/contact", function(req, res){
    const contact = new Contact({

      fname: req.body.fname,
      lname: req.body.lname,
      email: req.body.email,
      phone: req.body.phone,
        postBody: req.body.postBody
                });
    contact.save(function(err){
      if (!err){
          res.redirect("/");
      }
    });
  });

  let port = process.env.PORT;
  if (port == null || port == "") {
    port = 4000;
  }

  app.listen(port, function() {
    console.log("Server has started successfully");
  });
