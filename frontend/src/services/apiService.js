import axios from 'axios';

const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// Create base axios instance
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  timeout: isMobile ? 120000 : 180000, // 2 minutes for mobile, 3 for desktop
  headers: {
    'Content-Type': 'application/json',
    'X-Device-Type': isMobile ? 'mobile' : 'desktop'
  }
});

const apiService = {
  getDefaultSettings: async () => {
    try {
      const response = await apiClient.get('/settings');
      return response;
    } catch (error) {
      console.error('Settings error:', error);
      // Return fallback settings
      return {
        data: {
          num_colors: 15,
          blur_amount: 2,
          edge_threshold: 50,
          min_area: 50,
          output_format: 'svg',
          color_options: [5, 10, 15, 20, 25, 30],
          blur_options: [0, 1, 2, 3, 4, 5],
          edge_options: [10, 25, 50, 75, 100],
          area_options: [50, 100, 200, 500, 1000]
        }
      };
    }
  },

  uploadFile: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      timeout: isMobile ? 60000 : 120000 // 1 minute for mobile, 2 for desktop
    };
    
    return await apiClient.post('/upload', formData, config);
  },

  processImage: async (fileId, settings) => {
    const config = {
      timeout: isMobile ? 180000 : 300000, // 3 minutes for mobile, 5 for desktop
      headers: {
        'X-Processing-Mode': isMobile ? 'mobile' : 'desktop'
      }
    };

    try {
      return await apiClient.post('/process', {
        file_id: fileId,
        settings: {
          ...settings,
          mobile_optimized: isMobile,
          optimization: {
            ...settings.optimization,
            quality: isMobile ? 'low' : settings.optimization?.quality || 'high',
            chunk_size: isMobile ? 262144 : 1048576 // 256KB for mobile, 1MB for desktop
          }
        }
      }, config);
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        throw new Error('Processing timeout. Try using lower quality settings or a smaller image.');
      }
      throw error;
    }
  },

  downloadFile: async (fileId, fileType) => {
    try {
      const response = await apiClient.get(`/download/${fileId}/${fileType}`, {
        responseType: 'blob',
        timeout: isMobile ? 60000 : 120000 // 1 minute for mobile, 2 for desktop
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${fileId}_${fileType}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return response;
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        throw new Error('Download timeout. Please try again.');
      }
      throw error;
    }
  }
};

export default apiService;
