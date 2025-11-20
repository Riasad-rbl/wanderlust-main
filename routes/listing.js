const express = require("express");
const router = express.Router();
const multer = require("multer");
const Listing = require("../models/listing");
const { isLoggedIn, isAdmin } = require("../middleware/middleware");



// Where to store uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // create uploads folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

//................................................



// =====================
// SHOW ALL LISTINGS
// =====================
router.get("/", async (req, res) => {
  const listings = await Listing.find({}).populate("reviews");

  // Calculate average rating for each listing
  listings.forEach(listing => {
    if (listing.reviews.length > 0) {
      const avg = listing.reviews.reduce((sum, r) => sum + r.rating, 0) / listing.reviews.length;
      listing.averageRating = avg.toFixed(1);
    } else {
      listing.averageRating = 0;
    }
  });

  res.render("listings/index", { allListings: listings });
});

// =====================
// NEW LISTING FORM (ADMIN ONLY)
// =====================
router.get("/new", isAdmin, (req, res) => {
  res.render("listings/new.ejs");
});

// =====================
// CREATE LISTING
// =====================
// router.post("/", isAdmin, async (req, res) => {
//   const newListing = new Listing(req.body.listing);
//   await newListing.save();
//   req.flash("success", "New listing added!");
//   res.redirect("/listings");
// });
router.post("/", isAdmin, upload.single("listing[image]"), async (req, res) => {
  try {
    const listingData = req.body.listing;

    // Add image path from multer
    if (req.file) {
      listingData.image = `/uploads/${req.file.filename}`;
    }

    const newListing = new Listing(listingData);
    await newListing.save();

    req.flash("success", "New listing added!");
    res.redirect("/listings");
  } catch (e) {
    console.log(e);
    req.flash("error", "Failed to create listing!");
    res.redirect("/listings/new");
  }
});

// =====================
// EDIT LISTING
// =====================
router.get("/:id/edit", isAdmin, async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }

  res.render("listings/edit.ejs", { listing });
});

// =====================
// UPDATE LISTING
// =====================
// router.put("/:id", isAdmin, async (req, res) => {
//   const { id } = req.params;
//   await Listing.findByIdAndUpdate(id, req.body.listing);
//   req.flash("success", "Listing updated!");
//   res.redirect(`/listings/${id}`);
// });
router.put("/:id", isAdmin, upload.single("newImage"), async (req, res) => {
  const { id } = req.params;

  const updatedData = req.body.listing;

  // If new image uploaded, use it — otherwise keep old one
  if (req.file) {
    updatedData.image = `/uploads/${req.file.filename}`;
  } else {
    updatedData.image = req.body.existingImage;
  }

  await Listing.findByIdAndUpdate(id, updatedData);

  req.flash("success", "Listing updated!");
  res.redirect(`/listings/${id}`);
});

// =====================
// DELETE LISTING
// =====================
router.delete("/:id", isAdmin, async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing deleted!");
  res.redirect("/listings");
});

// =====================
// SHOW SINGLE LISTING
// =====================
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  const listing = await Listing.findById(id).populate({
    path: "reviews",
    populate: { path: "author" }
  });

  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }

  res.render("listings/show", { listing });
});




module.exports = router;
