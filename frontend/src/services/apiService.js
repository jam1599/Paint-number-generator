import axios from 'axios';

// Detect mobile device
const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Create axios instances for different endpoints
const createApiClient = (baseURL, timeout) => {
  // Adjust timeout for mobile devices
  const defaultTimeout = isMobileDevice() ? 120000 : 180000; // 2 minutes for mobile, 3 for desktop
  
  const instance = axios.create({
    baseURL,
    timeout: timeout || defaultTimeout,
    headers: {
      'Content-Type': 'application/json',
    }
  });

  // Add request interceptor for mobile optimization
  instance.interceptors.request.use(
    (config) => {
      if (isMobileDevice()) {
        // Add mobile-specific headers
        config.headers['X-Mobile-Client'] = 'true';
        // Ensure content compression
        config.headers['Accept-Encoding'] = 'gzip, deflate';
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Add response interceptor for better error handling
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.code === 'ECONNABORTED') {
        error.message = 'Request timed out. Please check your connection and try again.';
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

// Create primary and backup clients
const primaryClient = createApiClient(process.env.REACT_APP_API_URL);
const backupClient = process.env.REACT_APP_BACKUP_API_URL ? 
  createApiClient(process.env.REACT_APP_BACKUP_API_URL) : null;

// API health check with timeout
const checkApiHealth = async (client) => {
  try {
    await client.get('/settings', { 
      timeout: 5000 // Short timeout for health check
    });
    return true;
  } catch (error) {
    console.error('API health check failed:', error);
    return false;
  }
};

// Get active API client with retry
const getActiveClient = async () => {
  let retries = 0;
  const maxRetries = 2;

  while (retries < maxRetries) {
    try {
      // Try primary first
      if (await checkApiHealth(primaryClient)) {
        return primaryClient;
      }
      
      // Try backup if available
      if (backupClient && await checkApiHealth(backupClient)) {
        console.log('Switched to backup API');
        return backupClient;
      }
      
      retries++;
      if (retries < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * retries));
      }
    } catch (error) {
      console.error('API client error:', error);
      retries++;
    }
  }
  
  // If both fail, return primary with warning
  console.warn('All API endpoints failed, using primary with warning');
  return primaryClient;
};

const apiService = {
  // Get default settings with retry logic
  getDefaultSettings: async () => {
    let retries = 0;
    const maxRetries = 3;
    
    while (retries < maxRetries) {
      try {
        const client = await getActiveClient();
        const response = await client.get('/settings');
        return response;
      } catch (error) {
        retries++;
        console.error(`Settings attempt ${retries} failed:`, error);
        
        if (retries === maxRetries) {
          // Return offline fallback settings
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
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, retries) * 1000));
      }
    }
  },

  uploadFile: async (file) => {
    const client = await getActiveClient();
    const formData = new FormData();
    formData.append('file', file);
    
    // Adjust timeout based on file size and device
    const fileSize = file.size;
    const baseTimeout = isMobileDevice() ? 120000 : 300000; // 2 minutes mobile, 5 minutes desktop
    const timeout = Math.min(baseTimeout * (fileSize / (5 * 1024 * 1024)), 600000); // Adjust for file size, max 10 minutes
    
    return await client.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: timeout,
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        console.log('Upload progress:', percentCompleted);
      }
    });
  },

  processImage: async (fileId, settings) => {
    const client = await getActiveClient();
    const isMobile = isMobileDevice();
    
    // Adjust timeout based on settings and device
    const baseTimeout = isMobile ? 120000 : 300000;
    const timeout = settings.optimization?.quality === 'low' ? baseTimeout : baseTimeout * 1.5;
    
    try {
      return await client.post('/process', {
        file_id: fileId,
        settings: settings
      }, {
        timeout: timeout,
        headers: {
          'X-Processing-Mode': isMobile ? 'mobile' : 'desktop',
          'X-Device-Memory': navigator?.deviceMemory || '4',
          'X-Device-Cores': navigator?.hardwareConcurrency || '4'
        }
      });
    } catch (error) {
      // Enhanced error handling for mobile
      if (error.code === 'ECONNABORTED') {
        throw new Error('Processing timeout. Try using lower quality settings or a smaller image.');
      }
      throw error;
    }
  },

  downloadFile: async (fileId, fileType) => {
    const client = await getActiveClient();
    
    try {
      const response = await client.get(`/download/${fileId}/${fileType}`, {
        responseType: 'blob',
        timeout: isMobileDevice() ? 60000 : 120000 // 1 minute mobile, 2 minutes desktop
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
  },
};

export default apiService;
