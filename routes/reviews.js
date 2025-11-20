const express = require("express");
const router = express.Router({ mergeParams: true });

const Listing = require("../models/listing");
const Review = require("../models/review");
const { isLoggedIn } = require("../middleware/middleware");

// ===============================
// CREATE A REVIEW
// ===============================
router.post("/", isLoggedIn, async (req, res) => {
  const { id } = req.params;

  const listing = await Listing.findById(id).populate("reviews");

  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }

  const review = new Review(req.body.review);
  review.author = req.user._id; // Store logged-in user ID

  await review.save();
  listing.reviews.push(review);
  await listing.save();

  // ⭐ Recalculate average rating
  const allReviews = await Review.find({ _id: { $in: listing.reviews } });
  const avgRating =
    allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

  listing.averageRating = avgRating.toFixed(1);
  await listing.save();

  req.flash("success", "Review added!");
  res.redirect(`/listings/${id}`);
});

// ===============================
// DELETE A REVIEW
// ===============================
router.delete("/:reviewId", isLoggedIn, async (req, res) => {
  const { id, reviewId } = req.params;

  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);

  // Recalculate average rating
  const listing = await Listing.findById(id).populate("reviews");

  if (listing.reviews.length > 0) {
    const avg =
      listing.reviews.reduce((sum, r) => sum + r.rating, 0) /
      listing.reviews.length;

    listing.averageRating = avg.toFixed(1);
  } else {
    listing.averageRating = 0;
  }

  await listing.save();

  req.flash("success", "Review deleted successfully!");
  res.redirect(`/listings/${id}`);
});

module.exports = router;
