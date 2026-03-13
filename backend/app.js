/**
 * @fileoverview Express-сервер прототипа ТИС: афиша спектаклей, выбор мест и бронирование билетов.
 */
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const Hall = require("./models/TheatreHall");
const Seat = require("./models/TheatreSeat");
const Performance = require("./models/TheatrePerformance");
const Booking = require("./models/TheatreBooking");

const port = 3001;
const app = express();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.static("../frontend/dist"));
app.use(cookieParser());
app.use(express.json());

/**
 * Вспомогательный эндпоинт: список залов (для админки).
 */
app.get("/api/halls", async (req, res) => {
  try {
    const halls = await Hall.find().sort({ name: 1 });
    res.send({
      error: null,
      halls: halls.map((hall) => ({
        id: hall._id,
        name: hall.name,
        rows: hall.rows,
        seatsPerRow: hall.seatsPerRow,
      })),
    });
  } catch (e) {
    res.status(500).send({ error: e.message || "Не удалось получить список залов" });
  }
});

/**
 * Преобразование спектакля к формату для фронтенда.
 * @param {import("./models/TheatrePerformance")} performance
 */
function mapPerformance(performance) {
  const hall = performance.hall;

  return {
    id: performance._id,
    title: performance.title,
    description: performance.description,
    date: performance.date,
    time: performance.time,
    basePrice: performance.basePrice,
    imageUrl: performance.imageUrl || "",
    hall: hall
      ? {
          id: hall._id,
          name: hall.name,
          rows: hall.rows,
          seatsPerRow: hall.seatsPerRow,
        }
      : null,
  };
}

/**
 * Список всех спектаклей для афиши.
 */
app.get("/api/performances", async (req, res) => {
  try {
    const performances = await Performance.find()
      .populate("hall")
      .sort({ date: 1, time: 1 });

    res.send({ error: null, performances: performances.map(mapPerformance) });
  } catch (e) {
    res.status(500).send({ error: e.message || "Не удалось получить список спектаклей" });
  }
});

/**
 * Детальная информация о спектакле по id.
 */
app.get("/api/performances/:id", async (req, res) => {
  try {
    const performance = await Performance.findById(req.params.id).populate("hall");

    if (!performance) {
      return res.status(404).send({ error: "Спектакль не найден" });
    }

    res.send({ error: null, performance: mapPerformance(performance) });
  } catch (e) {
    res.status(500).send({ error: e.message || "Не удалось получить спектакль" });
  }
});

/**
 * Схема зала с пометкой занятых мест.
 * Ожидает query-параметр performanceId, чтобы учитывать бронирования именно на этот спектакль.
 */
app.get("/api/halls/:id/seats", async (req, res) => {
  try {
    const { id: hallId } = req.params;
    const { performanceId } = req.query;

    const hall = await Hall.findById(hallId);
    if (!hall) {
      return res.status(404).send({ error: "Зал не найден" });
    }

    const seats = await Seat.find({ hall: hallId }).sort({
      rowNumber: 1,
      seatNumber: 1,
    });

    let bookedSeatIds = new Set();

    if (performanceId) {
      const bookings = await Booking.find({
        performance: performanceId,
        status: { $ne: "cancelled" },
      }).select("seats");

      bookings.forEach((booking) => {
        booking.seats.forEach((seatId) => {
          bookedSeatIds.add(String(seatId));
        });
      });
    }

    res.send({
      error: null,
      hall: {
        id: hall._id,
        name: hall.name,
        rows: hall.rows,
        seatsPerRow: hall.seatsPerRow,
      },
      seats: seats.map((seat) => ({
        id: seat._id,
        rowNumber: seat.rowNumber,
        seatNumber: seat.seatNumber,
        seatType: seat.seatType,
        isBooked: bookedSeatIds.has(String(seat._id)),
      })),
    });
  } catch (e) {
    res.status(500).send({ error: e.message || "Не удалось получить схему зала" });
  }
});

/**
 * Создание бронирования: спектакль, выбранные места, контактные данные и вычисление общей стоимости.
 * Ожидает body:
 * {
 *   performanceId: string,
 *   seatIds: string[],
 *   customerName: string,
 *   customerEmail: string
 * }
 */
app.post("/api/bookings", async (req, res) => {
  try {
    const { performanceId, seatIds, customerName, customerEmail } = req.body;

    if (!performanceId || !Array.isArray(seatIds) || seatIds.length === 0) {
      return res
        .status(400)
        .send({ error: "Необходимо указать спектакль и хотя бы одно место" });
    }

    const performance = await Performance.findById(performanceId).populate("hall");
    if (!performance) {
      return res.status(404).send({ error: "Спектакль не найден" });
    }

    const seats = await Seat.find({ _id: { $in: seatIds }, hall: performance.hall });
    if (seats.length !== seatIds.length) {
      return res.status(400).send({ error: "Некорректный набор мест для данного зала" });
    }

    // Проверяем, что места ещё свободны на этот спектакль
    const existingBookings = await Booking.find({
      performance: performanceId,
      status: { $ne: "cancelled" },
      seats: { $in: seatIds },
    }).select("_id");

    if (existingBookings.length > 0) {
      return res
        .status(409)
        .send({ error: "Одно или несколько выбранных мест уже забронированы" });
    }

    // Простая логика цен: базовая цена * количество мест (без учёта типа)
    const totalPrice = performance.basePrice * seatIds.length;

    const booking = await Booking.create({
      performance: performanceId,
      seats: seatIds,
      customerName: customerName || null,
      customerEmail: customerEmail || null,
      totalPrice,
      status: "confirmed",
    });

    res.status(201).send({
      error: null,
      booking: {
        id: booking._id,
        performance: mapPerformance(performance),
        seats: seats.map((seat) => ({
          id: seat._id,
          rowNumber: seat.rowNumber,
          seatNumber: seat.seatNumber,
          seatType: seat.seatType,
        })),
        customerName: booking.customerName,
        customerEmail: booking.customerEmail,
        totalPrice,
        status: booking.status,
        bookingTime: booking.createdAt,
      },
    });
  } catch (e) {
    res.status(500).send({ error: e.message || "Не удалось создать бронирование" });
  }
});

/**
 * Упрощённая админка: добавление нового спектакля.
 * Ожидает body:
 * {
 *   title, description, date, time, basePrice, hallId
 * }
 */
app.post("/api/admin/performances", async (req, res) => {
  try {
    const { title, description, date, time, basePrice, hallId, imageUrl } = req.body;

    if (!title || !date || !time || !basePrice || !hallId) {
      return res.status(400).send({
        error: "Необходимо указать название, дату, время, базовую цену и зал",
      });
    }

    const hall = await Hall.findById(hallId);
    if (!hall) {
      return res.status(404).send({ error: "Зал не найден" });
    }

    const performance = await Performance.create({
      title,
      description: description || "",
      date,
      time,
      basePrice,
      hall: hallId,
      imageUrl: imageUrl || "",
    });

    const populated = await performance.populate("hall");

    res.status(201).send({ error: null, performance: mapPerformance(populated) });
  } catch (e) {
    res.status(500).send({ error: e.message || "Не удалось создать спектакль" });
  }
});

mongoose
  .connect(
    "mongodb+srv://rezvukhinaan:an.na_rez@cluster0.yxbtl5b.mongodb.net/prototype_theatre?retryWrites=true&w=majority&appName=Cluster0"
  )
  .then(() => {
    app.listen(port, () => {
      console.log(`Server started on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
  });
