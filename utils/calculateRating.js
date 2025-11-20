const Review = require("../models/review");
const Listing = require("../models/listing");

module.exports.updateAverageRating = async function (listingId) {
  const listing = await Listing.findById(listingId).populate("reviews");
  if (listing.reviews.length === 0) {
    listing.averageRating = 0;
  } else {
    const total = listing.reviews.reduce((sum, r) => sum + r.rating, 0);
    listing.averageRating = (total / listing.reviews.length).toFixed(1);
  }
  await listing.save();
};
