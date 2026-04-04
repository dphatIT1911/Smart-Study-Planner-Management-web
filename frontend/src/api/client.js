// Lấy URL từ biến môi trường của Vite, nếu không có thì fallback về localhost (môi trường dev cục bộ)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Trình gửi Yêu cầu HTTP cơ bản đến Backend
 * @param {string} endpoint - Đường dẫn con (ví dụ: '/api/users' hoặc '/')
 * @param {object} options - Các thông số như method (GET/POST), headers, body
 */
export async function fetchFromApi(endpoint, options = {}) {
  // Tự động gép link gốc với link con
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Mặc định luôn gắn header JSON
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  try {
    const response = await fetch(url, { ...options, headers });
    
    // Nếu request lỗi (4xx, 5xx) thì bắn loi
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Lỗi API: ${response.status}`);
    }
    
    // Trả về dữ liệu dạng Object Javascript
    return await response.json();
  } catch (error) {
    console.error(`[API Call FAILED] ${method} ${url}:`, error);
    throw error;
  }
}
