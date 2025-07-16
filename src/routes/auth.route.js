const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");


const router = express.Router();

router.get("/login", (req, res) => {
  res.render("login", { user: req.user });
});

router.get("/logout", (req, res) => {
  res.send("logging out");
  res.redirect("/");
});

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

router.get(
  "/google/redirect",
  passport.authenticate("google", {
    failureRedirect: "/login",
  }),
  (req, res) => {
    

    res.redirect("/dashbroad"); 
  }
);



module.exports = router;
