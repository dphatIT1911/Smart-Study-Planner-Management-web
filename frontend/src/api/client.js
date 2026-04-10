import config from '../config';

// URL gốc của API phụ thuộc vào môi trường
const API_BASE_URL = config.API_BASE_URL;

// Debugging: log API base so we can see what the built app is using.
try {
  // eslint-disable-next-line no-console
  console.info('[API config] API_BASE_URL =', API_BASE_URL);
} catch (e) {}

/**
 * Trình gửi Yêu cầu HTTP cơ bản đến Backend
 * @param {string} endpoint - Đường dẫn con (ví dụ: '/api/users' hoặc '/')
 * @param {object} options - Các thông số như method (GET/POST), headers, body
 */
export async function fetchFromApi(endpoint, options = {}) {
  // Tự động gép link gốc với link con
  const url = API_BASE_URL ? `${API_BASE_URL}${endpoint}` : endpoint;
  const method = options.method || 'GET';
  
  // Mặc định luôn gắn header JSON
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  try {
    // Debug log each request
    try {
      // eslint-disable-next-line no-console
      console.debug(`[API] ${method} ${url}`);
    } catch (e) {}

    const response = await fetch(url, { ...options, headers });
    
    // Nếu request lỗi (4xx, 5xx) thì bắn loi
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Lỗi API: ${response.status}`);
    }
    
    // Trả về dữ liệu dạng Object Javascript
    return await response.json();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`[API Call FAILED] ${method} ${url}:`, error);
    throw error;
  }
}
