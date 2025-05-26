import mongoose from "mongoose";

const reviewFormSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rating: { type: Number, required: true },
  comment: { type: String, required: true },
  submittedAt: { type: Date, default: Date.now },
});

const ReviewForm = mongoose.model("ReviewForm", reviewFormSchema);
export default ReviewForm;
