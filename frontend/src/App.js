import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    // Load default settings on component mount
    console.log('App component mounted');
    loadDefaultSettings();
  }, []);

  const loadDefaultSettings = async () => {
    try {
      console.log('Loading default settings...');
      const response = await apiService.getDefaultSettings();
      console.log('Default settings loaded:', response.data);
      setDefaultSettings(response.data);
      setSettings(response.data);
    } catch (error) {
      console.error('Error loading default settings:', error);
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
      setError('Using offline mode - some features may be limited');
    } finally {
      setIsInitialized(true);
    }
  };

  const handleFileUpload = async (file) => {
    try {
      setError(null);
      setProcessing(true);
      
      const response = await apiService.uploadFile(file);
      setUploadedFile(file);
      setFileId(response.data.file_id);
      setCurrentStep('settings');
    } catch (error) {
      console.error('Upload error:', error);
      setError('Failed to upload file. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleSettingsChange = (newSettings) => {
    setSettings(newSettings);
  };

  const handleProcessImage = async () => {
    try {
      setError(null);
      setProcessing(true);
      setCurrentStep('processing');
      
      const response = await apiService.processImage(fileId, settings);
      setResults(response.data);
      setCurrentStep('results');
    } catch (error) {
      console.error('Processing error:', error);
      setError('Failed to process image. Please try again.');
      setCurrentStep('settings');
    } finally {
      setProcessing(false);
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
              <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
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
