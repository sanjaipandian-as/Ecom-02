import mongoose from 'mongoose';

const tempCustomerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    address: {
      type: String,
      trim: true,
      default: "",
    },

    addressLine1: {
      type: String,
      trim: true,
    },

    addressLine2: {
      type: String,
      trim: true,
    },

    city: {
      type: String,
      trim: true,
    },

    state: {
      type: String,
      trim: true,
    },

    postalCode: {
      type: String,
      trim: true,
    },

    otp: {
      type: String,
      required: true,
    },

    otpExpires: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

// Auto-delete temporary registrations after 1 hour using a TTL index
tempCustomerSchema.index({ createdAt: 1 }, { expireAfterSeconds: 3600 });
tempCustomerSchema.index({ email: 1 });

export default mongoose.model('TempCustomer', tempCustomerSchema);
