/**
 * Схема места в зале театра.
 */
const mongoose = require("mongoose");

const SeatSchema = mongoose.Schema(
  {
    hall: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hall",
      required: true,
    },
    rowNumber: {
      type: Number,
      required: true,
    },
    seatNumber: {
      type: Number,
      required: true,
    },
    seatType: {
      type: String,
      enum: ["standard", "vip", "restricted"],
      default: "standard",
    },
  },
  { timestamps: true }
);

SeatSchema.index({ hall: 1, rowNumber: 1, seatNumber: 1 }, { unique: true });

const Seat = mongoose.model("Seat", SeatSchema);

module.exports = Seat;

