/**
 * Схема зала театра: название и размеры (ряды x мест в ряду).
 */
const mongoose = require("mongoose");

const HallSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    rows: {
      type: Number,
      required: true,
    },
    seatsPerRow: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const Hall = mongoose.model("Hall", HallSchema);

module.exports = Hall;

