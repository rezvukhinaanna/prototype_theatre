import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { theatreAPI } from "../../theatreApi";

/**
 * Главная страница театра: афиша с карточками спектаклей.
 */
export default function Home() {
  const navigate = useNavigate();
  const [performances, setPerformances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      const resp = await theatreAPI.getPerformances();
      if (resp.error) {
        setError(resp.error);
      } else {
        setPerformances(resp.performances || []);
      }
      setLoading(false);
    };

    load();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100 text-slate-900">
      {/* Top bar */}
      <header className="bg-white/80 backdrop-blur shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-lg font-bold">
              Т
            </div>
            <div>
              <h1 className="text-sm md:text-base font-semibold leading-tight">
                Театр «Театральные информационные системы»
              </h1>
              <p className="text-[11px] md:text-xs text-slate-500">
                Онлайн-покупка билетов на спектакли
              </p>
            </div>
          </div>
          <nav className="flex items-center gap-4 text-xs md:text-sm">
            <button
              onClick={() => {
                const el = document.getElementById("afisha");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="text-slate-600 hover:text-slate-900 transition-colors"
            >
              Афиша
            </button>
            <button
              onClick={() => {
                const el = document.getElementById("contacts");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="text-slate-600 hover:text-slate-900 transition-colors"
            >
              Контакты
            </button>
            <button
              onClick={() => navigate("/admin")}
              className="hidden sm:inline-flex items-center rounded-full border border-slate-300 px-3 py-1 text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Управление репертуаром
            </button>
          </nav>
        </div>
      </header>

      {/* Hero section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-35 bg-[radial-gradient(circle_at_top,_#4f46e5,_transparent_60%),radial-gradient(circle_at_bottom,_#6366f1,_transparent_65%)] pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-indigo-500 mb-3">
              Онлайн-театр
            </p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight mb-4 text-slate-900">
              Выбирайте лучшие спектакли
              <span className="block text-slate-600 font-normal mt-1">
                и бронируйте места онлайн
              </span>
            </h2>
            <p className="text-sm md:text-base text-slate-600 mb-6 max-w-xl">
              Современная система онлайн-продажи билетов: актуальная афиша, удобная
              интерактивная схема зала и безопасное бронирование без очередей в кассу.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => {
                  const el = document.getElementById("afisha");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
                className="inline-flex items-center rounded-full bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold px-5 py-2.5 text-white transition-colors shadow-sm"
              >
                Посмотреть афишу
              </button>
              <button
                onClick={() => {
                  const el = document.getElementById("scheme-info");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
                className="inline-flex items-center rounded-full border border-slate-300 text-sm font-semibold px-4 py-2.5 text-slate-700 hover:bg-slate-100 transition-colors bg-white/70"
              >
                Как работает бронирование
              </button>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="relative rounded-3xl border border-slate-200 bg-white p-5 shadow-lg">
              <div className="text-xs text-slate-500 mb-2">Пример схемы зала</div>
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                <div className="text-center text-[10px] uppercase tracking-wide text-slate-500 mb-3">
                  Сцена
                </div>
                <div className="space-y-1.5">
                  {[1, 2, 3, 4, 5].map((row) => (
                    <div key={row} className="flex items-center justify-center gap-1">
                      {[...Array(10)].map((_, idx) => (
                        <div
                          key={idx}
                          className={`w-4 h-4 rounded-sm ${
                            row === 1
                              ? "bg-indigo-500/80"
                              : row === 2 && idx < 3
                                ? "bg-slate-400"
                                : "bg-emerald-500/80"
                          }`}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
              <p className="mt-4 text-xs text-slate-500">
                Свободные места подсвечиваются зелёным, занятые – серым, выбранные – синим.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section
        id="scheme-info"
        className="bg-transparent"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-8 md:pb-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-base md:text-lg font-semibold mb-2">
              Как работает система
            </h3>
            <p className="text-xs md:text-sm text-slate-600">
              Выбирайте спектакль из афиши, отмечайте нужные места на интерактивной
              схеме зала и подтверждайте бронирование.
            </p>
          </div>
          <div className="text-xs md:text-sm text-slate-600 space-y-1.5">
            <p>1. Откройте афишу и выберите интересующий спектакль.</p>
            <p>2. На странице спектакля отметьте свободные места в зале.</p>
            <p>3. Укажите контактные данные и подтвердите бронирование.</p>
          </div>
          <div className="text-xs md:text-sm text-slate-600 space-y-1.5">
            <p>Система учитывает уже занятые места и не даёт выбрать забронированные.</p>
            <p>Информация о спектаклях и зале хранится в базе данных.</p>
          </div>
        </div>
      </section>

      {/* Afisha cards */}
      <section id="afisha" className="py-6 md:py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg md:text-xl font-semibold">Афиша спектаклей</h2>
          </div>

          {loading ? (
            <p className="text-sm text-slate-600">Загрузка афиши...</p>
          ) : error ? (
            <p className="text-sm text-red-500">Ошибка загрузки афиши: {error}</p>
          ) : performances.length === 0 ? (
            <p className="text-sm text-slate-600">
              Спектакли ещё не добавлены. Добавьте их через панель управления.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {performances.map((perf) => (
                <article
                  key={perf.id}
                  className="group rounded-2xl overflow-hidden border border-slate-200 bg-white hover:shadow-lg transition-shadow"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-slate-100">
                    {perf.imageUrl ? (
                      <img
                        src={perf.imageUrl}
                        alt={perf.title}
                        className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-slate-500">
                        Обложка спектакля
                      </div>
                    )}
                  </div>
                  <div className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-semibold text-slate-900">
                        {perf.title}
                      </h3>
                      <span className="text-[11px] text-indigo-600 whitespace-nowrap">
                        {perf.date} · {perf.time}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2 min-h-[2.5em]">
                      {perf.description || "Описание спектакля будет добавлено позже."}
                    </p>
                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <p className="text-[11px] text-slate-500">от</p>
                        <p className="text-sm font-semibold text-indigo-600">
                          {perf.basePrice.toFixed(0)} ₽
                        </p>
                      </div>
                      <button
                        onClick={() => navigate(`/performances/${perf.id}`)}
                        className="inline-flex items-center rounded-full bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 text-[11px] font-semibold text-white transition-colors"
                      >
                        Выбрать места
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Contacts / footer */}
      <footer
        id="contacts"
        className="border-t border-slate-200 bg-white py-6"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <p className="text-xs text-slate-500">
              © {new Date().getFullYear()} Театр «Театральные информационные системы».
            </p>
            <p className="text-xs text-slate-500">
              Все спектакли и расписание представлены в демонстрационных целях.
            </p>
          </div>
          <div className="text-xs text-slate-600 space-y-0.5">
            <p>Касса: +7 (000) 000-00-00</p>
            <p>Адрес: г. Санкт-Петербург, ул. Примерная, д. 1</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
