/**
 * Небольшой изолированный API-клиент именно для прототипа театра.
 * Базовый URL выбирается в зависимости от окружения:
 * - локально: http://localhost:3001
 * - в продакшене: backend на Render.
 */
const API_BASE_URL =
  (typeof window !== "undefined" && window.location.hostname.includes("localhost"))
    ? "http://localhost:3001"
    : "https://prototype-theatre-1.onrender.com";

async function request(endpoint, options = {}) {
  const { method = "GET", body, headers = {} } = options;

  const config = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || "Request failed" };
    }

    return data;
  } catch (error) {
    return { error: error.message || "Network error" };
  }
}

export const theatreAPI = {
  getPerformances: () => request("/api/performances"),
  getPerformance: (id) => request(`/api/performances/${id}`),
  getHallSeats: (hallId, performanceId) => {
    const params = new URLSearchParams();
    if (performanceId) params.append("performanceId", performanceId);
    const query = params.toString();
    return request(`/api/halls/${hallId}/seats${query ? `?${query}` : ""}`);
  },
  createBooking: (bookingData) =>
    request("/api/bookings", {
      method: "POST",
      body: bookingData,
    }),
  getHalls: () => request("/api/halls"),
  createPerformance: (performanceData) =>
    request("/api/admin/performances", {
      method: "POST",
      body: performanceData,
    }),
};

