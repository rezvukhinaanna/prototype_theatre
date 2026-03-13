import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./router";

/**
 * Корневой компонент прототипа театра: только роутер и страницы ТИС.
 */
export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
