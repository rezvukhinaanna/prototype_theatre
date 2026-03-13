import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { theatreAPI } from "../../theatreApi";

/**
 * Упрощённая административная панель: список спектаклей и форма добавления нового.
 */
export default function AdminPage() {
  const navigate = useNavigate();
  const [performances, setPerformances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [halls, setHalls] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    basePrice: "",
    hallId: "",
    imageUrl: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const performancesResp = await theatreAPI.getPerformances();
        if (!performancesResp.error) {
          setPerformances(performancesResp.performances || []);
        }

        const hallsResp = await theatreAPI.getHalls?.();
        if (hallsResp && !hallsResp.error) {
          setHalls(hallsResp.halls || []);
        }
      } catch (e) {
        setError(e.message || "Не удалось загрузить данные");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.date || !form.time || !form.basePrice || !form.hallId) {
      setError("Заполните обязательные поля: название, дата, время, цена, зал");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const resp = await theatreAPI.createPerformance({
        title: form.title,
        description: form.description,
        date: form.date,
        time: form.time,
        basePrice: Number(form.basePrice),
        hallId: form.hallId,
        imageUrl: form.imageUrl || undefined,
      });

      if (resp.error) {
        throw new Error(resp.error);
      }

      setPerformances((prev) => [...prev, resp.performance]);
      setForm({
        title: "",
        description: "",
        date: "",
        time: "",
        basePrice: "",
        hallId: "",
        imageUrl: "",
      });
    } catch (e) {
      setError(e.message || "Не удалось создать спектакль");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-slate-900 text-white py-4 px-4 sm:px-8 shadow">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-300">
              Театр «ТИС»
            </p>
            <h1 className="text-lg font-semibold">
              Панель управления репертуаром
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-xs text-slate-300">
              Только для сотрудников театра
            </span>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="text-xs md:text-sm border border-slate-600 rounded-full px-3 py-1 text-slate-200 hover:bg-slate-800 transition-colors"
            >
              На сайт театра
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <section className="bg-white rounded-2xl shadow border border-slate-100 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Добавить спектакль
          </h2>

          {error && (
            <div className="mb-3 text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Название спектакля *
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => handleChange("title", e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Зал *
              </label>
              <select
                value={form.hallId}
                onChange={(e) => handleChange("hallId", e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Выберите зал</option>
                {halls.map((hall) => (
                  <option key={hall.id} value={hall.id}>
                    {hall.name} ({hall.rows}×{hall.seatsPerRow})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Дата (YYYY-MM-DD) *
              </label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => handleChange("date", e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Время (HH:MM) *
              </label>
              <input
                type="time"
                value={form.time}
                onChange={(e) => handleChange("time", e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Базовая цена, ₽ *
              </label>
              <input
                type="number"
                min="0"
                value={form.basePrice}
                onChange={(e) => handleChange("basePrice", e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Описание (коротко)
              </label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">
                URL обложки спектакля
              </label>
              <input
                type="url"
                value={form.imageUrl}
                onChange={(e) => handleChange("imageUrl", e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className={`px-6 py-2.5 rounded-full text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors ${
                  saving ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {saving ? "Сохранение..." : "Добавить спектакль"}
              </button>
            </div>
          </form>
        </section>

        <section className="bg-white rounded-2xl shadow border border-slate-100 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Текущая афиша
          </h2>
          {loading ? (
            <p className="text-sm text-slate-500">Загрузка спектаклей...</p>
          ) : performances.length === 0 ? (
            <p className="text-sm text-slate-500">
              Спектакли ещё не добавлены. Используйте форму выше, чтобы создать первый.
            </p>
          ) : (
            <div className="space-y-3 text-sm">
              {performances.map((perf) => (
                <div
                  key={perf.id}
                  className="flex items-center justify-between border border-slate-100 rounded-xl px-3 py-2"
                >
                  <div>
                    <p className="font-medium text-slate-900">{perf.title}</p>
                    <p className="text-xs text-slate-500">
                      {perf.date} · {perf.time} · {perf.hall?.name}
                    </p>
                  </div>
                  <div className="text-right text-xs text-slate-500">
                    <div>Базовая цена: {perf.basePrice.toFixed(2)} ₽</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

