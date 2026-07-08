import Wishlist from "../models/Wishlist.js";
import Product from "../models/Product.js";

export const addToWishlist = async (req, res) => {
  try {
    const customerId = req.user._id;
    const { productId } = req.body;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const item = await Wishlist.create({ customerId, productId });

    return res.json({
      message: "Added to wishlist",
      item
    });

  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "Already in wishlist" });
    }
    res.status(500).json({ error: err.message });
  }
};

export const removeFromWishlist = async (req, res) => {
  try {
    const customerId = req.user._id;
    const { productId } = req.params;

    await Wishlist.findOneAndDelete({ customerId, productId });

    return res.json({ message: "Removed from wishlist" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getWishlist = async (req, res) => {
  try {
    const customerId = req.user._id;

    const items = await Wishlist.find({ customerId })
      .populate("productId");

    // Filter out items with null/deleted products
    const validItems = items.filter(item => item.productId !== null && !item.productId.is_deleted);

    // If any items had null products, remove them from database
    if (validItems.length !== items.length) {
      const invalidItemIds = items
        .filter(item => item.productId === null)
        .map(item => item._id);

      await Wishlist.deleteMany({ _id: { $in: invalidItemIds } });
      console.log(`🧹 Cleaned up ${invalidItemIds.length} deleted products from wishlist for user ${customerId}`);
    }

    return res.json(validItems);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Sync Local Wishlist with Database Wishlist
export const syncWishlist = async (req, res) => {
  try {
    const customerId = req.user._id;
    const { productIds } = req.body; // Array of productIds

    if (!productIds || !Array.isArray(productIds)) {
      return res.status(400).json({ message: "ProductIds must be an array." });
    }

    const addedItems = [];
    for (const productId of productIds) {
      if (!productId) continue;

      const product = await Product.findOne({ _id: productId, is_deleted: { $ne: true } });
      if (!product) continue;

      // Check if already in wishlist
      const exists = await Wishlist.findOne({ customerId, productId });
      if (!exists) {
        const item = await Wishlist.create({ customerId, productId });
        addedItems.push(item);
      }
    }

    return res.json({ message: "Wishlist synced successfully", addedItems });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
