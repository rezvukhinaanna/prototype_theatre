/**
 * Схема бронирования билетов на спектакль.
 */
const mongoose = require("mongoose");

const BookingSchema = mongoose.Schema(
  {
    performance: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Performance",
      required: true,
    },
    seats: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Seat",
        required: true,
      },
    ],
    customerName: {
      type: String,
      default: null,
    },
    customerEmail: {
      type: String,
      default: null,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const Booking = mongoose.model("Booking", BookingSchema);

module.exports = Booking;

