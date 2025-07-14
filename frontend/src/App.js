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

  useEffect(() => {
    // Load default settings on component mount
    loadDefaultSettings();
  }, []);

  const loadDefaultSettings = async () => {
    try {
      const response = await apiService.getDefaultSettings();
      setDefaultSettings(response.data);
      setSettings(response.data);
    } catch (error) {
      console.error('Error loading default settings:', error);
      setError('Failed to load default settings');
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
        return null;
    }
  };

  return (
    <div className="App">
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
    </div>
  );
}

export default App;
