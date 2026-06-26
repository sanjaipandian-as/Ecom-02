import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 2,
      index: true,
    },

    icon: {
      type: String, // Relative path to icon image (resolved to full URL in toJSON)
      default: null,
      trim: true,
    },

    displayOrder: {
      type: Number,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    showInTopbar: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        const baseUrl = (process.env.UPLOADS_BASE_URL || '').replace(/\/+$/, '');

        if (ret.icon && !ret.icon.startsWith('http://') && !ret.icon.startsWith('https://')) {
          ret.icon = `${baseUrl}/${ret.icon}`;
        }

        return ret;
      },
    },
  }
);

export default mongoose.model("Category", categorySchema);
