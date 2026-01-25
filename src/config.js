const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

const API_ENDPOINTS = {
  FORMS: `${API_BASE_URL}/api/forms`,
};

export { API_BASE_URL, API_ENDPOINTS };
