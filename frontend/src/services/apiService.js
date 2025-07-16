import axios from 'axios';

// Create axios instances for different endpoints
const createApiClient = (baseURL, timeout) => {
  return axios.create({
    baseURL,
    timeout: timeout || 180000,
    headers: {
      'Content-Type': 'application/json',
    }
  });
};

// Create primary and backup clients
const primaryClient = createApiClient(process.env.REACT_APP_API_URL);
const backupClient = process.env.REACT_APP_BACKUP_API_URL ? 
  createApiClient(process.env.REACT_APP_BACKUP_API_URL) : null;

// API health check
const checkApiHealth = async (client) => {
  try {
    await client.get('/settings');
    return true;
  } catch (error) {
    console.error('API health check failed:', error);
    return false;
  }
};

// Get active API client
const getActiveClient = async () => {
  // Try primary first
  if (await checkApiHealth(primaryClient)) {
    return primaryClient;
  }
  
  // Try backup if available
  if (backupClient && await checkApiHealth(backupClient)) {
    console.log('Switched to backup API');
    return backupClient;
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
    
    return await client.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: parseInt(process.env.REACT_APP_UPLOAD_TIMEOUT || '300000'),
    });
  },

  processImage: async (fileId, settings) => {
    const client = await getActiveClient();
    return await client.post('/process', {
      file_id: fileId,
      settings: settings,
    });
  },

  downloadFile: async (fileId, fileType) => {
    const client = await getActiveClient();
    const response = await client.get(`/download/${fileId}/${fileType}`, {
      responseType: 'blob',
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
  },
};

export default apiService;
