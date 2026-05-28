import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      index: true,
    },

    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    reviewText: {
      type: String,
      trim: true,
      default: "",
    },

    title: {
      type: String,
      trim: true,
      default: "",
    },

    tags: {
      type: [String],
      default: [],
    },

    helpfulVotes: {
      up: { type: Number, default: 0 },
      down: { type: Number, default: 0 }
    },
    voters: [
      {
        customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
        voteType: { type: String, enum: ["up", "down"] }
      }
    ],
  },
  { timestamps: true }
);

// ⭐ Prevent same customer reviewing same product twice
reviewSchema.index({ customerId: 1, productId: 1 }, { unique: true });

export default mongoose.model("Review", reviewSchema);
