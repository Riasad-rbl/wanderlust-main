const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Listing = require("../models/listing");
const { isAdmin } = require("../middleware/middleware");

// Admin Dashboard View
router.get("/", isAdmin, (req, res) => {
  res.render("admin/dashboard");
});

// Fetch users
router.get("/api/users", isAdmin, async (req, res) => {
  const search = req.query.search || "";
  const users = await User.find({
    $or: [
      { username: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ],
  });
  res.json(users);
});

// Fetch listings
router.get("/api/listings", isAdmin, async (req, res) => {
  const search = req.query.search || "";
  const listings = await Listing.find({
    title: { $regex: search, $options: "i" },
  });
  res.json(listings);
});

// Delete User
router.delete("/users/:id", isAdmin, async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// Delete Listing
router.delete("/listings/:id", isAdmin, async (req, res) => {
  await Listing.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

module.exports = router;
