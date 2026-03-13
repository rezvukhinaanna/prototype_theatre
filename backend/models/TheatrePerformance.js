/**
 * Схема спектакля: название, описание, дата, время, базовая цена, зал и обложка.
 */
const mongoose = require("mongoose");

const PerformanceSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    date: {
      type: String,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    basePrice: {
      type: Number,
      required: true,
    },
    hall: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hall",
      required: true,
    },
    imageUrl: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const Performance = mongoose.model("Performance", PerformanceSchema);

module.exports = Performance;

