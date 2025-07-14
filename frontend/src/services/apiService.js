import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 300000, // 5 minutes timeout for processing
});

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
