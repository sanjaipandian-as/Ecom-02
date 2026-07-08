import Razorpay from "razorpay";
import dotenv from "dotenv";

dotenv.config({ override: true });

let razorpayInstance = null;

if (
  process.env.RAZORPAY_KEY_ID &&
  process.env.RAZORPAY_KEY_SECRET
) {
  razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
  console.log(`💳 Razorpay initialized in ${process.env.RAZORPAY_KEY_ID.startsWith('rzp_live') ? '🟢 LIVE' : '🟡 TEST'} mode`);
} else {
  console.warn('⚠️ Razorpay NOT initialized — missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET');
}

export default razorpayInstance;
