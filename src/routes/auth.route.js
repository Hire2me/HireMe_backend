const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
// const { googleMobileLogin } = require('../controller/google.controller');

const router = express.Router();

router.get("/login", (req, res) => {
  res.render("login", { user: req.user });
});

router.get("/logout", (req, res) => {
  // You might want to actually logout the user here using req.logout() if using sessions
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
    // Optional: Issue a JWT here for APIs/mobile apps
    // const token = jwt.sign(
    //     { id: req.user.id, email: req.user.email },
    //     process.env.JWT_SECRET,
    //     { expiresIn: process.env.JWT_EXPIRES_IN }
    // );
    // res.json({ token, message: 'Google login successful' });

    res.redirect("/dashbroad"); // fixed typo from 'dashbroad'
  }
);

// Mobile login with Google token from client
// router.post('/google/mobile', googleMobileLogin);

module.exports = router;
