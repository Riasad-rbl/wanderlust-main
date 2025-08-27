const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate =require("ejs-mate");


const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine('ejs',ejsMate);
app.use(express.static(path.join(__dirname,"/public")));


// ============ LOGIN ROUTES ============

// Show login form
app.get("/login", (req, res) => {
  res.render("listings/login.ejs"); // <-- your login.ejs file
});

// Handle login
app.post("/login", (req, res) => {
  const { role, userId, password } = req.body;

  // Simple authentication check
  const foundUser = users.find(
    (u) => u.role === role && u.userId === userId && u.password === password
  );

  if (!foundUser) {
    return res.status(401).send("Invalid credentials. Please try again.");
  }

  // Redirect based on role
  if (role === "admin") {
    return res.redirect("/admin/dashboard");
  } else {
    return res.redirect("/user/dashboard");
  }
});

// Admin dashboard
app.get("/admin/dashboard", (req, res) => {
  res.render("listings/adminDashboard.ejs");
});

// User dashboard
app.get("/user/dashboard", (req, res) => {
  res.render("listings/userDashboard.ejs");
});

// ============ LISTING ROUTES ============


app.get("/", async(req, res) => {
  const featuredListings = await Listing.find({}); // Fetch 6 featured listings
  res.render('listings/home.ejs', { featuredListings }); // Render home.ejs with data
});


// Home Page Route
app.get('/home', async (req, res) => {
      const featuredListings = await Listing.find({}); // Fetch 6 featured listings
      res.render('listings/home.ejs', { featuredListings }); // Render home.ejs with data
});

//Index Route
app.get("/listings", async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
});

//New Route
app.get("/listings/new", (req, res) => {
  res.render("listings/new.ejs");
});

//Show Route
app.get("/listings/:id", async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/show.ejs", { listing });
});

//Create Route
app.post("/listings", async (req, res) => {
  const newListing = new Listing(req.body.listing);
  await newListing.save();
  res.redirect("/listings");
});

//Edit Route
app.get("/listings/:id/edit", async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/edit.ejs", { listing });
});

//Update Route
app.put("/listings/:id", async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  res.redirect(`/listings/${id}`);
});

//Delete Route
app.delete("/listings/:id", async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  res.redirect("/listings");
});

// app.get("/testListing", async (req, res) => {
//   let sampleListing = new Listing({
//     title: "My New Villa",
//     description: "By the beach",
//     price: 1200,
//     location: "Calangute, Goa",
//     country: "India",
//   });

//   await sampleListing.save();
//   console.log("sample was saved");
//   res.send("successful testing");
// });

app.listen(8080, () => {
  console.log("server is listening to port 8080");
});

