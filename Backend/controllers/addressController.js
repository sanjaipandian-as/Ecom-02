import Address from "../models/Address.js";

// ⭐ Add Address
export const addAddress = async (req, res) => {
  try {
    const customerId = req.user._id;

    // ⭐ SECURITY FIX (VULN-10): Whitelist allowed fields instead of spreading req.body
    // This prevents mass-assignment attacks (e.g., injecting a foreign customerId)
    const { fullname, phone, pincode, state, city, addressLine, landmark, country, isDefault } = req.body;

    const newAddress = await Address.create({
      customerId, // Always use authenticated user's ID
      fullname,
      phone,
      pincode,
      state,
      city,
      addressLine,
      landmark: landmark || "",
      country: country || "India",
      isDefault: isDefault || false
    });

    res.json({
      message: "Address added successfully",
      address: newAddress
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ⭐ Get all addresses of customer
export const getAddresses = async (req, res) => {
  try {
    const customerId = req.user._id;

    const addresses = await Address.find({ customerId });

    res.json(addresses);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ⭐ Update Address
export const updateAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const customerId = req.user._id;

    const updated = await Address.findOneAndUpdate(
      { _id: addressId, customerId },
      req.body,
      { new: true }
    );

    res.json({
      message: "Address updated",
      address: updated
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ⭐ Delete Address
export const deleteAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const customerId = req.user._id;

    await Address.findOneAndDelete({ _id: addressId, customerId });

    res.json({ message: "Address deleted" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ⭐ Set Default Address
export const setDefaultAddress = async (req, res) => {
  try {
    const customerId = req.user._id;
    const { addressId } = req.params;

    // Remove default from all
    await Address.updateMany(
      { customerId },
      { $set: { isDefault: false } }
    );

    // ⭐ SECURITY FIX (VULN-6): Filter by customerId to prevent IDOR
    // Without this, a customer could set any user's address as their default
    const address = await Address.findOneAndUpdate(
      { _id: addressId, customerId },
      { isDefault: true },
      { new: true }
    );

    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    res.json({
      message: "Default address set",
      address
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
