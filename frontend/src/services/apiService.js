import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://paint-number-generator-1.onrender.com/api';

console.log('API Base URL:', API_BASE_URL);

// Create axios instance with optimized settings
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000, // 2 minutes timeout for mobile processing
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for mobile optimization
apiClient.interceptors.request.use(
  (config) => {
    // Add mobile detection header
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    config.headers['X-Device-Type'] = isMobile ? 'mobile' : 'desktop';
    config.headers['X-Device-Info'] = JSON.stringify({
      userAgent: navigator.userAgent,
      screen: {
        width: window.screen.width,
        height: window.screen.height,
      },
    });

    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Network or timeout errors
    if (!error.response) {
      error.message = 'Network error or server timeout. Please check your connection.';
      if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        error.message += ' If on mobile data, try using WiFi for better stability.';
      }
    }
    // Server errors
    else if (error.response.status >= 500) {
      error.message = 'Server error. Please try again in a few moments.';
    }
    return Promise.reject(error);
  }
);

const apiService = {
  // Upload file
  uploadFile: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    return await apiClient.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Process image with enhanced mobile support
  processImage: async (fileId, settings) => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    // Add mobile-specific headers
    const headers = {
      'X-Device-Type': isMobile ? 'mobile' : 'desktop',
      'X-Request-Start': new Date().toISOString(),
    };

    return await apiClient.post(
      '/process',
      {
        file_id: fileId,
        settings: settings,
      },
      { headers }
    );
  },

  // Download file
  downloadFile: async (fileId, fileType) => {
    const response = await apiClient.get(`/download/${fileId}/${fileType}`, {
      responseType: 'blob',
    });

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${fileId}_${fileType}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    return response;
  },

  // Get default settings
  getDefaultSettings: async () => {
    return await apiClient.get('/settings');
  },

  // Health check
  healthCheck: async () => {
    return await apiClient.get('/health');
  },
};

export default apiService;
