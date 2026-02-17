const mongoose = require("mongoose");

const workoutSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    distance: {
      type: Number,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    calories: {
      type: Number,
    },
    intensity: {
      type: String,
      enum: ["low", "medium", "high"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Workout", workoutSchema);
