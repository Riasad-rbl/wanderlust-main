const express = require("express");
const router = express.Router();
const User = require("../models/user");
const passport = require("passport");

// ===== REGISTER =====
router.get("/register", (req, res) => {
  res.render("users/register");
});

router.post("/register", async (req, res, next) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      req.flash("error", "Passwords do not match!");
      return res.redirect("/register");
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      req.flash("error", "Username already taken!");
      return res.redirect("/register");
    }

    const newUser = new User({ username, email });
    const registeredUser = await User.register(newUser, password);

    req.login(registeredUser, (err) => {
      if (err) return next(err);
      req.flash("success", "Welcome to Wanderlust!");
      res.redirect("/listings");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/register");
  }
});

// ===== LOGIN =====
router.get("/login", (req, res) => {
  res.render("users/login");
});

router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  (req, res) => {
    req.flash("success", "Welcome back!");
    res.redirect("/listings");
  }
);

// ===== LOGOUT =====
router.get("/logout", (req, res, next) => {
  req.logout(function (err) {
    if (err) return next(err);
    req.flash("success", "You have logged out successfully!");
    res.redirect("/listings");
  });
});

module.exports = router;
