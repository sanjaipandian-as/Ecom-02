import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

// 2.1 Add to Cart
export const addToCart = async (req, res) => {
  try {
    const customerId = req.user._id;
    const { productId, quantity } = req.body;

    // ⭐ SECURITY FIX (VULN-9): Validate quantity is a positive integer
    const qty = parseInt(quantity, 10);
    if (!Number.isInteger(qty) || qty < 1 || qty > 100) {
      return res.status(400).json({ message: "Quantity must be a positive integer (max 100)." });
    }

    const product = await Product.findOne({ _id: productId, is_deleted: { $ne: true } });
    if (!product) return res.status(404).json({ message: "Product not available" });

    let cart = await Cart.findOne({ customerId });

    if (!cart) {
      // ⭐ CHECK STOCK for new cart
      if (product.stock < qty) {
        return res.status(400).json({ message: `Only ${product.stock} pieces available in stock` });
      }
      cart = await Cart.create({
        customerId,
        items: [{ productId, quantity: qty }]
      });
    } else {
      const itemIndex = cart.items.findIndex(
        (item) => item.productId.toString() === productId
      );
      if (itemIndex >= 0) {
        // ⭐ SECURITY FIX: Check TOTAL quantity (existing + new) against stock
        const newTotalQuantity = cart.items[itemIndex].quantity + qty;
        if (product.stock < newTotalQuantity) {
          return res.status(400).json({ 
            message: `Only ${product.stock} pieces available in stock. You already have ${cart.items[itemIndex].quantity} in cart.` 
          });
        }
        cart.items[itemIndex].quantity = newTotalQuantity;
      } else {
        // ⭐ CHECK STOCK for new item
        if (product.stock < qty) {
          return res.status(400).json({ message: `Only ${product.stock} pieces available in stock` });
        }
        cart.items.push({ productId, quantity: qty });
      }
      await cart.save();
    }

    return res.json({ message: "Added to cart", cart });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// 2.2 Get Cart
export const getCart = async (req, res) => {
  try {
    const customerId = req.user._id;

    const cart = await Cart.findOne({ customerId }).populate("items.productId");

    if (!cart) return res.json({ items: [] });

    // Filter out items with null/deleted products
    const validItems = cart.items.filter(item => item.productId !== null);

    // If any items were removed, update the cart in database
    if (validItems.length !== cart.items.length) {
      cart.items = validItems;
      await cart.save();
      console.log(`🧹 Cleaned up ${cart.items.length - validItems.length} deleted products from cart for user ${customerId}`);
    }

    return res.json({ ...cart.toObject(), items: validItems });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// 2.3 Update Cart
export const updateCartItem = async (req, res) => {
  try {
    const customerId = req.user._id;
    const { productId, quantity } = req.body;

    const cart = await Cart.findOne({ customerId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const product = await Product.findById(productId);
    if (!product || product.is_deleted) {
      return res.status(404).json({ message: "Product no longer available" });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ message: `Only ${product.stock} pieces available in stock` });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );
    if (itemIndex < 0) {
      return res.status(404).json({ message: "Product not in cart" });
    }

    cart.items[itemIndex].quantity = quantity;
    await cart.save();

    return res.json({ message: "Quantity updated", cart });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// 2.4 Remove Item
export const removeCartItem = async (req, res) => {
  try {
    const customerId = req.user._id;
    const { productId } = req.params;

    const cart = await Cart.findOne({ customerId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter(
      (i) => i.productId.toString() !== productId
    );

    await cart.save();

    return res.json({ message: "Item removed", cart });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 2.5 Sync Local Cart with Database Cart
export const syncCart = async (req, res) => {
  try {
    const customerId = req.user._id;
    const { items } = req.body; // Array of { productId, quantity }

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ message: "Items must be an array." });
    }

    let cart = await Cart.findOne({ customerId });
    if (!cart) {
      cart = new Cart({ customerId, items: [] });
    }

    for (const item of items) {
      const { productId, quantity } = item;
      const qty = parseInt(quantity, 10);
      if (!productId || isNaN(qty) || qty < 1) continue;

      const product = await Product.findOne({ _id: productId, is_deleted: { $ne: true } });
      if (!product) continue;

      const itemIndex = cart.items.findIndex(
        (i) => i.productId.toString() === productId
      );

      if (itemIndex >= 0) {
        // Merge quantities, capping at available stock
        const mergedQty = cart.items[itemIndex].quantity + qty;
        cart.items[itemIndex].quantity = Math.min(mergedQty, product.stock || 0);
      } else {
        // Add new item, capping at available stock
        cart.items.push({
          productId,
          quantity: Math.min(qty, product.stock || 0)
        });
      }
    }

    await cart.save();
    return res.json({ message: "Cart synced successfully", cart });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
