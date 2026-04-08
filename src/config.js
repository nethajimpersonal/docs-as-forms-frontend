const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

const API_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/api/user/login`,
  FORMS: `${API_BASE_URL}/api/forms`,
  DOWNLOAD_TEMPLATE: `${API_BASE_URL}/api/templates`,
  FONT_FAMILIES: `${API_BASE_URL}/api/fonts/families`,
  SUBMITTED: `${API_BASE_URL}/api/submitted`,
  SAVED: `${API_BASE_URL}/api/saved`
};

export { API_BASE_URL, API_ENDPOINTS };
