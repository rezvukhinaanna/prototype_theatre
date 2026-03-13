/**
 * Страница 404: отображается по маршруту * при отсутствии совпадения.
 * @returns {JSX.Element}
 */
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-8">Страница не найдена</p>
        <a
          href="/"
          className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-full hover:from-purple-700 hover:to-indigo-700 transition-all duration-300"
        >
          На главную
        </a>
      </div>
    </div>
  )
}