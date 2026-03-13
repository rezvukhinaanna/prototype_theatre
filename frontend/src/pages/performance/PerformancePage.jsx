import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { theatreAPI } from "../../theatreApi";

/**
 * Страница спектакля: детали, интерактивная схема зала, выбор мест и покупка билета.
 */
export default function PerformancePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [performance, setPerformance] = useState(null);
  const [hall, setHall] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeatIds, setSelectedSeatIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");

  useEffect(() => {
    let isCancelled = false;

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const performanceResp = await theatreAPI.getPerformance(id);
        if (performanceResp.error) {
          throw new Error(performanceResp.error);
        }

        const perf = performanceResp.performance;
        if (!perf || !perf.hall) {
          throw new Error("Для спектакля не указан зал");
        }

        const seatsResp = await theatreAPI.getHallSeats(perf.hall.id, id);
        if (seatsResp.error) {
          throw new Error(seatsResp.error);
        }

        if (!isCancelled) {
          setPerformance(perf);
          setHall(seatsResp.hall);
          setSeats(seatsResp.seats || []);
        }
      } catch (e) {
        if (!isCancelled) {
          setError(e.message || "Не удалось загрузить данные о спектакле");
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isCancelled = true;
    };
  }, [id]);

  const seatsByRow = useMemo(() => {
    const byRow = new Map();
    seats.forEach((seat) => {
      if (!byRow.has(seat.rowNumber)) {
        byRow.set(seat.rowNumber, []);
      }
      byRow.get(seat.rowNumber).push(seat);
    });

    // сортировка мест внутри ряда
    byRow.forEach((rowSeats, row) => {
      rowSeats.sort((a, b) => a.seatNumber - b.seatNumber);
    });

    return Array.from(byRow.entries()).sort(([rowA], [rowB]) => rowA - rowB);
  }, [seats]);

  const toggleSeat = (seat) => {
    if (seat.isBooked) return;

    setSelectedSeatIds((prev) =>
      prev.includes(seat.id) ? prev.filter((id) => id !== seat.id) : [...prev, seat.id]
    );
  };

  const selectedSeats = useMemo(
    () => seats.filter((s) => selectedSeatIds.includes(s.id)),
    [seats, selectedSeatIds]
  );

  const totalPrice = useMemo(() => {
    if (!performance) return 0;
    return performance.basePrice * selectedSeats.length;
  }, [performance, selectedSeats.length]);

  const handleCreateBooking = async () => {
    if (!performance || selectedSeatIds.length === 0) return;

    try {
      setBookingLoading(true);
      setError(null);
      setBookingResult(null);

      const resp = await theatreAPI.createBooking({
        performanceId: performance.id,
        seatIds: selectedSeatIds,
        customerName: customerName || null,
        customerEmail: customerEmail || null,
      });

      if (resp.error) {
        throw new Error(resp.error);
      }

      setBookingResult(resp.booking);

      // обновляем статусы мест после успешного бронирования
      const seatsResp = await theatreAPI.getHallSeats(performance.hall.id, performance.id);
      if (!seatsResp.error && seatsResp.seats) {
        setSeats(seatsResp.seats);
        setSelectedSeatIds([]);
      }
    } catch (e) {
      setError(e.message || "Не удалось оформить покупку");
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg text-gray-600">Загрузка данных спектакля...</div>
      </div>
    );
  }

  if (error && !performance) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <div className="max-w-xl text-center">
          <h1 className="text-2xl font-semibold text-red-600 mb-4">Ошибка</h1>
          <p className="text-gray-700 mb-6">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
          >
            Вернуться к афише
          </button>
        </div>
      </div>
    );
  }

  if (!performance || !hall) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <header className="bg-white/90 backdrop-blur border-b border-slate-200 sticky top-0 z-20 text-slate-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="flex items-center text-slate-600 hover:text-slate-900 transition-colors"
          >
            <span className="mr-2 text-xl">←</span>
            <span className="font-medium text-sm">К афише</span>
          </button>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Театр «Театральные информационные системы»
            </p>
            <p className="text-[11px] text-slate-500">Онлайн-покупка билетов</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <section className="lg:col-span-2 bg-white/80 backdrop-blur rounded-3xl shadow-xl border border-slate-100 p-6 md:p-8">
            <div className="mb-6">
              <p className="text-xs uppercase tracking-wide text-indigo-600 font-semibold mb-1">
                Спектакль
              </p>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
                {performance.title}
              </h1>
              <p className="text-sm text-slate-500 mb-1">
                {performance.date} · {performance.time}
              </p>
              {performance.hall && (
                <p className="text-sm text-slate-500">
                  Зал: {performance.hall.name} · {performance.hall.rows} рядов по{" "}
                  {performance.hall.seatsPerRow} мест
                </p>
              )}
            </div>

            {performance.description && (
              <p className="text-sm text-slate-700 mb-6 leading-relaxed">
                {performance.description}
              </p>
            )}

            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                Выбор мест в зале
              </h2>
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <div className="flex items-center gap-1">
                  <span className="w-4 h-4 rounded border border-slate-300 bg-white inline-block mr-1"></span>
                  Свободно
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-4 h-4 rounded bg-slate-300 inline-block mr-1"></span>
                  Занято
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-4 h-4 rounded bg-indigo-500 inline-block mr-1"></span>
                  Выбрано
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 md:p-6 border border-slate-100">
              <div className="mb-4 text-center text-xs uppercase tracking-wide text-slate-500">
                Сцена
              </div>

              <div className="space-y-2 max-h-[420px] overflow-auto pr-1">
                {seatsByRow.length === 0 && (
                  <p className="text-sm text-slate-500 text-center">
                    Схема зала пока не настроена.
                  </p>
                )}

                {seatsByRow.map(([rowNumber, rowSeats]) => (
                  <div
                    key={rowNumber}
                    className="flex items-center gap-3 text-xs md:text-sm"
                  >
                    <span className="w-14 text-right text-slate-500 whitespace-nowrap">
                      Ряд {rowNumber}
                    </span>
                    <div className="flex gap-1 md:gap-1.5 flex-nowrap overflow-x-auto pb-1">
                      {rowSeats.map((seat) => {
                        const isSelected = selectedSeatIds.includes(seat.id);
                        const isBooked = seat.isBooked;

                        let bg = "bg-white";
                        let border = "border-slate-300";
                        let text = "text-slate-700";

                        if (isBooked) {
                          bg = "bg-slate-300";
                          border = "border-slate-300";
                          text = "text-slate-500";
                        } else if (isSelected) {
                          bg = "bg-indigo-500";
                          border = "border-indigo-500";
                          text = "text-white";
                        }

                        return (
                          <button
                            key={seat.id}
                            type="button"
                            onClick={() => toggleSeat(seat)}
                            disabled={isBooked}
                            className={`w-8 h-8 rounded-md border text-xs font-medium flex items-center justify-center transition-colors ${
                              bg
                            } ${border} ${text} ${
                              !isBooked
                                ? "hover:bg-indigo-50 hover:border-indigo-400"
                                : "cursor-not-allowed"
                            }`}
                            title={`Ряд ${seat.rowNumber}, место ${seat.seatNumber}`}
                          >
                            {seat.seatNumber}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="lg:col-span-1 space-y-6">
            <div className="bg-white/90 backdrop-blur rounded-3xl shadow-xl border border-slate-100 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Детали покупки
              </h2>

              <div className="space-y-3 text-sm text-slate-700 mb-4">
                <p>
                  <span className="text-slate-500">Спектакль:</span>{" "}
                  <span className="font-medium">{performance.title}</span>
                </p>
                <p>
                  <span className="text-slate-500">Дата и время:</span>{" "}
                  <span className="font-medium">
                    {performance.date} · {performance.time}
                  </span>
                </p>
                <p>
                  <span className="text-slate-500">Зал:</span>{" "}
                  <span className="font-medium">{performance.hall?.name}</span>
                </p>
                <p>
                  <span className="text-slate-500">Базовая цена:</span>{" "}
                  <span className="font-semibold text-indigo-600">
                    {performance.basePrice.toFixed(2)} ₽
                  </span>{" "}
                  <span className="text-slate-400 text-xs">за место</span>
                </p>
              </div>

              <div className="border-t border-slate-100 pt-4 mb-4">
                <h3 className="text-sm font-semibold text-slate-900 mb-2">
                  Выбранные места
                </h3>
                {selectedSeats.length === 0 ? (
                  <p className="text-xs text-slate-500">
                    Места не выбраны. Нажмите на свободные места на схеме, чтобы добавить их.
                  </p>
                ) : (
                  <ul className="text-sm text-slate-700 space-y-1">
                    {selectedSeats.map((seat) => (
                      <li key={seat.id}>
                        Ряд {seat.rowNumber}, место {seat.seatNumber}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-slate-500">Итого к оплате</span>
                <span className="text-xl font-bold text-indigo-600">
                  {totalPrice.toFixed(2)} ₽
                </span>
              </div>

              <div className="space-y-3 mb-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Имя (необязательно)
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Иван Иванов"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Email (необязательно)
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="example@mail.ru"
                  />
                </div>
              </div>

              {error && (
                <div className="mb-3 text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                  {error}
                </div>
              )}

              <button
                type="button"
                disabled={selectedSeats.length === 0 || bookingLoading}
                onClick={handleCreateBooking}
                className={`w-full rounded-full px-4 py-3 text-sm font-semibold transition-colors ${
                  selectedSeats.length === 0 || bookingLoading
                    ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                    : "bg-indigo-600 text-white hover:bg-indigo-700"
                }`}
              >
                {bookingLoading
                  ? "Оформление покупки..."
                  : selectedSeats.length === 0
                    ? "Выберите места"
                    : "Купить билет"}
              </button>
            </div>

            {bookingResult && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-5 text-sm text-emerald-900">
                <h3 className="font-semibold mb-2">Бронирование создано</h3>
                <p className="mb-2">
                  Спектакль:{" "}
                  <span className="font-medium">{bookingResult.performance.title}</span>
                </p>
                <p className="mb-2">
                  Места:{" "}
                  {bookingResult.seats
                    .map((s) => `ряд ${s.rowNumber}, место ${s.seatNumber}`)
                    .join("; ")}
                </p>
                <p className="mb-2">
                  Сумма:{" "}
                  <span className="font-semibold">
                    {bookingResult.totalPrice.toFixed(2)} ₽
                  </span>
                </p>
                {bookingResult.customerEmail && (
                  <p className="text-xs text-emerald-800">
                    Контактный email: {bookingResult.customerEmail}
                  </p>
                )}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

