/**
 * @fileoverview Конфигурация маршрутов приложения (React Router).
 */

import { Routes, Route } from "react-router-dom";
import Home from "../pages/home/home";
import PerformancePage from "../pages/performance/PerformancePage";
import AdminPage from "../pages/admin/AdminPage";
import NotFound from "../pages/NotFound";

/**
 * Дерево маршрутов: главная, авторизация, регистрация, бронирование, галерея, панель фотографа, 404.
 * @returns {JSX.Element}
 */
export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/performances/:id" element={<PerformancePage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
