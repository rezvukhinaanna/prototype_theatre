/**
 * @fileoverview Утилита для HTTP-запросов к API бэкенда (с поддержкой cookies).
 */

const API_BASE_URL = "http://localhost:3001";

/**
 * Выполняет запрос к API. При ошибке возвращает объект { error: string }, иначе — тело ответа.
 * @param {string} endpoint - Путь API (например "/login", "/register")
 * @param {string} [method="GET"] - HTTP-метод
 * @param {Object|null} [body=null] - Тело запроса (для POST/PATCH), будет сериализовано в JSON
 * @returns {Promise<Object>} Ответ: либо { error } при ошибке, либо данные (напр. { user }, { error, user })
 */
export const request = async (endpoint, method = "GET", body = null) => {
  const config = {
    method,
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || data.message || "Request failed" };
    }

    return data;
  } catch (error) {
    return { error: error.message || "Network error" };
  }
};
