const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
// const Listing = require("./models/listing");
const User = require("./models/user");
const reviewRoutes = require("./routes/reviews");
// Middleware + Routes
const { isLoggedIn, isAdmin } = require("./middleware/middleware");
const userRoutes = require("./routes/user");
const adminRoutes = require("./routes/admin");
const listingRoutes = require("./routes/listing");
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

// ================== DATABASE CONNECTION ==================
mongoose.connect(MONGO_URL)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error(" MongoDB Error:", err));

// ================== APP CONFIG ==================
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static("uploads"));

// ================== SESSION + FLASH ==================
const sessionConfig = {
  secret: "mysupersecretkey",
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};
app.use(session(sessionConfig));
app.use(flash());

// ================== PASSPORT CONFIG ==================
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ================== GLOBAL VARIABLES ==================
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

// ================== ROUTES ==================
app.use("/", userRoutes);
app.use("/admin", adminRoutes);
app.use("/listings", listingRoutes);
app.use("/listings/:id/reviews", reviewRoutes);


// ================== LISTING ROUTES ==================
app.get("/", async (req, res) => {
  const featuredListings = await Listing.find({});
  res.render("listings/home.ejs", { featuredListings });
});
// Home Page
app.get("/home", async (req, res) => {
  const featuredListings = await Listing.find({});
  res.render("listings/home.ejs", { featuredListings });
});

// View All Listings
app.get("/listings", async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
});

// Add New Listing (Admin Only)
app.get("/listings/new", isAdmin, (req, res) => {
  res.render("listings/new.ejs");
});

// Create Listing (Admin Only)
app.post("/listings", isAdmin, async (req, res) => {
  const newListing = new Listing(req.body.listing);
  await newListing.save();
  req.flash("success", "New listing added!");
  res.redirect("/listings");
});

// Edit Listing (Admin Only)
app.get("/listings/:id/edit", isAdmin, async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  res.render("listings/edit.ejs", { listing });
});

// Update Listing (Admin Only)
app.put("/listings/:id", isAdmin, async (req, res) => {
  await Listing.findByIdAndUpdate(req.params.id, req.body.listing);
  req.flash("success", "Listing updated successfully!");
  res.redirect(`/listings/${req.params.id}`);
});

// Delete Listing (Admin Only)
app.delete("/listings/:id", isAdmin, async (req, res) => {
  await Listing.findByIdAndDelete(req.params.id);
  req.flash("success", "Listing deleted successfully!");
  res.redirect("/listings");
});

// Show Listing Details
app.get("/listings/:id", async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  res.render("listings/show.ejs", { listing });
});

// ================== SERVER START ==================
app.listen(8080, () => {
  console.log("Server running on port 8080");
});

