import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://paint-number-generator-1.onrender.com/api';

console.log('API Base URL:', API_BASE_URL);

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 300000, // 5 minutes timeout for processing
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    console.log('Making API request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log('API response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API error:', error.response?.status, error.response?.data || error.message);
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

  // Process image
  processImage: async (fileId, settings) => {
    return await apiClient.post('/process', {
      file_id: fileId,
      settings: settings,
    });
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
