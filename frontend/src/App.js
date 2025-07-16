import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Alert,
  AppBar,
  Toolbar,
  IconButton,
  Fab
} from '@mui/material';
import { PhotoCamera, Settings } from '@mui/icons-material';
import ImageUpload from './components/ImageUpload';
import ProcessingSettings from './components/ProcessingSettings';
import ResultsDisplay from './components/ResultsDisplay';
import LoadingSpinner from './components/LoadingSpinner';
import apiService from './services/apiService';

function App() {
  const [currentStep, setCurrentStep] = useState('upload'); // upload, settings, processing, results
  const [uploadedFile, setUploadedFile] = useState(null);
  const [fileId, setFileId] = useState(null);
  const [settings, setSettings] = useState({});
  const [defaultSettings, setDefaultSettings] = useState({});
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [progress, setProgress] = useState(0);

  const loadDefaultSettings = useCallback(async () => {
    try {
      console.log('Loading default settings...');
      console.log('API URL:', process.env.REACT_APP_API_URL);
      
      const response = await apiService.getDefaultSettings();
      console.log('Default settings loaded:', response.data);
      setDefaultSettings(response.data);
      setSettings(response.data);
      
      // Clear any previous errors if API works
      if (error && error.includes('offline mode')) {
        setError(null);
      }
    } catch (error) {
      console.error('Error loading default settings:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      
      // Use fallback default settings if API fails
      const fallbackSettings = {
        num_colors: 15,
        blur_amount: 2,
        edge_threshold: 50,
        min_area: 50,
        output_format: 'svg',
        color_options: [5, 10, 15, 20, 25, 30],
        blur_options: [0, 1, 2, 3, 4, 5],
        edge_options: [10, 25, 50, 75, 100],
        area_options: [50, 100, 200, 500, 1000]
      };
      console.log('Using fallback settings:', fallbackSettings);
      setDefaultSettings(fallbackSettings);
      setSettings(fallbackSettings);
      setError('Using offline mode - API connection failed. Upload and processing features will not work until backend is connected.');
    }
  }, [error]);

  useEffect(() => {
    // Load default settings on component mount
    console.log('App component mounted');
    console.log('Environment:', {
      NODE_ENV: process.env.NODE_ENV,
      API_URL: process.env.REACT_APP_API_URL
    });
    
    // Set initialized to true immediately so UI shows
    setIsInitialized(true);
    
    // Then try to load settings
    loadDefaultSettings();
  }, [loadDefaultSettings]);

  // Device capability detection
  const getDeviceCapabilities = useCallback(() => {
    const memory = navigator?.deviceMemory || 4;
    const cores = navigator?.hardwareConcurrency || 4;
    const connection = navigator?.connection?.effectiveType || '4g';
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    return {
      memory,
      cores,
      connection,
      isMobile,
      performance: {
        memory: memory >= 4 ? 'high' : 'low',
        cpu: cores >= 4 ? 'high' : 'low',
        network: ['4g', '5g'].includes(connection) ? 'high' : 'low'
      }
    };
  }, []);

  const handleFileUpload = async (file) => {
    try {
      setError(null);
      setProcessing(true);
      console.log('Uploading file:', file.name);
      
      const response = await apiService.uploadFile(file);
      console.log('File uploaded successfully:', response.data);
      
      setUploadedFile(file);
      setFileId(response.data.file_id || response.data.id);
      setCurrentStep('settings');
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to upload file';
      setError(`Upload failed: ${errorMessage}. Please try again.`);
    } finally {
      setProcessing(false);
    }
  };

  const handleSettingsChange = (newSettings) => {
    setSettings(newSettings);
  };

  // Update progress handler for progressive loading
  useEffect(() => {
    window.updateProcessingProgress = (progressData) => {
      setProgress(progressData.percentage);
    };
    return () => {
      delete window.updateProcessingProgress;
    };
  }, []);

  const handleProcessImage = async () => {
    try {
      setError(null);
      setProcessing(true);
      setCurrentStep('processing');
      setProgress(0);
      
      console.log('Processing image with settings:', settings);
      
      // Get device capabilities
      const capabilities = getDeviceCapabilities();
      
      // Optimize settings based on device capabilities
      const processSettings = {
        ...settings,
        mobile_optimized: capabilities.isMobile,
        device_info: {
          type: capabilities.isMobile ? 'mobile' : 'desktop',
          userAgent: navigator.userAgent,
          screen: {
            width: window.screen.width,
            height: window.screen.height,
            pixelRatio: window.devicePixelRatio
          },
          hardware: {
            memory: capabilities.memory,
            cores: capabilities.cores,
            connection: capabilities.connection
          },
          performance: capabilities.performance
        },
        optimization: {
          quality: capabilities.performance.memory === 'low' ? 'low' : 'high',
          progressive_loading: true,
          hardware_acceleration: capabilities.performance.cpu === 'high',
          parallel_processing: capabilities.cores > 2,
          chunk_size: capabilities.isMobile ? 524288 : 1048576 // 512KB for mobile, 1MB for desktop
        }
      };
      
      // Add retry logic with progressive fallback
      let retries = 0;
      const maxRetries = 3;
      
      while (retries < maxRetries) {
        try {
          const response = await apiService.processImage(fileId, processSettings);
          console.log('Image processed successfully:', response.data);
          
          setResults(response.data);
          setCurrentStep('results');
          return;
        } catch (error) {
          retries++;
          console.error(`Processing attempt ${retries} failed:`, error);
          
          if (retries === maxRetries) {
            // If all retries fail, try with reduced quality
            if (processSettings.optimization.quality !== 'low') {
              console.log('Retrying with reduced quality...');
              processSettings.optimization.quality = 'low';
              processSettings.optimization.chunk_size = 524288; // 512KB chunks
              const response = await apiService.processImage(fileId, processSettings);
              console.log('Image processed successfully with reduced quality:', response.data);
              setResults(response.data);
              setCurrentStep('results');
              return;
            }
            throw error;
          }
          
          // Wait before retrying with exponential backoff
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, retries) * 1000));
        }
      }
    } catch (error) {
      console.error('Processing error:', error);
      let errorMessage = 'Failed to process image. ';
      
      if (error.response?.data?.error) {
        errorMessage += error.response.data.error;
      } else if (error.message?.includes('Network Error')) {
        errorMessage += 'Network connection issue. Please check your connection and try again.';
      } else if (error.message) {
        errorMessage += error.message;
      }
      
      const capabilities = getDeviceCapabilities();
      if (capabilities.isMobile) {
        errorMessage += ' If on mobile data, try using WiFi for better connection stability.';
        if (capabilities.performance.memory === 'low') {
          errorMessage += ' Your device has limited memory. Try using a smaller image or lower quality settings.';
        }
      }
      
      setError(errorMessage);
      setCurrentStep('settings');
    } finally {
      setProcessing(false);
      setProgress(0);
    }
  };

  const handleDownload = async (fileType) => {
    try {
      await apiService.downloadFile(fileId, fileType);
    } catch (error) {
      console.error('Download error:', error);
      setError('Failed to download file. Please try again.');
    }
  };

  const handleReset = () => {
    setCurrentStep('upload');
    setUploadedFile(null);
    setFileId(null);
    setResults(null);
    setError(null);
    setSettings(defaultSettings);
  };

  const renderCurrentStep = () => {
    try {
      switch (currentStep) {
        case 'upload':
          return (
            <ImageUpload
              onFileUpload={handleFileUpload}
              processing={processing}
            />
          );
        case 'settings':
          return (
            <ProcessingSettings
              settings={settings}
              defaultSettings={defaultSettings}
              onSettingsChange={handleSettingsChange}
              onProcess={handleProcessImage}
              uploadedFile={uploadedFile}
              processing={processing}
            />
          );
        case 'processing':
          return (
            <LoadingSpinner message="Processing your image..." />
          );
        case 'results':
          return (
            <ResultsDisplay
              results={results}
              onDownload={handleDownload}
              onReset={handleReset}
            />
          );
        default:
          return (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6">Welcome to Paint by Numbers Generator</Typography>
              <Typography variant="body1" sx={{ mt: 2 }}>
                Upload an image to get started!
              </Typography>
            </Box>
          );
      }
    } catch (error) {
      console.error('Render error:', error);
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="error">Something went wrong</Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>
            Please refresh the page and try again.
          </Typography>
        </Box>
      );
    }
  };

  return (
    <div className="App">
      {!isInitialized ? (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Paper elevation={3} sx={{ p: 3, minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6">Loading Paint by Numbers Generator...</Typography>
              <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                Please wait while we initialize the application.
              </Typography>
            </Box>
          </Paper>
        </Container>
      ) : (
        <>
          <AppBar position="static">
            <Toolbar>
              <IconButton
                edge="start"
                color="inherit"
                aria-label="menu"
                sx={{ mr: 2 }}
              >
                <PhotoCamera />
              </IconButton>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                Paint by Numbers Generator
              </Typography>
              {currentStep === 'results' && (
                <IconButton color="inherit" onClick={handleReset}>
                  <Settings />
                </IconButton>
              )}
            </Toolbar>
          </AppBar>

          <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            {error && (
              <Alert severity="warning" sx={{ mb: 3 }} onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            <Paper elevation={3} sx={{ p: 3, minHeight: '60vh' }}>
              {renderCurrentStep()}
            </Paper>

            {/* Progress indicator */}
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {['upload', 'settings', 'processing', 'results'].map((step, index) => (
                  <Box
                    key={step}
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      backgroundColor: 
                        step === currentStep ? 'primary.main' :
                        ['upload', 'settings', 'processing', 'results'].indexOf(currentStep) > index ? 'success.main' : 'grey.300'
                    }}
                  />
                ))}
              </Box>
            </Box>
          </Container>

          {/* Reset FAB */}
          {currentStep !== 'upload' && (
            <Fab
              color="secondary"
              aria-label="reset"
              sx={{ position: 'fixed', bottom: 16, right: 16 }}
              onClick={handleReset}
            >
              <PhotoCamera />
            </Fab>
          )}
        </>
      )}
    </div>
  );
}

export default App;
