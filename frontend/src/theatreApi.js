/**
 * Небольшой изолированный API-клиент именно для прототипа театра,
 * чтобы не трогать существующие файлы другого проекта.
 */
const API_BASE_URL = "http://localhost:3001";

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

