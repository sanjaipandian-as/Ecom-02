import Review from "../models/Review.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";

export const addReview = async (req, res) => {
  try {
    const customerId = req.user._id;
    const { productId, rating, title, reviewText, tags } = req.body;

    // ⭐ SECURITY FIX (VULN-8): Validate rating is between 1 and 5
    const numRating = Number(rating);
    if (!numRating || numRating < 1 || numRating > 5 || !Number.isFinite(numRating)) {
      return res.status(400).json({ message: "Rating must be a number between 1 and 5." });
    }
    // Check if the user has purchased the product
    const hasPurchased = await Order.findOne({
      customerId,
      "items.productId": productId,
      $or: [
        { status: "delivered" },
        { paymentStatus: "success" }
      ]
    });

    if (!hasPurchased) {
      return res.status(403).json({
        message: "Only customers who have purchased this product can write a review."
      });
    }

    // Create review
    const review = await Review.create({
      customerId,
      productId,
      rating,
      title: title || "",
      reviewText: reviewText || "",
      tags: tags || []
    });

    // Update product rating stats
    const reviews = await Review.find({ productId });
    const avg =
      reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await Product.findByIdAndUpdate(productId, {
      averageRating: avg,
      totalReviews: reviews.length
    });

    return res.json({
      message: "Review added successfully",
      review
    });

  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        message: "You have already reviewed this product"
      });
    }
    return res.status(500).json({ error: err.message });
  }
};

export const updateReview = async (req, res) => {
  try {
    const customerId = req.user._id;
    const { reviewId } = req.params;
    const { rating, reviewText } = req.body;

    // ⭐ SECURITY FIX (VULN-8): Validate rating is between 1 and 5
    const numRating = Number(rating);
    if (!numRating || numRating < 1 || numRating > 5 || !Number.isFinite(numRating)) {
      return res.status(400).json({ message: "Rating must be a number between 1 and 5." });
    }

    const review = await Review.findOneAndUpdate(
      { _id: reviewId, customerId },
      { rating, reviewText },
      { new: true }
    );

    if (!review)
      return res.status(404).json({ message: "Review not found" });

    // Update product rating stats
    const reviews = await Review.find({ productId: review.productId });
    const avg =
      reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await Product.findByIdAndUpdate(review.productId, {
      averageRating: avg,
      totalReviews: reviews.length
    });

    return res.json({
      message: "Review updated successfully",
      review
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const customerId = req.user._id;
    const { reviewId } = req.params;

    const review = await Review.findOneAndDelete({
      _id: reviewId,
      customerId
    });

    if (!review)
      return res.status(404).json({ message: "Review not found" });

    // Recalculate product stats
    const reviews = await Review.find({ productId: review.productId });

    const avg =
      reviews.length === 0
        ? 0
        : reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await Product.findByIdAndUpdate(review.productId, {
      averageRating: avg,
      totalReviews: reviews.length
    });

    return res.json({ message: "Review deleted" });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    const reviews = await Review.find({ productId })
      .populate("customerId", "name")
      .sort({ createdAt: -1 });

    return res.json(reviews);

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// Check if customer can review a product
export const canReviewProduct = async (req, res) => {
  try {
    const customerId = req.user._id;
    const { productId } = req.params;

    const hasPurchased = await Order.findOne({
      customerId,
      "items.productId": productId,
      $or: [
        { status: "delivered" },
        { paymentStatus: "success" }
      ]
    });

    return res.json({ canReview: !!hasPurchased });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// Vote on a review's helpfulness
export const voteReview = async (req, res) => {
  try {
    const customerId = req.user._id;
    const { reviewId } = req.params;
    const { type } = req.body; // "up" or "down"

    if (type !== "up" && type !== "down") {
      return res.status(400).json({ message: "Invalid vote type" });
    }

    const review = await Review.findById(reviewId);
    if (!review) return res.status(404).json({ message: "Review not found" });

    const existingVoteIndex = review.voters.findIndex(
      v => v.customerId.toString() === customerId.toString()
    );

    if (existingVoteIndex !== -1) {
      const existingVote = review.voters[existingVoteIndex];
      if (existingVote.voteType === type) {
        return res.status(400).json({ message: "You have already voted this way" });
      }
      
      if (existingVote.voteType === "up") {
        review.helpfulVotes.up = Math.max(0, review.helpfulVotes.up - 1);
      } else {
        review.helpfulVotes.down = Math.max(0, review.helpfulVotes.down - 1);
      }
      
      if (type === "up") {
        review.helpfulVotes.up += 1;
      } else {
        review.helpfulVotes.down += 1;
      }
      
      review.voters[existingVoteIndex].voteType = type;
    } else {
      if (type === "up") {
        review.helpfulVotes.up += 1;
      } else {
        review.helpfulVotes.down += 1;
      }
      review.voters.push({ customerId, voteType: type });
    }

    await review.save();

    return res.json(review);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
