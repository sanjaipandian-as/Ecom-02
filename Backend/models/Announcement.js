import mongoose from "mongoose";

const AnnouncementSchema = new mongoose.Schema({
    message: {
        type: String,
        required: [true, "Announcement message is required"],
        trim: true
    },
    discountText: {
        type: String,
        trim: true,
        default: ""
    },
    endDate: {
        type: Date
    },
    link: {
        type: String,
        trim: true,
        default: "/"
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

export default mongoose.model("Announcement", AnnouncementSchema);
